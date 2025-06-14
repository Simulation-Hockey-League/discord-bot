import { Events, Interaction } from 'discord.js';
import { commandCountDB, userCountDB } from 'src/db/users';
import { Config } from 'src/utils/config/config';
import { ErrorEmbed } from 'src/lib/embed';

import { pluralize } from 'src/lib/format';
import { logger } from 'src/lib/logger';
import { checkRole } from 'src/lib/role';
import { BotEvent } from 'typings/event';

// Initialize Keyv with SQLite

export default {
  name: Events.InteractionCreate,
  execute: async (interaction: Interaction) => {
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);
      const cooldownKey = `${interaction.commandName}-${interaction.user.username}`;
      const cooldown = interaction.client.cooldowns.get(cooldownKey);

      if (!command) return;

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
          cooldownKey,
          Date.now() + command.cooldown * 1000,
        );
      }

      try {
        const commandKey = `command:${interaction.commandName}`;
        const commandUsage = (await commandCountDB.get(commandKey)) || 0;
        await commandCountDB.set(commandKey, commandUsage + 1);

        const userKey = `user:${interaction.user.username}`;
        const userUsage = (await userCountDB.get(userKey)) || 0;
        await userCountDB.set(userKey, userUsage + 1);

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
          channel.send({ embeds: [ErrorEmbed(interaction, e)] });
        }
        logger.error(
          'An Unhandled Error occurred, check the Developer Discord for more information',
        );
      }
    }
  },
} satisfies BotEvent;
