import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  EmbedBuilder,
} from 'discord.js';
import { leagueTypeToString } from 'src/db/index/helpers/leagueToString';
import { LeagueType } from 'src/db/index/shared';
import { inviteLink } from 'src/lib/config/config';
import { logger } from 'src/lib/logger';
import { checkRole } from 'src/lib/role';
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

const createMainHelpEmbed = async (interaction: ButtonInteraction) => {
  const client = interaction.client;

  const helpEmbed = new EmbedBuilder()
    .setTitle('Available Commands')
    .setDescription('Here are the commands you can use:')
    .setColor('#0099ff');

  for (const [, command] of client.commands) {
    const minRole = command.minRole || 0;

    const hasPermission = await checkRole(interaction.member, minRole);
    if (hasPermission) {
      helpEmbed.addFields({
        name: `/${command.command.name}`,
        value: command.command.description || 'No description available.',
        inline: false,
      });
    }
  }

  helpEmbed.addFields({
    name: 'Invite the bot',
    value: `[Click here to invite the bot to your server](${inviteLink})`,
    inline: false,
  });

  return helpEmbed;
};

export async function handleHelpButtons(interaction: ButtonInteraction) {
  const customId = interaction.customId;

  try {
    if (customId === 'help_main') {
      const helpEmbed = await createMainHelpEmbed(interaction);

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId('help_abbr')
          .setLabel('Abbr Helper')
          .setStyle(ButtonStyle.Primary),
      );

      await interaction.update({ embeds: [helpEmbed], components: [row] });
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

      await interaction.update({
        embeds: [embed],
        components: [backRow],
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
