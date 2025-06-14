import { SlashCommandBuilder } from 'discord.js';
import { getDetailedStats } from 'src/db/index';
import { LeagueType } from 'src/db/index/shared';
import { DynamicConfig } from 'src/utils/config/dynamicConfig';
import { logUnhandledCommandError } from 'src/utils/logUnhandledError';
import { createTeamStatsSelector } from 'src/utils/menus/menuHelper';
import { SlashCommand } from 'typings/command';
import { DetailedTeamStats } from 'typings/statsindex';

const teamCategories = {
  goalsPerGame: 'Goals For per Game',
  goalsAgainstPerGame: 'Goals Against per Game',
  shotsPerGame: 'Shots For per Game',
  shotsAgainstPerGame: 'Shots Against per Game',
  faceoffPct: 'Faceoff Percentage',
  shotsBlocked: 'Shots Blocked',
  hits: 'Hits',
  takeaways: 'Takeaways',
  giveaways: 'Giveaways',
  penaltyMinutesPerGame: 'Penalty Minutes per Game',
  ppPct: 'Power Play %',
  pkPct: 'Penalty Kill %',
  pdo: 'PDO',
  corsi: 'Corsi',
};

const getSortingOrder = (category: string, a: number, b: number) => {
  return category === 'goalsAgainstPerGame' ||
    category === 'shotsAgainstPerGame'
    ? a - b // Sort low to high
    : b - a; // Sort high to low
};

export default {
  command: new SlashCommandBuilder()
    .setName('team-rank')
    .setDescription('Retrieve team rankings')
    .addNumberOption((option) =>
      option
        .setName('league')
        .setDescription('Which League to get team rankings')
        .addChoices(
          { name: 'SHL', value: LeagueType.SHL },
          { name: 'SMJHL', value: LeagueType.SMJHL },
        )
        .setRequired(true),
    )
    .addNumberOption((option) =>
      option
        .setName('season')
        .setDescription(
          'The season to search for. Only S66 and above. Defaults to current season',
        )
        .setRequired(false),
    ),

  execute: async (interaction) => {
    await interaction.deferReply();
    const targetLeague = interaction.options.getNumber('league') as LeagueType;
    const currentSeason = DynamicConfig.currentSeason.get();
    const targetSeason =
      interaction.options.getNumber('season') ?? currentSeason;

    if (targetSeason < 66) {
      await interaction.editReply({
        content: 'Only S66 and above is supported',
      });
      return;
    }

    try {
      const allDetailedStats = await getDetailedStats(
        targetLeague,
        targetSeason,
      );

      const computeStats = (team: DetailedTeamStats) => ({
        goalsPerGame: (team.goalsFor / team.gamesPlayed).toFixed(2),
        goalsAgainstPerGame: (team.goalsAgainst / team.gamesPlayed).toFixed(2),
        shotsPerGame: (team.shotsFor / team.gamesPlayed).toFixed(2),
        shotsAgainstPerGame: (team.shotsAgainst / team.gamesPlayed).toFixed(2),
        faceoffPct: team.faceoffPct,
        shotsBlocked: team.shotsBlocked,
        hits: team.hits,
        takeaways: team.takeaways,
        giveaways: team.giveaways,
        penaltyMinutesPerGame: team.penaltyMinutesPerGame,
        ppPct: (
          (team.ppOpportunities ? team.ppGoalsFor / team.ppOpportunities : 0) *
          100
        ).toFixed(2),
        pkPct: (
          (team.shOpportunities
            ? (team.shOpportunities - team.ppGoalsAgainst) /
              team.shOpportunities
            : 0) * 100
        ).toFixed(2),
        pdo: (
          (team.shotsFor
            ? team.goalsFor / team.shotsFor +
              (1 - team.goalsAgainst / team.shotsAgainst)
            : 0) * 100
        ).toFixed(3),
        corsi: (
          (team.shotsFor + team.shotsAgainst
            ? team.shotsFor / (team.shotsFor + team.shotsAgainst)
            : 0) * 100
        ).toFixed(3),
      });

      const rankedTeams = allDetailedStats.map((team) => ({
        ...team,
        stats: computeStats(team),
      }));

      await createTeamStatsSelector(
        interaction,
        rankedTeams,
        teamCategories,
        'goalsPerGame',
        `Team Rankings - S${targetSeason}`,
        getSortingOrder,
      );
    } catch (error) {
      logUnhandledCommandError(interaction, error);
      await interaction.editReply({
        content: 'An error occurred while retrieving rankings.',
      });
    }
  },
} satisfies SlashCommand;
