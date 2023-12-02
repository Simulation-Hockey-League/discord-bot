import { readdirSync } from 'fs';
import { join } from 'path';

import { Client } from 'discord.js';
import { BotEvent } from 'typings/event';

module.exports = (client: Client) => {
  let eventsDir = join(__dirname, '../events');

  readdirSync(eventsDir).forEach((file) => {
    if (!file.endsWith('.js') && !file.endsWith('.ts')) return;
    const event: BotEvent = require(`${eventsDir}/${file}`).default;

    event.once
      ? client.once(event.name, event.execute)
      : client.on(event.name, event.execute);
    console.log(`✔ Successfully loaded event ${event.name}`);
  });
};
