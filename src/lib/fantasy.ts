import { BaseEmbed } from './embed';
import { fetchPlayersOnlyData } from './fantasyHelpers';

const PAGE_SIZE = 25;

const paginateData = (
  data: { score: number; playerName: string }[],
  page: number,
) => {
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

export const createGlobalPlayerRank = async (
  interaction: any,
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

export const createGlobalRank = async (interaction: any, page: number = 1) => {
  const fantasyData = await fetchPlayersOnlyData(null);
  const { totalPages, startIndex, currentPageData } = paginateData(
    fantasyData,
    page,
  );

  const embed = BaseEmbed(interaction, {})
    .setTitle('Global Fantasy Rankings')
    .setDescription(`Page ${page}/${totalPages}`)
    .addFields({
      name: 'Global Rank',
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
          : 'No rankings found',
      inline: false,
    });

  return embed;
};
