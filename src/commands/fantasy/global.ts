import { SlashCommandBuilder } from 'discord.js';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} from 'discord.js';
import { createGlobalPlayerRank, createGlobalRank } from 'src/lib/fantasy';
import { SlashCommand } from 'typings/command';

export default {
  command: new SlashCommandBuilder()
    .setName('global')
    .addStringOption((option) =>
      option
        .setName('type')
        .setDescription(
          'Returns either the Global Rank of all users or the Players Rank by score',
        )
        .setChoices(
          { name: 'Global Rank', value: 'global' },
          { name: 'Player Rank', value: 'player' },
        )
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName('position')
        .setDescription(
          'The position to get the rank for. Default to all positions',
        )
        .addChoices(
          { name: 'G', value: 'G' },
          { name: 'F', value: 'F' },
          { name: 'D', value: 'D' },
        )
        .setRequired(false),
    )
    .setDescription('Get global fantasy rankings.'),

  execute: async (interaction) => {
    const type = interaction.options.getString('type');
    const position = interaction.options.getString('position') || null;
    let currentPage = 1;

    await interaction.deferReply();

    try {
      let embed;

      switch (type) {
        case 'global':
          embed = await createGlobalRank(interaction, currentPage);
          break;
        case 'player':
          embed = await createGlobalPlayerRank(
            interaction,
            position,
            currentPage,
          );
          break;
        default:
          await interaction.editReply({
            content: 'Invalid type.',
          });
          return;
      }

      // Create pagination buttons
      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId('prev')
          .setLabel('Previous')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('next')
          .setLabel('Next')
          .setStyle(ButtonStyle.Primary),
      );

      const message = await interaction.editReply({
        embeds: [embed],
        components: [row],
      });

      // Set up collector for button interactions
      const collector = message.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 60000, // 1 minute timeout
      });

      collector.on('collect', async (btnInteraction) => {
        try {
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

          let newEmbed;
          switch (type) {
            case 'global':
              newEmbed = await createGlobalRank(interaction, currentPage);
              break;
            case 'player':
              newEmbed = await createGlobalPlayerRank(
                interaction,
                position,
                currentPage,
              );
              break;
          }

          await btnInteraction.update({
            embeds: [newEmbed],
            components: [row],
          });
        } catch (error) {
          await btnInteraction.reply({
            content: 'An error occurred while fetching fantasy rankings.',
            ephemeral: true,
          });
        }
      });

      collector.on('end', () => {
        row.components.forEach((button) => button.setDisabled(true));
        message.edit({ components: [row] });
      });
    } catch (error) {
      await interaction.editReply({
        content: 'An error occurred while retrieving fantasy rankings.',
      });
    }
  },
} satisfies SlashCommand;
