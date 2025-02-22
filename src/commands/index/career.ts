import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { getPlayerStats } from 'src/db/index';
import { IndexApiClient } from 'src/db/index/api/IndexApiClient';
import { LeagueType, SeasonType } from 'src/db/index/shared';
import { PortalClient } from 'src/db/portal/PortalClient';
import { users } from 'src/db/users';
import { BaseEmbed } from 'src/lib/embed';
import { SlashCommand } from 'typings/command';
import { GoalieStats, PlayerStats } from 'typings/statsindex';

export default {
  command: new SlashCommandBuilder()
    .setName('career')
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
        .setDescription('The season type (i.e. regular, playoffs, etc.)')
        .setChoices(
          { name: 'Regular', value: SeasonType.REGULAR },
          { name: 'Playoffs', value: SeasonType.POST },
        )
        .setRequired(false),
    )
    .setDescription('Get player career statistics.'),
  execute: async (interaction) => {
    const league = interaction.options.getNumber('league') as
      | LeagueType
      | undefined;
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

    try {
      let playerID;
      let position;

      if (currentUserInfo?.portalID && !targetName) {
        const player = await PortalClient.getPlayer(currentUserInfo.portalID);
        if (player) {
          position = player.position;
          const leagueID = league ?? LeagueType.SHL;
          const indexRecord = player.indexRecords?.find(
            (record) => record.leagueID === leagueID,
          );

          if (indexRecord) {
            playerID = indexRecord.indexID;
          }
        }
      }
      if (!playerID) {
        const getPlayer = await getPlayerStats(name, seasonType, league);
        if (!getPlayer) {
          await interaction.editReply({
            content: `Could not find ${name}.`,
          });
          return;
        }
        playerID = getPlayer.id;
        position = getPlayer.position;
      }

      const isGoalie = position === 'G' || position === 'Goalie';
      const careerStats = await IndexApiClient.get(league).getCareerStats(
        playerID,
        seasonType,
        isGoalie,
      );

      if (isGoalie) {
        await displayGoalieCareer(
          interaction,
          careerStats as GoalieStats[],
          seasonType ?? SeasonType.REGULAR,
        );
      } else {
        await displaySkaterCareer(
          interaction,
          careerStats as PlayerStats[],
          seasonType ?? SeasonType.REGULAR,
        );
      }

      await interaction.editReply({});
    } catch (error) {
      await interaction.editReply({
        content: 'An error occurred while fetching career statistics.',
      });
    }
  },
} satisfies SlashCommand;

const displaySkaterCareer = async (
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

const displayGoalieCareer = async (
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
