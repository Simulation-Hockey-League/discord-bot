import {
  ActionRowBuilder,
  CacheType,
  ComponentType,
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
} from 'discord.js';
import { leagueNumberToType } from 'src/db/index/helpers/leagueToString';

import {
  GetPageFn,
  backForwardButtons,
  createPaginator,
} from 'src/utils/buttons/button';
import { logUnhandledCommandError } from 'src/utils/logUnhandledError';
import { GoalieStats, PlayerStats } from 'typings/statsindex';

import { pageSizes } from '../utils/config/config';

import { findTeamByID } from './teams';

export async function createLeadersSelector<
  T extends PlayerStats | GoalieStats,
>(
  interaction: any,
  players: T[],
  categories: { [key: string]: string },
  defaultCategory: string,
  titlePrefix: string,
) {
  let currentCategory = defaultCategory;

  // Menu Options Row
  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId('stat-category')
    .setPlaceholder('Select a category')
    .addOptions(
      Object.entries(categories).map(([key, name]) => ({
        label: name,
        value: key,
      })),
    );
  const menuRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    selectMenu,
  );

  // Define the getPage function using the current category
  const getPage: GetPageFn = async (page: number) => {
    const sortedData = [...players].sort(
      (a, b) =>
        Number(b[currentCategory as keyof T]) -
        Number(a[currentCategory as keyof T]),
    );
    const totalPages = Math.ceil(sortedData.length / pageSizes.global);
    const startIndex = (page - 1) * pageSizes.global;
    const topPlayers = sortedData.slice(
      startIndex,
      startIndex + pageSizes.global,
    );
    const embed = new EmbedBuilder()
      .setTitle(
        `${titlePrefix} - ${categories[currentCategory]} (Page ${page}/${totalPages})`,
      )
      .setDescription(
        topPlayers
          .map((entry, index) => {
            const team = findTeamByID(
              entry.id,
              leagueNumberToType(entry.league),
            );
            const emoji = team ? team.emoji : entry.name;
            return `${startIndex + index + 1}. ${emoji}: ${
              entry[currentCategory as keyof T]
            }`;
          })
          .join('\n'),
      );
    const buttons = backForwardButtons(page, totalPages);
    return { embed, buttons, totalPages };
  };

  // Get initial page data
  const { embed: initialEmbed, totalPages } = await getPage(1);
  const paginationButtons = backForwardButtons(1, totalPages);

  // Send the initial message and capture it
  const message = await interaction.editReply({
    embeds: [initialEmbed],
    components: [menuRow, paginationButtons],
  });

  // Create a collector for the select menu to update the category
  const menuCollector = message.createMessageComponentCollector({
    componentType: ComponentType.StringSelect,
    time: 60000,
  });
  menuCollector.on(
    'collect',
    async (selectInteraction: StringSelectMenuInteraction<CacheType>) => {
      if (selectInteraction.user.id !== interaction.user.id) {
        return selectInteraction.reply({
          content: 'You cannot interact with this menu.',
          ephemeral: true,
        });
      }
      currentCategory = selectInteraction.values[0];
      const { embed, totalPages } = await getPage(1);
      const newPaginationButtons = backForwardButtons(1, totalPages);
      await selectInteraction.update({
        embeds: [embed],
        components: [menuRow, newPaginationButtons],
      });
    },
  );

  // Use your paginator to handle the pagination buttons.
  await createPaginator(message, interaction.user.id, getPage, [menuRow]).catch(
    async (error) => {
      logUnhandledCommandError(interaction, error);
      await interaction.editReply({
        content: 'An error occurred while fetching player stats.',
      });
    },
  );
}
