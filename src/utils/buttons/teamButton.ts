import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  CacheType,
  ChatInputCommandInteraction,
} from 'discord.js';
import {
  createLeadersEmbed,
  createRosterEmbed,
  createScheduleEmbed,
  createStatsEmbed,
  createTPEEarnedEmbed,
} from 'src/lib/team';
import { TeamInfo } from 'src/lib/teams';
import { ManagerInfo } from 'typings/portal';
import { IndexTeamInfo, SeasonType } from 'typings/statsindex';

import { LeagueType } from '../../db/index/shared';

export function createActionRow(
  abbr: string,
  season: number | undefined,
  view: string,
  league: LeagueType,
) {
  const actionRow = new ActionRowBuilder<ButtonBuilder>();
  actionRow.addComponents(
    new ButtonBuilder()
      .setCustomId(`overview_${abbr}_${season ?? 'current'}`)
      .setLabel('Overview')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(view === 'overview'),
  );
  if (league !== LeagueType.IIHF && league !== LeagueType.WJC) {
    actionRow.addComponents(
      new ButtonBuilder()
        .setCustomId(`roster_${abbr}_${season ?? 'current'}`)
        .setLabel('Current Roster')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(view === 'roster'),
    );
  }
  if (season && season >= 53) {
    actionRow.addComponents(
      new ButtonBuilder()
        .setCustomId(`schedule_${abbr}_${season ?? 'current'}`)
        .setLabel('Schedule')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(view === 'schedule'),
    );
  }
  actionRow.addComponents(
    new ButtonBuilder()
      .setCustomId(`leaders_${abbr}_${season ?? 'current'}`)
      .setLabel('Team Leaders')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(view === 'leaders'),
  );
  if (
    season &&
    season >= 73 &&
    league !== LeagueType.IIHF &&
    league !== LeagueType.WJC
  ) {
    actionRow.addComponents(
      new ButtonBuilder()
        .setCustomId(`tpeearned_${abbr}_${season ?? 'current'}`)
        .setLabel('TPE Earned')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(view === 'tpeearned'),
    );
  }

  return actionRow;
}

export async function createTeamEmbed(
  interaction: ChatInputCommandInteraction<CacheType>,
  team: IndexTeamInfo,
  teamInfo: TeamInfo,
  season?: number,
  seasonType?: SeasonType,
  view?: string,
  managerInfo?: ManagerInfo[],
) {
  switch (view) {
    case 'roster':
      if (
        teamInfo.leagueType === LeagueType.SHL ||
        teamInfo.leagueType === LeagueType.SMJHL
      ) {
        return await createRosterEmbed(
          interaction,
          team,
          teamInfo,
          managerInfo,
        );
      }
      return;
    case 'schedule':
      if (season && season >= 53) {
        return await createScheduleEmbed(
          interaction,
          team,
          teamInfo,
          seasonType,
          season,
        );
      }
      return;

    case 'leaders':
      return await createLeadersEmbed(
        interaction,
        team,
        teamInfo,
        season,
        seasonType,
      );
    case 'tpeearned':
      if (season && season >= 73) {
        return await createTPEEarnedEmbed(interaction, teamInfo, season);
      }
      return;
    default:
      return await createStatsEmbed(interaction, teamInfo, season, seasonType);
  }
}
