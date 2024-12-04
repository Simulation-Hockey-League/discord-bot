import { SlashCommandBuilder } from 'discord.js';
import { getPlayerStats } from 'src/db/index';
import { IndexApiClient } from 'src/db/index/api/IndexApiClient';
import { SeasonType } from 'src/db/index/shared';
import { users } from 'src/db/users';
import { BaseEmbed } from 'src/lib/embed';
import { withPlayerStats } from 'src/lib/player';
import { findTeamByName } from 'src/lib/teams';

import { SlashCommand } from 'typings/command';

export default {
  command: new SlashCommandBuilder()
    .setName('player')
    .addStringOption((option) =>
      option
        .setName('name')
        .setDescription(
          'The name of the player. If not provided, will use the player name stored by /store.',
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
        .setName('type')
        .setDescription('The season type (i.e. regular, playoffs, etc.)')
        .setChoices(
          { name: 'Regular', value: SeasonType.REGULAR },
          { name: 'Playoffs', value: SeasonType.POST },
        )
        .setRequired(false),
    )
    .setDescription('Get player statistics.'),
  execute: async (interaction) => {
    const season = interaction.options.getNumber('season') ?? undefined;
    const targetName = interaction.options.getString('name');
    const seasonType = interaction.options.getString('type') as
      | SeasonType
      | undefined;
    const currentUserInfo = await users.get(interaction.user.id);

    const name = targetName || currentUserInfo?.playerName;

    if (!name) {
      await interaction.reply({
        content: 'No player name provided or stored.',
        ephemeral: true,
      });
      return;
    }

    await interaction.deferReply();
    const playerStats = await getPlayerStats(name, seasonType, season);

    if (!playerStats) {
      await interaction.editReply({
        content: `Could not find ${name}${
          season ? ` in season ${season}` : ''
        }.`,
      });
      return;
    }

    const teamInfo = findTeamByName(playerStats.team);
    const teams = await IndexApiClient.get(playerStats.league).getTeamInfo();
    const team = teams.find((team) => team.id === playerStats?.teamId);

    await interaction.editReply({
      embeds: [
        withPlayerStats(
          BaseEmbed(interaction, {
            logoUrl: teamInfo?.logoUrl,
            teamColor: team?.colors.primary,
          }).setTitle(`${playerStats.name} - ${playerStats.position}`),
          playerStats,
        ),
      ],
    });
  },
} satisfies SlashCommand;
