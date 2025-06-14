import { SlashCommandBuilder } from 'discord.js';
import { connectToDatabase } from 'src/db/fantasy';
import { BaseEmbed } from 'src/lib/embed';
import { logUnhandledCommandError } from 'src/utils/logUnhandledError';
import { SlashCommand } from 'typings/command';

import { Global_DB } from 'typings/fantasy';

import { generateLeaderboard } from '../../utils/fantasyHelpers';

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
      const db = await connectToDatabase();
      const players: Global_DB[] = await new Promise((resolve, reject) => {
        db.all(`SELECT * FROM global_users`, (err, rows) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(rows as Global_DB[]);
        });
      });
      if (!players.length) {
        await interaction.editReply({
          content: 'Failed to retrieve data from Google Sheets.',
        });
        return;
      }

      const groupPlayers = players
        .filter((p) => p.group_number === groupNumber)
        .sort((a, b) => a.score - b.score);

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
        logUnhandledCommandError(interaction, error);
      });
    } catch (error) {
      await interaction.editReply({
        content: 'An error occurred while retrieving fantasy rankings.',
      });
    }
  },
} satisfies SlashCommand;
