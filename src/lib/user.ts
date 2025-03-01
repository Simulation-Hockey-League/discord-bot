import { CacheType, ChatInputCommandInteraction } from 'discord.js';
import { IndexApiClient } from 'src/db/index/api/IndexApiClient';
import { PortalClient } from 'src/db/portal/PortalClient';

import { BasicUserInfo } from 'typings/portal';

import { DynamicConfig } from './config/dynamicConfig';
import { BaseEmbed } from './embed';

export async function withUserInfo(
  interaction: ChatInputCommandInteraction<CacheType>,
  user: BasicUserInfo,
) {
  if (!user) {
    await interaction.reply({
      content: 'Could not find user with that username.',
      ephemeral: true,
    });
    return;
  }

  const currentSeason = DynamicConfig.get('currentSeason');
  const players = await PortalClient.getActivePlayers();
  const player = players.find((p) => p.uid === user.userID);

  if (!player) {
    await interaction.reply({
      content: 'Could not find active player with that username.',
      ephemeral: true,
    });
    return;
  }

  let checklistLeague = 0;
  if (player.draftSeason && player.draftSeason > currentSeason) {
    checklistLeague = 1;
  }

  const checklist = await PortalClient.getChecklistByUser(
    false,
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
      .map((task) => {
        const subject = task.subject || 'Unknown Subject';
        const tid = task.tid || 'Unknown Task ID';
        let taskLink = `https://simulationhockey.com/showthread.php?${tid}`;
        let dueDate = task.dueDate;

        if (subject.includes('Chirp')) {
          taskLink = 'https://simulationhockey.com/forumdisplay.php?fid=758';
          dueDate = 'End of the week';
        } else if (
          subject === 'weeklyActivityCheck' ||
          subject === 'weeklyTraining'
        ) {
          taskLink = 'https://portal.simulationhockey.com/';
          dueDate = 'End of the week';
        } else if (subject === 'Deep Dive' || subject === 'seasonalCoaching') {
          taskLink = 'https://simulationhockey.com/forumdisplay.php?fid=432';
          dueDate = 'End of the Season';
        }

        return `🔹 [${subject}](${taskLink}) - **${dueDate}**`;
      })
      .join('\n');

    checklistField = {
      name: '📝 Checklist',
      value: taskList,
      inline: false,
    };
  }

  const teams = await IndexApiClient.get(player.currentLeague).getTeamInfo();
  const team = teams.find((team) => team.id === player.currentTeamID);
  const formattedBankBalance = `$${player.bankBalance.toLocaleString('en-US')}`;
  let bankedTPE = (player.totalTPE - player.appliedTPE).toString();
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
      { name: 'Banked', value: bankedTPE, inline: true },
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

  await interaction.editReply({ embeds: [playerEmbed] });
}

export async function withUserAwards(
  interaction: ChatInputCommandInteraction<CacheType>,
  user: BasicUserInfo,
) {
  try {
    const userAwards = await PortalClient.getUserAwards(
      false,
      String(user.userID),
    );

    const sortedAwards = [...userAwards].sort(
      (a, b) => Number(b.seasonID) - Number(a.seasonID),
    );
    const wonAwards: string[] = [];
    const nominatedAwards: string[] = [];
    const cups: string[] = [];

    for (const award of sortedAwards) {
      const awardText = `[S${award.seasonID}] ${award.achievementName}`;

      if (award.isAward) {
        if (award.won) {
          wonAwards.push(awardText);
        } else {
          nominatedAwards.push(awardText);
        }
      } else {
        cups.push(awardText);
      }
    }

    const MAX_FIELD_LENGTH = 1024;
    const trimText = (text: string) =>
      text.length > MAX_FIELD_LENGTH
        ? text.substring(0, MAX_FIELD_LENGTH - 3) + '...'
        : text;

    const awardsEmbed = BaseEmbed(interaction, {}).setTitle(
      `${user.username}'s Awards`,
    );

    if (wonAwards.length > 0) {
      awardsEmbed.addFields({
        name: 'Awards Won',
        value: trimText(wonAwards.join('\n')) || 'None',
        inline: false,
      });
    }

    if (nominatedAwards.length > 0) {
      awardsEmbed.addFields({
        name: 'Awards Nominated',
        value: trimText(nominatedAwards.join('\n')) || 'None',
        inline: false,
      });
    }

    if (cups.length > 0) {
      awardsEmbed.addFields({
        name: 'Cups',
        value: trimText(cups.join('\n')) || 'None',
        inline: false,
      });
    }

    await interaction.editReply({ embeds: [awardsEmbed] });
  } catch (error) {
    await interaction.editReply({
      content: `An error occurred while fetching user awards: ${
        error instanceof Error ? error.message : 'unknown error'
      }.`,
    });
  }
}
