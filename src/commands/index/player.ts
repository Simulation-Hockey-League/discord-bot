import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ComponentType,
  SlashCommandBuilder,
} from 'discord.js';
import { getPlayerStats } from 'src/db/index';
import { IndexApiClient } from 'src/db/index/api/IndexApiClient';
import { SeasonType } from 'src/db/index/shared';
import { users } from 'src/db/users';
import { BaseEmbed } from 'src/lib/embed';
import { logger } from 'src/lib/logger';
import { withPlayerRatings, withPlayerStats } from 'src/lib/player';
import { findTeamByName } from 'src/lib/teams';
import { logUnhandledCommandError } from 'src/utils/logUnhandledError';
import { SlashCommand } from 'typings/command';

export default {
  command: new SlashCommandBuilder()
    .setName('player')
    .addStringOption((option) =>
      option
        .setName('name')
        .setDescription(
          'The name of the player. If not provided, will use the player name stored by /store.',
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
    .setDescription('Get player statistics.'),
  execute: async (interaction) => {
    const season = interaction.options.getNumber('season') ?? undefined;
    const targetName = interaction.options.getString('name');
    const seasonType = interaction.options.getString('type') as
      | SeasonType
      | undefined;
    const currentUserInfo = await users.get(interaction.user.id);

    const name = targetName || currentUserInfo?.playerName;

    if (!name) {
      await interaction.reply({
        content: 'No player name provided or stored.',
        ephemeral: true,
      });
      return;
    }

    await interaction.deferReply();
    const playerStats = await getPlayerStats(
      name,
      seasonType ?? SeasonType.REGULAR,
      season,
    );

    if (!playerStats) {
      await interaction.editReply({
        content: `Could not find ${name}${
          season ? ` in season ${season}` : ''
        }.`,
      });
      return;
    }
    let isGoalie = false;
    if (playerStats.position === 'G') {
      isGoalie = true;
    }

    const playerRatings = await IndexApiClient.get(
      playerStats.league,
    ).getRatings(
      playerStats.id,
      playerStats.seasonType,
      playerStats.season,
      isGoalie,
    );

    try {
      const teamInfo = findTeamByName(playerStats.team);
      const teams = await IndexApiClient.get(playerStats.league).getTeamInfo();
      const team = teams.find((team) => team.id === playerStats?.teamId);

      const determinedSeason = playerStats.season;

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(`player_${playerStats.gamesPlayed}`)
          .setLabel('Player')
          .setStyle(ButtonStyle.Primary),
        ...(determinedSeason >= 53
          ? [
              new ButtonBuilder()
                .setCustomId(`ratings_${playerStats.gamesPlayed}`)
                .setLabel('Player Ratings')
                .setStyle(ButtonStyle.Secondary),
            ]
          : []),
      );

      const embed = await withPlayerStats(
        BaseEmbed(interaction, {
          logoUrl: teamInfo?.logoUrl,
          teamColor: team?.colors.primary,
        }).setTitle(`${playerStats.name} - ${playerStats.position}`),
        playerStats,
      );

      const response = await interaction
        .editReply({ embeds: [embed], components: [row] })
        .catch((error) => {
          logUnhandledCommandError(interaction, error);
          return null;
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

        await i.deferUpdate().catch((error) => {
          logger.error('Failed to defer update:', error);
          if (error.code === 10008) {
            collector.stop();
            return;
          }
        });

        let newEmbed;
        if (i.customId.startsWith('player')) {
          newEmbed = await withPlayerStats(
            BaseEmbed(interaction, {
              logoUrl: teamInfo?.logoUrl,
              teamColor: team?.colors.primary,
            }).setTitle(`${playerStats.name} - ${playerStats.position}`),
            playerStats,
          );
        } else if (i.customId.startsWith('ratings')) {
          newEmbed = await withPlayerRatings(
            BaseEmbed(interaction, {
              logoUrl: teamInfo?.logoUrl,
              teamColor: team?.colors.primary,
            }).setTitle(`${playerStats.name} - ${playerStats.position}`),
            playerRatings,
          );
        }

        if (!newEmbed) return;
        await i.editReply({ embeds: [newEmbed], components: [row] });
      });
      collector.on('end', () => {
        interaction.editReply({ components: [] }).catch((error) => {
          logUnhandledCommandError(interaction, error);
        });
      });
    } catch (error) {
      logger.error(error);
      await interaction.editReply({
        content: 'An error occurred while retrieving player info.',
      });
    }
  },
} satisfies SlashCommand;
