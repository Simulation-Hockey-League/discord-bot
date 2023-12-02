import { readdirSync } from 'fs';
import { join } from 'path';

// eslint-disable-next-line import/order
import { Client, Collection, GatewayIntentBits } from 'discord.js';
import 'dotenv/config';

import { SlashCommand } from 'typings/command';

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.commands = new Collection<string, SlashCommand>();
client.cooldowns = new Collection<string, number>();

const handlersDir = join(__dirname, './handlers');
readdirSync(handlersDir).forEach((handler) => {
  if (!handler.endsWith('.js') && !handler.endsWith('.ts')) return;

  require(`${handlersDir}/${handler}`)(client);
});

client.login(process.env.TOKEN);
