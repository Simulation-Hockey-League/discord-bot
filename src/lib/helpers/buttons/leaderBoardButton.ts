import { ButtonInteraction } from 'discord.js';
import {
  getGlobalLeaderboard,
  getPlayerLeaderboard,
  sendLeaderboard,
} from 'src/lib/leaderboard';

export async function handleLeaderboardButtons(interaction: ButtonInteraction) {
  if (!interaction.customId.startsWith('leaderboard_')) return;

  const [, action, type, pageStr] = interaction.customId.split('_');
  const currentPage = parseInt(pageStr, 10);
  const newPage = action === 'prev' ? currentPage - 1 : currentPage + 1;

  let leaderboardData;
  if (type === 'global') {
    leaderboardData = await getGlobalLeaderboard();
  } else {
    leaderboardData = await getPlayerLeaderboard();
  }

  if (!leaderboardData.length) return;

  await sendLeaderboard(interaction, leaderboardData, type, newPage);
  await interaction.deferUpdate();
}
