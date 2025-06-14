import { Interaction } from 'discord.js';
import { logger } from 'src/lib/logger';

export function logUnhandledCommandError(
  interaction: Interaction,
  error: unknown,
) {
  const commandName =
    'commandName' in interaction ? (interaction as any).commandName : 'N/A';

  logger.error(
    `Unhandled error in command "${commandName}" by user ${
      interaction.user?.tag ?? 'Unknown'
    } (${interaction.user?.id ?? 'Unknown'}) in channel ${
      interaction.channel?.id ?? 'Unknown'
    } (${interaction.channel?.toString() ?? 'Unknown'}) in guild ${
      interaction.guild?.name ?? 'DM'
    } (${interaction.guild?.id ?? 'Unknown'}): ${error}`,
  );
}
