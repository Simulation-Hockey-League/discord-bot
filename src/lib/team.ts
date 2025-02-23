import { getTeamStats } from 'src/db/index';
import { IndexApiClient } from 'src/db/index/api/IndexApiClient';

import { SeasonType } from 'src/db/index/shared';

import { IndexTeamInfo } from 'typings/statsindex';

import { BaseEmbed } from './embed';
import {
  formatFutureGame,
  formatPastGame,
  gameTypeToSeasonType,
  getLast10Games,
} from './teamHelpers';
import { TeamInfo } from './teams';

export async function createScheduleEmbed(
  interaction: any,
  teamData: IndexTeamInfo,
  teamInfo: TeamInfo,
  seasonType?: SeasonType,
  season?: number,
) {
  if (season && season <= 52) {
    await interaction.editReply({
      content: 'Cannot fetch schedule for seasons before Season 53.',
      ephemeral: true,
    });
    return;
  }

  const fullSchedule = await IndexApiClient.get(
    teamInfo.leagueType,
  ).getSchedule(season);
  const pastGames = fullSchedule
    .filter((game) => game.played === 1)
    .filter(
      (game) =>
        gameTypeToSeasonType(game.type) === (seasonType ?? SeasonType.REGULAR),
    )
    .filter(
      (game) =>
        game.awayTeamInfo.name === teamInfo.fullName ||
        game.homeTeamInfo.name === teamInfo.fullName,
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 7)
    .reverse();

  const futureGames = fullSchedule
    .filter((game) => game.played === 0)
    .filter(
      (game) =>
        gameTypeToSeasonType(game.type) === (seasonType ?? SeasonType.REGULAR),
    )
    .filter(
      (game) =>
        game.awayTeamInfo.name === teamInfo.fullName ||
        game.homeTeamInfo.name === teamInfo.fullName,
    )
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  const pastGamesText =
    pastGames.length > 0
      ? pastGames.map((game) => formatPastGame(game, teamInfo)).join('\n')
      : 'No past games found.';
  const futureGamesText =
    futureGames.length > 0
      ? futureGames.map(formatFutureGame).join('\n')
      : 'No upcoming games found.';

  const scheduleEmbed = BaseEmbed(interaction, {
    logoUrl: teamInfo.logoUrl,
    teamColor: teamData.colors.primary,
  })
    .setTitle(`${teamInfo.fullName} Schedule`)
    .addFields(
      {
        name: 'Last 5 Games',
        value: pastGamesText,
        inline: false,
      },
      {
        name: 'Next 5 Games',
        value: futureGamesText,
        inline: false,
      },
    );

  return scheduleEmbed;
}

export async function createLeadersEmbed(
  interaction: any,
  teamData: IndexTeamInfo,
  teamInfo: TeamInfo,
  season?: number,
) {
  // Implementation for team leaders view
  const leadersEmbed = BaseEmbed(interaction, {
    logoUrl: teamInfo.logoUrl,
    teamColor: teamData.colors.primary,
  }).setTitle(`${teamInfo.fullName} Team Leaders`);
  // Add team leaders information here

  return leadersEmbed;
}

export async function createRosterEmbed(
  interaction: any,
  teamData: IndexTeamInfo,
  teamInfo: TeamInfo,
  season?: number,
) {
  // Implementation for roster view
  const rosterEmbed = BaseEmbed(interaction, {
    logoUrl: teamInfo.logoUrl,
    teamColor: teamData.colors.primary,
  }).setTitle(`${teamInfo.fullName} Roster`);
  // Add roster information here

  return rosterEmbed;
}

export async function createStatsEmbed(
  interaction: any,
  teamData: IndexTeamInfo,
  teamInfo: TeamInfo,
  season?: number,
  seasonType?: SeasonType,
  view?: string,
) {
  const teamStats = await getTeamStats(teamInfo, season);
  const {
    goalsPerGame,
    goalsAgainstPerGame,
    pimsRank,
    ppRank,
    pkRank,
    leaguePosition,
    conferencePosition,
    divisionPosition,
    detailedStats,
  } = teamStats;

  const PP = 100 * (detailedStats.ppGoalsFor / detailedStats.ppOpportunities);
  const PK =
    (100 * (detailedStats.shOpportunities - detailedStats.ppGoalsAgainst)) /
    (detailedStats.shOpportunities <= 0 ? 1 : detailedStats.shOpportunities);

  const last10Games = await getLast10Games(teamInfo, season);

  return BaseEmbed(interaction, {
    logoUrl: teamInfo.logoUrl,
    teamColor: teamStats.teamInfo.colors.primary,
  })
    .setTitle(`${teamInfo.fullName}`)
    .addFields(
      {
        name: 'Regular Season',
        value: `${teamStats.wins}-${teamStats.losses}-${teamStats.OTL}`,
        inline: true,
      },
      {
        name: 'Home',
        value: `${teamStats.home.wins}-${teamStats.home.losses}-${teamStats.home.OTL}`,
        inline: true,
      },
      {
        name: 'Away',
        value: `${teamStats.away.wins}-${teamStats.away.losses}-${teamStats.away.OTL}`,
        inline: true,
      },
      {
        name: 'Division',
        value: `#${divisionPosition}`,
        inline: true,
      },
      {
        name: 'Conference',
        value: `#${conferencePosition}`,
        inline: true,
      },
      {
        name: 'League',
        value: `#${leaguePosition}`,
        inline: true,
      },
      {
        name: 'GF',
        value: `${goalsPerGame.toFixed(2)} (#${teamStats.goalsForRank})`,
        inline: true,
      },
      {
        name: 'GA',
        value: `${goalsAgainstPerGame.toFixed(2)} (#${
          teamStats.goalsAgainstRank
        })`,
        inline: true,
      },
      {
        name: 'Shots',
        value: `${teamStats.shotsPerGame} (#${teamStats.shotsForRank})`,
        inline: true,
      },
      {
        name: 'SA',
        value: `${teamStats.shotsAgainstPerGame} (#${teamStats.shotsAgainstRank})`,
        inline: true,
      },
      {
        name: 'Diff',
        value: `${teamStats.shotDiff} (#${teamStats.shotDiffRank})`,
        inline: true,
      },
      {
        name: 'PIM',
        value: `${detailedStats.penaltyMinutesPerGame} (#${pimsRank})`,
        inline: true,
      },
      {
        name: 'PP',
        value: `${PP.toFixed(2)} (#${ppRank})`,
        inline: true,
      },
      {
        name: 'PK',
        value: `${PK.toFixed(2)} (#${pkRank})`,
        inline: true,
      },
      {
        name: 'Last 10 Games',
        value: last10Games
          .map((game: { result: string }) => game.result)
          .join(''),
        inline: false,
      },
    );
}
