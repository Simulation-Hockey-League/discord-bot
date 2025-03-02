import {
  ButtonInteraction,
  ComponentType,
  SlashCommandBuilder,
} from 'discord.js';
import { IndexApiClient } from 'src/db/index/api/IndexApiClient';
import { LeagueType, SeasonType } from 'src/db/index/shared';
import { users } from 'src/db/users';
import { DynamicConfig } from 'src/lib/config/dynamicConfig';
import {
  createActionRow,
  createTeamEmbed,
} from 'src/lib/helpers/buttons/teamButton';
import { logger } from 'src/lib/logger';
import { Teams, findTeamByAbbr } from 'src/lib/teams';

import { SlashCommand } from 'typings/command';
export default {
  command: new SlashCommandBuilder()
    .setName('team')
    .addStringOption((option) =>
      option
        .setName('abbr')
        .setDescription(
          'The abbreviation of the team. If not provided, will use the team name stored by /store.',
        )
        .setRequired(false),
    )
    .addNumberOption((option) =>
      option
        .setName('league')
        .setDescription(
          'The league you want to search. If not provided, will use SHL or IIHF teams',
        )
        .setChoices(
          { name: 'SHL', value: LeagueType.SHL },
          { name: 'SMJHL', value: LeagueType.SMJHL },
          { name: 'IIHF', value: LeagueType.IIHF },
          { name: 'WJC', value: LeagueType.WJC },
        )
        .setRequired(false),
    )
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
        .setName('type')
        .setDescription(
          'The season type (i.e. regular, playoffs, etc.). Default to regular season.',
        )
        .setChoices(
          { name: 'Regular', value: SeasonType.REGULAR },
          { name: 'Playoffs', value: SeasonType.POST },
        )
        .setRequired(false),
    )
    .addStringOption((option) =>
      option
        .setName('view')
        .setDescription('Choose what information to view')
        .addChoices(
          { name: 'Overview', value: 'overview' },
          { name: 'Current Roster', value: 'roster' },
          { name: 'Schedule', value: 'schedule' },
          { name: 'Team Leaders', value: 'leaders' },
        )
        .setRequired(false),
    )
    .setDescription('Get team information.'),
  execute: async (interaction) => {
    try {
      const currentSeason = DynamicConfig.currentSeason.get();

      const season = interaction.options.getNumber('season') ?? currentSeason;
      const userTeam = await users.get(interaction.user.id);
      const league = interaction.options.getNumber('league') as
        | LeagueType
        | undefined;
      const abbr =
        interaction.options.getString('abbr') ??
        Object.values(Teams).find(
          (team) => team.fullName === userTeam?.teamName,
        )?.abbr ??
        null;
      const seasonType = interaction.options.getString('type') as
        | SeasonType
        | undefined;

      const view = interaction.options.getString('view') ?? 'overview';
      if (!abbr) {
        await interaction.reply({
          content: 'No team abbreviation provided.',
          ephemeral: true,
        });
        return;
      }

      await interaction.deferReply();

      const teamInfo = findTeamByAbbr(abbr, league);
      if (!teamInfo) {
        await interaction.editReply({
          content: `Could not find team with abbreviation ${abbr}.`,
        });
        return;
      }
      if (
        view === 'roster' &&
        (teamInfo.leagueType === LeagueType.IIHF ||
          teamInfo.leagueType === LeagueType.WJC)
      ) {
        await interaction.editReply({
          content: `Roster view is not available for IIHF or WJC teams.`,
        });
        return;
      }
      const teams = await IndexApiClient.get(teamInfo.leagueType).getTeamInfo(
        season,
      );
      const team = teams.find((team) => team.abbreviation === teamInfo.abbr);

      if (!team) {
        await interaction.editReply({
          content: `Could not find team with abbreviation ${abbr} for season ${season}.`,
        });
        return;
      }
      const row = createActionRow(abbr, season, view, teamInfo.leagueType);

      const initialEmbed = await createTeamEmbed(
        interaction,
        team,
        teamInfo,
        season,
        seasonType,
        view,
      );

      if (!initialEmbed) {
        return;
      }

      const response = await interaction
        .editReply({
          embeds: [initialEmbed],
          components: [row],
        })
        .catch(async (error) => {
          logger.error(error);
          await interaction.editReply({
            content: 'An error occurred while fetching team info.',
          });
          return;
        });

      if (!response) {
        return;
      }
      const collector = response.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 60000,
      });

      collector.on('collect', async (i: ButtonInteraction) => {
        if (i.user.id !== interaction.user.id) {
          await i.reply({
            content: 'Only the command user can use these buttons.',
            ephemeral: true,
          });
          return;
        }

        const [action, abbr, seasonValue] = i.customId.split('_');
        const selectedSeason =
          seasonValue === 'current' ? season : parseInt(seasonValue);

        await i.deferUpdate();

        const newEmbed = await createTeamEmbed(
          interaction,
          team,
          teamInfo,
          selectedSeason,
          seasonType,
          action,
        );

        const updatedRow = createActionRow(
          abbr,
          selectedSeason,
          action,
          teamInfo.leagueType,
        );

        if (!newEmbed) return;
        await i.editReply({
          embeds: [newEmbed],
          components: [updatedRow],
        });
      });

      collector.on('end', async () => {
        try {
          await interaction.editReply({
            components: [],
          });
        } catch (error) {
          logger.error(error);
        }
      });
    } catch (error) {
      await interaction.editReply({
        content: 'An error occurred while fetching team info.',
      });
      return;
    }
  },
} satisfies SlashCommand;
