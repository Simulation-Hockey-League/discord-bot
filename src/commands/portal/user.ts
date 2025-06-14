import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ComponentType,
  SlashCommandBuilder,
} from 'discord.js';
import { getUserByFuzzy } from 'src/db/portal';
import { users } from 'src/db/users';
import { logger } from 'src/lib/logger';
import { withTPEEarned, withUserAwards, withUserInfo } from 'src/lib/user';
import { logUnhandledCommandError } from 'src/utils/logUnhandledError';
import { SlashCommand } from 'typings/command';

export default {
  command: new SlashCommandBuilder()
    .setName('user')
    .addStringOption((option) =>
      option
        .setName('username')
        .setDescription('The username of the player on the forum.')
        .setRequired(false),
    )
    .setDescription('Retrieve player info from the portal.'),
  execute: async (interaction) => {
    await interaction.deferReply({ ephemeral: false });
    const target = interaction.options.getString('username');
    const currentUserInfo = await users.get(interaction.user.id);
    const name = target || currentUserInfo?.forumName;

    if (!name) {
      await interaction
        .editReply({
          content: 'No player name provided or stored.',
        })
        .catch((error) => {
          logUnhandledCommandError(interaction, error);
        });
      return;
    }

    try {
      const user = await getUserByFuzzy(name);
      if (!user) {
        await interaction.editReply({
          content:
            'Could not find user with that username. Please check your spelling and try again.',
        });
        return;
      }

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(`profile_${user.userID}`)
          .setLabel('Profile')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId(`awards_${user.userID}`)
          .setLabel('User Awards')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(`tpe_earned_${user.userID}`)
          .setLabel('TPE Earned')
          .setStyle(ButtonStyle.Secondary),
      );

      await withUserInfo(interaction, user);
      const response = await interaction
        .editReply({ components: [row] })
        .catch((error) => {
          logUnhandledCommandError(interaction, error);
          return null;
        });
      if (!response) {
        return;
      }

      const collector = response.createMessageComponentCollector({
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

        await i.deferUpdate().catch((error) => {
          logger.error('Failed to defer update:', error);
          if (error.code === 10008) {
            collector.stop();
            return;
          }
        });

        if (i.customId.startsWith('profile')) {
          await withUserInfo(interaction, user);
        } else if (i.customId.startsWith('awards')) {
          await withUserAwards(interaction, user);
        } else if (i.customId.startsWith('tpe_earned')) {
          await withTPEEarned(interaction, user);
        }

        await i.editReply({ components: [row] });
      });

      collector.on('end', () => {
        interaction.editReply({ components: [] }).catch((error) => {
          logUnhandledCommandError(interaction, error);
        });
      });
    } catch (error) {
      logUnhandledCommandError(interaction, error);
      await interaction.editReply({
        content: 'An error occurred while retrieving player info.',
      });
    }
  },
} satisfies SlashCommand;
