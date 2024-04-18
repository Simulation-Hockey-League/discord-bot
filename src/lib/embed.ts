import {
  CacheType,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';

import { hexColorToInt } from './format';
// import { users } from 'src/db/users';

export const BaseEmbed = (
  interaction: ChatInputCommandInteraction<CacheType>,
  teamColor?: string,
  forceColor?: string,
) => {
  const color =
    forceColor ||
    teamColor || // users.get(interaction.user.id)?.teamName ||
    '#7289da';

  return new EmbedBuilder().setColor(hexColorToInt(color));
};
