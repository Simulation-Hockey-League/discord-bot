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
  const leaderboardType = type === 'global' ? 'global' : 'player';
  if (leaderboardType === 'global') {
    leaderboardData = await getGlobalLeaderboard();
  } else {
    leaderboardData = await getPlayerLeaderboard();
  }

  if (!leaderboardData.length) return;

  await sendLeaderboard(interaction, leaderboardData, leaderboardType, newPage);
  await interaction.deferUpdate();
}
