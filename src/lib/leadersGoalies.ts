import { EmbedBuilder } from 'discord.js';
import { leagueTypeToString } from 'src/db/index/helpers/leagueToString';
import { GoalieCategories, LeagueType } from 'src/db/index/shared';
import { GoalieStats, SeasonType } from 'typings/statsindex';

import { pageSizes } from './config/config';

export const withLeaderStats = async (
  playerStats: GoalieStats[],
  league: LeagueType | undefined,
  season: number | undefined,
  seasonType: SeasonType | undefined,
  leader: GoalieCategories,
  viewRookie: boolean,
  abbr: string | null,
  page: number,
): Promise<{ embed: EmbedBuilder; totalPages: number }> => {
  if (!leader) {
    throw new Error('Leader category must be specified');
  }

  let gsaaMap: Map<number, number> | null = null;

  if (leader === 'GSAA') {
    // Compute total saves and total shots in a single loop
    const { totalSaves, totalShotsAgainst } = playerStats.reduce(
      (acc, g) => {
        acc.totalSaves += g.saves;
        acc.totalShotsAgainst += g.shotsAgainst;
        return acc;
      },
      { totalSaves: 0, totalShotsAgainst: 0 },
    );

    const leagueAvgSavePct = totalShotsAgainst
      ? totalSaves / totalShotsAgainst
      : 0;
    gsaaMap = new Map();
    playerStats.forEach((player) => {
      const gsaa = player.saves - leagueAvgSavePct * player.shotsAgainst;
      gsaaMap!.set(player.id, gsaa);
    });
  }

  // Sort goalies based on the selected leader category OR GSAA if selected
  playerStats.sort((a, b) => {
    if (leader === 'GSAA' && gsaaMap) {
      return (gsaaMap.get(b.id) ?? 0) - (gsaaMap.get(a.id) ?? 0);
    }
    return (b[leader] as number) - (a[leader] as number);
  });

  let headerParts = [`${leagueTypeToString(league ?? 0)} Leaders`];

  if (abbr) headerParts.push(`Team: ${abbr.toUpperCase()}`);
  if (seasonType) headerParts.push(`Type: ${seasonType}`);
  if (viewRookie) headerParts.push('Rookie Only');

  headerParts.push(
    `S${season} ${
      leader.charAt(0).toUpperCase() + leader.slice(1)
    } Leaders (Page ${page})`,
  );
  const embed = new EmbedBuilder().setTitle(headerParts.join(' | '));

  const totalPages = Math.ceil(playerStats.length / pageSizes.global);
  const startIndex = (page - 1) * pageSizes.global;
  const topPlayers = playerStats.slice(
    startIndex,
    startIndex + pageSizes.global,
  );
  const playerList = topPlayers
    .map((player, index) => {
      const value =
        leader === 'GSAA' && gsaaMap
          ? gsaaMap.get(player.id)?.toFixed(2)
          : player[leader];
      return `${startIndex + index + 1}. ${player.name} - ${value}`;
    })
    .join('\n');

  if (playerList.length === 0) {
    embed.setDescription('No players found for the selected category.');
  } else {
    embed.setDescription(playerList);
  }

  return { embed, totalPages };
};
