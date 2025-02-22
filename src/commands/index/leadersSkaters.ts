import { SlashCommandBuilder } from 'discord.js';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} from 'discord.js';
import { IndexApiClient } from 'src/db/index/api/IndexApiClient';
import { LeagueType, SeasonType } from 'src/db/index/shared';
import { withLeaderStats } from 'src/lib/leadersSkaters';

import { SlashCommand } from 'typings/command';

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
    .setDescription('Get player statistics.'),

  execute: async (interaction) => {
    const season = interaction.options.getNumber('season') ?? undefined;
    const league = interaction.options.getNumber('league') as
      | LeagueType
      | undefined;
    const seasonType = interaction.options.getString('type') as
      | SeasonType
      | undefined;
    const position = interaction.options.getString('position') as
      | 'F'
      | 'D'
      | undefined;
    const leader = interaction.options.getString('category') as
      | 'goals'
      | 'assists'
      | 'points'
      | 'plusMinus'
      | 'pim'
      | 'shotsOnGoal'
      | 'gwg'
      | 'faceoffs'
      | 'faceoffWins'
      | 'giveaways'
      | 'takeaways'
      | 'shotsBlocked'
      | 'hits'
      | 'shotsOnGoal';

    let currentPage = 1;

    await interaction.deferReply();

    try {
      const playerStats = await IndexApiClient.get(league).getPlayerStats(
        seasonType ?? SeasonType.REGULAR,
        season,
      );

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
        // Disable buttons after the collector ends
        row.components.forEach((button) => button.setDisabled(true));
        message.edit({ components: [row] });
      });
    } catch (error) {
      await interaction.editReply({
        content: 'An error occurred while fetching player stats.',
      });
      return;
    }
  },
} satisfies SlashCommand;
