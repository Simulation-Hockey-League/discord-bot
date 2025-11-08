import {
  CacheType,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import { Database } from 'node_modules/sqlite3/lib/sqlite3';
import { connectToDatabase } from 'src/db/fantasy';
import { UserInfo } from 'src/db/users';
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
  position: string | null | undefined,
  currentUserInfo: UserInfo | null,
  page: number = 1,
): Promise<{ embed: EmbedBuilder; totalPages: number }> => {
  let db: Database | null = null;

  try {
    db = await connectToDatabase();

    interface PlayerRow {
      playerName: string;
    }

    const userPlayers: string[] = await new Promise((resolve, reject) => {
      db!.all(
        `
        SELECT 
          COALESCE(new_player, player) AS playerName
        FROM fantasy_groups
        WHERE group_number = (
          SELECT group_number
          FROM fantasy_groups
          WHERE LOWER(username) = LOWER(?)
          LIMIT 1
        )
        `,
        [currentUserInfo?.forumName],
        (err, rows: PlayerRow[]) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(rows.map((r) => r.playerName));
        },
      );
    });

    const fantasyData: FantasyInfo[] = await new Promise((resolve, reject) => {
      let query = `SELECT * FROM fantasy`;
      const params: string[] = [];

      if (position) {
        query += ` WHERE position = ?`;
        params.push(position);
      }

      db!.all(query, params, (err, rows) => {
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
      .setDescription(
        `Page ${page}/${totalPages}\n**Bolded** = Players in your fantasy group`,
      )
      .addFields({
        name: 'Player Rank',
        value:
          currentPageData.length > 0
            ? currentPageData
                .map((player, index) => {
                  const displayName = userPlayers.includes(player.name)
                    ? `**${player.name}**`
                    : player.name;

                  return `${startIndex + index + 1}. (${
                    player.position
                  }) ${displayName} - ${player.fantasyPoints}`;
                })
                .join('\n')
            : 'No players found',
        inline: false,
      });

    return { embed, totalPages };
  } finally {
    if (db) {
      db.close();
    }
  }
};

export const createGlobalRank = async (
  interaction: ChatInputCommandInteraction<CacheType>,
  page: number = 1,
): Promise<{ embed: EmbedBuilder; totalPages: number }> => {
  let db: Database | null = null;

  try {
    db = await connectToDatabase();

    const fantasyData: Global_DB[] = await new Promise((resolve, reject) => {
      db!.all(
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

    const { totalPages, currentPageData } = paginateGroupData(
      fantasyData,
      page,
    );

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

    return { embed, totalPages };
  } finally {
    if (db) {
      db.close();
    }
  }
};
