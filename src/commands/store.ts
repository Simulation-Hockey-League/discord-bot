import { SlashCommandBuilder } from 'discord.js';
import { IndexApiClient } from 'src/db/index/api/IndexApiClient';
import { PortalClient } from 'src/db/portal/PortalClient';
import { UserInfo, users } from 'src/db/users';
import { BaseEmbed } from 'src/lib/embed';
import { SlashCommand } from 'typings/command';

export default {
  command: new SlashCommandBuilder()
    .setName('store')
    .addStringOption((option) =>
      option
        .setName('username')
        .setDescription('Your username on the forum.')
        .setRequired(true),
    )
    .setDescription('Store user info in the database.'),
  execute: async (interaction) => {
    const target = interaction.options.getString('username', true);

    const isOverwritingStoredInfo = await users.has(interaction.user.id);

    const allUsers = await PortalClient.getUserInfo();
    const user = allUsers.find((u) => u.username === target);

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

    const teams = await IndexApiClient.get(player?.currentLeague).getTeamInfo();
    const team = teams.find((team) => team.id === player?.currentTeamID);

    const userInfo: UserInfo = {
      discordId: interaction.user.id,
      forumName: target,
      forumUserId: user.userID,
      playerName: player?.name,
      teamName: team?.name,
      portalID: String(player?.pid),
    };

    users.set(interaction.user.id, userInfo);

    await interaction.reply({
      embeds: [
        BaseEmbed(interaction, { teamColor: team?.colors.primary })
          .setDescription(
            isOverwritingStoredInfo
              ? `Updated user info for ${interaction.user.toString()}.`
              : `Stored user info for ${interaction.user.toString()}.`,
          )
          .addFields(
            { name: 'User', value: target },
            { name: 'Team', value: userInfo.teamName ?? '-' },
            { name: 'Player', value: userInfo.playerName ?? '-' },
          ),
      ],
      ephemeral: true,
    });
  },
} satisfies SlashCommand;
