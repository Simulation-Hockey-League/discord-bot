import { Events, Interaction } from 'discord.js';
import { Config, UserRole } from 'src/lib/config/config';
import { ErrorEmbed } from 'src/lib/embed';

import { pluralize } from 'src/lib/format';
import { logger } from 'src/lib/logger';
import { checkRole } from 'src/lib/role';
import { BotEvent } from 'typings/event';

/**
 * This file handles any incoming slash commands sent by users
 */
export default {
  name: Events.InteractionCreate,
  execute: async (interaction: Interaction) => {
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);
      const cooldown = interaction.client.cooldowns.get(
        `${interaction.commandName}-${interaction.user.username}`,
      );

      if (!command) return;
      console.log(
        `Executing command: ${interaction.commandName} from server: ${interaction.guild?.name} (${interaction.guildId})`,
      );
      if (
        command.minRole &&
        !(await checkRole(interaction.member, command.minRole))
      ) {
        interaction.reply({
          content: 'You do not have permission to run this command.',
          ephemeral: true,
        });
        return;
      }

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
      try {
        await command.execute(interaction);
      } catch (e) {
        if (!interaction.replied && !interaction.deferred) {
          interaction.reply({
            content:
              'There was an internal error while executing this command. If you see this message let a developer know.',
            ephemeral: true,
          });
        } else {
          interaction.followUp({
            content:
              'There was an internal error while executing this command. If you see this message let a developer know.',
          });
        }

        const channel = interaction.client.channels.cache.get(
          Config.botErrorChannelId,
        );
        if (channel?.isTextBased() && 'send' in channel) {
          channel.send({
            embeds: [ErrorEmbed(interaction, e)],
          });
        }
        logger.error(
          'An Unhandled Error occured, check the Developer Discord for more information',
        );
      }
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
