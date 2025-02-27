import Keyv from 'keyv';
import { logger } from 'src/lib/logger';

export type UserInfo = {
  discordId: string;
  forumName: string;
  teamName?: string;
  playerName?: string;
  forumUserId: number; // Add handling to get this later
  portalID?: string; // connecting to portal
};

export const users = new Keyv<UserInfo>('sqlite://src/db/users/users.sqlite');

export type PlayerInfo = {
  playerID: number;
  leagueID: number;
  name: string;
};

users.on('error', (err) => logger.error('Keyv connection error:', err));
