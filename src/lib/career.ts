import { ChatInputCommandInteraction } from 'discord.js';

import { SeasonType } from 'src/db/index/shared';
import { PortalClient } from 'src/db/portal/PortalClient';
import { GoalieStats, PlayerStats } from 'typings/statsindex';

import { BaseEmbed } from './embed';

export const displaySkaterCareer = async (
  interaction: ChatInputCommandInteraction,
  careerStats: PlayerStats[],
  seasonType: SeasonType,
) => {
  const sortedStats = [...careerStats].sort((a, b) => b.season - a.season);
  const totals = {
    gamesPlayed: sortedStats.reduce((sum, stat) => sum + stat.gamesPlayed, 0),
    goals: sortedStats.reduce((sum, stat) => sum + stat.goals, 0),
    assists: sortedStats.reduce((sum, stat) => sum + stat.assists, 0),
    points: sortedStats.reduce((sum, stat) => sum + stat.points, 0),
    plusMinus: sortedStats.reduce((sum, stat) => sum + stat.plusMinus, 0),
    pim: sortedStats.reduce((sum, stat) => sum + stat.pim, 0),
    shotsOnGoal: sortedStats.reduce((sum, stat) => sum + stat.shotsOnGoal, 0),
  };
  const shotPercentage = ((totals.goals / totals.shotsOnGoal) * 100).toFixed(1);

  const seasonFields = sortedStats.map((season) => ({
    name: `Season ${season.season}`,
    value: `Team: ${season.team} | GP: ${season.gamesPlayed} | G: ${
      season.goals
    } | A: ${season.assists} | P: ${season.points} | +/-: ${
      season.plusMinus
    } | PIM: ${season.pim} | S%: ${(
      (season.goals / season.shotsOnGoal) *
      100
    ).toFixed(1)}%`,
    inline: false,
  }));

  seasonFields.push({
    name: '\u200b',
    value: '**Career Totals**',
    inline: false,
  });

  seasonFields.push({
    name: 'Career Statistics',
    value: `GP: ${totals.gamesPlayed} | G: ${totals.goals} | A: ${totals.assists} | P: ${totals.points} | +/-: ${totals.plusMinus} | PIM: ${totals.pim} | S%: ${shotPercentage}%`,
    inline: false,
  });

  const embed = BaseEmbed(interaction, {})
    .setTitle(`${sortedStats[0].name} - Career Statistics`)
    .addFields(seasonFields)
    .setFooter({
      text: `${
        seasonType === SeasonType.POST ? 'Playoff' : 'Regular Season'
      } Statistics`,
    });

  await interaction.editReply({ embeds: [embed] });
};

export const displayGoalieCareer = async (
  interaction: ChatInputCommandInteraction,
  careerStats: GoalieStats[],
  seasonType: SeasonType,
) => {
  const sortedStats = [...careerStats].sort((a, b) => b.season - a.season);
  const totals = {
    gamesPlayed: sortedStats.reduce((sum, stat) => sum + stat.gamesPlayed, 0),
    wins: sortedStats.reduce((sum, stat) => sum + stat.wins, 0),
    losses: sortedStats.reduce((sum, stat) => sum + stat.losses, 0),
    ot: sortedStats.reduce((sum, stat) => sum + stat.ot, 0),
    saves: sortedStats.reduce((sum, stat) => sum + stat.saves, 0),
    shotsAgainst: sortedStats.reduce((sum, stat) => sum + stat.shotsAgainst, 0),
    goalsAgainst: sortedStats.reduce((sum, stat) => sum + stat.goalsAgainst, 0),
    shutouts: sortedStats.reduce((sum, stat) => sum + stat.shutouts, 0),
  };

  const careerSavePercentage = (
    (totals.saves / totals.shotsAgainst) *
    100
  ).toFixed(2);
  const seasonFields = sortedStats.map((season) => ({
    name: `Season ${season.season}`,
    value: `Team: ${season.team} | GP: ${season.gamesPlayed} | W: ${
      season.wins
    } | L: ${season.losses} | OT: ${season.ot} | SV%: ${(
      (season.saves / season.shotsAgainst) *
      100
    ).toFixed(2)}% | SO: ${season.shutouts}`,
    inline: false,
  }));

  seasonFields.push({
    name: '\u200b',
    value: '**Career Totals**',
    inline: false,
  });

  seasonFields.push({
    name: 'Career Statistics',
    value: `GP: ${totals.gamesPlayed} | W: ${totals.wins} | L: ${totals.losses} | OT: ${totals.ot} | SV%: ${careerSavePercentage}% | SO: ${totals.shutouts}`,
    inline: false,
  });

  const embed = BaseEmbed(interaction, {})
    .setTitle(`${sortedStats[0].name} - Career Statistics`)
    .addFields(seasonFields)
    .setFooter({
      text: `${
        seasonType === SeasonType.POST ? 'Playoff' : 'Regular Season'
      } Statistics`,
    });

  await interaction.editReply({ embeds: [embed] });
};

export const displayPlayerAwards = async (
  interaction: ChatInputCommandInteraction,
  careerStats: PlayerStats[],
  season?: number,
) => {
  try {
    if (!careerStats || careerStats.length === 0) {
      await interaction.editReply({
        content: 'No player stats found, so awards cannot be retrieved.',
      });
      return;
    }

    const playerID = String(careerStats[0].id);
    const leagueID = String(careerStats[0].league);

    const getAwards = await PortalClient.getPlayerAwards(
      playerID,
      leagueID,
      season ? String(season) : undefined,
    );

    const sortedAwards = [...getAwards].sort(
      (a, b) => Number(b.seasonID) - Number(a.seasonID),
    );

    const wonAwards: string[] = [];
    const nominatedAwards: string[] = [];
    const allStarsAndCups: string[] = [];

    for (const award of sortedAwards) {
      const awardText = `[S${award.seasonID}] ${award.achievementName}`;

      if (award.isAward) {
        if (award.won) {
          wonAwards.push(awardText);
        } else {
          nominatedAwards.push(awardText);
        }
      } else {
        allStarsAndCups.push(awardText);
      }
    }

    const MAX_FIELD_LENGTH = 1024;
    const trimText = (text: string) =>
      text.length > MAX_FIELD_LENGTH
        ? text.substring(0, MAX_FIELD_LENGTH - 3) + '...'
        : text;

    const awardsEmbed = BaseEmbed(interaction, {}).setTitle('Awards');

    if (wonAwards.length > 0) {
      awardsEmbed.addFields({
        name: 'Awards Won',
        value: trimText(wonAwards.join('\n')) || 'None',
        inline: false,
      });
    }

    if (nominatedAwards.length > 0) {
      awardsEmbed.addFields({
        name: 'Awards Nommed',
        value: trimText(nominatedAwards.join('\n')) || 'None',
        inline: false,
      });
    }

    if (allStarsAndCups.length > 0) {
      awardsEmbed.addFields({
        name: 'All-Stars / Cups',
        value: trimText(allStarsAndCups.join('\n')) || 'None',
        inline: false,
      });
    }

    await interaction.editReply({ embeds: [awardsEmbed] });
  } catch (error) {
    await interaction.editReply({
      content: `An error occurred while fetching awards: ${
        error instanceof Error ? error.message : 'unknown error'
      }.`,
    });
  }
};
