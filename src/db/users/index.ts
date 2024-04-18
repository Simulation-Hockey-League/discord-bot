import Keyv from 'keyv';
import { logger } from 'src/lib/logger';

export type UserInfo = {
  discordId: string;
  forumName: string;
  teamName?: string;
  playerName?: string;
  forumUserId: number; // Add handling to get this later
};

export const users = new Keyv<UserInfo>('sqlite://src/db/users/users.sqlite');

users.on('error', (err) => logger.error('Keyv connection error:', err));
