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
] as const;

export const TEAM_CHOICES = [
  { name: 'Atlanta Inferno', value: 'ATL' },
  { name: 'Baltimore Platoon', value: 'BAP' },
  { name: 'Buffalo Stampede', value: 'BUF' },
  { name: 'Chicago Syndicate', value: 'CHI' },
  { name: 'Hamilton Steelhawks', value: 'HAM' },
  { name: 'Manhattan Rage', value: 'MAN' },
  { name: 'New England Wolfpack', value: 'NEW' },
  { name: 'Tampa Bay Barracuda', value: 'TBB' },
  { name: 'Toronto North Stars', value: 'TOR' },
  { name: 'Calgary Dragons', value: 'CGY' },
  { name: 'Edmonton Blizzard', value: 'EDM' },
  { name: 'Los Angeles Panthers', value: 'LAP' },
  { name: 'Minnesota Monarchs', value: 'MIN' },
  { name: 'New Orleans Specters', value: 'NOLA' },
  { name: 'San Francisco Pride', value: 'SFP' },
  { name: 'Seattle Argonauts', value: 'SEA' },
  { name: 'Texas Renegades', value: 'TEX' },
  { name: 'Winnipeg Aurora', value: 'WPG' },
  { name: 'Montreal Patriotes', value: 'MTL' },
  { name: 'Philadelphia Forge', value: 'PHI' },
  { name: 'Yukon Malamutes', value: 'YUM' },
  { name: 'Anchorage Armada', value: 'ANC' },
  { name: 'Carolina Kraken', value: 'CAR' },
  { name: 'Colorado Raptors', value: 'COL' },
  { name: 'Detroit Falcons', value: 'DET' },
  { name: 'Kelowna Knights', value: 'KEL' },
  { name: 'Maine Timber', value: 'MET' },
  { name: 'Nevada Battleborn', value: 'NBB' },
  { name: 'Newfoundland Berserkers', value: 'NFL' },
  { name: 'Quebec City Citadelles', value: 'QCC' },
  { name: 'St. Louis Scarecrows', value: 'STL' },
  { name: 'Vancouver Whalers', value: 'VAN' },
  { name: 'Regina Elk', value: 'REG' },
  { name: 'Great Falls Grizzlies', value: 'GFG' },
  { name: 'San Diego Tidal', value: 'SDT' },
  { name: 'Ottawa Highlanders', value: 'OTT' },
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
