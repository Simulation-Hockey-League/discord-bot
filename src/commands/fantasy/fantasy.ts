import { SlashCommandBuilder } from 'discord.js';
import { Database } from 'node_modules/sqlite3/lib/sqlite3';
import { connectToDatabase } from 'src/db/fantasy';
import { users } from 'src/db/users';
import { BaseEmbed } from 'src/lib/embed';
import { logUnhandledCommandError } from 'src/utils/logUnhandledError';
import { SlashCommand } from 'typings/command';

import { Fantasy_Groups_DB, Global_DB } from 'typings/fantasy';

import {
  formatSwapInfo,
  generateLeaderboard,
  getUserFromFantasyGroups,
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
      const targetName = interaction.options.getString('username');

      const currentUserInfo = await users.get(interaction.user.id);
      const name = targetName || currentUserInfo?.forumName;

      if (!name) {
        await interaction.editReply({
          content: 'No player name provided or stored.',
        });
        return;
      }

      const db: Database = await connectToDatabase();

      const username = await getUserFromFantasyGroups(name, db);
      if (!username) {
        await interaction.editReply({
          content: `Could not find fantasy data for "${name}".`,
        });
        return;
      }

      const fantasy_groups: Fantasy_Groups_DB[] = await new Promise(
        (resolve, reject) => {
          db.all(
            `SELECT * from fantasy_groups WHERE group_number= (SELECT DISTINCT(group_number) from fantasy_groups WHERE LOWER(username) = LOWER(?))`,
            [username],
            (err, rows) => {
              if (err) {
                reject(err);
                return;
              }
              resolve(rows as Fantasy_Groups_DB[]);
            },
          );
        },
      );

      if (!fantasy_groups.length) {
        await interaction.editReply({
          content: `Could not find user "${name}" attached to a Fantasy Group. Please check your spelling.`,
        });
        return;
      }

      const filtered_group: Global_DB[] = await new Promise(
        (resolve, reject) => {
          db.all(
            `SELECT * FROM global_users WHERE group_number = ?`,
            [fantasy_groups[0].group_number],
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
      db.close();
      const userData = filtered_group.find(
        (entry) => entry.username === username,
      );

      const leaderboard = generateLeaderboard(filtered_group, username);
      const playersSection = fantasy_groups
        .filter((player) => player.username === username)
        .map((player) => {
          if (player.new_player) {
            return `${player.player} ${player.OSA} -> ${player.new_player} ${(
              (player.NSC ?? 0) - (player.NSA ?? 0)
            ).toFixed(1)} [${(
              (player.OSA ?? 0) +
              (player.NSC ?? 0) -
              (player.NSA ?? 0)
            ).toFixed(1)}]`;
          }
          return `${player.player}: ${player.fantasyPoints}`;
        })
        .join('\n');
      const swappedPlayers = fantasy_groups.filter(
        (p) => p.username === username && p.new_player,
      );

      const swapSections = swappedPlayers.map(formatSwapInfo);

      const swapSection = swapSections.map((s) => s.pointsAfterSwap).join('\n');
      const swapSection2 = swapSections.map((s) => s.costToSwap).join('\n');

      const embed = BaseEmbed(interaction, {})
        .setTitle(`Fantasy Group ${userData?.group_number}`)
        .setDescription(leaderboard)
        .addFields({
          name: '🌍 Global Rank',
          value: `${username} - **${userData?.score}** (Rank: ${userData?.rank})`,
        })
        .addFields({
          name: 'Players',
          value: playersSection,
        });
      if (swapSection) {
        embed.addFields({ name: 'Points After Swap', value: swapSection });
      }
      if (swapSection2 && username === 'Keven') {
        embed.addFields({
          name: 'Cost to Swap (Hi Keven)',
          value: swapSection2,
        });
      }

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      logUnhandledCommandError(interaction, error);

      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({
          content: 'unexpected error occurred while fetching fantasy data.',
        });
      } else {
        await interaction.reply({
          content: 'unexpected error occurred while fetching fantasy data.',
          ephemeral: true,
        });
      }
    }
  },
} satisfies SlashCommand;
