import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  EmbedBuilder,
  Message,
  MessageComponentInteraction,
} from 'discord.js';
import { logger } from 'src/lib/logger';

export const backForwardButtons = (page: number, totalPages: number) => {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`prev`)
      .setLabel('Previous')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(page === 1),
    new ButtonBuilder()
      .setCustomId(`next`)
      .setLabel('Next')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(page === totalPages),
  );
};

export type GetPageFn = (page: number) => Promise<{
  embed: EmbedBuilder;
  buttons: ActionRowBuilder<ButtonBuilder>;
  totalPages: number;
}>;

const disableButtons = (
  row: ActionRowBuilder<ButtonBuilder>,
): ActionRowBuilder<ButtonBuilder> => {
  row.components.forEach((btn) => btn.setDisabled(true));
  return row;
};

export async function createPaginator(
  message: Message,
  userId: string,
  getPage: GetPageFn,
  staticComponents: ActionRowBuilder<any>[] = [],
  initialPage = 1,
  timeout = 60000,
) {
  let currentPage = initialPage;
  let { embed, buttons, totalPages } = await getPage(currentPage);

  await message.edit({
    embeds: [embed],
    components: [...staticComponents, buttons],
  });

  const collector = message.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: timeout,
    filter: (interaction) => interaction.user.id === userId,
  });

  collector.on('collect', async (interaction: MessageComponentInteraction) => {
    if (interaction.customId === 'next') {
      currentPage = Math.min(currentPage + 1, totalPages);
    } else if (interaction.customId === 'prev') {
      currentPage = Math.max(currentPage - 1, 1);
    }

    const result = await getPage(currentPage);
    embed = result.embed;
    buttons = result.buttons;
    totalPages = result.totalPages;

    await interaction.update({
      embeds: [embed],
      components: [...staticComponents, buttons],
    });
  });

  collector.on('end', async () => {
    const disabledRow = disableButtons(buttons);
    await message.edit({ components: [disabledRow] }).catch((error) => {
      logger.error(error);
    });
  });
}
