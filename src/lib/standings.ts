import { EmbedBuilder } from 'discord.js';
import { LeagueType } from 'src/db/index/shared';
import {
  IndexTeamInfo,
  LeagueConference,
  LeagueDivision,
  PlayoffSeries,
  TeamStats,
} from 'typings/statsindex';

import { findTeamByID } from './teams';

export const playoffStandings = (
  embed: EmbedBuilder,
  playoffFormat: PlayoffSeries[][],
) => {
  if (
    !playoffFormat ||
    !Array.isArray(playoffFormat) ||
    playoffFormat.length === 0
  ) {
    return embed.setDescription('No playoff data available.');
  }

  let outputString = '';

  playoffFormat.forEach((round, roundIndex) => {
    outputString += `**Round ${roundIndex + 1}${getRoundName(
      roundIndex,
      playoffFormat.length,
    )}**\n`;

    round.forEach((series: { team1: any; team2: any }) => {
      const team1 = series.team1;
      const team2 = series.team2;

      outputString += formatPlayoffSeries(team1, team2);
    });

    outputString += '\n';
  });

  return embed.setDescription(outputString);
};

export const regularSeasonStandings = (
  embed: EmbedBuilder,
  seasonStats: TeamStats[],
  teamInfo: IndexTeamInfo[],
  conferenceInfo: LeagueConference[],
  divisionInfo: LeagueDivision[],
  league: LeagueType,
  configuration: string,
) => {
  if (
    configuration === 'division' &&
    !teamInfo.some((team) => team.division !== undefined)
  ) {
    return embed.setDescription(
      `There is no division information available for this season`,
    );
  }

  const teamInfoMap = new Map(teamInfo.map((info) => [info.id, info]));
  const conferenceMap = new Map(conferenceInfo.map((conf) => [conf.id, conf]));
  const divisionMap = new Map();

  divisionInfo.forEach((div) => {
    divisionMap.set(`${div.conference}_${div.id}`, div);
  });

  const validTeamStats = seasonStats.filter((team) => teamInfoMap.has(team.id));
  let outputString = '';

  if (configuration === 'league') {
    const sortedStats = [...validTeamStats].sort((a, b) => b.points - a.points);
    outputString = sortedStats
      .map((team) => formatTeamStanding(team, league))
      .join('\n');
  } else if (configuration === 'conference') {
    const conferenceGroups: Record<number, TeamStats[]> = {};

    for (const team of validTeamStats) {
      const info = teamInfoMap.get(team.id);
      if (!info) continue;

      const conferenceId = info.conference;

      if (!conferenceGroups[conferenceId]) {
        conferenceGroups[conferenceId] = [];
      }

      conferenceGroups[conferenceId].push(team);
    }

    const sortedConferenceIds = Object.keys(conferenceGroups)
      .map(Number)
      .sort((a, b) => a - b);

    for (const confId of sortedConferenceIds) {
      const teams = conferenceGroups[confId];
      const sortedTeams = teams.sort((a, b) => b.points - a.points);
      const conferenceName =
        conferenceMap.get(confId)?.name || `Conference ${confId}`;

      outputString += `**${conferenceName}**\n`;
      outputString +=
        sortedTeams.map((team) => formatTeamStanding(team, league)).join('\n') +
        '\n\n';
    }
  } else if (configuration === 'division') {
    const conferenceGroups: Record<number, Record<number, TeamStats[]>> = {};

    for (const team of validTeamStats) {
      const info = teamInfoMap.get(team.id);
      if (!info) continue;

      const conferenceId = info.conference;
      const divisionId = info.division;

      if (divisionId === undefined) continue;

      if (!conferenceGroups[conferenceId]) {
        conferenceGroups[conferenceId] = {};
      }

      if (!conferenceGroups[conferenceId][divisionId]) {
        conferenceGroups[conferenceId][divisionId] = [];
      }

      conferenceGroups[conferenceId][divisionId].push(team);
    }

    const sortedConferenceIds = Object.keys(conferenceGroups)
      .map(Number)
      .sort((a, b) => a - b);

    for (const confId of sortedConferenceIds) {
      const divisions = conferenceGroups[confId];
      const conferenceName =
        conferenceMap.get(confId)?.name || `Conference ${confId}`;

      outputString += `**${conferenceName}**\n`;

      const sortedDivisionIds = Object.keys(divisions)
        .map(Number)
        .sort((a, b) => a - b);

      for (const divId of sortedDivisionIds) {
        const teams = divisions[divId];
        const sortedTeams = teams.sort((a, b) => b.points - a.points);
        const divisionName =
          divisionMap.get(`${confId}_${divId}`)?.name || `Division ${divId}`;

        outputString += `  **${divisionName}**\n`;
        outputString +=
          sortedTeams
            .map((team) => `  ${formatTeamStanding(team, league)}`)
            .join('\n') + '\n\n';
      }
    }
  }

  return embed.setDescription(outputString);
};

const formatTeamStanding = (team: TeamStats, league: LeagueType) => {
  const teamInfo = findTeamByID(team.id, league);
  const emoji = teamInfo?.emoji;
  const teamAbbr = teamInfo?.abbr;
  const goalDiff = team.goalsFor - team.goalsAgainst;

  return `${emoji ? emoji : ''} | ${teamAbbr} | **${team.points}P** | ${
    team.gp
  }GP | ${team.wins}W | ${team.losses}L | ${team.OTL}OTL | ${goalDiff} GD`;
};

const getRoundName = (roundIndex: number, totalRounds: number): string => {
  if (totalRounds === 4) {
    //SHL & SMJHL 16 team playoff
    switch (roundIndex) {
      case 0:
        return ' (First Round)';
      case 1:
        return ' (Semi Finals)';
      case 2:
        return ' (Conference Finals)';
      case 3:
        return ' (Championship)';
    }
  } else if (totalRounds === 3) {
    //IIHF & WJC 8 Team Playoff
    switch (roundIndex) {
      case 0:
        return ' (Quarterfinals)';
      case 1:
        return ' (Semifinals)';
      case 2:
        return ' (Championship)';
    }
  }
  return '';
};

const formatPlayoffSeries = (team1: any, team2: any): string => {
  const leadingTeam = team1.wins >= team2.wins ? team1 : team2;
  const trailingTeam = team1.wins >= team2.wins ? team2 : team1;

  if (leadingTeam.wins >= 4) {
    return `${leadingTeam.abbr}(${leadingTeam.wins}) ${trailingTeam.abbr}(${trailingTeam.wins})\n`;
  } else {
    return `${leadingTeam.abbr} leads ${trailingTeam.abbr} (${leadingTeam.wins}-${trailingTeam.wins})\n`;
  }
};
