import { EmbedBuilder } from 'discord.js';
import { IndexApiClient } from 'src/db/index/api/IndexApiClient';
import { SeasonType } from 'src/db/index/shared';
import { GoalieStats, PlayerStats } from 'typings/statsindex';

import { DynamicConfig } from './config/dynamicConfig';
import { getSkaterFantasyPoints } from './fantasyHelpers';

export const toToi = (minutes: number, games: number): string => {
  const avg = minutes / (games || 0) / 60;
  const avgMinutes = Math.floor(avg);
  const avgSeconds = Math.floor((avg - avgMinutes) * 60);
  return `${avgMinutes}:${avgSeconds.toString().padStart(2, '0')}`;
};

export const withPlayerStats = async (
  embed: EmbedBuilder,
  playerStats: PlayerStats | GoalieStats,
): Promise<EmbedBuilder> => {
  const fantasyPoints = getSkaterFantasyPoints(playerStats);
  const currentSeason = DynamicConfig.get('currentSeason');
  const seasonInfo = `Season: ${playerStats.season}${
    playerStats.seasonType === SeasonType.POST ? ' | Playoffs' : ''
  }`;
  if ('advancedStats' in playerStats) {
    return embed
      .setDescription(
        `Games played: ${playerStats.gamesPlayed}${
          playerStats.season !== currentSeason ? `\n${seasonInfo}` : ''
        }`,
      )
      .addFields(
        {
          name: 'Stats',
          value: [
            `Goals: ${playerStats.goals}`,
            `Assists: ${playerStats.assists}`,
            `Points: ${playerStats.points}`,
            `Plus/Minus: ${playerStats.plusMinus > 0 ? '+' : ''}${
              playerStats.plusMinus
            }`,
            `Shots: ${playerStats.shotsOnGoal}`,
            `Shooting %: ${(
              (100 * playerStats.goals) /
              (playerStats.shotsOnGoal || 1)
            ).toFixed(2)}`,
            `GWG: ${
              typeof playerStats.gwg === 'number' ? playerStats.gwg : '-'
            }`,
          ].join('\n'),
          inline: true,
        },
        {
          name: '\u200B',
          value: [
            `Hits: ${playerStats.hits}`,
            `Blocks: ${playerStats.shotsBlocked}`,
            `PIM: ${playerStats.pim}`,
            `Fights: ${playerStats.fights} ${
              playerStats.fightWins > 0 ? `(${playerStats.fightWins} won)` : ''
            }`,
            `TA: ${playerStats.takeaways}`,
            `GA: ${playerStats.giveaways}`,
            `TA/GA: ${(
              playerStats.takeaways / (playerStats.giveaways || 1)
            ).toFixed(2)}`,
          ].join('\n'),
          inline: true,
        },
        {
          name: '\u200B',
          value: [
            `PP goals: ${playerStats.ppGoals}`,
            `PP points: ${playerStats.ppPoints}`,
            `SH points: ${playerStats.shPoints}`,
            `TOI: ${toToi(playerStats.timeOnIce, playerStats.gamesPlayed)}`,
            `PP: ${toToi(playerStats.ppTimeOnIce, playerStats.gamesPlayed)}`,
            `SH: ${toToi(playerStats.shTimeOnIce, playerStats.gamesPlayed)}`,
            `FOW: ${playerStats.faceoffWins ?? '-'} ${
              playerStats.faceoffs && playerStats.faceoffWins
                ? `(${(
                    (100 * playerStats.faceoffWins) /
                    playerStats.faceoffs
                  ).toFixed(0)}%)`
                : ''
            }`,
          ].join('\n'),
          inline: true,
        },
        {
          name: 'Advanced',
          value: [
            `PDO: ${playerStats.advancedStats.PDO.toFixed(2)}`,
            `CF%: ${playerStats.advancedStats.CFPct.toFixed(2)}`,
            `CF% rel: ${
              playerStats.advancedStats.CFPctRel > 0 ? '+' : ''
            }${playerStats.advancedStats.CFPctRel.toFixed(2)}`,
          ].join('\n'),
          inline: true,
        },
        {
          name: '\u200B',
          value: [
            `GR: ${playerStats.gameRating}`,
            `OGR: ${playerStats.offensiveGameRating}`,
            `DGR: ${playerStats.defensiveGameRating}`,
          ].join('\n'),
          inline: true,
        },
        {
          name: '\u200B',
          value: [`Fantasy: ${fantasyPoints}`].join('\n'),
          inline: true,
        },
        {
          name: '\u200B',
          value: '\u200B',
          inline: true,
        },
      );
  } else {
    const allGoalies = await IndexApiClient.get(
      playerStats.league,
    ).getGoalieStats(playerStats.seasonType, playerStats.season);
    const { totalSaves, totalShotsAgainst } = allGoalies.reduce(
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

    const gsaa =
      playerStats.saves - leagueAvgSavePct * playerStats.shotsAgainst;

    if (playerStats.season !== currentSeason) {
      embed.setDescription(seasonInfo);
    }
    return embed.addFields({
      name: 'Stats',
      value: [
        `Games Played: ${playerStats.gamesPlayed}`,
        `Record: ${playerStats.wins}-${playerStats.losses}-${playerStats.ot}`,
        `GAA: ${playerStats.gaa}`,
        `Save percentage: ${playerStats.savePct}`,
        `Shutouts: ${playerStats.shutouts}`,
        `Shots against: ${(
          playerStats.shotsAgainst / (playerStats.gamesPlayed || 1)
        ).toFixed(2)}`,
        `Game rating: ${playerStats.gameRating}`,
        `GSAA: ${gsaa.toFixed(2)}`,
        `Fantasy: ${fantasyPoints}`,
      ].join('\n'),
      inline: true,
    });
  }
};
