import { SlashCommandBuilder } from 'discord.js';
import { updateFantasy } from 'src/db/fantasy/updateFantasy';
import {
  IihfIndexApiClient,
  ShlIndexApiClient,
  SmjhlIndexApiClient,
  WjcIndexApiClient,
} from 'src/db/index/api/IndexApiClient';
import { PortalClient } from 'src/db/portal/PortalClient';
import { UserRole } from 'src/lib/config/config';
import { SlashCommand } from 'typings/command';

export default {
  command: new SlashCommandBuilder()
    .setName('updatecache')
    .addStringOption((option) =>
      option
        .setName('reload')
        .setDescription('Reload the which cache.')
        .addChoices(
          { name: 'Shl', value: 'shl' },
          { name: 'Smjhl', value: 'smjhl' },
          { name: 'IIHF', value: 'iihf' },
          { name: 'WJC', value: 'wjc' },
          { name: 'Portal', value: 'portal' },
        )
        .setRequired(true),
    )
    .setDescription('Manually update the cache for the bot.'),
  execute: async (interaction) => {
    const reloadOption = interaction.options.getString('reload');
    if (!reloadOption) {
      await interaction.reply({
        content: 'You must provide a reload option',
        ephemeral: true,
      });
      return;
    }

    await interaction.deferReply({ ephemeral: true });
    let fantasyUpdateMessage = '';

    try {
      switch (reloadOption) {
        case 'shl': {
          await ShlIndexApiClient.reload();
          fantasyUpdateMessage = await updateFantasy();
          break;
        }
        case 'smjhl':
          await SmjhlIndexApiClient.reload();
          break;
        case 'iihf':
          await IihfIndexApiClient.reload();
          break;
        case 'wjc':
          await WjcIndexApiClient.reload();
          break;
        case 'portal':
          await PortalClient.reload();
          break;
        default:
          await interaction.editReply({
            content: `Invalid reload option: ${reloadOption}`,
          });
          return;
      }

      await interaction.editReply({
        content: `Cache has been successfully updated for ${reloadOption}\n${fantasyUpdateMessage}`,
      });
    } catch (error) {
      await interaction.editReply({
        content: ` An error occurred while updating the cache`,
      });
    }
  },
  minRole: UserRole.SERVER_ADMIN,
} satisfies SlashCommand;
