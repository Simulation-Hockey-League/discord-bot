import { CacheType, ChatInputCommandInteraction } from 'discord.js';

import { BaseEmbed } from './embed';
import {
  fetchGlobalSheetData,
  fetchPlayersOnlyData,
  groupRecords,
  playersOnlyRecords,
} from './helpers/fantasyHelpers';

const PAGE_SIZE = 25;

const paginateData = (data: playersOnlyRecords[], page: number) => {
  const sortedData = data.sort((a, b) => b.score - a.score);
  const totalPages = Math.ceil(sortedData.length / PAGE_SIZE);
  const startIndex = (page - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, sortedData.length);
  const currentPageData = sortedData.slice(startIndex, endIndex);

  return {
    totalPages,
    startIndex,
    currentPageData,
  };
};

const paginateGroupData = (data: groupRecords[], page: number) => {
  const sortedData = data.sort((a, b) => a.globalRank - b.globalRank);
  const totalPages = Math.ceil(sortedData.length / PAGE_SIZE);
  const startIndex = (page - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, sortedData.length);
  const currentPageData = sortedData.slice(startIndex, endIndex);

  return {
    totalPages,
    startIndex,
    currentPageData,
  };
};

export const createGlobalPlayerRank = async (
  interaction: ChatInputCommandInteraction<CacheType>,
  position?: string | null,
  page: number = 1,
) => {
  const fantasyData = await fetchPlayersOnlyData(position ?? null);
  const { totalPages, startIndex, currentPageData } = paginateData(
    fantasyData,
    page,
  );

  const embed = BaseEmbed(interaction, {})
    .setTitle(
      `Global Fantasy Player Rankings${position ? ` - ${position}` : ''}`,
    )
    .setDescription(`Page ${page}/${totalPages}`)
    .addFields({
      name: 'Player Rank',
      value:
        currentPageData.length > 0
          ? currentPageData
              .map(
                (player, index) =>
                  `${startIndex + index + 1}. ${player.playerName} - ${
                    player.score
                  }`,
              )
              .join('\n')
          : 'No players found',
      inline: false,
    });

  return embed;
};

export const createGlobalRank = async (
  interaction: ChatInputCommandInteraction<CacheType>,
  page: number = 1,
) => {
  const fantasyData = await fetchGlobalSheetData();
  const { totalPages, currentPageData } = paginateGroupData(fantasyData, page);

  const embed = BaseEmbed(interaction, {})
    .setTitle('Global Fantasy User Rankings')
    .setDescription(`Page ${page}/${totalPages}`)
    .addFields({
      name: 'Global Rank',
      value:
        currentPageData.length > 0
          ? currentPageData
              .map(
                (user) =>
                  `${user.globalRank}. ${user.username} - ${user.score}`,
              )
              .join('\n')
          : 'No rankings found',
      inline: false,
    });

  return embed;
};
