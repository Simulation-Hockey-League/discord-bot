import { SlashCommandBuilder } from 'discord.js';
import { UserRole } from 'src/utils/config/config';
import { reloadCache } from 'src/utils/reloadCache';
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

    try {
      const result = await reloadCache(reloadOption);

      if (!result.ok) {
        await interaction.editReply({ content: result.error });
        return;
      }

      await interaction.editReply({
        content: `Cache has been successfully updated for ${reloadOption}\n${result.fantasyMessage ?? ''}`,
      });
    } catch (error) {
      await interaction.editReply({
        content: `An error occurred while updating the cache`,
      });
    }
  },
  minRole: UserRole.SERVER_ADMIN,
} satisfies SlashCommand;
