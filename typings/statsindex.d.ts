export type League = 'SHL' | 'SMJHL' | 'IIHF' | 'WJC';

export type AvailableSeason = {
  id: number;
  name: string;
  abbreviation: string;
  season: number;
};

export type LeagueConference = {
  id: number;
  league: number;
  name: string;
  season: number;
};

export type LeagueDivision = {
  id: number;
  league: number;
  conference: number;
  name: string;
  season: number;
  // possibly include teams here?
};

type Record = {
  wins: number;
  losses: number;
  OTL: number;
};

export type TeamStats = {
  id: number;
  name: string;
  gp: number;
  wins: number;
  losses: number;
  OTW: number;
  OTL: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  home: Record;
  away: Record;
  shootout: Record;
};

export type TeamInfo = {
  id: number;
  season: number;
  league: number;
  conference: number;
  division?: number;
  name: string;
  abbreviation: string;
  location: string;
  nameDetails: {
    first: string;
    second: string;
  };
  colors: {
    primary: string;
    secondary: string;
    text: string;
  };
};
