import { Events } from 'discord.js';
import { logger } from 'src/lib/logger';
import { BotEvent } from 'typings/event';

export default {
  name: Events.Warn,
  execute: (m) => logger.warn(m),
} satisfies BotEvent;
