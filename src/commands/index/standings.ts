import { SlashCommandBuilder } from 'discord.js';
import { getStandings } from 'src/db/index';
import { LeagueType, toLeagueType } from 'src/db/index/shared';
import { DynamicConfig } from 'src/lib/config/dynamicConfig';
import { BaseEmbed } from 'src/lib/embed';
import { withStandingsStats } from 'src/lib/standings';

import { SlashCommand } from 'typings/command';

export default {
  command: new SlashCommandBuilder()
    .setName('standings')
    .addStringOption((option) =>
      option
        .setName('league')
        .setDescription(
          'The league of the standings to return. If not provided, will use SHL standings.',
        )
        .setRequired(false),
    )
    .addNumberOption((option) =>
      option
        .setName('season')
        .setDescription(
          'The season to get stats for. If not provided, will get current season.',
        )
        .setRequired(false),
    )
    .addBooleanOption((option) =>
      option
        .setName('playoffs')
        .setDescription(
          'Select regular season or playoffs. If not provided, will get regular season.',
        )
        .setRequired(false),
    )
    .setDescription('Get season rankings.'),
  execute: async (interaction) => {
    await interaction.deferReply();
    const league = toLeagueType(interaction.options.getString('league'));
    const playoffs = interaction.options.getBoolean('playoffs') ?? false;

    const currentSeason = DynamicConfig.get('currentSeason');
    const season = interaction.options.getNumber('season') ?? currentSeason;
    try {
      const seasonStats = await getStandings(league, season);

      if (!seasonStats || seasonStats?.length <= 0) {
        await interaction.editReply({
          content: `Could not find${playoffs ? ` playoff` : ''} standings for ${
            LeagueType[league]
          }${season ? ` in season ${season}` : ''}.`,
        });
        return;
      }
      await interaction.editReply({
        embeds: [
          withStandingsStats(
            BaseEmbed(interaction, {}).setTitle(
              `Season ${season}${
                playoffs ? ` Playoff ` : ` Regular Season `
              }Standings`,
            ),
            seasonStats,
          ),
        ],
      });
    } catch (error) {
      await interaction.editReply({
        content: `An error occurred while retrieving standings.`,
      });
      return;
    }
  },
} satisfies SlashCommand;
