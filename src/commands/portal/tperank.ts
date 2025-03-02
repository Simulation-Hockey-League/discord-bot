import { SlashCommandBuilder } from 'discord.js';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} from 'discord.js';
import { PortalClient } from 'src/db/portal/PortalClient';
import { BaseEmbed } from 'src/lib/embed';
import { logger } from 'src/lib/logger';
import { SlashCommand } from 'typings/command';

export default {
  command: new SlashCommandBuilder()
    .setName('tperank')
    .addStringOption((option) =>
      option
        .setName('league')
        .setDescription(
          'Which League to get TPE rankings for. Default is All Leagues.',
        )
        .addChoices(
          { name: 'SHL', value: 'SHL' },
          { name: 'SMJHL', value: 'SMJHL' },
        )
        .setRequired(false),
    )
    .addNumberOption((option) =>
      option
        .setName('season')
        .setDescription(
          'The draft season to get TPE rankings for. Default is All Seasons.',
        )
        .setRequired(false),
    )
    .setDescription('Retrieve TPE rankings from the portal.'),

  execute: async (interaction) => {
    await interaction.deferReply({ ephemeral: false });
    const targetLeague = interaction.options.getString('league') ?? null;
    const targetDraftSeason = interaction.options.getNumber('season') ?? null;
    const players = await PortalClient.getActivePlayers();

    if (!players.length) {
      await interaction.reply({
        content: 'Something went wrong. Please try again.',
        ephemeral: true,
      });
      return;
    }

    let currentPage = 1;

    try {
      const tpeRankings = players
        .map((player) => ({
          username: player.username,
          tpe: player.totalTPE,
          league: player.currentLeague,
          draftSeason: player.draftSeason,
          position: player.position,
          name: player.name,
        }))
        .sort((a, b) => b.tpe - a.tpe)
        .filter((player) => {
          const matchesLeague = targetLeague
            ? player.league === targetLeague
            : true;
          const matchesSeason = targetDraftSeason
            ? player.draftSeason === targetDraftSeason
            : true;

          return matchesLeague && matchesSeason;
        });

      const getRankingEmbed = (page: number) => {
        const startIdx = (page - 1) * 15;
        const endIdx = page * 15;

        const pageRankings = tpeRankings.slice(startIdx, endIdx);

        return BaseEmbed(interaction, {})
          .setTitle(
            targetDraftSeason || targetLeague
              ? `TPE Rankings for S${targetDraftSeason || ''} ${
                  targetLeague || ''
                }`.trim()
              : 'TPE Rankings',
          )
          .addFields({
            name: 'TPE Rankings',
            value: pageRankings
              .map(
                (player, index) =>
                  `${startIdx + index + 1}.  ${player.username} |  ${
                    player.name
                  } | ${player.tpe} TPE`,
              )
              .join('\n'),
            inline: false,
          });
      };

      const embed = getRankingEmbed(currentPage);

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId('prev')
          .setLabel('Previous')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(currentPage === 1),
        new ButtonBuilder()
          .setCustomId('next')
          .setLabel('Next')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(currentPage * 10 >= tpeRankings.length),
      );

      const message = await interaction
        .editReply({
          embeds: [embed],
          components: [row],
        })
        .catch((error) => {
          logger.error(error);
          return null;
        });
      if (!message) {
        return;
      }

      const collector = message.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 60000,
      });

      collector.on('collect', async (btnInteraction) => {
        if (btnInteraction.user.id !== interaction.user.id) {
          return btnInteraction.reply({
            content: 'You cannot interact with these buttons.',
            ephemeral: true,
          });
        }

        if (btnInteraction.customId === 'next') {
          currentPage++;
        } else if (btnInteraction.customId === 'prev' && currentPage > 1) {
          currentPage--;
        }

        const newEmbed = getRankingEmbed(currentPage);
        await btnInteraction.update({
          embeds: [newEmbed],
          components: [
            new ActionRowBuilder<ButtonBuilder>().addComponents(
              new ButtonBuilder()
                .setCustomId('prev')
                .setLabel('Previous')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(currentPage === 1),
              new ButtonBuilder()
                .setCustomId('next')
                .setLabel('Next')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(currentPage * 10 >= tpeRankings.length),
            ),
          ],
        });
      });

      collector.on('end', () => {
        row.components.forEach((button) => button.setDisabled(true));
        message.edit({ components: [row] }).catch((error) => {
          logger.error(error);
        });
      });
    } catch (error) {
      await interaction.editReply({
        content: `An error occurred while retrieving TPE rankings.`,
      });
      return;
    }
  },
} satisfies SlashCommand;
