import { readdirSync } from 'fs';
import { join } from 'path';

import { Client, Collection, GatewayIntentBits } from 'discord.js';
import 'dotenv/config';

import { SlashCommand } from 'typings/command';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection<string, SlashCommand>();
client.cooldowns = new Collection<string, number>();

const handlersDir = join(__dirname, './handlers');
readdirSync(handlersDir).forEach((handler) => {
  if (!handler.endsWith('.js') && !handler.endsWith('.ts')) return;

  require(`${handlersDir}/${handler}`)(client);
});

let token;
const isDevelopment = process.env.NODE_ENV === 'development';
if (isDevelopment) {
  token = process.env.DEV_TOKEN;
} else {
  token = process.env.TOKEN;
}
client.login(token);
