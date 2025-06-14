import { SlashCommandBuilder } from 'discord.js';
import { getStandings } from 'src/db/index';
import { IndexApiClient } from 'src/db/index/api/IndexApiClient';
import { LeagueType } from 'src/db/index/shared';
import { BaseEmbed } from 'src/lib/embed';
import { logger } from 'src/lib/logger';
import { playoffStandings, regularSeasonStandings } from 'src/lib/standings';
import { DynamicConfig } from 'src/utils/config/dynamicConfig';
import { logUnhandledCommandError } from 'src/utils/logUnhandledError';

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
    .addStringOption((option) =>
      option
        .setName('configuration')
        .setDescription(
          'What configuration to get standings for (League, Conference, Division). Default to League.',
        )
        .addChoices(
          { name: 'League', value: 'league' },
          { name: 'Conference', value: 'conference' },
          { name: 'Division', value: 'division' },
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
      const league =
        (interaction.options.getNumber('league') as LeagueType) ??
        LeagueType.SHL;
      const playoffs = interaction.options.getBoolean('playoffs') ?? false;

      const currentSeason = DynamicConfig.get('currentSeason');
      const season = interaction.options.getNumber('season') ?? currentSeason;
      const seasonStats = await getStandings(league, season);
      const teamInfo = await IndexApiClient.get(league).getTeamInfo();
      const configuration =
        interaction.options.getString('configuration') ?? 'league';

      if (!seasonStats || seasonStats?.length <= 0) {
        await interaction.editReply({
          content: `Could not find${
            playoffs ? ` playoff` : ''
          } standings for ${league}${season ? ` in season ${season}` : ''}.`,
        });
        return;
      }
      const conferenceInfo = await IndexApiClient.get(league).getConferences();
      const divisionInfo = await IndexApiClient.get(league).getDivisions();

      if (playoffs) {
        const playoffFormat = await IndexApiClient.get(league).getPlayoffs(
          season,
        );
        await interaction
          .editReply({
            embeds: [
              playoffStandings(
                BaseEmbed(interaction, {}).setTitle(
                  `Season ${season} Playoff Standings`,
                ),
                playoffFormat,
              ),
            ],
          })
          .catch((error) => {
            logger.error(
              `Unhandled error in command "${
                interaction.commandName
              }" by user ${interaction.user.tag} (${
                interaction.user.id
              }) in channel ${
                interaction.channel?.id
              } (${interaction.channel?.toString()}) in guild ${
                interaction.guild?.name ?? 'DM'
              } (${interaction.guild?.id}): ${error}`,
            );
          });
        return;
      }

      await interaction
        .editReply({
          embeds: [
            regularSeasonStandings(
              BaseEmbed(interaction, {}).setTitle(
                `Season ${season} Regular Season Standings`,
              ),
              seasonStats,
              teamInfo,
              conferenceInfo,
              divisionInfo,
              league,
              configuration,
            ),
          ],
        })
        .catch((error) => {
          logUnhandledCommandError(interaction, error);
        });
    } catch (error) {
      await interaction.editReply({
        content: `An error occurred while retrieving standings.`,
      });
      return;
    }
  },
} satisfies SlashCommand;
