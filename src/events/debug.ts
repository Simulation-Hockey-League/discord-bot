import { Events } from 'discord.js';
import { logger } from 'src/lib/logger';
import { BotEvent } from 'typings/event';

export default {
  name: Events.Debug,
  execute: (m) => logger.debug(m),
} satisfies BotEvent;
