import { Collection } from 'discord.js';

import { SlashCommand } from './command';

declare module 'discord.js' {
  export interface Client {
    commands: Collection<string, SlashCommand>;
    cooldowns: Collection<string, number>;
  }
}
