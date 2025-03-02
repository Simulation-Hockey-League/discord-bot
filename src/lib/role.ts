import { APIInteractionGuildMember, GuildMember } from 'discord.js';

import { discordMods } from 'src/db/users';

import { Config, UserRole } from './config/config';

export const checkRole = async (
  member: GuildMember | APIInteractionGuildMember | null,
  minRole: UserRole,
) => {
  if (!member) return false;
  if (Config.devTeamIds.includes(member.user.id)) {
    return minRole <= UserRole.BOT_OWNERS;
  }

  const user = await discordMods.get(member.user.id);
  const userRole = user ? user.role : UserRole.REGULAR;
  return userRole >= minRole;
};
