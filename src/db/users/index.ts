import Keyv from 'keyv';
import { UserRole } from 'src/lib/config/config';
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

export type DiscordModInfo = {
  discordID: string;
  role: UserRole;
};

export const discordMods = new Keyv<DiscordModInfo>(
  'sqlite://src/db/users/discordMods.sqlite',
);

users.on('error', (err) => logger.error('Keyv connection error:', err));
discordMods.on('error', (err) => logger.error('Keyv connection error:', err));
