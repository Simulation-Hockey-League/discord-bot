export type GlobalCSVData = {
  username: string;
  group: number;
};

export type PlayersCSVData = {
  username: string;
  player: string;
};

export type FantasyInfo = {
  playerID: number;
  leagueID: number;
  name: string;
  position: string;
  fantasyPoints: number;
};

export type SwapsCSVData = {
  username: string;
  'Old (Skater)': string;
  'New (Skater)': string;
  'Old (Goalie)': string;
  'New (Goalie)': string;
  OSA: string;
  NSA: string;
  OSC: string;
  NSC: string;
  Difference: string;
};

export type Fantasy_Groups_DB = {
  username: string;
  group_number: number;
  player: string;
  position: string;
  fantasyPoints: number;
  new_player: string | null;
  OSA: number | null;
  NSA: number | null;
  OSC: number | null;
  NSC: number | null;
  Difference: number | null;
};

export type Global_DB = {
  username: string;
  group_number: number;
  score: number;
  rank: number;
};
export type playersRecords = {
  player: string;
  score: number;
};

export type swapsRecords = {
  username: string;
  oldSkater: string;
  newSkater: string;
  oldGoalie: string;
  newGoalie: string;
  osa: number;
  nsa: number;
  osc: number;
  nsc: number;
  difference: number;
};
