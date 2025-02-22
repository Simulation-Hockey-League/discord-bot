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
