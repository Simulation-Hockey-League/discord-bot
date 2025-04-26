import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { PortalClient } from 'src/db/portal/PortalClient';
import { pageSizes } from 'src/lib/config/config';
import { DynamicConfig } from 'src/lib/config/dynamicConfig';
import {
  GetPageFn,
  backForwardButtons,
  createPaginator,
} from 'src/lib/helpers/buttons/button';
import { SlashCommand } from 'typings/command';
import { PortalTPEEarned } from 'typings/portal';

export default {
  command: new SlashCommandBuilder()
    .setName('tpeearned')
    .addNumberOption((option) =>
      option
        .setName('season')
        .setDescription(
          'The season you want to search for TPE Earned. If not provided, will get current season.',
        )
        .setRequired(false),
    )
    .addNumberOption((option) =>
      option
        .setName('draftseason')
        .setDescription(
          'The draft season you want to search for TPE Earned. If not provided, will return all seasons',
        )
        .setRequired(false),
    )
    .setDescription('Retrieve TPE rankings from the portal.'),

  execute: async (interaction) => {
    await interaction.deferReply({ ephemeral: false });
    const currentSeason = DynamicConfig.get('currentSeason');
    const targetSeason =
      interaction.options.getNumber('season') ?? currentSeason;
    const draftSeason =
      interaction.options.getNumber('draftseason') ?? undefined;

    try {
      let earnedTPE = (
        await PortalClient.getTPEEarnedBySeason(false, targetSeason)
      ).sort((a, b) => b.earnedTPE - a.earnedTPE);

      if (draftSeason) {
        earnedTPE = earnedTPE.filter(
          (player) => player.draftSeason === draftSeason,
        );
        earnedTPE.forEach((player, index) => {
          player.rank = index + 1;
        });
      }

      const getLeaderStatsPage: GetPageFn = async (page) => {
        const { embed, totalPages } = await getRankingEmbed(earnedTPE, page);

        const buttons = backForwardButtons(page, totalPages);
        return { embed, buttons, totalPages };
      };

      const message = await interaction.editReply({
        embeds: [(await getLeaderStatsPage(1)).embed],
        components: [(await getLeaderStatsPage(1)).buttons],
      });
      await createPaginator(message, interaction.user.id, getLeaderStatsPage);
    } catch (error) {
      await interaction.editReply({
        content: `An error occurred while retrieving TPE rankings.`,
      });
      return;
    }
  },
} satisfies SlashCommand;

const getRankingEmbed = (earnedTPE: PortalTPEEarned[], page: number) => {
  const totalPages = Math.ceil(earnedTPE.length / pageSizes.tpeRank);
  const startIdx = (page - 1) * pageSizes.tpeRank;
  const endIdx = page * pageSizes.tpeRank;

  const pageRankings = earnedTPE.slice(startIdx, endIdx);
  const embed = new EmbedBuilder()
    .setTitle(`TPE Earned for Season ${earnedTPE[0]?.season || 'N/A'}`)
    .addFields({
      name: 'TPE Earned',
      value: pageRankings.length
        ? pageRankings
            .map(
              (player) =>
                `${player.rank}.  ${player.username} |  ${player.name} | ${player.earnedTPE} TPE`,
            )
            .join('\n')
        : 'No players found.',
      inline: false,
    });

  return { embed, totalPages };
};
