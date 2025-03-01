import { EmbedBuilder } from 'discord.js';
import { leagueTypeToString } from 'src/db/index/helpers/leagueToString';
import { LeagueType, SkaterCategory } from 'src/db/index/shared';
import { PlayerStats, SeasonType } from 'typings/statsindex';

export const withLeaderStats = async (
  playerStats: PlayerStats[],
  league: LeagueType | undefined,
  season: number | undefined,
  seasonType: SeasonType | undefined,
  position: 'F' | 'D' | undefined,
  leader: SkaterCategory,
  viewRookie: boolean,
  abbr: string | null,
  page: number = 1,
): Promise<EmbedBuilder> => {
  // (F = C, LW, RW; D = LD, RD)
  const filteredPlayers = playerStats.filter((player) => {
    if (position === 'F') {
      return ['C', 'LW', 'RW'].includes(player.position);
    } else if (position === 'D') {
      return ['LD', 'RD'].includes(player.position);
    }
    return true;
  });

  if (!leader) {
    throw new Error('Leader category must be specified');
  }

  filteredPlayers.sort((a, b) => (b[leader] as number) - (a[leader] as number));

  let headerParts = [`${leagueTypeToString(league ?? 0)} Leaders`];

  if (abbr) headerParts.push(`Team: ${abbr.toUpperCase()}`);
  if (position)
    headerParts.push(
      `Position: ${position === 'F' ? 'Forward' : 'Defenseman'}`,
    );
  if (viewRookie) headerParts.push('Rookie Only');
  if (seasonType) headerParts.push(`Type: ${seasonType}`);

  headerParts.push(
    `S${season} ${
      leader.charAt(0).toUpperCase() + leader.slice(1)
    } Leaders (Page ${page})`,
  );

  const embed = new EmbedBuilder().setTitle(headerParts.join(' | '));
  const pageSize = 25;
  const startIndex = (page - 1) * pageSize;
  const topPlayers = filteredPlayers.slice(startIndex, startIndex + pageSize);
  const playerList = topPlayers
    .map(
      (player, index) =>
        `${startIndex + index + 1}. ${player.name} - ${player[leader]}`,
    )
    .join('\n');

  if (playerList.length === 0) {
    embed.setDescription('No players found for the selected category.');
  } else {
    embed.setDescription(playerList);
  }

  return embed;
};
