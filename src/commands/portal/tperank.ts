import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { PortalClient } from 'src/db/portal/PortalClient';
import { pageSizes } from 'src/lib/config/config';
import {
  GetPageFn,
  backForwardButtons,
  createPaginator,
} from 'src/lib/helpers/buttons/button';
import { SlashCommand } from 'typings/command';

export default {
  command: new SlashCommandBuilder()
    .setName('tperank')
    .addStringOption((option) =>
      option
        .setName('league')
        .setDescription(
          'Which League to get TPE rankings for. Default is All Leagues.',
        )
        .addChoices(
          { name: 'SHL', value: 'SHL' },
          { name: 'SMJHL', value: 'SMJHL' },
        )
        .setRequired(false),
    )
    .addNumberOption((option) =>
      option
        .setName('season')
        .setDescription(
          'The draft season to get TPE rankings for. Default is All Seasons.',
        )
        .setRequired(false),
    )
    .setDescription('Retrieve TPE rankings from the portal.'),

  execute: async (interaction) => {
    await interaction.deferReply({ ephemeral: false });
    const targetLeague = interaction.options.getString('league') ?? null;
    const targetDraftSeason = interaction.options.getNumber('season') ?? null;
    const players = await PortalClient.getActivePlayers();

    if (!players.length) {
      await interaction.editReply({
        content: 'Something went wrong. Please try again.',
      });
      return;
    }
    try {
      const tpeRankings = players
        .map((player) => ({
          username: player.username,
          tpe: player.totalTPE,
          league: player.currentLeague,
          draftSeason: player.draftSeason,
          position: player.position,
          name: player.name,
        }))
        .sort((a, b) => b.tpe - a.tpe)
        .filter((player) => {
          const matchesLeague = targetLeague
            ? player.league === targetLeague
            : true;
          const matchesSeason = targetDraftSeason
            ? player.draftSeason === targetDraftSeason
            : true;

          return matchesLeague && matchesSeason;
        });

      const getLeaderStatsPage: GetPageFn = async (page) => {
        const { embed, totalPages } = await getRankingEmbed(
          tpeRankings,
          targetDraftSeason,
          targetLeague,
          page,
        );

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

const getRankingEmbed = (
  tpeRankings: any[],
  targetDraftSeason: number | null,
  targetLeague: string | null,
  page: number,
) => {
  const totalPages = Math.ceil(tpeRankings.length / pageSizes.tpeRank);
  const startIdx = (page - 1) * pageSizes.tpeRank;
  const endIdx = page * pageSizes.tpeRank;

  const pageRankings = tpeRankings.slice(startIdx, endIdx);

  const embed = new EmbedBuilder()
    .setTitle(
      targetDraftSeason || targetLeague
        ? `TPE Rankings for S${targetDraftSeason || ''} ${
            targetLeague || ''
          }`.trim()
        : 'TPE Rankings',
    )
    .addFields({
      name: 'TPE Rankings',
      value: pageRankings.length
        ? pageRankings
            .map(
              (player, index) =>
                `${startIdx + index + 1}.  ${player.username} |  ${
                  player.name
                } | ${player.tpe} TPE`,
            )
            .join('\n')
        : 'No players found.',
      inline: false,
    });

  return { embed, totalPages };
};
