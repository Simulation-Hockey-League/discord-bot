import { SlashCommandBuilder } from 'discord.js';
import { Database } from 'node_modules/sqlite3/lib/sqlite3';
import { connectToDatabase } from 'src/db/fantasy';
import { users } from 'src/db/users';
import { BaseEmbed } from 'src/lib/embed';
import { logUnhandledCommandError } from 'src/utils/logUnhandledError';
import { SlashCommand } from 'typings/command';

import { Fantasy_Groups_DB, Global_DB } from 'typings/fantasy';

import {
  generateLeaderboard,
  getUserByFuzzy,
} from '../../utils/fantasyHelpers';

export default {
  command: new SlashCommandBuilder()
    .setName('fantasy')
    .addStringOption((option) =>
      option
        .setName('username')
        .setDescription('The username of the player.')
        .setRequired(false),
    )
    .setDescription('Retrieve fantasy rankings for a specified player.'),

  execute: async (interaction) => {
    try {
      await interaction.deferReply({ ephemeral: false });
      const target = interaction.options.getString('username');

      const currentUserInfo = await users.get(interaction.user.id);
      const name = target || currentUserInfo?.forumName;

      if (!name) {
        await interaction.editReply({
          content: 'No player name provided or stored.',
        });
        return;
      }

      const db: Database = await connectToDatabase();

      const fantasy_groups: Fantasy_Groups_DB[] = await new Promise(
        (resolve, reject) => {
          db.all(`SELECT * FROM fantasy_groups`, (err, rows) => {
            if (err) {
              reject(err);
              return;
            }
            resolve(rows as Fantasy_Groups_DB[]);
          });
        },
      );
      const user = await getUserByFuzzy(name, fantasy_groups);
      if (!user) {
        await interaction.editReply({
          content: `Could not find user "${name}". Please check your spelling.`,
        });
        return;
      }

      const filtered_fantasy = fantasy_groups.filter(
        (entry) => entry.username === user.username,
      );

      const filtered_group: Global_DB[] = await new Promise(
        (resolve, reject) => {
          db.all(
            `SELECT * FROM global_users WHERE group_number = ?`,
            [user.group_number],
            (err, rows) => {
              if (err) {
                reject(err);
                return;
              }
              resolve(rows as Global_DB[]);
            },
          );
        },
      );
      const userData = filtered_group.find(
        (entry) => entry.username === user.username,
      );
      if (!userData) {
        await interaction.editReply({
          content: `Could not find user data for "${name}".`,
        });
        return;
      }

      const leaderboard = generateLeaderboard(filtered_group, user.username);
      let playersSection = '';
      filtered_fantasy.forEach((player) => {
        if (player.new_player) {
          playersSection += `${player.player} ${player.OSA} -> ${player.new_player} ${player.NSA} (${player.Difference})\n`;
        } else {
          playersSection += `${player.player}: ${player.fantasyPoints}\n`;
        }
      });

      const embed = BaseEmbed(interaction, {})
        .setTitle(`Fantasy Group ${userData.group_number}`)
        .setDescription(leaderboard)
        .addFields({
          name: '🌍 Global Rank',
          value: `${user.username} - **${userData.score}** (Rank: ${userData.rank})`,
        })
        .addFields({
          name: 'Players',
          value: playersSection,
        });
      await interaction.editReply({ embeds: [embed] }).catch((error) => {
        logUnhandledCommandError(interaction, error);
      });
    } catch (error) {
      await interaction.editReply({
        content: `An error occurred while retrieving fantasy rankings.`,
      });
    }
  },
} satisfies SlashCommand;
