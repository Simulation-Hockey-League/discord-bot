import {
  AutocompleteInteraction,
  CacheType,
  ChatInputCommandInteraction,
  ModalSubmitInteraction,
  SlashCommandBuilder,
} from 'discord.js';

export interface SlashCommand {
  command: SlashCommandBuilder;
  execute: (interaction: ChatInputCommandInteraction) => void;
  autocomplete?: (interaction: AutocompleteInteraction) => void;
  modal?: (interaction: ModalSubmitInteraction<CacheType>) => void;
  cooldown?: number; // in seconds
}
