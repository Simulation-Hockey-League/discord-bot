import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  CommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import { commandCountDB, userCountDB } from 'src/db/users';

import { logger } from './logger';

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
  type: string,
  page: number,
) {
  const totalPages = Math.ceil(leaderboardData.length / LEADERBOARD_PAGE_SIZE);
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
            : `**${start + index + 1}.** ${entry.discordId} - ${
                entry.count
              } uses`,
        )
        .join('\n'),
    )
    .setFooter({ text: `Page ${page + 1} of ${totalPages}` });

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`leaderboard_prev_${type}_${page}`)
      .setLabel('Previous')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(page === 0),
    new ButtonBuilder()
      .setCustomId(`leaderboard_next_${type}_${page}`)
      .setLabel('Next')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(page + 1 >= totalPages),
  );

  if (interaction.replied || interaction.deferred) {
    await interaction
      .editReply({ embeds: [embed], components: [row] })
      .catch((error) => {
        logger.error(error);
      });
  } else {
    await interaction.reply({ embeds: [embed], components: [row] });
  }
}
