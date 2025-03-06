import { ButtonInteraction, EmbedBuilder } from 'discord.js';
import { leagueTypeToString } from 'src/db/index/helpers/leagueToString';
import { LeagueType } from 'src/db/index/shared';

import { inviteLink } from './config/config';
import { checkRole } from './role';
import { Teams } from './teams';

const getTeamsByLeague = (leagueType: LeagueType) => {
  return Object.values(Teams).filter((team) => team.leagueType === leagueType);
};

export const createTeamListEmbed = (leagueType: LeagueType) => {
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

export const createMainHelpEmbed = async (interaction: ButtonInteraction) => {
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

export const createAboutEmbed = async () => {
  const embed = new EmbedBuilder()
    .setTitle('SHL Bot V1.0.1')
    .setDescription('Latest Version of the SHL Bot: 3/5/25')
    .addFields({
      name: 'Feedback',
      value:
        'Fill out this form to provide feedback, suggestions, or bug reports: [Form Link](https://docs.google.com/forms/d/e/1FAIpQLSe7RO1wxunG_GTluZgyMc65oPpdKbeTNa1yAqS4nYqvQ2QMTA/viewform?usp=sharing)',
      inline: false,
    })
    .addFields({
      name: 'SHL V1.0.1 Udpates',
      value:
        'Latest Updates\n Added new Hamilton and Manhattan Logos \n Added  /leaderboard command \n Added about section in /help \n Added Gms to current roster on /teams \n Added difference for swaps on /fantasy',
      inline: false,
    });
  return embed;
};
