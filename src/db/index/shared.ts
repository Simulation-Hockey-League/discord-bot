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
