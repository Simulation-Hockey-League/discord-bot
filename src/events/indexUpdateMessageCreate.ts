import { Events, Message } from 'discord.js';

import { Config } from 'src/lib/config/config';
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
      // Reload league data for current season
    } else {
      // Reload SHL and SMJHL for current season
    }
  },
} satisfies BotEvent;
