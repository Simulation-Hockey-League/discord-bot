export enum LeagueType {
  SHL = 0,
  SMJHL = 1,
  IIHF = 2,
  WJC = 3,
}

export const leagueStringToLeagueType = (
  league: string | null | undefined,
): LeagueType => {
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
