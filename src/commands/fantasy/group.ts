import { SlashCommandBuilder } from 'discord.js';
import { BaseEmbed } from 'src/lib/embed';
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
    const groupNumber = interaction.options.getInteger('group');

    try {
      const players = await fetchGlobalSheetData();
      if (!players.length) {
        await interaction.reply({
          content: 'Failed to retrieve data from Google Sheets.',
          ephemeral: true,
        });
        return;
      }

      const groupPlayers = players
        .filter((p) => p.group === groupNumber)
        .sort((a, b) => a.groupRank - b.groupRank);

      if (groupPlayers.length === 0) {
        await interaction.reply({
          content: `Nno group #${groupNumber} found.`,
          ephemeral: true,
        });
        return;
      }

      const leaderboard = generateLeaderboard(groupPlayers, null);

      const embed = BaseEmbed(interaction, {})
        .setTitle(`Fantasy Group ${groupNumber} Rankings`)
        .setDescription(leaderboard);

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({
        content: 'An error occurred while retrieving fantasy rankings.',
        ephemeral: true,
      });
    }
  },
} satisfies SlashCommand;
