import {
  CacheType,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';

import { hexColorToInt } from './format';
// import { users } from 'src/db/users';

export const BaseEmbed = (
  interaction: ChatInputCommandInteraction<CacheType>,
  {
    logoUrl,
    teamColor,
    forceColor,
  }: {
    logoUrl?: string;
    teamColor?: string;
    forceColor?: string;
  },
) => {
  const color =
    forceColor ||
    teamColor || // users.get(interaction.user.id)?.teamName ||
    '#7289da';

  const embed = new EmbedBuilder()
    .setColor(hexColorToInt(color))
    .setTimestamp()
    .setFooter({
      text: 'Built with ❤️ by the SHL Developer Team',
    });
  if (logoUrl) {
    embed.setThumbnail(logoUrl);
  }
  return embed;
};
