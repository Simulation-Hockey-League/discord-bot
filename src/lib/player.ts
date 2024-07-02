import { EmbedBuilder } from 'discord.js';
import { SeasonType } from 'src/db/index/shared';
import { GoalieStats, PlayerStats } from 'typings/statsindex';

import { DynamicConfig } from './config/dynamicConfig';

export const toToi = (minutes: number, games: number): string => {
  const avg = minutes / (games || 0) / 60;
  const avgMinutes = Math.floor(avg);
  const avgSeconds = Math.floor((avg - avgMinutes) * 60);
  return `${avgMinutes}:${avgSeconds.toString().padStart(2, '0')}`;
};

// Populate the embed with player stats fields based on the playerStats response
export const withPlayerStats = (
  embed: EmbedBuilder,
  playerStats: PlayerStats | GoalieStats,
): EmbedBuilder => {
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
                  ).toFixed(0)})`
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
        // TODO(fantasy): if can show fantasy value show here
        {
          name: '\u200B',
          value: '\u200B',
          inline: true,
        },
      );
  } else {
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
      ].join('\n'),
      inline: true,
    });
  }
};
