import { SlashCommandBuilder } from 'discord.js';

import { IndexApiClient } from 'src/db/index/api/IndexApiClient';
import { leagueTypeToString } from 'src/db/index/helpers/leagueToString';
import { LeagueType, SeasonType } from 'src/db/index/shared';
import { goalieRookieCutoffs } from 'src/utils/config/config';
import { DynamicConfig } from 'src/utils/config/dynamicConfig';
import { getGSAAInfo } from 'src/utils/playerHelpers';
import { createLeadersSelector } from 'src/lib/leaders';
import { logger } from 'src/lib/logger';
import { TeamInfo, findTeamByAbbr } from 'src/lib/teams';

import { SlashCommand } from 'typings/command';
import { GoalieStats } from 'typings/statsindex';

export const goalieCategories = {
  gamesPlayed: 'Games Played',
  wins: 'Wins',
  losses: 'Losses',
  ot: 'OT',
  shotsAgainst: 'Shots Against',
  saves: 'Saves',
  goalsAgainst: 'Goals Against',
  shutouts: 'Shutouts',
  savePct: 'Save %',
  GSAA: 'GSAA',
};

export default {
  command: new SlashCommandBuilder()
    .setName('leaders-goalies')
    .addNumberOption((option) =>
      option
        .setName('season')
        .setDescription(
          'The season to get stats for. If not provided, will get current season.',
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
    .setDescription('Get Goalie Statistics. Defaults to wins'),

  execute: async (interaction) => {
    try {
      await interaction.deferReply({ ephemeral: false });
      const currentSeason = DynamicConfig.get('currentSeason');
      const season = interaction.options.getNumber('season') ?? currentSeason;
      const league = interaction.options.getNumber('league') as
        | LeagueType
        | undefined;
      const seasonType = interaction.options.getString('type') as
        | SeasonType
        | undefined;
      const viewRookie = interaction.options.getBoolean('rookie') ?? false;
      const abbr = interaction.options.getString('abbr');

      let seasonBefore: GoalieStats[] = [];
      let playerStats = await IndexApiClient.get(league).getGoalieStats(
        seasonType ?? SeasonType.REGULAR,
        season,
      );

      if (viewRookie) {
        seasonBefore = await IndexApiClient.get(league).getGoalieStats(
          seasonType ?? SeasonType.REGULAR,
          season - 1,
        );
        const cutoff =
          goalieRookieCutoffs.find((cutoff) => cutoff.league === league)
            ?.gamesPlayed ?? 12; // default to SHL games played for rookie cutoff
        const previousSeasonIds = new Set(
          seasonBefore.map((player) => player.id),
        );
        const rookieStats = playerStats.filter(
          (player) =>
            !previousSeasonIds.has(player.id) && player.gamesPlayed > cutoff,
        );
        playerStats = rookieStats;
      }

      let teamInfo: TeamInfo | undefined;
      if (abbr) {
        teamInfo = findTeamByAbbr(abbr, league);
        if (!teamInfo) {
          await interaction.editReply({
            content: `Could not find team with abbreviation ${abbr}. Please double-check the abbreviation.`,
          });
          return;
        }
        playerStats = playerStats.filter(
          (player) => teamInfo && player.teamId === teamInfo.teamID,
        );
      }

      const leagueAvgSavePct = getGSAAInfo(playerStats);
      playerStats.forEach((g) => {
        g.GSAA = Number(
          (g.saves - leagueAvgSavePct * g.shotsAgainst).toFixed(2),
        );
      });

      let titleParts = ['Player Rankings'];

      if (season) titleParts.unshift(`S${season}`);
      if (abbr) titleParts.push(abbr.toUpperCase());
      if (league) titleParts.push(leagueTypeToString(league));
      if (seasonType) titleParts.push(seasonType);
      if (viewRookie) titleParts.push('Rookies');
      const getTitle = titleParts.join(' | ');

      await createLeadersSelector(
        interaction,
        playerStats,
        goalieCategories,
        'wins',
        getTitle,
      );
    } catch (error) {
      logger.error('Error while executing /leaders-goalies command', error);
      await interaction.editReply({
        content:
          'An error occurred while fetching player stats. Please try again later.',
      });
    }
  },
} satisfies SlashCommand;
