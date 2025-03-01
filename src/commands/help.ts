import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { UserRole, inviteLink } from 'src/lib/config/config';
import { logger } from 'src/lib/logger';
import { checkRole } from 'src/lib/role';
import { SlashCommand } from 'typings/command';

export default {
  command: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Display all available commands'),

  execute: async (interaction) => {
    const helpEmbed = new EmbedBuilder()
      .setTitle('Available Commands')
      .setDescription('Here are the commands you can use:')
      .setColor('#0099ff');
    for (const [_, command] of interaction.client.commands) {
      const minRole = command.minRole || UserRole.REGULAR;
      const hasPermission = await checkRole(interaction.member, minRole);
      if (hasPermission) {
        helpEmbed.addFields({
          name: `/${command.command.name}`,
          value: command.command.description || 'No description available.',
          inline: false,
        });
      }
    }
    helpEmbed.addFields({
      name: 'Invite the bot',
      value: `[Click here to invite the bot to your server](${inviteLink})`,
      inline: false,
    });

    await interaction.reply({ embeds: [helpEmbed] }).catch((error) => {
      logger.error(error);
    });
  },
} satisfies SlashCommand;
