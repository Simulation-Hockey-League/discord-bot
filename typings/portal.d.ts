export type PortalSkaterAttributes = {
  screening: number;
  gettingOpen: number;
  passing: number;
  puckhandling: number;
  shootingAccuracy: number;
  shootingRange: number;
  offensiveRead: number;
  checking: number;
  hitting: number;
  positioning: number;
  stickchecking: number;
  shotBlocking: number;
  faceoffs: number;
  defensiveRead: number;
  acceleration: number;
  agility: number;
  balance: number;
  speed: number;
  strength: number;
  stamina: number;
  fighting: number;
  aggression: number;
  bravery: number;
  determination: number;
  teamPlayer: number;
  leadership: number;
  temperament: number;
  professionalism: number;
};

export type PortalGoalieAttributes = {
  blocker: number;
  glove: number;
  passing: number;
  pokeCheck: number;
  positioning: number;
  rebound: number;
  recovery: number;
  puckhandling: number;
  lowShots: number;
  reflexes: number;
  skating: number;
  aggression: number;
  mentalToughness: number;
  determination: number;
  teamPlayer: number;
  leadership: number;
  goaltenderStamina: number;
  professionalism: number;
};

export type IndexPlayerID = {
  playerUpdateID: number;
  leagueID: number;
  indexID: number;
  startSeason: number;
};

export type PortalPlayer = {
  uid: number;
  username: string;
  pid: number;
  creationDate: string;
  retirementDate: string | null;
  status: 'active' | 'pending' | 'retired' | 'denied';
  name: string;
  position:
    | 'Center'
    | 'Left Wing'
    | 'Right Wing'
    | 'Goalie'
    | 'Left Defense'
    | 'Right Defense';
  handedness: 'Left' | 'Right';
  recruiter: string | null;
  render: string | null;
  jerseyNumber: number | null;
  height: string | null;
  weight: number | null;
  birthplace: string | null;
  totalTPE: number;
  currentLeague: 'SMJHL' | 'SHL' | null;
  currentTeamID: number | null;
  shlRightsTeamID: number | null;
  iihfNation: string | null;
  draftSeason: number | null;
  bankedTPE: number;
  appliedTPE: number;
  positionChanged: boolean;
  usedRedistribution: number;
  coachingPurchased: number;
  trainingPurchased: boolean;
  activityCheckComplete: boolean;
  trainingCampComplete: boolean;
  bankBalance: number;
  taskStatus: 'Draftee Free Agent' | 'SMJHL Rookie' | 'SHL/Send-down';
  attributes: PortalSkaterAttributes | PortalGoalieAttributes;
  isSuspended: boolean;
  indexRecords: IndexPlayerID[] | null;
  inactive: boolean;
};

export type InternalChecklist = {
  userID: number;
  playerUpdateID: number;
  tid: number;
  league: number;
  subject: string;
  complete: number;
  dueDate: string;
};

export type PlayerAchievement = {
  playerUpdateID: number | null;
  playerName: string;
  userID: number | null;
  fhmID: number;
  leagueID: number;
  seasonID: number;
  teamID: number;
  achievement: number;
  achievementName: string;
  achievementDescription: string;
  isAward: boolean;
  won: boolean;
};

export type TeamAchievement = {
  teamID: number;
  leagueID: number;
  seasonID: number;
  achievement: number;
  achievementName: string;
  achievementDescription: string;
};

export type UserAchievement = {
  username: string;
  userID: number;
  leagueID: number;
  seasonID: number;
  teamID: number;
  achievement: number;
  achievementName: string;
  achievementDescription: string;
  isAward: boolean;
  won: boolean;
  GM: number;
};

export type BasicUserInfo = {
  userID: number;
  username: string;
};

export type ManagerInfo = {
  leagueID: number;
  teamID: number;
  gmID: number;
  gmUsername: string;
  cogmID: number;
  cogmUsername: string;
};

export type PortalTPEEarned = {
  playerUpdateID: number;
  season: number;
  name: string;
  position: string;
  currentLeague: string;
  currentTeamID: number;
  shlRightsTeamID: number;
  draftSeason: number;
  userID: number;
  username: string;
  earnedTPE: number;
  rank: number;
  regression: number;
  activitycheck: number;
  training: number;
  trainingcamp: number;
  coaching: number;
  pt: number;
  fantasy: number;
  recruitment: number;
  correction: number;
  other: number;
};
