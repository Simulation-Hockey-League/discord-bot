import { CacheType, ChatInputCommandInteraction } from 'discord.js';

import { Database } from 'node_modules/sqlite3/lib/sqlite3';
import { connectToDatabase } from 'src/db/fantasy';
import { FantasyInfo, Global_DB } from 'typings/fantasy';

import { BaseEmbed } from './embed';

const PAGE_SIZE = 25;

const paginateData = (data: FantasyInfo[], page: number) => {
  const sortedData = data.sort((a, b) => b.fantasyPoints - a.fantasyPoints);
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

const paginateGroupData = (data: Global_DB[], page: number) => {
  const sortedData = data.sort((a, b) => a.rank - b.rank);
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
  const db: Database = await connectToDatabase();

  const fantasyData: FantasyInfo[] = await new Promise((resolve, reject) => {
    let query = `SELECT * FROM fantasy`;
    if (position) {
      query += ` WHERE position = ?`;
    }
    db.all(query, position || [], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows as FantasyInfo[]);
    });
  });

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
                  `${startIndex + index + 1}. (${player.position}) ${
                    player.name
                  } - ${player.fantasyPoints}`,
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
  const db: Database = await connectToDatabase();

  const fantasyData: Global_DB[] = await new Promise((resolve, reject) => {
    db.all(
      `SELECT username, group_number, score, rank FROM global_users`,
      (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(rows as Global_DB[]);
      },
    );
  });
  const { totalPages, currentPageData } = paginateGroupData(fantasyData, page);

  const embed = BaseEmbed(interaction, {})
    .setTitle('Global Fantasy User Rankings')
    .setDescription(`Page ${page}/${totalPages}`)
    .addFields({
      name: 'Global Rank',
      value:
        currentPageData.length > 0
          ? currentPageData
              .map((user) => `${user.rank}. ${user.username} - ${user.score}`)
              .join('\n')
          : 'No rankings found',
      inline: false,
    });

  return embed;
};
