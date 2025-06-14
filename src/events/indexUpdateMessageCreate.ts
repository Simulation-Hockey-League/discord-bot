import { Events, Message } from 'discord.js';
import {
  IndexApiClient,
  ShlIndexApiClient,
  SmjhlIndexApiClient,
} from 'src/db/index/api/IndexApiClient';

import { Config } from 'src/utils/config/config';
import { logger } from 'src/lib/logger';
import { BotEvent } from 'typings/event';

export default {
  name: Events.MessageCreate,
  execute: async (message: Message) => {
    if (
      message.guildId !== Config.indexUpdateServerId ||
      message.channelId !== Config.indexUpdateChannelId ||
      !message.content.match(/^Index Updated - Season: \d+.*/)
    ) {
      return;
    }

    // Index Updated - Season: 59 League: shl - https://index.simulationhockey.com/shl
    const { groups } =
      /^Index Updated - Season: (?<season>\d+) League: (?<league>\w+).*/.exec(
        message.content,
      ) ?? {};
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
    const season =
      groups && 'season' in groups ? parseInt(groups.season) : null;
    const league = groups && 'league' in groups ? groups.league : null;

    if (league !== null) {
      logger.info(`Reloading ${league} index for season ${season}`);
      IndexApiClient.get(league).reload(season ?? undefined);
    } else {
      ShlIndexApiClient.reload(season ?? undefined);
      SmjhlIndexApiClient.reload(season ?? undefined);
    }
  },
} satisfies BotEvent;
