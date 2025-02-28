import { IndexApiClient } from 'src/db/index/api/IndexApiClient';
import { leagueTypeToString } from 'src/db/index/helpers/leagueToString';
import { LeagueType, SeasonType } from 'src/db/index/shared';
import { TeamInfo } from 'src/lib/teams';
import { GameInfo } from 'typings/statsindex';

import { botEmojis } from './config/config';

export const gameTypeToSeasonType = (gameType: string): SeasonType => {
  switch (gameType) {
    case 'Pre-Season':
      return SeasonType.PRE;
    case 'Regular Season':
      return SeasonType.REGULAR;
    case 'Playoffs':
      return SeasonType.POST;
    default:
      return SeasonType.REGULAR;
  }
};

export const leagueNametoType = (league: string): LeagueType => {
  switch (league) {
    case 'SHL':
      return LeagueType.SHL;
    case 'SMJHL':
      return LeagueType.SMJHL;
    case 'IIHF':
      return LeagueType.IIHF;
    case 'WJC':
      return LeagueType.WJC;
    default:
      return LeagueType.SHL;
  }
};

export const getGameResult = (game: GameInfo, teamInfo: TeamInfo): string => {
  if (
    (game.homeTeamInfo.id === teamInfo.teamID &&
      game.homeScore > game.awayScore) ||
    (game.awayTeamInfo.id === teamInfo.teamID &&
      game.awayScore > game.homeScore)
  ) {
    return botEmojis.win;
  }
  if (game.overtime === 1 || game.shootout === 1) {
    return botEmojis.otl;
  }
  return botEmojis.loss;
};

export const formatPastGame = (game: GameInfo, teamInfo: TeamInfo): string => {
  const league = leagueTypeToString(teamInfo.leagueType).toLowerCase();
  const result = getGameResult(game, teamInfo);
  return `[${result} ${game.awayTeamInfo.abbreviation} (${game.awayScore}) - ${game.homeTeamInfo.abbreviation} (${game.homeScore})](https://index.simulationhockey.com/${league}/${game.season}/game/${game.slug})`;
};

export const formatFutureGame = (game: GameInfo) => {
  return `${game.awayTeamInfo.abbreviation} @ ${game.homeTeamInfo.abbreviation}`;
};

export const getLast10Games = async (
  teamInfo: TeamInfo,
  season?: number,
  seasonType?: SeasonType,
) => {
  const last10Results = (
    await IndexApiClient.get(teamInfo.leagueType).getSchedule(season)
  )
    .filter((game) => game.played === 1)
    .filter((game) => {
      if (
        teamInfo.leagueType === LeagueType.IIHF ||
        teamInfo.leagueType === LeagueType.WJC
      ) {
        // Use location for IIHF or WJC league since it is Team <Location>
        return (
          game.awayTeamInfo.location === teamInfo.fullName ||
          game.homeTeamInfo.location === teamInfo.fullName
        );
      } else {
        return (
          game.awayTeamInfo.name === teamInfo.fullName ||
          game.homeTeamInfo.name === teamInfo.fullName
        );
      }
    })
    .filter(
      (game) =>
        gameTypeToSeasonType(game.type) === (seasonType ?? SeasonType.REGULAR),
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10)
    .reverse()
    .map((game) => ({
      result: getGameResult(game, teamInfo),
    }));

  return last10Results;
};
