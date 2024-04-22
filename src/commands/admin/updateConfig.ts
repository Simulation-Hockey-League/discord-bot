import { SlashCommandBuilder } from 'discord.js';
import { UserRole } from 'src/lib/config/config';
import { DynamicConfig } from 'src/lib/config/dynamicConfig';

import { SlashCommand } from 'typings/command';

export default {
  command: new SlashCommandBuilder()
    .setName('update-config')
    .addStringOption((option) =>
      option
        .setName('fantasysheetid')
        .setDescription(
          'The ID of the Google Sheet that contains the fantasy data.',
        ),
    )
    .setDescription('Update the internal bot configuration.'),
  execute: async (interaction) => {
    const fantasySheetId = interaction.options.getString('fantasysheetid');
    if (!fantasySheetId) {
      await DynamicConfig.set('fantasySheetId', fantasySheetId);
      await interaction.reply({
        content: `Updated the fantasy sheet ID to ${fantasySheetId}.`,
        ephemeral: true,
      });
      return;
    }

    await interaction.reply({
      content: 'You must provide some value to update the config',
      ephemeral: true,
    });
  },
  minRole: UserRole.BOT_OWNERS,
} satisfies SlashCommand;
