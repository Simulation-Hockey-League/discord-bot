import { SlashCommandBuilder } from 'discord.js';
import { discordMods } from 'src/db/users';
import { UserRole } from 'src/lib/config/config';
import { BaseEmbed } from 'src/lib/embed';
import { logger } from 'src/lib/logger';
import { SlashCommand } from 'typings/command';

export default {
  command: new SlashCommandBuilder()
    .setName('update-team')
    .addStringOption((option) =>
      option
        .setName('discord-id')
        .setDescription(
          'DiscordID of the user (found if you right click on them in discord)',
        )
        .setRequired(true),
    )
    .addBooleanOption((option) =>
      option
        .setName('addremove')
        .setDescription('True = Add, False = Remove')
        .setRequired(true),
    )
    .addNumberOption((option) =>
      option
        .setName('role')
        .setDescription('The role to add or remove')
        .addChoices({ name: 'Admin', value: UserRole.SERVER_ADMIN })
        .setRequired(true),
    )
    .setDescription('Update Discord Team Roles.'),
  execute: async (interaction) => {
    const target = interaction.options.getString('discord-id', true);
    const addOrRemove = interaction.options.getBoolean('addremove', true);
    const role = interaction.options.getNumber('role', true);

    const isOverwritingStoredInfo = await discordMods.has(target);
    try {
      if (addOrRemove) {
        await discordMods.set(target, { discordID: target, role: role });
      } else {
        await discordMods.delete(target);
      }
      await interaction.reply({
        embeds: [
          BaseEmbed(interaction, {})
            .setDescription(
              isOverwritingStoredInfo
                ? `Updated team role for ${target}.`
                : `Stored team role for ${target}.`,
            )
            .addFields({
              name: 'Role',
              value: role === UserRole.SERVER_ADMIN ? 'Admin' : 'User',
            }),
        ],
        ephemeral: true,
      });
    } catch (error) {
      logger.error(error);
    }
  },
  minRole: UserRole.BOT_OWNERS,
} satisfies SlashCommand;
