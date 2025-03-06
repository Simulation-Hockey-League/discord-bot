export enum LeagueType {
  SHL = 0,
  SMJHL = 1,
  IIHF = 2,
  WJC = 3,
}

export enum SeasonType {
  PRE = 'ps',
  REGULAR = 'rs',
  POST = 'po',
}

export enum PositionFilter {
  F = 'F',
  D = 'D',
  G = 'G',
}

export const GOALIE_LEADER_CATEGORIES = [
  'gamesPlayed',
  'wins',
  'losses',
  'ot',
  'shotsAgainst',
  'saves',
  'goalsAgainst',
  'shutouts',
  'savePct',
  'GSAA',
] as const;

export type GoalieCategories = (typeof GOALIE_LEADER_CATEGORIES)[number];

const SKATER_CATEGORIES = [
  'goals',
  'assists',
  'points',
  'plusMinus',
  'pim',
  'shotsOnGoal',
  'gwg',
  'faceoffs',
  'faceoffWins',
  'giveaways',
  'takeaways',
  'shotsBlocked',
  'hits',
  'fights',
  'fightWins',
  'fightLosses',
] as const;

export const SkaterCategories = {
  goals: 'goals',
  assists: 'assists',
  points: 'points',
  plusMinus: 'plusMinus',
  pim: 'pim',
  shotsOnGoal: 'shotsOnGoal',
  gwg: 'gwg',
  faceoffs: 'faceoffs',
  faceoffWins: 'faceoffWins',
  giveaways: 'giveaways',
  takeaways: 'takeaways',
  shotsBlocked: 'shotsBlocked',
  hits: 'hits',
  fights: 'fights',
  fightWins: 'fightWins',
  fightLosses: 'fightLosses',
};

export type SkaterCategory = (typeof SKATER_CATEGORIES)[number];

export const toLeagueType = (league: string | null | undefined): LeagueType => {
  switch (league?.toUpperCase()) {
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

export const seasonTypeToApiName = (seasonType: SeasonType): string => {
  switch (seasonType) {
    case SeasonType.PRE:
      return 'preseason';
    case SeasonType.REGULAR:
      return 'regular';
    case SeasonType.POST:
      return 'playoffs';
  }
};

export const seasonTypeToLongName = (seasonType: SeasonType): string => {
  switch (seasonType) {
    case SeasonType.PRE:
      return 'Pre-Season';
    case SeasonType.REGULAR:
      return 'Regular Season';
    case SeasonType.POST:
      return 'Playoffs';
  }
};
