import fuzzysort from 'fuzzysort';
import _ from 'lodash';
import sqlite3 from 'sqlite3';
import { TeamInfo } from 'src/lib/teams';
import {
  DetailedTeamStats,
  HydratedTeamStats,
  IndexTeamInfo,
} from 'typings/statsindex';

import { IndexApiClient } from './api/IndexApiClient';
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
  seasonType: SeasonType = SeasonType.REGULAR,
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

  const teamId = teamInfo.teamID ?? null; // dont need requireFhmTeamId due to previous checks for getTeamInfo
  if (!teamId && teamId !== 0) {
    throw new Error(`Could not find team ID for ${teamInfo.fullName}`);
  }
  const result = allTeams.find((team) => team.id === teamId);
  const currentTeamInfo = teamInfosById[teamId];
  const detailedStats = detailedStatsById[teamId] ?? {
    // If we are not in the FHM8/10 Era, return just 0's
    gamesPlayed: result?.gp ?? 0,
    goalsFor: result?.goalsFor ?? 0,
    goalsAgainst: result?.goalsAgainst ?? 0,
    shotsFor: 0,
    shotsAgainst: 0,
    penaltyMinutesPerGame: 0,
    ppOpportunities: 0,
    ppGoalsFor: 0,
    ppGoalsAgainst: 0,
    shOpportunities: 0,
    shGoalsFor: 0,
    shGoalsAgainst: 0,
    faceoffPct: 0,
    shotsBlocked: 0,
    hits: 0,
    takeaways: 0,
    giveaways: 0,
  };
  const players = await IndexApiClient.get(teamInfo.leagueType).getPlayerStats(
    seasonType,
    season,
  );
  const teamPlayers = players.filter(
    (player) => player.teamId === currentTeamInfo.id,
  );

  // Calculate PDO and Corsi
  const teamPDO =
    (detailedStats.goalsFor / (detailedStats.shotsFor || 1) +
      (1 - detailedStats.goalsAgainst / (detailedStats.shotsAgainst || 1))) *
    100;
  const teamCorsiPct =
    (detailedStats.shotsFor /
      (detailedStats.shotsFor + detailedStats.shotsAgainst || 1)) *
    100;
  const pdoRank =
    _.orderBy(
      allDetailedStats,
      (team) =>
        (team.goalsFor / (team.shotsFor || 1) +
          (1 - team.goalsAgainst / (team.shotsAgainst || 1))) *
        100,
      'desc',
    ).findIndex((team) => team.id === teamId) + 1;
  const corsiRank =
    _.orderBy(
      allDetailedStats,
      (team) =>
        (team.shotsFor / (team.shotsFor + team.shotsAgainst || 1)) * 100,
      'desc',
    ).findIndex((team) => team.id === teamId) + 1;

  if (!result || !currentTeamInfo) {
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
    pdoRank: pdoRank,
    corsiRank: corsiRank,
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
    shotsPerGame: Number(
      (detailedStats.shotsFor / detailedStats.gamesPlayed || 1).toFixed(2),
    ),
    shotsAgainstPerGame: Number(
      (detailedStats.shotsAgainst / detailedStats.gamesPlayed || 1).toFixed(2),
    ),
    shotDiff: Number(
      (
        (detailedStats.shotsFor / detailedStats.gamesPlayed || 1) -
        (detailedStats.shotsAgainst / detailedStats.gamesPlayed || 1)
      ).toFixed(2),
    ),
    pdo: Number(teamPDO.toFixed(2)),
    corsi: Number(teamCorsiPct.toFixed(2)),
    regularSeasonPlayerStats: teamPlayers,
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
  const normalizedName = name.toLowerCase().replace(/[.,]/g, '').trim();
  const candidates = league
    ? await Promise.all([
        getPlayerStatsByFuzzyName(league, normalizedName, season, seasonType),
        getGoalieStatsByFuzzyName(league, normalizedName, season, seasonType),
      ])
    : await Promise.all([
        getPlayerStatsByFuzzyName(
          LeagueType.SHL,
          normalizedName,
          season,
          seasonType,
        ),
        getPlayerStatsByFuzzyName(
          LeagueType.SMJHL,
          normalizedName,
          season,
          seasonType,
        ),
        getGoalieStatsByFuzzyName(
          LeagueType.SHL,
          normalizedName,
          season,
          seasonType,
        ),
        getGoalieStatsByFuzzyName(
          LeagueType.SMJHL,
          normalizedName,
          season,
          seasonType,
        ),
      ]);

  return _.maxBy(candidates, (candidate) => candidate?.score ?? -1)?.obj;
};

export const getAllPlayers = async (name: string, league: LeagueType) => {
  const db = new sqlite3.Database('src/db/index/players.sqlite');

  type Player = { playerID: number; name: string };
  const players = await new Promise<Player[]>((resolve, reject) => {
    db.all(
      `SELECT playerID, name FROM players WHERE leagueID = ?`,
      [league],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows as Player[]);
        }
      },
    );
  }).finally(() => db.close());

  const playerMatch = fuzzysort.go(name, players, {
    key: 'name',
    limit: 1,
    threshold: -10000,
  });
  return _.maxBy(playerMatch, (candidate) => candidate?.score ?? -1)?.obj;
};
