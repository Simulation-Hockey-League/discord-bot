import { Config } from 'src/lib/config/config';
import { logger } from 'src/lib/logger';
import { PortalPlayer } from 'typings/portal';

class PortalApiClient {
  #userInfo: Array<{ userID: number; username: string }> = [];
  #activePlayers: Array<PortalPlayer> = [];
  #getPlayer: Array<PortalPlayer> = [];

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

  async getUserInfo(
    reload: boolean = false,
  ): Promise<Array<{ userID: number; username: string }>> {
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

  async getPlayer(
    portalID: string,
    reload: boolean = false,
  ): Promise<PortalPlayer | undefined> {
    const players = await this.#getData(this.#getPlayer, reload, ['player'], {
      pid: portalID,
    });
    return players[0];
  }

  async reload(): Promise<void> {
    this.#loaded = false;

    await Promise.all([
      await this.getUserInfo(true),
      await this.getActivePlayers(true),
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
