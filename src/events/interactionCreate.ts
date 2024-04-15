import { Events, Interaction } from 'discord.js';

import { pluralize } from 'src/lib/format';
import { logger } from 'src/lib/logger';
import { BotEvent } from 'typings/event';

/**
 * This file handles any incoming slash commands sent by users
 */
export default {
  name: Events.InteractionCreate,
  execute: (interaction: Interaction) => {
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);
      const cooldown = interaction.client.cooldowns.get(
        `${interaction.commandName}-${interaction.user.username}`,
      );

      if (!command) return;

      if (command.cooldown && cooldown) {
        if (Date.now() < cooldown) {
          const remainingSeconds = Math.floor(
            Math.abs(Date.now() - cooldown) / 1000,
          );
          interaction.reply(
            `You have to wait ${remainingSeconds} ${pluralize(
              remainingSeconds,
              'second',
            )} to use this command again.`,
          );
          setTimeout(() => interaction.deleteReply(), 5000);
          return;
        }
      } else if (command.cooldown && !cooldown) {
        interaction.client.cooldowns.set(
          `${interaction.commandName}-${interaction.user.username}`,
          Date.now() + command.cooldown * 1000,
        );
      }
      command.execute(interaction);
    } else if (interaction.isAutocomplete()) {
      const command = interaction.client.commands.get(interaction.commandName);

      if (!command) {
        logger.error(
          `No command matching ${interaction.commandName} was found.`,
        );
        return;
      }

      try {
        command.autocomplete?.(interaction);
      } catch (error) {
        logger.error(error);
      }
    } else if (interaction.isModalSubmit()) {
      const command = interaction.client.commands.get(interaction.customId);

      if (!command) {
        logger.error(`No command matching ${interaction.customId} was found.`);
        return;
      }

      try {
        command.modal?.(interaction);
      } catch (error) {
        logger.error(error);
      }
    }
  },
} satisfies BotEvent;
