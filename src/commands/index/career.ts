import {
  ButtonInteraction,
  ComponentType,
  SlashCommandBuilder,
} from 'discord.js';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { getAllPlayers, getPlayerStats } from 'src/db/index';
import { IndexApiClient } from 'src/db/index/api/IndexApiClient';
import { LeagueType, SeasonType } from 'src/db/index/shared';
import { PortalClient } from 'src/db/portal/PortalClient';
import { users } from 'src/db/users';
import { displayPlayerAwards } from 'src/lib/career';
import { displayGoalieCareer, displaySkaterCareer } from 'src/lib/career';
import { SlashCommand } from 'typings/command';
import { GoalieStats, PlayerStats } from 'typings/statsindex';

export default {
  command: new SlashCommandBuilder()
    .setName('career')
    .setDescription('Get player career statistics.')
    .addStringOption((option) =>
      option
        .setName('name')
        .setDescription(
          'The name of the player. If not provided, will use the player name stored by /store.',
        )
        .setRequired(false),
    )
    .addNumberOption((option) =>
      option
        .setName('league')
        .setDescription(
          'The league of the standings to return. If not provided, will use SHL standings.',
        )
        .setChoices(
          { name: 'SHL', value: LeagueType.SHL },
          { name: 'SMJHL', value: LeagueType.SMJHL },
          { name: 'IIHF', value: LeagueType.IIHF },
          { name: 'WJC', value: LeagueType.WJC },
        )
        .setRequired(false),
    )
    .addStringOption((option) =>
      option
        .setName('type')
        .setDescription('The season type (i.e. regular, playoffs, etc.)')
        .setChoices(
          { name: 'Regular', value: SeasonType.REGULAR },
          { name: 'Playoffs', value: SeasonType.POST },
        )
        .setRequired(false),
    ),

  execute: async (interaction) => {
    try {
      await interaction.deferReply();

      let league = interaction.options.getNumber('league') as
        | LeagueType
        | undefined;
      const targetName = interaction.options.getString('name');
      const seasonType = interaction.options.getString('type') as
        | SeasonType
        | undefined;
      const currentUserInfo = await users.get(interaction.user.id);
      const name = targetName || currentUserInfo?.playerName;

      if (!name) {
        await interaction.reply({
          content: 'No player name provided or stored.',
          ephemeral: true,
        });
        return;
      }
      let playerID;
      let position;
      let setLeague;
      if (currentUserInfo?.portalID && !targetName) {
        const player = await PortalClient.getPlayer(currentUserInfo.portalID);
        if (player) {
          position = player.position;
          const leagueID = league ?? LeagueType.SHL;
          const indexRecord = player.indexRecords?.find(
            (record) => record.leagueID === leagueID,
          );

          if (indexRecord) {
            playerID = indexRecord.indexID;
            setLeague = indexRecord.leagueID;
          }
        }
      }

      if (!playerID) {
        const playerRecord = await getAllPlayers(
          name,
          league ?? LeagueType.SHL,
        );
        if (!playerRecord) {
          await interaction.editReply({
            content: `Could not find ${name}.`,
          });
          return;
        }
        playerID = playerRecord.playerID;
        setLeague = league;
      }
      if (!playerID) {
        const playerStats = await getPlayerStats(name, seasonType);
        if (playerStats) {
          playerID = playerStats.id;
          position = playerStats.position;
          setLeague = playerStats.league;
        }
      }

      league = league ?? setLeague;

      let isGoalie = position === 'G' || position === 'Goalie';
      let careerStats = await IndexApiClient.get(league).getCareerStats(
        playerID,
        seasonType,
        isGoalie,
      );

      if (
        !position &&
        (!careerStats || careerStats.length === 0) &&
        !isGoalie
      ) {
        isGoalie = true;
        careerStats = await IndexApiClient.get(league).getCareerStats(
          playerID,
          seasonType,
          isGoalie,
        );
      }
      if (isGoalie) {
        await displayGoalieCareer(
          interaction,
          careerStats as GoalieStats[],
          seasonType ?? SeasonType.REGULAR,
        );
      } else {
        await displaySkaterCareer(
          interaction,
          careerStats as PlayerStats[],
          seasonType ?? SeasonType.REGULAR,
        );
      }

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(`career_${playerID}_${seasonType ?? 'regular'}`)
          .setLabel('Career Stats')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId(`awards_${playerID}_${seasonType ?? 'regular'}`)
          .setLabel('Awards')
          .setStyle(ButtonStyle.Secondary),
      );

      const response = await interaction.editReply({
        components: [row],
      });
      const collector = response.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 60000,
      });

      collector.on('collect', async (i: ButtonInteraction) => {
        if (i.user.id !== interaction.user.id) {
          await i.reply({
            content: 'Only the command user can use these buttons.',
            ephemeral: true,
          });
          return;
        }

        const [action, seasonValue] = i.customId.split('_');
        const selectedSeason =
          seasonValue === 'regular' ? SeasonType.REGULAR : SeasonType.POST;

        await i.deferUpdate();

        if (action === 'career') {
          if (isGoalie) {
            await displayGoalieCareer(
              interaction,
              careerStats as GoalieStats[],
              selectedSeason,
            );
          } else {
            await displaySkaterCareer(
              interaction,
              careerStats as PlayerStats[],
              selectedSeason,
            );
          }
        } else if (action === 'awards') {
          await displayPlayerAwards(interaction, careerStats as PlayerStats[]);
        }

        await i.editReply({
          components: [row],
        });
      });

      collector.on('end', () => {
        interaction
          .editReply({
            components: [],
          })
          .catch(
            async (error) =>
              await interaction.editReply(
                `An error occurred while updating: ${error.message}.`,
              ),
          );
      });
    } catch (error) {
      await interaction.editReply({
        content: `An error occurred while fetching career stats: ${
          error instanceof Error ? error.message : 'unknown error'
        }.`,
      });
    }
  },
} satisfies SlashCommand;
