import { Config } from 'src/lib/config/config';
import { logger } from 'src/lib/logger';
import {
  BasicUserInfo,
  InternalChecklist,
  PlayerAchievement,
  PortalPlayer,
  TeamAchievement,
  UserAchievement,
} from 'typings/portal';

class PortalApiClient {
  #userInfo: Array<BasicUserInfo> = [];
  #activePlayers: Array<PortalPlayer> = [];
  #getPlayer: Array<PortalPlayer> = [];
  #getChecklist: Array<InternalChecklist> = [];
  #getAwards: Array<PlayerAchievement> = [];
  #getTeamAwards: Array<TeamAchievement> = [];
  #getUserAwards: Array<UserAchievement> = [];

  #loaded = false;
  #lastLoadTimestamp = 0;

  async #getData<T>(
    data: Array<T>,
    reload: boolean = false,
    fetchOptions: Parameters<typeof fetch>,
    additionalQueryParams?: Record<string, string>,
  ): Promise<T[]> {
    if (data.length > 0 && !reload) {
      return data;
    }
    const [url, ...options] = fetchOptions;
    const queryParams = new URLSearchParams({
      ...additionalQueryParams,
    });
    logger.debug(
      `PortalClient: Fetching data for ${url}?${queryParams.toString()}`,
    );
    const response = await fetch(
      `${Config.portalApiUrl}/${url}?${queryParams.toString()}`,
      ...options,
    );
    if (!response.ok) {
      logger.error(
        `PortalClient: Failed to fetch data: ${response.statusText} for ${url}`,
      );
    }
    return response.json();
  }

  async getUserInfo(reload: boolean = false): Promise<Array<BasicUserInfo>> {
    this.#userInfo = await this.#getData(this.#userInfo, reload, [`userinfo`]);
    return this.#userInfo;
  }

  async getActivePlayers(
    reload: boolean = false,
  ): Promise<Array<PortalPlayer>> {
    this.#activePlayers = await this.#getData(
      this.#activePlayers,
      reload,
      ['player'],
      { status: 'active' },
    );
    return this.#activePlayers;
  }

  async getChecklist(
    league: string,
    userID: string,
    reload: boolean = false,
  ): Promise<Array<InternalChecklist>> {
    return await this.#getData([], reload, ['landing-page/checklist'], {
      league: league,
      userID: userID,
    });
  }

  async getChecklistByUser(
    league: string,
    userID: string,
    reload: boolean = false,
  ): Promise<Array<InternalChecklist>> {
    return this.getChecklist(league, userID, reload);
  }

  async getPlayer(
    portalID: string,
    reload: boolean = false,
  ): Promise<PortalPlayer | undefined> {
    const players = await this.#getData(this.#getPlayer, reload, ['player'], {
      pid: portalID,
    });
    return players[0];
  }

  async getPlayerAwards(
    fhmID: string,
    leagueID: string,
    seasonID?: string,
    reload: boolean = false,
  ): Promise<Array<PlayerAchievement>> {
    return await this.#getData(this.#getAwards, reload, ['history/player'], {
      fhmID: fhmID,
      leagueID: leagueID,
      ...(seasonID && { seasonID }),
    });
  }

  async getTeamAwards(
    teamID: string,
    leagueID: string,
    reload: boolean = false,
  ): Promise<Array<TeamAchievement>> {
    return await this.#getData(this.#getTeamAwards, reload, ['history/team'], {
      teamID: teamID,
      leagueID: leagueID,
    });
  }

  async getUserAwards(
    uid: string,
    leagueID?: string,
    reload: boolean = false,
  ): Promise<Array<UserAchievement>> {
    return await this.#getData(
      this.#getUserAwards,
      reload,
      ['history/user-achievement'],
      {
        uid: uid,
        ...(leagueID && { leagueID }),
      },
    );
  }

  async reload(): Promise<void> {
    this.#loaded = false;

    await Promise.all([
      await this.getUserInfo(true),
      await this.getActivePlayers(true),
      await this.getChecklist('SHL', '1', true),
    ]);

    this.#lastLoadTimestamp = Date.now();
    this.#loaded = true;
  }

  async reloadIfError() {
    if (
      !this.#loaded ||
      Date.now() - this.#lastLoadTimestamp >= 30 * 60 * 1000 // 12 hours in milliseconds
    ) {
      this.reload();
    }
  }
}

export const PortalClient = new PortalApiClient();
