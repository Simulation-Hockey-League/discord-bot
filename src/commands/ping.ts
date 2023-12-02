import { SlashCommandBuilder } from 'discord.js';
import { SlashCommand } from 'typings/command';

export default {
  command: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!'),
  execute: async (interaction) => {
    await interaction.reply('Pong!');
  },
} satisfies SlashCommand;
