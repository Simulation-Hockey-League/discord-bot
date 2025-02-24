import { SlashCommandBuilder } from 'discord.js';
import { IndexApiClient } from 'src/db/index/api/IndexApiClient';
import { getUserByFuzzy } from 'src/db/portal';
import { PortalClient } from 'src/db/portal/PortalClient';
import { users } from 'src/db/users';
import { BaseEmbed } from 'src/lib/embed';
import { SlashCommand } from 'typings/command';

export default {
  command: new SlashCommandBuilder()
    .setName('user')
    .addStringOption((option) =>
      option
        .setName('username')
        .setDescription('The username of the player on the forum.')
        .setRequired(true),
    )
    .setDescription('Retrieve player info from the portal.'),
  execute: async (interaction) => {
    const target = interaction.options.getString('username', true);
    const currentUserInfo = await users.get(interaction.user.id);
    const name = target || currentUserInfo?.playerName;

    if (!name) {
      await interaction.reply({
        content: 'No player name provided or stored.',
        ephemeral: true,
      });
      return;
    }
    const user = await getUserByFuzzy(target);

    if (!user) {
      await interaction.reply({
        content:
          'Could not find user with that username. Please check your spelling and try again.',
        ephemeral: true,
      });
      return;
    }

    const players = await PortalClient.getActivePlayers();
    const player = players.find((p) => p.uid === user.userID);

    if (!player) {
      await interaction.reply({
        content: 'Could not find active player with that username.',
        ephemeral: true,
      });
      return;
    }
    const teams = await IndexApiClient.get(player?.currentLeague).getTeamInfo();
    const team = teams.find((team) => team.id === player?.currentTeamID);

    // Create an embed with player info
    const playerEmbed = BaseEmbed(interaction, {
      teamColor: team?.colors.primary,
    })
      .setTitle(`${player.name} - ${player.position}`)
      .addFields(
        { name: 'Username', value: user.username, inline: true },
        { name: 'Player ID', value: player.pid.toString(), inline: true },
        {
          name: 'Team',
          value: player.currentTeamID?.toString() ?? 'N/A',
          inline: true,
        },
        { name: 'TPE', value: player.totalTPE.toString(), inline: true },
        { name: 'Position', value: player.position, inline: true },
        { name: 'Draft Season', value: `S${player.draftSeason}`, inline: true },
      );

    await interaction.reply({ embeds: [playerEmbed] });
  },
} satisfies SlashCommand;
