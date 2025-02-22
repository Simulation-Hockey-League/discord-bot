import fuzzysort from 'fuzzysort';
import _ from 'lodash';
import { TeamInfo } from 'src/lib/teams';
import {
  DetailedTeamStats,
  HydratedTeamStats,
  IndexTeamInfo,
} from 'typings/statsindex';

import { IndexApiClient } from './api/IndexApiClient';
import { requireFhmTeamId } from './helpers/teamid';
import { LeagueType, PositionFilter, SeasonType } from './shared';

type LeagueInput = LeagueType | string | null | undefined;

export const getDetailedStats = (league: LeagueInput, season?: number) =>
  IndexApiClient.get(league).getDetailedTeamStats(season);

export const getStandings = (league: LeagueInput, season?: number) =>
  IndexApiClient.get(league).getStandings(season);

export const getTeamInfo = (league: LeagueInput, season?: number) =>
  IndexApiClient.get(league).getTeamInfo(season);

export const getTeamStats = async (
  teamInfo: TeamInfo,
  season?: number,
): Promise<HydratedTeamStats> => {
  const allTeams = await getStandings(teamInfo.leagueType, season);
  const allDetailedStats = await getDetailedStats(teamInfo.leagueType, season);
  const detailedStatsById = (
    await getDetailedStats(teamInfo.leagueType, season)
  ).reduce((acc, team) => {
    acc[team.id] = team;
    return acc;
  }, {} as Record<number, DetailedTeamStats>);
  const teamInfosById = (await getTeamInfo(teamInfo.leagueType, season)).reduce(
    (acc, team) => {
      acc[team.id] = team;
      return acc;
    },
    {} as Record<number, IndexTeamInfo>,
  );

  const teamId = await requireFhmTeamId(teamInfo);

  if (!teamId) {
    throw new Error(`Could not find team ID for ${teamInfo.fullName}`);
  }

  const result = allTeams.find((team) => team.id === teamId);
  const currentTeamInfo = teamInfosById[teamId];
  const detailedStats = detailedStatsById[teamId];

  if (!result || !currentTeamInfo || !detailedStats) {
    throw new Error(`Could not find stats for ${teamInfo.fullName}`);
  }

  return {
    ...result,
    detailedStats,
    teamInfo: currentTeamInfo,
    leaguePosition:
      _.orderBy(allTeams, (team) => team.points, 'desc').findIndex(
        (team) => team.id === teamId,
      ) + 1,
    conferencePosition:
      _.orderBy(
        allTeams.filter(
          (team) =>
            teamInfosById[team.id].conference === currentTeamInfo.conference,
        ),
        (team) => team.points,
        'desc',
      ).findIndex((team) => team.id === teamId) + 1,
    divisionPosition:
      _.orderBy(
        allTeams.filter(
          (team) =>
            teamInfosById[team.id].conference === currentTeamInfo.conference &&
            teamInfosById[team.id].division === currentTeamInfo.division,
        ),
        (team) => team.points,
        'desc',
      ).findIndex((team) => team.id === teamId) + 1,
    goalsForRank:
      _.orderBy(allTeams, (team) => team.goalsFor, 'desc').findIndex(
        (team) => team.id === teamId,
      ) + 1,
    goalsAgainstRank:
      _.orderBy(allTeams, (team) => team.goalsAgainst, 'asc').findIndex(
        (team) => team.id === teamId,
      ) + 1,
    // pdo, pdo rank from player stats on roster
    // corsi, corsi rank from player stats on roster
    shotsForRank:
      _.orderBy(allDetailedStats, (team) => team.shotsFor, 'desc').findIndex(
        (team) => team.id === teamId,
      ) + 1,
    shotsAgainstRank:
      _.orderBy(allDetailedStats, (team) => team.shotsAgainst, 'asc').findIndex(
        (team) => team.id === teamId,
      ) + 1,
    shotDiffRank:
      _.orderBy(
        allDetailedStats,
        (team) => team.shotsFor - team.shotsAgainst,
        'desc',
      ).findIndex((team) => team.id === teamId) + 1,
    pimsRank:
      _.orderBy(
        allDetailedStats,
        (team) => team.penaltyMinutesPerGame,
        'desc',
      ).findIndex((team) => team.id === teamId) + 1,
    ppRank:
      _.orderBy(
        allDetailedStats,
        (team) =>
          (100 * team.ppGoalsFor) /
          (team.ppOpportunities <= 0 ? 1 : team.ppOpportunities),
        'desc',
      ).findIndex((team) => team.id === teamId) + 1,
    pkRank:
      _.orderBy(
        allDetailedStats,
        (team) =>
          (100 * (team.shOpportunities - team.ppGoalsAgainst)) /
          (team.shOpportunities <= 0 ? 1 : team.shOpportunities),
        'desc',
      ).findIndex((team) => team.id === teamId) + 1,
    goalsPerGame: detailedStats.goalsFor / (detailedStats.gamesPlayed || 1),
    goalsAgainstPerGame:
      detailedStats.goalsAgainst / (detailedStats.gamesPlayed || 1),
    pdo: 0, // TODO
    pdoRank: 0, // TODO
    corsi: 0, // TODO
    corsiRank: 0, // TODO
    regularSeasonPlayerStats: [], // TODO
  };
};

const getSthsOrFhmSkaterStats = async (
  leagueType: LeagueType,
  seasonType: SeasonType,
  season?: number,
) => {
  return IndexApiClient.get(leagueType).getPlayerStats(seasonType, season);
};

const getSthsOrFhmGoalieStats = async (
  leagueType: LeagueType,
  seasonType: SeasonType,
  season?: number,
) => {
  return IndexApiClient.get(leagueType).getGoalieStats(seasonType, season);
};

export const getPlayerStatsByPosition = async (
  leagueType: LeagueType,
  seasonType: SeasonType,
  season?: number,
  positionFilter?: PositionFilter,
) => {
  const skaterStats = await getSthsOrFhmSkaterStats(
    leagueType,
    seasonType,
    season,
  );

  return skaterStats.filter((player) => {
    if (!positionFilter) {
      return true;
    }
    const isDefenseman = player.position === 'LD' || player.position === 'RD';

    return (
      (positionFilter === PositionFilter.D && isDefenseman) ||
      (positionFilter === PositionFilter.F && !isDefenseman)
    );
  });
};

export const getPlayerStatsByFuzzyName = async (
  leagueType: LeagueType,
  name: string,
  season?: number,
  seasonType?: SeasonType,
) => {
  const regular = await getSthsOrFhmSkaterStats(
    leagueType,
    SeasonType.REGULAR,
    season,
  );
  const playoffs = await getSthsOrFhmSkaterStats(
    leagueType,
    SeasonType.POST,
    regular?.[0]?.season,
  );
  const playoffMatch = fuzzysort.go(name, playoffs, {
    key: 'name',
    limit: 1,
    threshold: -10000,
  });
  const regularMatch = fuzzysort.go(name, regular, {
    key: 'name',
    limit: 1,
    threshold: -10000,
  });

  switch (seasonType) {
    case SeasonType.REGULAR:
      return regularMatch[0];
    case SeasonType.POST:
      return playoffMatch[0];
    default:
      if (!!playoffMatch[0] && playoffMatch[0]?.score >= 1) {
        return playoffMatch[0];
      } else {
        if (
          !!playoffMatch[0] &&
          playoffMatch[0]?.score >= regularMatch[0]?.score
        ) {
          return playoffMatch[0];
        }
        return regularMatch[0];
      }
  }
};

export const getGoalieStatsByFuzzyName = async (
  leagueType: LeagueType,
  name: string,
  season?: number,
  seasonType?: SeasonType,
) => {
  const regular = await getSthsOrFhmGoalieStats(
    leagueType,
    SeasonType.REGULAR,
    season,
  );
  const playoffs = await getSthsOrFhmGoalieStats(
    leagueType,
    SeasonType.POST,
    regular?.[0]?.season,
  );
  const playoffMatch = fuzzysort.go(name, playoffs, {
    key: 'name',
    limit: 1,
    threshold: -10000,
  });
  const regularMatch = fuzzysort.go(name, regular, {
    key: 'name',
    limit: 1,
    threshold: -10000,
  });
  switch (seasonType) {
    case SeasonType.REGULAR:
      return regularMatch[0];
    case SeasonType.POST:
      return playoffMatch[0];
    default:
      if (!!playoffMatch[0] && playoffMatch[0]?.score >= 1) {
        return playoffMatch[0];
      } else {
        if (
          !!playoffMatch[0] &&
          playoffMatch[0]?.score >= regularMatch[0]?.score
        ) {
          return playoffMatch[0];
        }
        return regularMatch[0];
      }
  }
};

export const getPlayerStats = async (
  name: string,
  seasonType?: SeasonType,
  season?: number,
  league?: LeagueType,
) => {
  const candidates = league
    ? await Promise.all([
        getPlayerStatsByFuzzyName(league, name, season, seasonType),
        getGoalieStatsByFuzzyName(league, name, season, seasonType),
      ])
    : await Promise.all([
        getPlayerStatsByFuzzyName(LeagueType.SHL, name, season, seasonType),
        getPlayerStatsByFuzzyName(LeagueType.SMJHL, name, season, seasonType),
        getGoalieStatsByFuzzyName(LeagueType.SHL, name, season, seasonType),
        getGoalieStatsByFuzzyName(LeagueType.SMJHL, name, season, seasonType),
      ]);
  return _.maxBy(candidates, (candidate) => candidate?.score ?? -1)?.obj;
};
