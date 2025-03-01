import { SlashCommandBuilder } from 'discord.js';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} from 'discord.js';
import { IndexApiClient } from 'src/db/index/api/IndexApiClient';
import { LeagueType, SeasonType, SkaterCategory } from 'src/db/index/shared';
import { skaterRookieCutoffs } from 'src/lib/config/config';
import { DynamicConfig } from 'src/lib/config/dynamicConfig';
import { withLeaderStats } from 'src/lib/leadersSkaters';
import { logger } from 'src/lib/logger';

import { SlashCommand } from 'typings/command';
import { PlayerStats } from 'typings/statsindex';

export default {
  command: new SlashCommandBuilder()
    .setName('leaders-skaters')
    .addStringOption((option) =>
      option
        .setName('category')
        .setDescription('The leader in a set position')
        .setChoices(
          { name: 'goals', value: 'goals' },
          { name: 'assists', value: 'assists' },
          { name: 'points', value: 'points' },
          { name: 'plusMinus', value: 'plusMinus' },
          { name: 'pim', value: 'pim' },
          { name: 'shotsOnGoal', value: 'shotsOnGoal' },
          { name: 'gwg', value: 'gwg' },
          { name: 'faceoffs', value: 'faceoffs' },
          { name: 'faceoffWins', value: 'faceoffWins' },
          { name: 'giveaways', value: 'giveaways' },
          { name: 'takeaways', value: 'takeaways' },
          { name: 'shotsBlocked', value: 'shotsBlocked' },
          { name: 'hits', value: 'hits' },
          { name: 'shotsOnGoal', value: 'shotsOnGoal' },
          { name: 'fights', value: 'fights' },
          { name: 'fightWins', value: 'fightWins' },
          { name: 'fightLosses', value: 'fightLosses' },
        )
        .setRequired(true),
    )
    .addNumberOption((option) =>
      option
        .setName('season')
        .setDescription(
          'The season to get stats for. If not provided, will get current season.',
        )
        .setRequired(false),
    )
    .addStringOption((option) =>
      option
        .setName('position')
        .setDescription(
          'The position of the leaders. If not provided, will use all players',
        )
        .setChoices(
          { name: 'Forward', value: 'F' },
          { name: 'Defenseman', value: 'D' },
        )
        .setRequired(false),
    )
    .addNumberOption((option) =>
      option
        .setName('league')
        .setDescription(
          'The league of the standings to return. If not provided, will use SHL standings.',
        )
        .setChoices(
          { name: 'SHL', value: LeagueType.SHL },
          { name: 'SMJHL', value: LeagueType.SMJHL },
          { name: 'IIHF', value: LeagueType.IIHF },
          { name: 'WJC', value: LeagueType.WJC },
        )
        .setRequired(false),
    )
    .addStringOption((option) =>
      option
        .setName('type')
        .setDescription(
          'The season type (i.e. regular, playoffs, etc.). If not provided will default to regular season',
        )
        .setChoices(
          { name: 'Regular', value: SeasonType.REGULAR },
          { name: 'Playoffs', value: SeasonType.POST },
        )
        .setRequired(false),
    )
    .addBooleanOption((option) =>
      option
        .setName('rookie')
        .setDescription(
          'If you want to look at only rookies or not. Default to no',
        )
        .setRequired(false),
    )
    .setDescription('Get player statistics.'),

  execute: async (interaction) => {
    const currentSeason = DynamicConfig.get('currentSeason');
    const season = interaction.options.getNumber('season') ?? currentSeason;
    const league = interaction.options.getNumber('league') as
      | LeagueType
      | LeagueType.SHL;
    const seasonType = interaction.options.getString('type') as
      | SeasonType
      | undefined;
    const position = interaction.options.getString('position') as
      | 'F'
      | 'D'
      | undefined;
    const leader = interaction.options.getString('category') as SkaterCategory;
    const viewRookie = interaction.options.getBoolean('rookie') ?? false;

    let currentPage = 1;

    await interaction.deferReply();

    try {
      let seasonBefore: PlayerStats[] = [];

      let playerStats = await IndexApiClient.get(league).getPlayerStats(
        seasonType ?? SeasonType.REGULAR,
        season,
      );
      if (viewRookie) {
        seasonBefore = await IndexApiClient.get(league).getPlayerStats(
          seasonType ?? SeasonType.REGULAR,
          season - 1,
        );
        const previousSeasonIds = new Set(
          seasonBefore.map((player) => player.id),
        );
        const cutoff =
          skaterRookieCutoffs.find((cutoff) => cutoff.league === league)
            ?.gamesPlayed ?? 15;
        const rookieStats = playerStats.filter(
          (player) =>
            !previousSeasonIds.has(player.id) && player.gamesPlayed > cutoff,
        );
        playerStats = rookieStats;
      }

      const embed = await withLeaderStats(
        playerStats,
        league,
        season,
        seasonType,
        position,
        leader,
        currentPage,
      );
      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId('prev')
          .setLabel('Previous')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('next')
          .setLabel('Next')
          .setStyle(ButtonStyle.Primary),
      );

      const message = await interaction.editReply({
        embeds: [embed],
        components: [row],
      });

      const collector = message.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 60000,
      });

      collector.on('collect', async (btnInteraction) => {
        if (btnInteraction.user.id !== interaction.user.id) {
          return btnInteraction.reply({
            content: 'You cannot interact with these buttons.',
            ephemeral: true,
          });
        }
        if (btnInteraction.customId === 'next') {
          currentPage++;
        } else if (btnInteraction.customId === 'prev' && currentPage > 1) {
          currentPage--;
        }

        const newEmbed = await withLeaderStats(
          playerStats,
          league,
          season,
          seasonType,
          position,
          leader,
          currentPage,
        );
        await btnInteraction.update({
          embeds: [newEmbed],
          components: [row],
        });
      });

      collector.on('end', () => {
        row.components.forEach((button) => button.setDisabled(true));
        message.edit({ components: [row] }).catch(logger.error);
      });
    } catch (error) {
      await interaction.editReply({
        content: 'An error occurred while fetching player stats.',
      });
      return;
    }
  },
} satisfies SlashCommand;
