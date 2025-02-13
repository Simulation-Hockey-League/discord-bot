import { EmbedBuilder } from 'discord.js';

import { logger } from './logger';
import { findTeamByName } from './teams';

// Populate the embed with player stats fields based on the playerStats response
export const withStandingsStats = (
	embed: EmbedBuilder,
	seasonStats: any,
): EmbedBuilder => {
	logger.info(seasonStats)

	let outputString = seasonStats.map((team: {
		name: string,
		abbreviation: string,
		points: number,
		gp: number,
		wins: number,
		losses: number,
		OTL: number
	}) => {
		const teamInfo = findTeamByName(team.name);
		const emoji = teamInfo?.emoji

		return `${emoji ? emoji : ''} ${team.abbreviation} - **${team.points}** (${team.gp}-${team.wins}-${team.losses}-${team.OTL})`
	}).join('\n')

	return embed
		.setDescription(outputString)
};
