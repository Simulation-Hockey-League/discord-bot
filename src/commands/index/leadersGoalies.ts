import { SlashCommandBuilder } from 'discord.js';

import { IndexApiClient } from 'src/db/index/api/IndexApiClient';
import { LeagueType, SeasonType } from 'src/db/index/shared';
import { GoalieCategories } from 'src/db/index/shared';
import { goalieRookieCutoffs } from 'src/lib/config/config';
import { DynamicConfig } from 'src/lib/config/dynamicConfig';
import { GetPageFn } from 'src/lib/helpers/buttons/button';
import {
  backForwardButtons,
  createPaginator,
} from 'src/lib/helpers/buttons/button';
import { withLeaderStats } from 'src/lib/leadersGoalies';
import { logger } from 'src/lib/logger';
import { TeamInfo, findTeamByAbbr } from 'src/lib/teams';

import { SlashCommand } from 'typings/command';
import { GoalieStats } from 'typings/statsindex';

export default {
  command: new SlashCommandBuilder()
    .setName('leaders-goalies')
    .addStringOption((option) =>
      option
        .setName('category')
        .setDescription('The leader in a set position')
        .setChoices(
          { name: 'gamesPlayed', value: 'gamesPlayed' },
          { name: 'wins', value: 'wins' },
          { name: 'losses', value: 'losses' },
          { name: 'ot', value: 'ot' },
          { name: 'shotsAgainst', value: 'shotsAgainst' },
          { name: 'saves', value: 'saves' },
          { name: 'goalsAgainst', value: 'goalsAgainst' },
          { name: 'shutouts', value: 'shutouts' },
          { name: 'savePct', value: 'savePct' },
          { name: 'GSAA', value: 'GSAA' },
        )
        .setRequired(true),
    )
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
    .setDescription('Get Goalie Statistics.'),

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
      const leader = interaction.options.getString(
        'category',
      ) as GoalieCategories;
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

      if (!playerStats.length) {
        const filters = [
          abbr ? `Team: ${abbr.toUpperCase()}` : null,
          season ? `Season: ${season}` : null,
          seasonType ? `Type: ${seasonType}` : null,
          leader ? `Category: ${leader}` : null,
          viewRookie ? 'Rookie Only' : null,
        ]
          .filter(Boolean)
          .join(' | ');

        await interaction.editReply({
          content: `No player stats found${filters ? ` for ${filters}` : ''}.`,
        });
        return;
      }
      const getLeaderStatsPage: GetPageFn = async (page) => {
        const { embed, totalPages } = await withLeaderStats(
          playerStats,
          league,
          season,
          seasonType,
          leader,
          viewRookie,
          abbr,
          page,
        );

        const buttons = backForwardButtons(page, totalPages);
        return { embed, buttons, totalPages };
      };

      const message = await interaction.editReply({
        embeds: [(await getLeaderStatsPage(1)).embed],
        components: [(await getLeaderStatsPage(1)).buttons],
      });
      await createPaginator(message, interaction.user.id, getLeaderStatsPage);
    } catch (error) {
      logger.error('Error while executing /leaders-goalies command', error);
      await interaction.editReply({
        content:
          'An error occurred while fetching player stats. Please try again later.',
      });
    }
  },
} satisfies SlashCommand;
