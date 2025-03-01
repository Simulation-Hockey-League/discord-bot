import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ComponentType,
  EmbedBuilder,
  SlashCommandBuilder,
} from 'discord.js';
import { handleHelpButtons } from 'src/lib/helpers/buttons/helpButton';
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

    // Add available commands dynamically based on permissions
    for (const [, command] of interaction.client.commands) {
      const minRole = command.minRole || 0;
      // Assuming `checkRole` is a function that checks if the user has the necessary role
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
      value:
        '[Click here to invite the bot to your server](https://discord.com/oauth2/authorize)',
      inline: false,
    });

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('help_main')
        .setLabel('Help')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('help_abbr')
        .setLabel('Abbr Helper')
        .setStyle(ButtonStyle.Primary),
    );

    const reply = await interaction.reply({
      embeds: [helpEmbed],
      components: [row],
      fetchReply: true,
    });

    const collector = reply.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 60000,
    });

    collector.on('collect', async (i: ButtonInteraction) => {
      if (i.user.id !== interaction.user.id) {
        await i.reply({
          content: 'Only the command user can use these buttons.',
          ephemeral: true,
        });
        return;
      }
      await handleHelpButtons(i);
    });

    collector.on('end', async () => {
      try {
        await interaction.editReply({
          components: [],
        });
      } catch (error) {
        logger.error(error);
      }
    });
  },
} satisfies SlashCommand;
