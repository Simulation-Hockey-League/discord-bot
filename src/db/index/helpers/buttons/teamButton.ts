import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import {
  createLeadersEmbed,
  createRosterEmbed,
  createScheduleEmbed,
  createStatsEmbed,
} from 'src/lib/team';
import { TeamInfo } from 'src/lib/teams';
import { IndexTeamInfo, SeasonType } from 'typings/statsindex';

export function createActionRow(
  abbr: string,
  season: number | undefined,
  view: string,
) {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`overview_${abbr}_${season ?? 'current'}`)
      .setLabel('Overview')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(view === 'overview'),
    new ButtonBuilder()
      .setCustomId(`roster_${abbr}_${season ?? 'current'}`)
      .setLabel('Current Roster')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(view === 'roster'),
    new ButtonBuilder()
      .setCustomId(`schedule_${abbr}_${season ?? 'current'}`)
      .setLabel('Schedule')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(view === 'schedule'),
    new ButtonBuilder()
      .setCustomId(`leaders_${abbr}_${season ?? 'current'}`)
      .setLabel('Team Leaders')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(view === 'leaders'),
  );
}

export async function createEmbed(
  interaction: any,
  team: IndexTeamInfo,
  teamInfo: TeamInfo,
  season?: number,
  seasonType?: SeasonType,
  view?: string,
) {
  switch (view) {
    case 'roster':
      return await createRosterEmbed(interaction, team, teamInfo);
    case 'schedule':
      return await createScheduleEmbed(
        interaction,
        team,
        teamInfo,
        seasonType,
        season,
      );
    case 'leaders':
      return await createLeadersEmbed(
        interaction,
        team,
        teamInfo,
        season,
        seasonType,
      );
    default:
      return await createStatsEmbed(interaction, teamInfo, season, seasonType);
  }
}
