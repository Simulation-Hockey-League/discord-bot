import { Client, Events } from 'discord.js';
import {
  ShlIndexApiClient,
  SmjhlIndexApiClient,
} from 'src/db/index/IndexClient';
import { logger } from 'src/lib/logger';
import { BotEvent } from 'typings/event';

export default {
  name: Events.ClientReady,
  once: true,
  execute: (client: Client) => {
    logger.info(`🚀 Ready! Logged in as ${client.user?.tag}`);
    ShlIndexApiClient.reload();
    SmjhlIndexApiClient.reload();
  },
} satisfies BotEvent;
