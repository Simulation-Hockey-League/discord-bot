import { SlashCommandBuilder } from 'discord.js';
import { IndexApiClient } from 'src/db/index/api/IndexApiClient';
import { getUserByFuzzy } from 'src/db/portal';
import { PortalClient } from 'src/db/portal/PortalClient';
import { users } from 'src/db/users';
import { DynamicConfig } from 'src/lib/config/dynamicConfig';
import { BaseEmbed } from 'src/lib/embed';
import { SlashCommand } from 'typings/command';

export default {
  command: new SlashCommandBuilder()
    .setName('user')
    .addStringOption((option) =>
      option
        .setName('username')
        .setDescription('The username of the player on the forum.')
        .setRequired(false),
    )
    .setDescription('Retrieve player info from the portal.'),
  execute: async (interaction) => {
    const target = interaction.options.getString('username');
    const currentUserInfo = await users.get(interaction.user.id);
    const name = target || currentUserInfo?.forumName;
    const currentSeason = DynamicConfig.get('currentSeason');
    if (!name) {
      await interaction.reply({
        content: 'No player name provided or stored.',
        ephemeral: true,
      });
      return;
    }
    const user = await getUserByFuzzy(name);

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

    let checklistLeague = 0;
    if (player && player.draftSeason === currentSeason) {
      checklistLeague - 1;
    }
    const checklist = await PortalClient.getChecklistByUser(
      String(checklistLeague),
      String(user.userID),
    );

    const incompleteTasks = checklist.filter((task) => task.complete === 0);
    let checklistField;
    if (incompleteTasks.length === 0) {
      checklistField = {
        name: '✅ Checklist',
        value: 'Done All your Tasks This week!',
        inline: false,
      };
    } else {
      const taskList = incompleteTasks
        .map(
          (task) =>
            `🔹 [${task.subject}](https://simulationhockey.com/showthread.php?${
              task.tid
            }) - **${task.dueDate.replace('Due: ', '')}**`,
        )
        .join('\n');

      checklistField = { name: '📝 Checklist', value: taskList, inline: false };
    }

    if (!player) {
      await interaction.reply({
        content: 'Could not find active player with that username.',
        ephemeral: true,
      });
      return;
    }
    const teams = await IndexApiClient.get(player?.currentLeague).getTeamInfo();
    const team = teams.find((team) => team.id === player?.currentTeamID);
    const formattedBankBalance = `$${player.bankBalance.toLocaleString(
      'en-US',
    )} USD`;

    const playerEmbed = BaseEmbed(interaction, {
      teamColor: team?.colors.primary,
    })
      .setTitle(`${player.username}`)
      .setURL(`https://portal.simulationhockey.com/player/${player.pid}`)
      .addFields(
        { name: 'TPE', value: `${player.totalTPE.toString()}`, inline: true },
        {
          name: 'Applied',
          value: `${player.appliedTPE.toString()}`,
          inline: true,
        },
        { name: 'Position', value: player.position, inline: true },
        { name: 'Draft Season', value: `S${player.draftSeason}`, inline: true },
        { name: 'Bank', value: formattedBankBalance, inline: true },
        {
          name: 'Activity Check',
          value: player.activityCheckComplete ? 'Yes' : 'No',
          inline: true,
        },
        {
          name: 'Training Purchased',
          value: player.trainingPurchased ? 'Yes' : 'No',
          inline: true,
        },
      );
    playerEmbed.addFields(checklistField);

    await interaction.reply({ embeds: [playerEmbed] });
  },
} satisfies SlashCommand;
