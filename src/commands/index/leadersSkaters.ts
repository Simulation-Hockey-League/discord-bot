import { SlashCommandBuilder } from 'discord.js';
import { IndexApiClient } from 'src/db/index/api/IndexApiClient';
import { leagueTypeToString } from 'src/db/index/helpers/leagueToString';
import { LeagueType, SeasonType } from 'src/db/index/shared';
import { skaterRookieCutoffs } from 'src/lib/config/config';
import { DynamicConfig } from 'src/lib/config/dynamicConfig';

import { createLeadersSelector } from 'src/lib/leaders';
import { logger } from 'src/lib/logger';
import { findTeamByAbbr } from 'src/lib/teams';

import { TeamInfo } from 'src/lib/teams';
import { SlashCommand } from 'typings/command';
import { PlayerStats } from 'typings/statsindex';

const skaterCategories = {
  goals: 'Goals',
  assists: 'Assists',
  points: 'Points',
  plusMinus: 'Plus/Minus',
  pim: 'PIM',
  shotsOnGoal: 'Shots on Goal',
  gwg: 'GWG',
  faceoffs: 'Faceoffs',
  faceoffWins: 'Faceoff Wins',
  giveaways: 'Giveaways',
  takeaways: 'Takeaways',
  shotsBlocked: 'Shots Blocked',
  hits: 'Hits',
  fights: 'Fights',
  fightWins: 'Fight Wins',
  fightLosses: 'Fight Losses',
};

export default {
  command: new SlashCommandBuilder()
    .setName('leaders-skaters')
    .addNumberOption((option) =>
      option
        .setName('season')
        .setDescription(
          'The season to get stats for. If not provided, will get current season.',
        )
        .setRequired(false),
    )
    .addStringOption((option) =>
      option
        .setName('position')
        .setDescription(
          'The position of the leaders. If not provided, will use all players',
        )
        .setChoices(
          { name: 'Forward', value: 'F' },
          { name: 'Defenseman', value: 'D' },
        )
        .setRequired(false),
    )
    .addNumberOption((option) =>
      option
        .setName('league')
        .setDescription(
          'The league of the standings to return. If not provided, will use SHL standings.',
        )
        .setChoices(
          { name: 'SHL', value: LeagueType.SHL },
          { name: 'SMJHL', value: LeagueType.SMJHL },
          { name: 'IIHF', value: LeagueType.IIHF },
          { name: 'WJC', value: LeagueType.WJC },
        )
        .setRequired(false),
    )
    .addStringOption((option) =>
      option
        .setName('type')
        .setDescription(
          'The season type (i.e. regular, playoffs, etc.). If not provided will default to regular season',
        )
        .setChoices(
          { name: 'Regular', value: SeasonType.REGULAR },
          { name: 'Playoffs', value: SeasonType.POST },
        )
        .setRequired(false),
    )
    .addBooleanOption((option) =>
      option
        .setName('rookie')
        .setDescription(
          'If you want to look at only rookies or not. Default to no',
        )
        .setRequired(false),
    )
    .addStringOption((option) =>
      option
        .setName('abbr')
        .setDescription(
          'The abbreviation of the team. If not provided will use team in /store. use /help for all abbr',
        )
        .setRequired(false),
    )
    .setDescription('Get Skater Statistics. Defaults to points'),

  execute: async (interaction) => {
    try {
      await interaction.deferReply();
      const currentSeason = DynamicConfig.get('currentSeason');
      const season = interaction.options.getNumber('season') ?? currentSeason;
      const league = interaction.options.getNumber('league') as
        | LeagueType
        | LeagueType.SHL;
      const seasonType = interaction.options.getString('type') as
        | SeasonType
        | undefined;
      const position = interaction.options.getString('position') as
        | 'F'
        | 'D'
        | undefined;
      const viewRookie = interaction.options.getBoolean('rookie') ?? false;
      const abbr = interaction.options.getString('abbr');

      let seasonBefore: PlayerStats[] = [];

      let playerStats = await IndexApiClient.get(league).getPlayerStats(
        seasonType ?? SeasonType.REGULAR,
        season,
      );
      if (viewRookie) {
        seasonBefore = await IndexApiClient.get(league).getPlayerStats(
          seasonType ?? SeasonType.REGULAR,
          season - 1,
        );
        const previousSeasonIds = new Set(
          seasonBefore.map((player) => player.id),
        );
        const cutoff =
          skaterRookieCutoffs.find((cutoff) => cutoff.league === league)
            ?.gamesPlayed ?? 15;
        const rookieStats = playerStats.filter(
          (player) =>
            !previousSeasonIds.has(player.id) && player.gamesPlayed > cutoff,
        );
        playerStats = rookieStats;
      }
      if (position) {
        if (position === 'F') {
          playerStats = playerStats.filter(
            (player) =>
              player.position === 'C' ||
              player.position === 'LW' ||
              player.position === 'RW',
          );
        } else if (position === 'D') {
          playerStats = playerStats.filter(
            (player) => player.position === 'LD' || player.position === 'RD',
          );
        }
      }

      let teamInfo: TeamInfo | undefined;
      if (abbr) {
        teamInfo = findTeamByAbbr(abbr, league);
        if (!teamInfo) {
          await interaction.editReply({
            content: `Could not find team with abbreviation ${abbr}.`,
          });
          return;
        }
        playerStats = playerStats.filter(
          (player) => teamInfo && player.teamId === teamInfo.teamID,
        );
      }

      let titleParts = ['Player Rankings'];

      if (position)
        titleParts[0] = `${
          position.charAt(0).toUpperCase() + position.slice(1)
        } Rankings`;
      if (season) titleParts.unshift(`S${season}`);
      if (abbr) titleParts.push(abbr.toUpperCase());
      if (league) titleParts.push(leagueTypeToString(league));
      if (seasonType) titleParts.push(seasonType);
      if (viewRookie) titleParts.push('Rookies');

      const getTitle = titleParts.join(' - ');

      await createLeadersSelector(
        interaction,
        playerStats,
        skaterCategories,
        'points',
        getTitle,
      );
    } catch (error) {
      logger.error(error);
      await interaction.editReply({
        content: 'An error occurred while fetching player stats.',
      });
      return;
    }
  },
} satisfies SlashCommand;
