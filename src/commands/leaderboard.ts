import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import {
  getGlobalLeaderboard,
  getPlayerLeaderboard,
  sendLeaderboard,
} from 'src/lib/leaderboard';
import { SlashCommand } from 'typings/command';

export default {
  command: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Displays the command usage leaderboard.')
    .addStringOption((option) =>
      option
        .setName('type')
        .setDescription('The type of leaderboard to display')
        .setRequired(true)
        .addChoices(
          { name: 'Command', value: 'global' },
          { name: 'User', value: 'player' },
        ),
    ),

  execute: async (interaction: ChatInputCommandInteraction) => {
    await interaction.deferReply();

    const type = interaction.options.getString('type', true);
    let leaderboardData;

    if (type === 'global') {
      leaderboardData = await getGlobalLeaderboard();
    } else {
      leaderboardData = await getPlayerLeaderboard();
    }

    if (!leaderboardData.length) {
      await interaction.editReply('No leaderboard data available.');
      return;
    }

    await sendLeaderboard(interaction, leaderboardData, type, 0);
    return;
  },
} satisfies SlashCommand;
