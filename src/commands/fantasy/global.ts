import { SlashCommandBuilder } from 'discord.js';
import { users } from 'src/db/users';
import { createPaginator } from 'src/utils/buttons/button';
import { createGlobalButton } from 'src/utils/buttons/globalButton';
import { logUnhandledCommandError } from 'src/utils/logUnhandledError';
import { SlashCommand } from 'typings/command';

export default {
  command: new SlashCommandBuilder()
    .setName('global')
    .addStringOption((option) =>
      option
        .setName('type')
        .setDescription(
          'Returns either the Global Rank of all users or the Players Rank by score',
        )
        .setChoices(
          { name: 'Global Rank', value: 'global' },
          { name: 'Player Rank', value: 'player' },
        )
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName('position')
        .setDescription(
          'The position to get the rank for. Default to all positions',
        )
        .addChoices(
          { name: 'G', value: 'G' },
          { name: 'F', value: 'F' },
          { name: 'D', value: 'D' },
        )
        .setRequired(false),
    )
    .setDescription('Get global fantasy rankings.'),

  execute: async (interaction) => {
    try {
      await interaction.deferReply();

      const type = interaction.options.getString('type', true) as
        | 'global'
        | 'player';
      const position = interaction.options.getString('position');
      const currentUserInfo = await users.get(interaction.user.id);

      const getGlobalRankings = createGlobalButton({
        interaction,
        type,
        currentUserInfo: currentUserInfo ?? null,
        position,
      });

      const message = await interaction.editReply({
        embeds: [(await getGlobalRankings(1)).embed],
        components: [(await getGlobalRankings(1)).buttons],
      });

      await createPaginator(
        message,
        interaction.user.id,
        getGlobalRankings,
        [],
      );
    } catch (error) {
      logUnhandledCommandError(interaction, error);

      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({
          content: 'Error has occured while fetching global things',
        });
      } else {
        await interaction.reply({
          content: 'Error has occured while fetching global things',
          ephemeral: true,
        });
      }
    }
  },
} satisfies SlashCommand;
