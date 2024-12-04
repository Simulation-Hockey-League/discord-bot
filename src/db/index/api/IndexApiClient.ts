import { assertUnreachable } from 'src/lib/assertUnreachable';
import { Config } from 'src/lib/config/config';

import { DynamicConfig } from 'src/lib/config/dynamicConfig';
import { logger } from 'src/lib/logger';

import { TeamInfo } from 'src/lib/teams';
import {
  AvailableSeason,
  DetailedTeamStats,
  GameInfo,
  GoalieStats,
  IndexTeamInfo,
  LeagueConference,
  LeagueDivision,
  PlayerStats,
  PlayoffSeries,
  TeamStats,
} from 'typings/statsindex';

import {
  LeagueType,
  SeasonType,
  seasonTypeToApiName,
  seasonTypeToLongName,
  toLeagueType,
} from '../shared';

export class IndexApiClient {
  #leagueId: LeagueType;

  #availableSeasons: Array<AvailableSeason> = [];
  #conferences: Map<number, Array<LeagueConference>> = new Map();
  #divisions: Map<number, Array<LeagueDivision>> = new Map();
  #standings: Map<number, Array<TeamStats>> = new Map();
  #teamInfo: Map<number, Array<IndexTeamInfo>> = new Map();
  #detailedTeamStats: Map<number, Array<DetailedTeamStats>> = new Map();
  #playerStats: Map<SeasonType, Map<number, Array<PlayerStats>>> = new Map();
  #goalieStats: Map<SeasonType, Map<number, Array<GoalieStats>>> = new Map();
  #schedule: Map<SeasonType, Map<number, Array<GameInfo>>> = new Map();
  #playoffs: Map<number, Array<Array<PlayoffSeries>>> = new Map();

  #loaded: boolean = false;
  #lastLoadTimestamp = 0;

  constructor(league: LeagueType) {
    this.#leagueId = league;
  }

  async #fetchIndexData(
    version: 'v1' | 'v2',
    fetchOptions: Parameters<typeof fetch>,
    additionalQueryParams?: Record<string, string>,
  ): Promise<Response> {
    const [url, ...options] = fetchOptions;
    const queryParams = new URLSearchParams({
      league: this.#leagueId.toString(),
      ...additionalQueryParams,
    });
    logger.debug(
      `IndexClient: ${
        this.#leagueId
      } Fetching data for ${url}?${queryParams.toString()}`,
    );
    return await fetch(
      `${
        version === 'v1'
          ? Config.indexApiUrlV1
          : version === 'v2'
          ? Config.indexApiUrlV2
          : assertUnreachable(version)
      }/${url}?${queryParams.toString()}`,
      ...options,
    );
  }

  async #getData<T>(
    data: Map<number, Array<T>>,
    reload: boolean = false,
    version: 'v1' | 'v2',
    fetchOptions: Parameters<typeof fetch>,
    _season?: number,
    additionalQueryParams?: Record<string, string>,
  ): Promise<T[]> {
    const season = _season ?? DynamicConfig.currentSeason.get();
    if (season < 1) {
      return [];
    }
    let result = data.get(season);

    if (!result || reload) {
      const response = await this.#fetchIndexData(version, fetchOptions, {
        season: season.toString(),
        ...additionalQueryParams,
      });

      if (!response.ok) {
        const [url] = fetchOptions;
        logger.error(
          `IndexClient: Failed to fetch data: ${response.statusText} for ${url}`,
        );
        if (!_season && season > 1) {
          return this.#getData(
            data,
            reload,
            version,
            fetchOptions,
            season - 1,
            additionalQueryParams,
          );
        } else {
          return result ?? [];
        }
      }
      result = await response.json();
    }

    return result ?? [];
  }

  async getAvailableSeasons(
    reload: boolean = false,
  ): Promise<Array<AvailableSeason>> {
    if (this.#availableSeasons.length === 0 || reload) {
      const response = await this.#fetchIndexData('v1', ['leagues/seasons']);
      if (!response.ok) {
        logger.error(
          `IndexClient: Failed to fetch data: ${response.statusText} for league/seasons`,
        );
        return this.#availableSeasons;
      }

      this.#availableSeasons = await response.json();

      // override the current season in our dynamic config with the latest season if it is greater than what we have
      const currentSeason = DynamicConfig.currentSeason.get();
      const latestSeason = this.#availableSeasons.reduce(
        (acc, { season }) => (season > acc ? season : acc),
        0,
      );

      if (latestSeason > currentSeason) {
        DynamicConfig.currentSeason.set(latestSeason);
      }
    }

    return this.#availableSeasons;
  }

  async getStandings(
    season?: number,
    reload: boolean = false,
  ): Promise<Array<TeamStats>> {
    const result = await this.#getData(
      this.#standings,
      reload,
      'v1',
      ['standings'],
      season,
    );
    if (season) {
      this.#standings.set(season, result);
    }
    return result;
  }

  async getConferences(
    season?: number,
    reload: boolean = false,
  ): Promise<Array<LeagueConference>> {
    const result = await this.#getData(
      this.#conferences,
      reload,
      'v1',
      ['conferences'],
      season,
    );
    if (season) {
      this.#conferences.set(season, result);
    }
    return result;
  }

  async getDivisions(
    season?: number,
    reload: boolean = false,
  ): Promise<Array<LeagueDivision>> {
    const result = await this.#getData(
      this.#divisions,
      reload,
      'v1',
      ['divisions'],
      season,
    );
    if (season) {
      this.#divisions.set(season, result);
    }
    return result;
  }

  async getTeamInfo(
    season?: number,
    reload: boolean = false,
  ): Promise<Array<IndexTeamInfo>> {
    const result = await this.#getData(
      this.#teamInfo,
      reload,
      'v1',
      ['teams'],
      season,
    );
    if (season) {
      this.#teamInfo.set(season, result);
    }
    return result;
  }

  async getDetailedTeamStats(
    season?: number,
    reload: boolean = false,
  ): Promise<Array<DetailedTeamStats>> {
    const result = await this.#getData(
      this.#detailedTeamStats,
      reload,
      'v1',
      ['teams/stats'],
      season,
    );
    if (season) {
      this.#detailedTeamStats.set(season, result);
    }
    return result;
  }

  async getPlayerStats(
    seasonType: SeasonType,
    season?: number,
    reload: boolean = false,
  ): Promise<Array<PlayerStats>> {
    if (!this.#playerStats.has(seasonType)) {
      this.#playerStats.set(seasonType, new Map());
    }
    const teamsByAbbr = (await this.getTeamInfo(season, reload)).reduce(
      (acc, team) => {
        acc[team.abbreviation] = team;
        return acc;
      },
      {} as Record<string, IndexTeamInfo>,
    );

    const result = (
      await this.#getData(
        this.#playerStats.get(seasonType)!,
        reload,
        'v1',
        ['players/stats'],
        season,
        { type: seasonTypeToApiName(seasonType) },
      )
    ).map((player) => ({
      ...player,
      seasonType,
      teamId: teamsByAbbr[player.team].id,
    }));

    if (season) {
      this.#playerStats.get(seasonType)!.set(season, result);
    }
    return result;
  }

  async getGoalieStats(
    seasonType: SeasonType,
    season?: number,
    reload: boolean = false,
  ): Promise<Array<GoalieStats>> {
    if (!this.#goalieStats.has(seasonType)) {
      this.#goalieStats.set(seasonType, new Map());
    }
    const teamsByAbbr = (await this.getTeamInfo(season, reload)).reduce(
      (acc, team) => {
        acc[team.abbreviation] = team;
        return acc;
      },
      {} as Record<string, IndexTeamInfo>,
    );

    const result = (
      await this.#getData(
        this.#goalieStats.get(seasonType)!,
        reload,
        'v1',
        ['goalies/stats'],
        season,
        { type: seasonTypeToApiName(seasonType) },
      )
    ).map((player) => ({
      ...player,
      seasonType,
      teamId: teamsByAbbr[player.team].id,
    }));

    if (season) {
      this.#goalieStats.get(seasonType)!.set(season, result);
    }
    return result;
  }

  async getStats<T extends boolean>(
    seasonType: SeasonType,
    season?: number,
    isGoalie: T = false as T,
  ): Promise<T extends true ? Array<GoalieStats> : Array<PlayerStats>> {
    return isGoalie
      ? (this.getGoalieStats(seasonType, season) as any)
      : (this.getPlayerStats(seasonType, season) as any);
  }

  async #getSchedule(
    seasonType: SeasonType,
    season?: number,
    reload: boolean = false,
  ): Promise<Array<GameInfo>> {
    if (!this.#schedule.has(seasonType)) {
      this.#schedule.set(seasonType, new Map());
    }
    const teamInfoById = (await this.getTeamInfo(season, reload)).reduce(
      (acc, team) => {
        acc[team.id] = team;
        return acc;
      },
      {} as Record<number, IndexTeamInfo>,
    );

    const result = (
      await this.#getData(
        this.#schedule.get(seasonType)!,
        reload,
        'v1',
        ['schedule'],
        season,
        { type: seasonTypeToLongName(seasonType) },
      )
    )
      .map((game) => ({
        ...game,
        seasonType,
        homeTeamInfo: teamInfoById[game.homeTeam],
        awayTeamInfo: teamInfoById[game.awayTeam],
      }))
      .filter((game) => game.type !== 'Pre-Season');
    if (season) {
      this.#schedule.get(seasonType)!.set(season, result);
    }
    return result;
  }

  async getSchedule(
    season?: number,
    reload: boolean = false,
  ): Promise<Array<GameInfo>> {
    const regularGames = await this.#getSchedule(
      SeasonType.REGULAR,
      season,
      reload,
    );
    const postseasonGames = await this.#getSchedule(
      SeasonType.POST,
      season,
      reload,
    );
    return [...regularGames, ...postseasonGames].sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  }

  async getPlayoffs(
    season?: number,
    reload: boolean = false,
  ): Promise<Array<Array<PlayoffSeries>>> {
    const teamInfoById = (await this.getTeamInfo(season, reload)).reduce(
      (acc, team) => {
        acc[team.id] = team;
        return acc;
      },
      {} as Record<number, IndexTeamInfo>,
    );

    const result = (
      await this.#getData(
        this.#playoffs,
        reload,
        'v1',
        ['standings/playoffs'],
        season,
      )
    ).map((round) =>
      round.map((series) => ({
        ...series,
        team1: {
          ...series.team1,
          teamInfo: teamInfoById[series.team1.id],
        },
        team2: {
          ...series.team2,
          teamInfo: teamInfoById[series.team2.id],
        },
      })),
    );
    if (season) {
      this.#playoffs.set(season, result);
    }
    return result;
  }

  async #load(season: number) {
    await Promise.all([
      this.getConferences(season, true),
      this.getStandings(season, true),
      this.getDivisions(season, true),
      this.getTeamInfo(season, true),
      this.getDetailedTeamStats(season, true),
      this.getPlayerStats(SeasonType.REGULAR, season, true),
      this.getPlayerStats(SeasonType.POST, season, true),
      this.getGoalieStats(SeasonType.REGULAR, season, true),
      this.getGoalieStats(SeasonType.POST, season, true),
      this.getSchedule(season, true),
      this.getPlayoffs(season, true),
    ]);
  }

  async reload(season?: number) {
    this.#loaded = false;
    const currentSeason = DynamicConfig.currentSeason.get();
    if (
      !this.#availableSeasons.some(({ season }) => season === currentSeason)
    ) {
      this.getAvailableSeasons(true);
    }

    await this.#load(season ?? currentSeason);
    this.#lastLoadTimestamp = Date.now();
    this.#loaded = true;
  }

  async reloadIfError() {
    if (
      !this.#loaded ||
      Date.now() - this.#lastLoadTimestamp >= 12 * 60 * 60 * 1000 // 12 hours in milliseconds
    ) {
      this.reload();
    }
  }

  static get(league: LeagueType | string | null | undefined) {
    if (typeof league === 'string' || league === null || league === undefined) {
      league = toLeagueType(league);
    }
    switch (league) {
      case LeagueType.SHL:
        return ShlIndexApiClient;
      case LeagueType.SMJHL:
        return SmjhlIndexApiClient;
      case LeagueType.IIHF:
        return IihfIndexApiClient;
      case LeagueType.WJC:
        return WjcIndexApiClient;
      default:
        return assertUnreachable(league);
    }
  }

  static getByTeam(teamInfo: TeamInfo) {
    return IndexApiClient.get(teamInfo.leagueType);
  }
}

export const ShlIndexApiClient = new IndexApiClient(LeagueType.SHL);
export const SmjhlIndexApiClient = new IndexApiClient(LeagueType.SMJHL);
export const IihfIndexApiClient = new IndexApiClient(LeagueType.IIHF);
export const WjcIndexApiClient = new IndexApiClient(LeagueType.WJC);
