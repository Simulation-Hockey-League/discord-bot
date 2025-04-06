import {
  ButtonInteraction,
  CommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import { commandCountDB, userCountDB } from 'src/db/users';

import {
  GetPageFn,
  backForwardButtons,
  createPaginator,
} from './helpers/buttons/button';

const LEADERBOARD_PAGE_SIZE = 20;

export async function getGlobalLeaderboard() {
  const allData = await commandCountDB.iterator();
  const leaderboard = [];

  for await (const [commandName, count] of allData) {
    leaderboard.push({ commandName, count });
  }

  return leaderboard.sort((a, b) => b.count - a.count);
}

export async function getPlayerLeaderboard() {
  const allData = await userCountDB.iterator();
  const leaderboard = [];

  for await (const [discordId, count] of allData) {
    leaderboard.push({ discordId, count });
  }

  return leaderboard.sort((a, b) => b.count - a.count);
}

export async function sendLeaderboard(
  interaction: CommandInteraction | ButtonInteraction,
  leaderboardData: {
    commandName?: string;
    discordId?: string;
    count: number;
  }[],
  type: 'global' | 'player',
  initialPage = 1,
) {
  const getLeaderboardPage: GetPageFn = async (page) => {
    const totalPages = Math.ceil(
      leaderboardData.length / LEADERBOARD_PAGE_SIZE,
    );
    const start = page * LEADERBOARD_PAGE_SIZE;
    const end = start + LEADERBOARD_PAGE_SIZE;
    const pageData = leaderboardData.slice(start, end);

    const embed = new EmbedBuilder()
      .setTitle(
        type === 'global'
          ? 'Global Command Leaderboard'
          : 'Player Command Leaderboard',
      )
      .setDescription(
        pageData
          .map((entry, index) =>
            type === 'global'
              ? `**${start + index + 1}.** \`${entry.commandName}\` - ${
                  entry.count
                } uses`
              : `**${start + index + 1}.** <@${entry.discordId}> - ${
                  entry.count
                } uses`,
          )
          .join('\n') || 'No data available.',
      )
      .setFooter({ text: `Page ${page + 1} of ${totalPages}` });

    const buttons = backForwardButtons(page, totalPages);
    return { embed, buttons, totalPages };
  };

  const page = initialPage;
  const { embed, buttons } = await getLeaderboardPage(page);

  if (interaction.replied || interaction.deferred) {
    const message = await interaction.editReply({
      embeds: [embed],
      components: [buttons],
    });

    await createPaginator(message, interaction.user.id, getLeaderboardPage);
  } else {
    const message = await interaction.reply({
      embeds: [embed],
      components: [buttons],
      fetchReply: true,
    });

    if ('id' in message) {
      await createPaginator(message, interaction.user.id, getLeaderboardPage);
    }
  }
}
