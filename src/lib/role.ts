import {
  APIInteractionGuildMember,
  GuildMember,
  PermissionsBitField,
} from 'discord.js';

import { Config, UserRole } from './config/config';

export const checkRole = (
  member: GuildMember | APIInteractionGuildMember | null,
  minRole: UserRole,
) => {
  if (!member) return false;

  const memberRole = Config.devTeamIds.includes(member.user.id)
    ? UserRole.BOT_OWNERS
    : typeof member.permissions !== 'string' &&
      member.permissions.has(PermissionsBitField.Flags.Administrator)
    ? UserRole.SERVER_ADMIN
    : UserRole.REGULAR;

  return memberRole >= minRole;
};
