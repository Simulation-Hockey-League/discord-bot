import { TextChannel } from 'discord.js';

export const sendTimedMessage = (
  message: string,
  channel: TextChannel,
  duration: number,
) =>
  channel
    .send(message)
    .then((m) =>
      setTimeout(
        async () => (await channel.messages.fetch(m)).delete(),
        duration,
      ),
    );
