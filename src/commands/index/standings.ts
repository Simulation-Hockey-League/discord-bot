import { SlashCommandBuilder } from 'discord.js';
import { getPlayerStats, getStandings } from 'src/db/index';
import { IndexApiClient } from 'src/db/index/api/IndexApiClient';
import { SeasonType, toLeagueType } from 'src/db/index/shared';
import { BaseEmbed } from 'src/lib/embed';
import { logger } from 'src/lib/logger';
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
					'Select regular season or playoffs. If not provided, will get regular season.'
				)
				.setRequired(false),
		)
    .setDescription('Get season rankings.'),
  execute: async (interaction) => {
		const league = toLeagueType(interaction.options.getString('league'));
		const playoffs = interaction.options.getBoolean('playoffs') ?? false;
		const season = interaction.options.getNumber('season') ?? undefined;

    await interaction.deferReply();
    const seasonStats = await getStandings(league, season);

    if (!seasonStats) {
      await interaction.editReply({
        content: `Could not find ${playoffs ? `playoff` : ''} standings for ${league}${
          season ? ` in season ${season}` : ''
        }.`,
      });
      return;
    }

    await interaction.editReply({
      embeds: [
      ],
    });
  },
} satisfies SlashCommand;
