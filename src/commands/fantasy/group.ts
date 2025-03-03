import { SlashCommandBuilder } from 'discord.js';
import { BaseEmbed } from 'src/lib/embed';
import { logger } from 'src/lib/logger';
import { SlashCommand } from 'typings/command';

import {
  fetchGlobalSheetData,
  generateLeaderboard,
} from '../../lib/helpers/fantasyHelpers';

export default {
  command: new SlashCommandBuilder()
    .setName('fantasygroup')
    .addIntegerOption((option) =>
      option
        .setName('group')
        .setDescription('The group number to retrieve rankings for.')
        .setRequired(true),
    )
    .setDescription('Retrieve fantasy rankings for a specified group.'),

  execute: async (interaction) => {
    await interaction.deferReply({ ephemeral: false });
    const groupNumber = interaction.options.getInteger('group');

    try {
      const players = await fetchGlobalSheetData();
      if (!players.length) {
        await interaction.editReply({
          content: 'Failed to retrieve data from Google Sheets.',
        });
        return;
      }

      const groupPlayers = players
        .filter((p) => p.group === groupNumber)
        .sort((a, b) => a.groupRank - b.groupRank);

      if (groupPlayers.length === 0) {
        await interaction.editReply({
          content: `No group #${groupNumber} found.`,
        });
        return;
      }

      const leaderboard = generateLeaderboard(groupPlayers, null);

      const embed = BaseEmbed(interaction, {})
        .setTitle(`Fantasy Group ${groupNumber} Rankings`)
        .setDescription(leaderboard);

      await interaction.editReply({ embeds: [embed] }).catch((error) => {
        logger.error(error);
      });
    } catch (error) {
      await interaction.editReply({
        content: 'An error occurred while retrieving fantasy rankings.',
      });
    }
  },
} satisfies SlashCommand;
