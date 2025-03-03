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

export type CommandUsageInfo = {
  commandName: string;
  count: number;
};

export type UserCommandUsageInfo = {
  discordId: string;
  count: number;
};

export const commandCountDB = new Keyv('sqlite://src/db/users/commands.sqlite');
export const userCountDB = new Keyv(
  'sqlite://src/db/users/user_commands.sqlite',
);

users.on('error', (err) => logger.error('Keyv connection error:', err));
discordMods.on('error', (err) => logger.error('Keyv connection error:', err));
commandCountDB.on('error', (err) =>
  logger.error('Keyv connection error (commandCountDB):', err),
);
userCountDB.on('error', (err) =>
  logger.error('Keyv connection error (userCountDB):', err),
);
