import { SlashCommandBuilder } from 'discord.js';
import { getStandings } from 'src/db/index';
import { LeagueType } from 'src/db/index/shared';
import { DynamicConfig } from 'src/lib/config/dynamicConfig';
import { BaseEmbed } from 'src/lib/embed';
import { logger } from 'src/lib/logger';
import { withStandingsStats } from 'src/lib/standings';

import { SlashCommand } from 'typings/command';

export default {
  command: new SlashCommandBuilder()
    .setName('standings')
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
    .setDescription('Get season rankings. Will default to SHL Standings'),
  execute: async (interaction) => {
    try {
      await interaction.deferReply();
      let league = interaction.options.getNumber('league') as LeagueType;
      const playoffs = interaction.options.getBoolean('playoffs') ?? false;

      const currentSeason = DynamicConfig.get('currentSeason');
      const season = interaction.options.getNumber('season') ?? currentSeason;
      const seasonStats = await getStandings(league, season);

      if (!seasonStats || seasonStats?.length <= 0) {
        await interaction.editReply({
          content: `Could not find${
            playoffs ? ` playoff` : ''
          } standings for ${league}${season ? ` in season ${season}` : ''}.`,
        });
        return;
      }
      league = league ?? LeagueType.SHL; //default to SHL
      await interaction
        .editReply({
          embeds: [
            withStandingsStats(
              BaseEmbed(interaction, {}).setTitle(
                `Season ${season}${
                  playoffs ? ` Playoff ` : ` Regular Season `
                }Standings`,
              ),
              seasonStats,
              league,
            ),
          ],
        })
        .catch(logger.error);
    } catch (error) {
      await interaction.editReply({
        content: `An error occurred while retrieving standings.`,
      });
      return;
    }
  },
} satisfies SlashCommand;
