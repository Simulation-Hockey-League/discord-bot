export type League = 'SHL' | 'SMJHL' | 'IIHF' | 'WJC';

enum SeasonType {
  PRE = 'ps',
  REGULAR = 'rs',
  POST = 'po',
}

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

export type DetailedTeamStats = {
  id: number;
  season: number;
  league: number;
  conference: number;
  division: number;
  name: string;
  abbreviation: string;
  gamesPlayed: number;
  goalsFor: number;
  goalsAgainst: number;
  shotsFor: number;
  shotsAgainst: number;
  faceoffPct: number;
  shotsBlocked: number;
  hits: number;
  takeaways: number;
  giveaways: number;
  penaltyMinutesPerGame: number;
  ppOpportunities: number;
  ppGoalsFor: number;
  ppGoalsAgainst: number;
  shOpportunities: number;
  shGoalsFor: number;
  shGoalsAgainst: number;
};

export type PlayerStats = {
  id: number;
  sthsId?: number;
  name: string;
  position: string;
  team: string;
  teamId: number;
  gamesPlayed: number;
  league: number;
  season: number;
  timeOnIce: number;
  goals: number;
  assists: number;
  points: number;
  plusMinus: number;
  pim: number;
  ppGoals: number;
  ppAssists: number;
  ppPoints: number;
  ppTimeOnIce: number;
  shGoals: number;
  shAssists: number;
  shPoints: number;
  shTimeOnIce: number;
  fights: number;
  fightWins: number;
  fightLosses: number;
  hits: number;
  giveaways: number;
  takeaways: number;
  shotsOnGoal: number;
  shotsBlocked: number;
  gameRating: number;
  offensiveGameRating: number;
  defensiveGameRating: number;
  faceoffs?: number;
  faceoffWins?: number;
  gwg: number;
  advancedStats: {
    PDO: number;
    GF60: number;
    GA60: number;
    SF60: number;
    SA60: number;
    CF: number;
    CA: number;
    CFPct: number;
    CFPctRel: number;
    FF: number;
    FA: number;
    FFPct: number;
    FFPctRel: number;
  };
  seasonType: SeasonType;
};

export type GoalieStats = {
  id: number;
  sthsId?: number;
  name: string;
  league: number;
  season: number;
  team: string;
  teamId: number;
  gamesPlayed: number;
  minutes: number;
  wins: number;
  losses: number;
  ot: number;
  shotsAgainst: number;
  saves: number;
  goalsAgainst: number;
  gaa: number;
  shutouts: number;
  savePct: number;
  gameRating: number;
  seasonType: SeasonType;
};

export type GameInfo = {
  season: number;
  league: number;
  date: string;
  homeTeam: number;
  homeScore: number;
  awayTeam: number;
  awayScore: number;
  type: 'Pre-Season' | 'Regular Season' | 'Playoffs';
  played: number;
  overtime: number;
  shootout: number;
  slug: string;
  gameid: number | null;
  seasonType: SeasonType;
  awayTeamInfo: TeamInfo;
  homeTeamInfo: TeamInfo;
};

type PlayoffSeriesTeam = {
  id: number;
  wins: number;
  name: string;
  nickname: string;
  abbr: string;
  teamInfo: TeamInfo;
};

export type PlayoffSeries = {
  league: number;
  season: number;
  team1: PlayoffSeriesTeam;
  team2: PlayoffSeriesTeam;
};
