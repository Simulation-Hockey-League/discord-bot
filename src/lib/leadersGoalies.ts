import { EmbedBuilder } from 'discord.js';
import { leagueTypeToString } from 'src/db/index/helpers/leagueToString';
import { GoalieCategories, LeagueType } from 'src/db/index/shared';
import { GoalieStats, SeasonType } from 'typings/statsindex';

export const withLeaderStats = async (
  playerStats: GoalieStats[],
  league: LeagueType | undefined,
  season: number | undefined,
  seasonType: SeasonType | undefined,
  leader: GoalieCategories,
  page: number = 1,
): Promise<EmbedBuilder> => {
  if (!leader) {
    throw new Error('Leader category must be specified');
  }

  playerStats.sort((a, b) => (b[leader] as number) - (a[leader] as number));

  let header = `${leagueTypeToString(league ?? 0)} Leaders`;

  header += `\nS${playerStats[0].season} ${
    leader.charAt(0).toUpperCase() + leader.slice(1)
  } Leaders (Page ${page})`;

  const embed = new EmbedBuilder().setTitle(header);

  const pageSize = 25;
  const startIndex = (page - 1) * pageSize;
  const topPlayers = playerStats.slice(startIndex, startIndex + pageSize);
  const playerList = topPlayers
    .map(
      (player, index) =>
        `${startIndex + index + 1}. ${player.name} - ${player[leader]}`,
    )
    .join('\n');

  embed.setDescription(playerList);

  return embed;
};
