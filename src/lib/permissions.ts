import {
  GuildMember,
  PermissionFlagsBits,
  PermissionResolvable,
} from 'discord.js';

export const checkPermissions = (
  member: GuildMember,
  permissions: Array<PermissionResolvable>,
) => {
  const nonMatchingPermissions = permissions.filter(
    (permission) => !member.permissions.has(permission),
  );

  if (nonMatchingPermissions.length === 0) return null;
  return nonMatchingPermissions
    .map((permission) => {
      if (typeof permission === 'string') {
        return permission.split(/(?=[A-Z])/).join(' ');
      } else {
        return Object.keys(PermissionFlagsBits)
          .find((key) => Object(PermissionFlagsBits)[key] === permission)
          ?.split(/(?=[A-Z])/)
          .join(' ');
      }
    })
    .filter((p): p is NonNullable<typeof p> => !!p);
};
