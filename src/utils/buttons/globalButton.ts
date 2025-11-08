import { EmbedBuilder } from 'discord.js';
import type { ChatInputCommandInteraction } from 'discord.js';
import { UserInfo } from 'src/db/users';
import { createGlobalPlayerRank, createGlobalRank } from 'src/lib/fantasy';

import { GetPageFn, backForwardButtons } from './button';

type GlobalRankType = 'global' | 'player';

interface GlobalButtonOptions {
  interaction: ChatInputCommandInteraction;
  type: GlobalRankType;
  currentUserInfo: UserInfo | null;
  position?: string | null;
}

export function createGlobalButton(options: GlobalButtonOptions): GetPageFn {
  const { interaction, type, position, currentUserInfo } = options;

  return async (page: number) => {
    let embed: EmbedBuilder;
    let totalPages: number;
    let globalResult;
    let playerResult;

    switch (type) {
      case 'global':
        globalResult = await createGlobalRank(interaction, page);
        embed = globalResult.embed;
        totalPages = globalResult.totalPages;
        break;

      case 'player':
        playerResult = await createGlobalPlayerRank(
          interaction,
          position,
          currentUserInfo,
          page,
        );
        embed = playerResult.embed;
        totalPages = playerResult.totalPages;
        break;

      default:
        throw new Error(`Invalid type: ${type}`);
    }

    const buttons = backForwardButtons(page, totalPages);

    return { embed, buttons, totalPages };
  };
}
