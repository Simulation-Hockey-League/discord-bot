import { Events } from 'discord.js';
import { logger } from 'src/lib/logger';
import { BotEvent } from 'typings/event';

export default {
  name: Events.Error,
  execute: (m) => logger.error(m),
} satisfies BotEvent;
