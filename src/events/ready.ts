import { Client, Events } from 'discord.js';
import { BotEvent } from 'typings/event';

export default {
  name: Events.ClientReady,
  once: true,
  execute: (client: Client) => {
    console.log(`🚀 Ready! Logged in as ${client.user?.tag}`);
  },
} satisfies BotEvent;
