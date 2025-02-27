import { SlashCommandBuilder } from 'discord.js';
import { users } from 'src/db/users';
import { BaseEmbed } from 'src/lib/embed';
import { SlashCommand } from 'typings/command';

import {
  fetchGlobalSheetData,
  fetchPlayersData,
  fetchSwapsData,
  generateLeaderboard,
  getUserByFuzzy,
} from '../../lib/fantasyHelpers';

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
        await interaction.reply({
          content: 'No player name provided or stored.',
          ephemeral: true,
        });
        return;
      }

      const players = await fetchGlobalSheetData();
      if (!players.length) {
        await interaction.reply({
          content: 'Failed to retrieve data from Google Sheets.',
          ephemeral: true,
        });
        return;
      }

      const user = await getUserByFuzzy(name, players);
      if (!user) {
        await interaction.reply({
          content: `Could not find user "${name}". Please check your spelling.`,
          ephemeral: true,
        });
        return;
      }

      const groupNumber = user.group;
      const groupPlayers = players
        .filter((p) => p.group === groupNumber)
        .sort((a, b) => a.groupRank - b.groupRank);

      const leaderboard = generateLeaderboard(groupPlayers, user.username);

      const playerData = await fetchPlayersData(user.username);
      const swapData = await fetchSwapsData(user.username);

      let swapsDict: { [key: string]: string } = {};
      swapData.forEach((swap) => {
        if (swap.oldSkater !== 'None' && swap.newSkater !== 'None') {
          swapsDict[swap.oldSkater] = `**${swap.oldSkater}** ${swap.osa} -> **${
            swap.newSkater
          }** - ${(swap.nsc - swap.nsa).toFixed(2)}`;
        }

        if (swap.oldGoalie !== 'None' && swap.newGoalie !== 'None') {
          swapsDict[swap.oldGoalie] = `**${swap.oldGoalie}** ${swap.osa} -> **${
            swap.newGoalie
          }** - ${(swap.nsc - swap.nsa).toFixed(2)}`;
        }
      });

      let playersSection = '';
      playerData.forEach((player) => {
        if (swapsDict[player.player]) {
          playersSection += `${swapsDict[player.player]}\n`;
        } else {
          playersSection += `${player.player} - ${player.score}\n`;
        }
      });

      const embed = BaseEmbed(interaction, {})
        .setTitle(`Fantasy Group ${groupNumber}`)
        .setDescription(leaderboard)
        .addFields({
          name: '🌍 Global Rank',
          value: `${user.username} - **${user.score}** (Rank: ${user.globalRank})`,
        })
        .addFields({
          name: 'Players',
          value: playersSection,
        });
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      await interaction.editReply({
        content: `An error occurred while retrieving fantasy rankings.`,
      });
    }
  },
} satisfies SlashCommand;
