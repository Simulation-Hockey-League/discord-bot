// This file will eventually be used for every embed to make sure that the description is below the limit
import { EmbedBuilder } from 'discord.js';

export function applySafeEmbedDescription(
  embed: EmbedBuilder,
  lines: string[],
  options?: {
    shortenNames?: boolean;
    fallbackText?: string;
  },
): EmbedBuilder {
  const MAX_LENGTH = 4096;
  const { shortenNames = false, fallbackText = '...and more' } = options ?? {};

  const fullText = lines.join('\n');
  if (fullText.length <= MAX_LENGTH) {
    return embed.setDescription(fullText);
  }

  const shortenNameInLine = (line: string) => {
    const nameMatch = line.match(/^(.+?):/);
    if (!nameMatch) return line;

    const fullName = nameMatch[1];
    const [first, ...rest] = fullName.split(' ');
    const shortened = `${first[0]}. ${rest.join(' ')}`;
    return line.replace(fullName, shortened);
  };

  const processedLines = shortenNames ? lines.map(shortenNameInLine) : lines;

  let i = processedLines.length;
  let desc = processedLines.slice(0, i).join('\n');

  while (desc.length > MAX_LENGTH && i > 0) {
    i--;
    desc = processedLines.slice(0, i).join('\n');
  }

  if (i < processedLines.length) {
    desc += `\n${fallbackText}`;
  }

  return embed.setDescription(desc);
}
