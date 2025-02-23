import { SlashCommandBuilder } from 'discord.js';
import { IndexApiClient } from 'src/db/index/api/IndexApiClient';
import { SeasonType, TEAM_CHOICES } from 'src/db/index/shared';
import { users } from 'src/db/users';
import { BaseEmbed } from 'src/lib/embed';
import { findTeamByName } from 'src/lib/teams';

import { SlashCommand } from 'typings/command';

export default {
  command: new SlashCommandBuilder()
    .setName('team')
    .addStringOption((option) =>
      option
        .setName('abbr')
        .setDescription(
          'The abbreviation of the team. If not provided, will use the team name stored by /store.',
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
        .setDescription(
          'The season type (i.e. regular, playoffs, etc.). Default to regular season.',
        )
        .setChoices(
          { name: 'Regular', value: SeasonType.REGULAR },
          { name: 'Playoffs', value: SeasonType.POST },
        )
        .setRequired(false),
    )
    .setDescription('Get team information.'),
  execute: async (interaction) => {
    const season = interaction.options.getNumber('season') ?? undefined;
    const userTeam = await users.get(interaction.user.id);
    const abbr =
      interaction.options.getString('abbr') ??
      TEAM_CHOICES.find((team) => team.name === userTeam?.teamName)?.value ??
      null;
    const seasonType = interaction.options.getString('type') as
      | SeasonType
      | undefined;

    if (!abbr) {
      await interaction.reply({
        content: 'No team abbreviation provided.',
        ephemeral: true,
      });
      return;
    }
    if (abbr && !TEAM_CHOICES.some((team) => team.value === abbr)) {
      await interaction.reply({
        content: `Invalid team abbreviation: ${abbr}.`,
        ephemeral: true,
      });
      return;
    }

    await interaction.deferReply();

    const teamInfo = findTeamByName(abbr);
    if (!teamInfo) {
      await interaction.editReply({
        content: `Could not find team with abbreviation ${abbr}.`,
      });
      return;
    }
    const teams = await IndexApiClient.get(teamInfo.leagueType).getTeamInfo(
      season,
    );
    const team = teams.find((team) => team.name === teamInfo.fullName);

    // TODO get player stats for team
    // TODO get team stats for team (and rankings)
    // TODO get standing results for team (Div, Conf, league)
    // TODO get last 10 games for team

    if (!team) {
      await interaction.editReply({
        content: `Could not find team with abbreviation ${abbr}.`,
      });
      return;
    }

    await interaction.editReply({
      embeds: [
        BaseEmbed(interaction, {
          logoUrl: teamInfo.logoUrl,
          teamColor: team.colors.primary,
        })
          .setTitle(`${teamInfo.fullName}`)
          .addFields(
            { name: 'Abbreviation', value: team.abbreviation, inline: true },
            { name: 'Location', value: team.location, inline: true },
            {
              name: 'Conference',
              value: team.conference.toString(),
              inline: true,
            },
            {
              name: 'Division',
              value: team.division?.toString() ?? 'N/A',
              inline: true,
            },
            {
              name: 'Colors',
              value: `Primary: ${team.colors.primary}, Secondary: ${team.colors.secondary}`,
              inline: true,
            },
          ),
      ],
    });
  },
} satisfies SlashCommand;
