import { readdirSync, statSync } from 'fs';
import { join } from 'path';

import {
  Client,
  REST,
  Routes,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
} from 'discord.js';
import { logger } from 'src/lib/logger';
import { SlashCommand } from 'typings/command';

module.exports = (client: Client) => {
  const slashCommands: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder[] =
    [];

  const baseCommandsDir = join(__dirname, '../commands');

  // Load slash commands from current directory and within sub directories
  const commandDir = readdirSync(baseCommandsDir)
    .map((file) => join(baseCommandsDir, file))
    .filter((file) => {
      const isDirectory = statSync(file).isDirectory();
      if (!isDirectory) {
        const command: SlashCommand = require(file).default;
        slashCommands.push(command.command);
        client.commands.set(command.command.name, command);
      }
      return isDirectory;
    });

  commandDir.forEach((commandsDir) => {
    readdirSync(commandsDir).forEach((file) => {
      if (!file.endsWith('.js') && !file.endsWith('.ts')) return;
      const command: SlashCommand = require(`${commandsDir}/${file}`).default;
      slashCommands.push(command.command);
      client.commands.set(command.command.name, command);
    });
  });

  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN!);

  rest
    .put(Routes.applicationCommands(process.env.CLIENT_ID!), {
      body: slashCommands.map((command) => command.toJSON()),
    })
    .then((data: any) => {
      logger.info(`✔ Successfully loaded ${data.length} command(s)`);
    })
    .catch((error) => {
      logger.error(error);
    });
};
