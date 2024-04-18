import { assertUnreachable } from 'src/lib/assertUnreachable';
import { Config } from 'src/lib/config/config';

import { DynamicConfig } from 'src/lib/config/dynamicConfig';
import { logger } from 'src/lib/logger';

import type {
  AvailableSeason,
  LeagueConference,
  LeagueDivision,
  TeamInfo,
  TeamStats,
} from 'typings/statsindex';

import { LeagueType } from './shared';

class IndexApiClient {
  #leagueId: LeagueType;

  #availableSeasons: Array<AvailableSeason> = [];
  #conferences: Map<number, Array<LeagueConference>> = new Map();
  #divisions: Map<number, Array<LeagueDivision>> = new Map();
  #standings: Map<number, Array<TeamStats>> = new Map();
  #teamInfo: Map<number, Array<TeamInfo>> = new Map();

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
    logger.info(
      `IndexClient: Fetching data for ${url}?${queryParams.toString()}`,
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
    if (season < 53) {
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
  ): Promise<Array<TeamInfo>> {
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

  async #load(season: number) {
    await Promise.all([
      this.getConferences(season, true),
      this.getStandings(season, true),
      this.getDivisions(season, true),
      this.getTeamInfo(season, true),
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
}

export const ShlIndexApiClient = new IndexApiClient(LeagueType.SHL);
export const SmjhlIndexApiClient = new IndexApiClient(LeagueType.SMJHL);
export const IihfIndexApiClient = new IndexApiClient(LeagueType.IIHF);
export const WjcIndexApiClient = new IndexApiClient(LeagueType.WJC);

export const IndexClient = (league: LeagueType) => {
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
};
