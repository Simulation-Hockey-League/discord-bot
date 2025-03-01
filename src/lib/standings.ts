import { EmbedBuilder } from 'discord.js';

import { LeagueType } from 'src/db/index/shared';
import { TeamStats } from 'typings/statsindex';

import { findTeamByID } from './teams';

// Populate the embed with player stats fields based on the playerStats response
export const withStandingsStats = (
  embed: EmbedBuilder,
  seasonStats: TeamStats[],
  league: LeagueType,
): EmbedBuilder => {
  let outputString = seasonStats
    .map((team: TeamStats) => {
      const teamInfo = findTeamByID(team.id, league);
      const emoji = teamInfo?.emoji;
      const teamAbbr = teamInfo?.abbr;
      const goalDiff = team.goalsFor - team.goalsAgainst;

      return `${emoji ? emoji : ''} | ${teamAbbr} | **${team.points}P** | ${
        team.gp
      }GP | ${team.wins}W | ${team.losses}L | ${team.OTL}OTL | ${goalDiff} GD`;
    })
    .join('\n');

  return embed.setDescription(outputString);
};
