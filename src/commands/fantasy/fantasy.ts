import { SlashCommandBuilder } from 'discord.js';
import { users } from 'src/db/users';
import { BaseEmbed } from 'src/lib/embed';
import { SlashCommand } from 'typings/command';

import {
  fetchGlobalSheetData,
  fetchPlayersData,
  fetchSwapsData,
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

    try {
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

      const leaderboard =
        groupPlayers
          .map(
            (p, index) =>
              `${index + 1}.  ${
                p.username === user.username ? `**${p.username}**` : p.username
              } - ${p.score}`,
          )
          .slice(0, 4)
          .join('\n') +
        '\n' +
        '------\n' +
        groupPlayers
          .slice(4, 8)
          .map(
            (p, index) =>
              `${index + 5}. ${
                p.username === user.username ? `**${p.username}**` : p.username
              } - ${p.score}`,
          )
          .join('\n');

      const playerData = await fetchPlayersData(name);
      const swapData = await fetchSwapsData(name);

      let playersSection = '';
      playerData.forEach((player) => {
        playersSection += `${player.player} - ${player.score}\n`;
      });

      let swapsSection = '';
      swapData.forEach((swap) => {
        if (swap.oldSkater !== 'None' && swap.newSkater !== 'None') {
          const skaterScoreDifference = swap.nsc - swap.nsa;
          swapsSection += `**${swap.oldSkater}** ${swap.osa} -> **${swap.newSkater}** - ${skaterScoreDifference}\n`;
        }

        if (swap.oldGoalie !== 'None' && swap.newGoalie !== 'None') {
          const goalieScoreDifference = swap.nsc - swap.nsa;
          swapsSection += `**${swap.oldGoalie}** ${swap.osa} -> **${swap.newGoalie}** - ${goalieScoreDifference}\n`;
        }
      });

      const embed = BaseEmbed(interaction, {})
        .setTitle(`Fantasy Group ${groupNumber}`)
        .setDescription(leaderboard)
        .addFields({
          name: '🌍 Global Rank & TPE Reward',
          value: `${user.username} - **${user.score}** (Rank: ${user.globalRank})`,
        })
        .addFields({
          name: 'Players',
          value: playersSection,
        });
      if (swapsSection !== '') {
        embed.addFields({
          name: 'Swaps',
          value: swapsSection || 'No swaps made.',
        });
      }
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({
        content: 'An error occurred while retrieving fantasy rankings.',
        ephemeral: true,
      });
    }
  },
} satisfies SlashCommand;
