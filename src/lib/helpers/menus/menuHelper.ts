import {
  ActionRowBuilder,
  ComponentType,
  EmbedBuilder,
  InteractionEditReplyOptions,
  Message,
  StringSelectMenuBuilder,
} from 'discord.js';
import { leagueNumberToType } from 'src/db/index/helpers/leagueToString';

import { findTeamByID } from 'src/lib/teams';

export async function createStatSelector(
  interaction: {
    editReply: (options: InteractionEditReplyOptions) => Promise<Message>;
    user: { id: string };
  },
  categories: { [key: string]: string },
  generateEmbed: (category: string) => EmbedBuilder,
  defaultCategory: string,
) {
  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId('stat-category')
    .setPlaceholder('Select a category')
    .addOptions(
      Object.entries(categories).map(([key, name]) => ({
        label: String(name),
        value: key,
      })),
    );

  const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    selectMenu,
  );

  const message = await interaction.editReply({
    embeds: [generateEmbed(defaultCategory)],
    components: [row as ActionRowBuilder<StringSelectMenuBuilder>],
  });

  const collector = message.createMessageComponentCollector({
    componentType: ComponentType.StringSelect,
    time: 60000,
  });

  collector.on('collect', async (selectInteraction) => {
    if (selectInteraction.user.id !== interaction.user.id) {
      return selectInteraction.reply({
        content: 'You cannot interact with this menu.',
        ephemeral: true,
      });
    }

    await selectInteraction.update({
      embeds: [generateEmbed(selectInteraction.values[0])],
    });
  });
}

export async function createTeamStatsSelector(
  interaction: any,
  rankedData: any[],
  categories: { [key: string]: string },
  defaultCategory: string,
  titlePrefix: string,
  getSortingOrder: (category: string, a: number, b: number) => number,
) {
  const generateEmbed = (category: string) => {
    const sortedData = rankedData.sort((a, b) =>
      getSortingOrder(category, a.stats[category], b.stats[category]),
    );

    return new EmbedBuilder()
      .setTitle(`${titlePrefix} - ${categories[category]}`)
      .setDescription(
        sortedData
          .map((entry, index) => {
            // Find team emoji by ID and league type
            const team = findTeamByID(
              entry.id,
              leagueNumberToType(entry.league),
            );
            const emoji = team ? team.emoji : entry.name;
            return `${index + 1}. ${emoji}: ${entry.stats[category]}`;
          })
          .join('\n'),
      );
  };

  await createStatSelector(
    interaction,
    categories,
    generateEmbed,
    defaultCategory,
  );
}
