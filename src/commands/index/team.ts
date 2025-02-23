import { SlashCommandBuilder } from 'discord.js';
import { getTeamStats } from 'src/db/index';
import { IndexApiClient } from 'src/db/index/api/IndexApiClient';
import { SeasonType, TEAM_CHOICES } from 'src/db/index/shared';
import { users } from 'src/db/users';
import { BaseEmbed } from 'src/lib/embed';
import { TeamInfo, findTeamByName } from 'src/lib/teams';

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
    const teamStats = await getTeamStats(teamInfo, season);

    // Extract necessary stats
    const {
      goalsPerGame,
      goalsAgainstPerGame,
      pimsRank,
      ppRank,
      pkRank,
      leaguePosition,
      conferencePosition,
      divisionPosition,
      detailedStats,
      regularSeasonPlayerStats,
    } = teamStats;

    const PP = 100 * (detailedStats.ppGoalsFor / detailedStats.ppOpportunities);
    const PK =
      (100 * (detailedStats.shOpportunities - detailedStats.ppGoalsAgainst)) /
      (detailedStats.shOpportunities <= 0 ? 1 : detailedStats.shOpportunities);

    const last10Games = await getLast10Games(teamInfo, season);

    await interaction.editReply({
      embeds: [
        BaseEmbed(interaction, {
          logoUrl: teamInfo.logoUrl,
          teamColor: teamStats.teamInfo.colors.primary,
        })
          .setTitle(`${teamInfo.fullName}`)
          .addFields(
            {
              name: 'Regular Season',
              value: `${teamStats.wins}-${teamStats.losses}-${teamStats.OTL}`,
              inline: true,
            },
            {
              name: 'Home',
              value: `${teamStats.home.wins}-${teamStats.home.losses}-${teamStats.home.OTL}`,
              inline: true,
            },
            {
              name: 'Away',
              value: `${teamStats.away.wins}-${teamStats.away.losses}-${teamStats.away.OTL}`,
              inline: true,
            },
            {
              name: 'Division',
              value: `#${divisionPosition}`,
              inline: true,
            },
            {
              name: 'Conference',
              value: `#${conferencePosition}`,
              inline: true,
            },
            {
              name: 'League',
              value: `#${leaguePosition}`,
              inline: true,
            },
            {
              name: 'GF',
              value: `${goalsPerGame.toFixed(2)} (#${teamStats.goalsForRank})`,
              inline: true,
            },
            {
              name: 'GA',
              value: `${goalsAgainstPerGame.toFixed(2)} (#${
                teamStats.goalsAgainstRank
              })`,
              inline: true,
            },
            {
              name: 'Shots',
              value: `${teamStats.shotsPerGame} (#${teamStats.shotsForRank})`,
              inline: true,
            },
            {
              name: 'SA',
              value: `${teamStats.shotsAgainstPerGame} (#${teamStats.shotsAgainstRank})`,
              inline: true,
            },
            {
              name: 'Diff',
              value: `${teamStats.shotDiff} (#${teamStats.shotDiffRank})`,
              inline: true,
            },
            {
              name: 'PIM',
              value: `${detailedStats.penaltyMinutesPerGame} (#${pimsRank})`,
              inline: true,
            },
            {
              name: 'PP',
              value: `${PP.toFixed(2)} (#${ppRank})`,
              inline: true,
            },
            {
              name: 'PK',
              value: `${PK.toFixed(2)} (#${pkRank})`,
              inline: true,
            },
            {
              name: 'Last 10 Games',
              value: last10Games.map((game) => game.result).join(' | '),
              inline: false, // This spans the entire row
            },
          ),
      ],
    });
  },
} satisfies SlashCommand;

const getLast10Games = async (teamInfo: TeamInfo, season?: number) => {
  const last10Results = (
    await IndexApiClient.get(teamInfo.leagueType).getSchedule(season)
  )
    .filter((game) => game.played === 1)
    .filter(
      (game) =>
        game.awayTeamInfo.name === teamInfo.fullName ||
        game.homeTeamInfo.name === teamInfo.fullName,
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10)
    .map((game) => {
      let result = '';
      if (game.overtime === 1 || game.shootout === 1) {
        result = 'OTL';
      } else if (
        (game.homeTeamInfo.name === teamInfo.fullName &&
          game.homeScore > game.awayScore) ||
        (game.awayTeamInfo.name === teamInfo.fullName &&
          game.awayScore > game.homeScore)
      ) {
        result = 'W';
      } else {
        result = 'L';
      }

      return {
        result: result,
      };
    });

  return last10Results;
};
