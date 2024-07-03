import {
  CacheType,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';

import { capitalize } from 'lodash';

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
      text: 'Made with ❤️ by the SHL Developer Team',
    });
  if (logoUrl) {
    embed.setThumbnail(logoUrl);
  }
  return embed;
};

export const ErrorEmbed = (
  interaction: ChatInputCommandInteraction<CacheType>,
  error: Error,
) => {
  return new EmbedBuilder()
    .setColor(0xff0000)
    .setTimestamp()
    .setTitle(`Unhandled ${error.name} Occurred`)
    .setDescription(
      `Error occured while executing command \`/${interaction.commandName}\`.`,
    )
    .addFields(
      {
        name: 'Error Location',
        value: [
          `**Username:** ${interaction.user.username}`,
          `**User ID:** ${interaction.user.id}`,
          `**Guild Name:** ${interaction.guild?.name ?? 'DM'}`,
          `**Guild ID:** ${interaction.guildId}`,
          ...(interaction.channel && 'name' in interaction.channel
            ? [`**Channel Name:** ${interaction.channel.name}`]
            : []),
          `**Channel ID:** ${interaction.channelId}`,
        ].join('\n'),
        inline: true,
      },
      {
        name: 'Interaction Details',
        value: [
          `**Name:** /${interaction.commandName}`,
          `**Options:**`,
          interaction.options.data.map(
            (option) => `*${capitalize(option.name)}:* ${option.value}`,
          ),
        ].join('\n'),
        inline: true,
      },
      {
        name: 'Raw Error',
        value: `\`\`\`js\n${error.stack}\`\`\``,
      },
    );
};
