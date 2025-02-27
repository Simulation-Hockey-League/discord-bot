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

      return `${emoji ? emoji : ''} ${team.name} - **${team.points}** (${
        team.gp
      }-${team.wins}-${team.losses}-${team.OTL})`;
    })
    .join('\n');

  return embed.setDescription(outputString);
};
