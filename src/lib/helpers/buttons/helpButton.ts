import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  EmbedBuilder,
} from 'discord.js';
import { LeagueType } from 'src/db/index/shared';
import {
  createAboutEmbed,
  createMainHelpEmbed,
  createTeamListEmbed,
} from 'src/lib/help';
import { logger } from 'src/lib/logger';

export const getMainHelpButtons = () => {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('help_main')
      .setLabel('Help')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('help_abbr')
      .setLabel('Abbr Helper')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('about')
      .setLabel('About')
      .setStyle(ButtonStyle.Primary),
  );
};

const getAbbrHelpButtons = (leagueType?: string) => {
  const leagues = ['SHL', 'SMJHL', 'IIHF', 'WJC'];

  const buttons = leagues.map((league) =>
    new ButtonBuilder()
      .setCustomId(`help_league_${league}`)
      .setLabel(league)
      .setStyle(ButtonStyle.Primary)
      .setDisabled(leagueType === league),
  );

  return new ActionRowBuilder<ButtonBuilder>().addComponents(buttons);
};

const getBackToHelpButtons = (customId: string) => {
  const buttons: ButtonBuilder[] = [];

  if (customId !== 'help_main') {
    buttons.push(
      new ButtonBuilder()
        .setCustomId('help_main')
        .setLabel('Back to Help')
        .setStyle(ButtonStyle.Secondary),
    );
  }

  if (customId !== 'about') {
    buttons.push(
      new ButtonBuilder()
        .setCustomId('about')
        .setLabel('Back to About')
        .setStyle(ButtonStyle.Secondary),
    );
  }

  return new ActionRowBuilder<ButtonBuilder>().addComponents(buttons);
};

export async function handleHelpButtons(interaction: ButtonInteraction) {
  const customId = interaction.customId;

  try {
    if (customId === 'help_main') {
      const helpEmbed = await createMainHelpEmbed(interaction);

      const row = getMainHelpButtons();

      await interaction.update({ embeds: [helpEmbed], components: [row] });
      return;
    }
    if (customId === 'help_abbr') {
      const row = getAbbrHelpButtons();

      const backRow = getBackToHelpButtons(customId);

      const embed = new EmbedBuilder()
        .setTitle('Team Abbreviation Helper')
        .setDescription('Select a league to view team abbreviations')
        .setColor('#0099ff');

      await interaction.update({
        embeds: [embed],
        components: [row, backRow],
      });
      return;
    }
    if (customId.startsWith('help_league_')) {
      const leagueString = customId.replace('help_league_', '');
      let leagueType: LeagueType;

      switch (leagueString) {
        case 'SHL':
          leagueType = LeagueType.SHL;
          break;
        case 'SMJHL':
          leagueType = LeagueType.SMJHL;
          break;
        case 'IIHF':
          leagueType = LeagueType.IIHF;
          break;
        case 'WJC':
          leagueType = LeagueType.WJC;
          break;
        default:
          throw new Error(`Unknown league: ${leagueString}`);
      }

      const embed = createTeamListEmbed(leagueType);
      const row = getAbbrHelpButtons(leagueString);

      const backRow = getBackToHelpButtons(customId);

      await interaction.update({
        embeds: [embed],
        components: [row, backRow],
      });
      return;
    }
    if (customId === 'about') {
      const embed = await createAboutEmbed();

      const backRow = getBackToHelpButtons(customId);

      await interaction.update({ embeds: [embed], components: [backRow] });
      return;
    }
  } catch (error) {
    logger.error('Error handling help button interaction:', error);
    await interaction
      .update({
        content: 'There was an error processing your request',
        components: [],
      })
      .catch((e) => logger.error(e));
  }
}
