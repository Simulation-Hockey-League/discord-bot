import { EmbedBuilder } from 'discord.js';
import { IndexApiClient } from 'src/db/index/api/IndexApiClient';
import { SeasonType } from 'src/db/index/shared';
import {
  GoalieRatings,
  GoalieStats,
  PlayerRatings,
  PlayerStats,
} from 'typings/statsindex';

import { DynamicConfig } from './config/dynamicConfig';
import { getSkaterFantasyPoints } from './helpers/fantasyHelpers';
import { getGSAAInfo } from './helpers/playerHelpers';

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
          value: [`Fantasy: ${fantasyPoints.toFixed(2)}`].join('\n'),
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
    const leagueAvgSavePct = getGSAAInfo(allGoalies);

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
        `Fantasy: ${fantasyPoints.toFixed(2)}`,
      ].join('\n'),
      inline: true,
    });
  }
};

export const withPlayerRatings = async (
  embed: EmbedBuilder,
  playerRatings: PlayerRatings | GoalieRatings,
): Promise<EmbedBuilder> => {
  embed.setDescription(
    'The player ratings are defined by the index ratings, not by the portal ratings.',
  );

  if ('mentalToughness' in playerRatings) {
    return embed.addFields(
      {
        name: 'Goalie Ratings',
        value: [
          `Blocker: ${playerRatings.blocker}`,
          `Glove: ${playerRatings.glove}`,
          `Passing: ${playerRatings.passing}`,
          `Poke Check: ${playerRatings.pokeCheck}`,
          `Positioning: ${playerRatings.positioning}`,
          `Rebound: ${playerRatings.rebound}`,
          `Recovery: ${playerRatings.recovery}`,
          `Puckhandling: ${playerRatings.puckhandling}`,
          `Low Shots: ${playerRatings.lowShots}`,
          `Reflexes: ${playerRatings.reflexes}`,
          `Skating: ${playerRatings.skating}`,
        ].join('\n'),
        inline: true,
      },
      {
        name: 'Mental Ratings',
        value: [
          `Mental Toughness: ${playerRatings.mentalToughness}`,
          `Goalie Stamina: ${playerRatings.goalieStamina}`,
        ].join('\n'),
        inline: true,
      },
      {
        name: '\u200B',
        value: '\u200B',
        inline: true,
      },
    );
  } else {
    return embed.addFields(
      {
        name: 'Offensive Ratings',
        value: [
          `Screening: ${playerRatings.screening}`,
          `Getting Open: ${playerRatings.gettingOpen}`,
          `Passing: ${playerRatings.passing}`,
          `Puckhandling: ${playerRatings.puckhandling}`,
          `Shooting Accuracy: ${playerRatings.shootingAccuracy}`,
          `Shooting Range: ${playerRatings.shootingRange}`,
          `Offensive Read: ${playerRatings.offensiveRead}`,
        ].join('\n'),
        inline: true,
      },
      {
        name: 'Defensive Ratings',
        value: [
          `Checking: ${playerRatings.checking}`,
          `Hitting: ${playerRatings.hitting}`,
          `Positioning: ${playerRatings.positioning}`,
          `Stickchecking: ${playerRatings.stickchecking}`,
          `Shot Blocking: ${playerRatings.shotBlocking}`,
          `Faceoffs: ${playerRatings.faceoffs}`,
          `Defensive Read: ${playerRatings.defensiveRead}`,
        ].join('\n'),
        inline: true,
      },
      {
        name: 'Physical Ratings',
        value: [
          `Acceleration: ${playerRatings.acceleration}`,
          `Agility: ${playerRatings.agility}`,
          `Balance: ${playerRatings.balance}`,
          `Speed: ${playerRatings.speed}`,
          `Stamina: ${playerRatings.stamina}`,
          `Strength: ${playerRatings.strength}`,
          `Fighting: ${playerRatings.fighting}`,
        ].join('\n'),
        inline: true,
      },
      {
        name: 'Mental Ratings',
        value: [
          `Aggression: ${playerRatings.aggression}`,
          `Bravery: ${playerRatings.bravery}`,
        ].join('\n'),
        inline: true,
      },
    );
  }
};
