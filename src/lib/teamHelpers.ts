import { IndexApiClient } from 'src/db/index/api/IndexApiClient';
import { LeagueType, SeasonType } from 'src/db/index/shared';
import { TeamInfo } from 'src/lib/teams';
import { GameInfo } from 'typings/statsindex';

const resultEmojis = {
  win: '<:Win:1343076655765389342>',
  loss: '<:Loss:1343076631128051772>',
  otl: '<:OTL:1343076600853299312>',
};

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

export const formatPastGame = (game: GameInfo, teamInfo: TeamInfo): string => {
  let result = '';
  if (
    (game.homeTeamInfo.name === teamInfo.fullName &&
      game.homeScore > game.awayScore) ||
    (game.awayTeamInfo.name === teamInfo.fullName &&
      game.awayScore > game.homeScore)
  ) {
    result = resultEmojis.win;
  } else {
    if (game.overtime === 1 || game.shootout === 1) {
      result = resultEmojis.otl;
    } else {
      result = resultEmojis.loss;
    }
  }
  return `[${result} ${game.awayTeamInfo.abbreviation} (${game.awayScore}) - ${game.homeTeamInfo.abbreviation} (${game.homeScore})](https://index.simulationhockey.com/shl/81/game/${game.slug})`;
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
    .filter(
      (game) =>
        game.awayTeamInfo.name === teamInfo.fullName ||
        game.homeTeamInfo.name === teamInfo.fullName,
    )
    .filter(
      (game) =>
        gameTypeToSeasonType(game.type) === (seasonType ?? SeasonType.REGULAR),
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10)
    .map((game) => {
      let result = '';
      if (game.overtime === 1 || game.shootout === 1) {
        result = resultEmojis.otl;
      } else if (
        (game.homeTeamInfo.name === teamInfo.fullName &&
          game.homeScore > game.awayScore) ||
        (game.awayTeamInfo.name === teamInfo.fullName &&
          game.awayScore > game.homeScore)
      ) {
        result = resultEmojis.win;
      } else {
        result = resultEmojis.loss;
      }

      return {
        result: result,
      };
    });

  return last10Results;
};
