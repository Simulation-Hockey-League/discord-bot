import { CacheType, ChatInputCommandInteraction } from 'discord.js';
import { getTeamStats } from 'src/db/index';
import { IndexApiClient } from 'src/db/index/api/IndexApiClient';

import { SeasonType } from 'src/db/index/shared';

import { PortalClient } from 'src/db/portal/PortalClient';
import { IndexTeamInfo } from 'typings/statsindex';

import { BaseEmbed } from './embed';
import {
  formatFutureGame,
  formatPastGame,
  gameTypeToSeasonType,
  getLast10Games,
  leagueNametoType,
} from './helpers/teamHelpers';
import { TeamInfo } from './teams';

export async function createScheduleEmbed(
  interaction: ChatInputCommandInteraction<CacheType>,
  teamData: IndexTeamInfo,
  teamInfo: TeamInfo,
  seasonType?: SeasonType,
  season?: number,
) {
  if (season && season <= 52) {
    await interaction.editReply({
      content: 'Cannot fetch schedule for seasons before Season 53.',
    });
    return;
  }

  const fullSchedule = await IndexApiClient.get(
    teamInfo.leagueType,
  ).getSchedule(season);
  const pastGames = fullSchedule
    .filter((game) => game.played === 1)
    .filter(
      (game) =>
        gameTypeToSeasonType(game.type) === (seasonType ?? SeasonType.REGULAR),
    )
    .filter(
      (game) =>
        game.awayTeamInfo.name === teamInfo.fullName ||
        game.homeTeamInfo.name === teamInfo.fullName,
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 7)
    .reverse();

  const futureGames = fullSchedule
    .filter((game) => game.played === 0)
    .filter(
      (game) =>
        gameTypeToSeasonType(game.type) === (seasonType ?? SeasonType.REGULAR),
    )
    .filter(
      (game) =>
        game.awayTeamInfo.name === teamInfo.fullName ||
        game.homeTeamInfo.name === teamInfo.fullName,
    )
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  const pastGamesText =
    pastGames.length > 0
      ? pastGames.map((game) => formatPastGame(game, teamInfo)).join('\n')
      : 'No past games found.';
  const futureGamesText =
    futureGames.length > 0
      ? futureGames.map(formatFutureGame).join('\n')
      : 'No upcoming games found.';

  const scheduleEmbed = BaseEmbed(interaction, {
    logoUrl: teamInfo.logoUrl,
    teamColor: teamData.colors.primary,
  })
    .setTitle(`${teamInfo.fullName} Schedule S${season}`)
    .addFields(
      {
        name: 'Last 7 Games',
        value: pastGamesText,
        inline: false,
      },
      {
        name: 'Next 5 Games',
        value: futureGamesText,
        inline: false,
      },
    );

  return scheduleEmbed;
}

export async function createLeadersEmbed(
  interaction: ChatInputCommandInteraction<CacheType>,
  teamData: IndexTeamInfo,
  teamInfo: TeamInfo,
  season?: number,
  seasonType?: SeasonType,
) {
  const players = await getTeamStats(
    teamInfo,
    seasonType ?? SeasonType.REGULAR,
    season,
  );

  const { regularSeasonPlayerStats } = players;

  const getTopThree = <K extends keyof (typeof regularSeasonPlayerStats)[0]>(
    stat: K,
  ) => {
    return [...regularSeasonPlayerStats]
      .sort((a, b) => Number(b[stat]) - Number(a[stat]))
      .slice(0, 3)
      .map((player) => `${player.name} (${player[stat]})`);
  };

  const topGoals = getTopThree('goals');
  const topAssists = getTopThree('assists');
  const topPoints = getTopThree('points');
  const topHits = getTopThree('hits');
  const topShotsBlocked = getTopThree('shotsBlocked');
  const topShotsOnGoal = getTopThree('shotsOnGoal');
  const topPlusMinus = [...regularSeasonPlayerStats]
    .sort((a, b) => a.plusMinus - b.plusMinus)
    .reverse()
    .slice(0, 3)
    .map(
      (player) =>
        `${player.name} (${player.plusMinus > 0 ? '+' : ''}${
          player.plusMinus
        })`,
    );

  const topTakeaways = getTopThree('takeaways');
  const topFightsWon = [...regularSeasonPlayerStats]
    .filter((player) => player.fights > 0)
    .sort((a, b) => b.fightWins - a.fightWins)
    .slice(0, 3)
    .map((player) => `${player.name} (${player.fightWins})`);

  const formatOutput = (leaders: string[]) => {
    if (leaders.length === 0) return 'None';
    return leaders.map((player, index) => `${index + 1}. ${player}`).join('\n');
  };

  const leadersEmbed = BaseEmbed(interaction, {
    logoUrl: teamInfo.logoUrl,
    teamColor: teamData.colors.primary,
  })
    .setTitle(`${teamInfo.fullName} Team Leaders S${season}`)
    .addFields(
      {
        name: 'Goals',
        value: formatOutput(topGoals),
        inline: true,
      },
      {
        name: 'Assists',
        value: formatOutput(topAssists),
        inline: true,
      },
      {
        name: 'Points',
        value: formatOutput(topPoints),
        inline: true,
      },
      {
        name: 'Hits',
        value: formatOutput(topHits),
        inline: true,
      },
      {
        name: 'Blocks',
        value: formatOutput(topShotsBlocked),
        inline: true,
      },
      {
        name: 'Shots',
        value: formatOutput(topShotsOnGoal),
        inline: true,
      },
      {
        name: 'Plus/Minus',
        value: formatOutput(topPlusMinus),
        inline: true,
      },
      {
        name: 'Takeaways',
        value: formatOutput(topTakeaways),
        inline: true,
      },
      {
        name: 'Fights Won',
        value: formatOutput(topFightsWon),
        inline: true,
      },
    );

  return leadersEmbed;
}

export async function createRosterEmbed(
  interaction: ChatInputCommandInteraction<CacheType>,
  teamData: IndexTeamInfo,
  teamInfo: TeamInfo,
) {
  const players = await PortalClient.getActivePlayers();
  const rosterPlayers = players
    .filter(
      (player) =>
        player.currentTeamID === teamData.id &&
        player.currentLeague &&
        leagueNametoType(player.currentLeague) === teamInfo.leagueType,
    )
    .sort((a, b) => b.totalTPE - a.totalTPE);

  const prospects = players
    .filter(
      (player) =>
        player.shlRightsTeamID === teamData.id &&
        player.currentLeague &&
        player.currentLeague === 'SMJHL',
    )
    .sort((a, b) => b.totalTPE - a.totalTPE);

  const averageTPE =
    rosterPlayers.reduce((acc, player) => acc + player.totalTPE, 0) /
    rosterPlayers.length;
  const averageForwards =
    rosterPlayers
      .filter(
        (player) =>
          player.position === 'Center' ||
          player.position === 'Left Wing' ||
          player.position === 'Right Wing',
      )
      .reduce((acc, player) => acc + player.totalTPE, 0) /
    rosterPlayers.filter(
      (player) =>
        player.position === 'Center' ||
        player.position === 'Left Wing' ||
        player.position === 'Right Wing',
    ).length;
  const averageDefense =
    rosterPlayers
      .filter(
        (player) =>
          player.position === 'Left Defense' ||
          player.position === 'Right Defense',
      )
      .reduce((acc, player) => acc + player.totalTPE, 0) /
    rosterPlayers.filter(
      (player) =>
        player.position === 'Left Defense' ||
        player.position === 'Right Defense',
    ).length;

  const goalies = rosterPlayers
    .filter((player) => player.position === 'Goalie')
    .sort((a, b) => b.totalTPE - a.totalTPE);

  const rosterEmbed = BaseEmbed(interaction, {
    logoUrl: teamInfo.logoUrl,
    teamColor: teamData.colors.primary,
  })
    .setTitle(`${teamInfo.fullName} Roster`)
    .addFields({
      name: 'Players',
      value: rosterPlayers
        .map(
          (player) =>
            `[S${player.draftSeason}] ${player.position} - ${player.name} (${player.totalTPE})`,
        )
        .join('\n'),
      inline: false,
    })
    .addFields({
      name: 'Average TPE',
      value: `${averageTPE.toFixed(2)}`,
      inline: true,
    })
    .addFields({
      name: 'Forwards',
      value: `${averageForwards.toFixed(2)}`,
      inline: true,
    })
    .addFields({
      name: 'Defense',
      value: `${averageDefense.toFixed(2)}`,
      inline: true,
    })
    .addFields({
      name: 'Starting Goalie',
      value: `${goalies[0].totalTPE || 0}`,
      inline: false,
    })
    .addFields({
      name: 'Backup Goalie',
      value: `${goalies[1].totalTPE || 0}`,
      inline: true,
    });
  if (teamInfo.leagueType === 0) {
    rosterEmbed.addFields({
      name: 'Prospects',
      value: prospects
        .map(
          (player) =>
            `[S${player.draftSeason}] ${player.position} - ${player.name} (${player.totalTPE})`,
        )
        .join('\n'),
      inline: false,
    });
  }

  return rosterEmbed;
}

export async function createStatsEmbed(
  interaction: ChatInputCommandInteraction<CacheType>,
  teamInfo: TeamInfo,
  season?: number,
  seasonType?: SeasonType,
) {
  const teamStats = await getTeamStats(teamInfo, seasonType, season);
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
    pdo,
    corsi,
    pdoRank,
    corsiRank,
  } = teamStats;
  const PP = 100 * (detailedStats.ppGoalsFor / detailedStats.ppOpportunities);
  const PK =
    (100 * (detailedStats.shOpportunities - detailedStats.ppGoalsAgainst)) /
    (detailedStats.shOpportunities <= 0 ? 1 : detailedStats.shOpportunities);

  const last10Games = await getLast10Games(teamInfo, season, seasonType);
  let embed = BaseEmbed(interaction, {
    logoUrl: teamInfo.logoUrl,
    teamColor: teamStats.teamInfo.colors.primary,
  })
    .setTitle(`${teamInfo.fullName} S${season}`)
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
    );
  // Additional stats for FHM8 & 10 Era
  if (season && season > 65) {
    embed = embed.addFields(
      {
        name: 'SF',
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
        name: 'PDO',
        value: `${pdo} (#${pdoRank})`,
        inline: true,
      },
      {
        name: 'Corsi',
        value: `${corsi} (#${corsiRank})`,
        inline: true,
      },
    );
  }
  return embed.addFields({
    name: 'Last 10 Games',
    value: last10Games.map((game: { result: string }) => game.result).join(''),
    inline: false,
  });
}
