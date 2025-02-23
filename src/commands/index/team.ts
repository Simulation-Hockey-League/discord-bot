import {
  ButtonInteraction,
  ComponentType,
  SlashCommandBuilder,
} from 'discord.js';
import { IndexApiClient } from 'src/db/index/api/IndexApiClient';
import {
  createActionRow,
  createEmbed,
} from 'src/db/index/helpers/buttons/teamButton';
import { SeasonType, TEAM_CHOICES } from 'src/db/index/shared';
import { users } from 'src/db/users';
import { findTeamByName } from 'src/lib/teams';

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
    const season = interaction.options.getNumber('season') ?? undefined;
    const userTeam = await users.get(interaction.user.id);
    const abbr =
      interaction.options.getString('abbr') ??
      TEAM_CHOICES.find((team) => team.name === userTeam?.teamName)?.value ??
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
    if (
      abbr &&
      !TEAM_CHOICES.some(
        (team) => team.value.toLowerCase() === abbr.toLowerCase(),
      )
    ) {
      await interaction.reply({
        content: `Invalid team abbreviation: ${abbr}.`,
        ephemeral: true,
      });
      return;
    }

    try {
      await interaction.deferReply();

      const teamInfo = findTeamByName(abbr);
      if (!teamInfo) {
        await interaction.editReply({
          content: `Could not find team with abbreviation ${abbr}.`,
        });
        return;
      }
      const teams = await IndexApiClient.get(teamInfo.leagueType).getTeamInfo();
      const team = teams.find((team) => team.name === teamInfo.fullName);

      if (!team) {
        await interaction.editReply({
          content: `Could not find team with abbreviation ${abbr}.`,
        });
        return;
      }
      const row = createActionRow(abbr, season, view);

      const initialEmbed = await createEmbed(
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

      const response = await interaction.editReply({
        embeds: [initialEmbed],
        components: [row],
      });

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

        const newEmbed = await createEmbed(
          interaction,
          team,
          teamInfo,
          selectedSeason,
          seasonType,
          action,
        );

        const updatedRow = createActionRow(abbr, selectedSeason, action);

        if (!newEmbed) return;
        await i.editReply({
          embeds: [newEmbed],
          components: [updatedRow],
        });
      });

      collector.on('end', () => {
        interaction
          .editReply({
            components: [],
          })
          .catch(
            async (error) =>
              await interaction.editReply(
                `An error while trying to fetch data ${error.message}.`,
              ),
          );
      });
    } catch (error) {
      await interaction.editReply({
        content: 'An error occurred while fetching team info.',
      });
      return;
    }
  },
} satisfies SlashCommand;
