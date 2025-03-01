import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  EmbedBuilder,
} from 'discord.js';
import { leagueTypeToString } from 'src/db/index/helpers/leagueToString';
import { LeagueType } from 'src/db/index/shared';
import { logger } from 'src/lib/logger';
import { Teams } from 'src/lib/teams';

const getTeamsByLeague = (leagueType: LeagueType) => {
  return Object.values(Teams).filter((team) => team.leagueType === leagueType);
};

const createTeamListEmbed = (leagueType: LeagueType) => {
  const teams = getTeamsByLeague(leagueType);
  const leagueName = leagueTypeToString(leagueType);

  const embed = new EmbedBuilder()
    .setTitle(`${leagueName} Teams`)
    .setDescription('List of teams and their abbreviations')
    .setColor('#0099ff');

  teams.forEach((team) => {
    embed.addFields({
      name: team.fullName,
      value: `Abbr: ${team.abbr}`,
      inline: true,
    });
  });

  return embed;
};

export async function handleHelpButtons(interaction: ButtonInteraction) {
  const customId = interaction.customId;

  try {
    if (customId === 'help_main') {
      const helpEmbed = new EmbedBuilder()
        .setTitle('Bot Help')
        .setDescription('Here are the available commands:')
        .setColor('#0099ff');

      await interaction.update({ embeds: [helpEmbed], components: [] });
      return;
    }
    if (customId === 'help_abbr') {
      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId('help_league_SHL')
          .setLabel('SHL')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('help_league_SMJHL')
          .setLabel('SMJHL')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('help_league_IIHF')
          .setLabel('IIHF')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('help_league_WJC')
          .setLabel('WJC')
          .setStyle(ButtonStyle.Primary),
      );

      const backRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId('help_main')
          .setLabel('Back to Help')
          .setStyle(ButtonStyle.Secondary),
      );

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

      const backRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId('help_abbr')
          .setLabel('Back to Leagues')
          .setStyle(ButtonStyle.Secondary),
      );
      const nextRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId('help_more_teams')
          .setLabel('Next Page')
          .setStyle(ButtonStyle.Primary),
      );

      await interaction.update({
        embeds: [embed],
        components: [backRow, nextRow],
      });
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
