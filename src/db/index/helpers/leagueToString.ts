import { LeagueType } from '../shared';

export const leagueTypeToString = (league: LeagueType): string => {
  switch (league) {
    case LeagueType.SHL:
      return 'SHL';
    case LeagueType.SMJHL:
      return 'SMJHL';
    case LeagueType.IIHF:
      return 'IIHF';
    case LeagueType.WJC:
      return 'WJC';
    default:
      throw new Error(`Unknown league type: ${league}`);
  }
};

export const leagueNumberToType = (league: number): LeagueType => {
  switch (league) {
    case 0:
      return LeagueType.SHL;
    case 1:
      return LeagueType.SMJHL;
    case 2:
      return LeagueType.IIHF;
    case 3:
      return LeagueType.WJC;
    default:
      throw new Error(`Unknown league type: ${league}`);
  }
};
