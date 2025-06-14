import axios from 'axios';
import { parse } from 'csv-parse/sync';

import { Database } from 'sqlite3';
import { DynamicConfig } from 'src/utils/config/dynamicConfig';
import { getSkaterFantasyPoints } from 'src/utils/fantasyHelpers';

import { logger } from 'src/lib/logger';

import { Teams } from 'src/lib/teams';

import {
  FantasyInfo,
  GlobalCSVData,
  PlayersCSVData,
  SwapsCSVData,
} from 'typings/fantasy';

import { IndexApiClient } from '../index/api/IndexApiClient';
import { LeagueType, SeasonType } from '../index/shared';

import { connectToDatabase } from '.';

const TAB_GID = '692922336';
const GROUP_TO_PLAYERS = '1820127588';
const SWAP_SHEET_GID = '1633490752';

export async function updateFantasy() {
  const db: Database = await connectToDatabase();
  const player_message = await updatePlayers(db);
  const global_message = await updateGlobal(db);
  const group_message = await updateGroupPlayers(db);
  const swap_message = await updateSwaps(db);

  let message = 'Fantasy has been updated as well';
  if (!player_message || !global_message || !group_message || !swap_message) {
    message = 'One or more updates for fantasy failed. Let luke know';
  }
  db.close((err) => {
    if (err) {
      logger.error('Error closing the database connection:', err.message);
      message = message + '\n Error closing database connection';
    } else {
      logger.info('Database connection closed');
    }
  });
  return message;
}

async function updatePlayers(db: Database) {
  const currentSeason = DynamicConfig.currentSeason.get();
  const players = await IndexApiClient.get(LeagueType.SHL).getPlayerStats(
    SeasonType.REGULAR,
    currentSeason,
  );

  const goalies = await IndexApiClient.get(LeagueType.SHL).getGoalieStats(
    SeasonType.REGULAR,
    currentSeason,
  );

  let fantasyInfoPlayers: FantasyInfo[] = [];
  players.forEach((player) => {
    const fantasyPoints = getSkaterFantasyPoints(player);
    fantasyInfoPlayers.push({
      playerID: player.id,
      leagueID: player.league,
      name: player.name,
      position:
        player.position === 'G'
          ? 'G'
          : ['RD', 'LD'].includes(player.position)
          ? 'D'
          : 'F',
      fantasyPoints: Number(fantasyPoints.toFixed(2)),
    });
  });

  let goalieTeams: Record<number, { fantasyPoints: number; teamID: number }> =
    {};

  goalies.forEach((goalie) => {
    const fantasyPoints = getSkaterFantasyPoints(goalie);
    if (!goalieTeams[goalie.teamId]) {
      goalieTeams[goalie.teamId] = { fantasyPoints: 0, teamID: goalie.teamId };
    }
    goalieTeams[goalie.teamId].fantasyPoints += fantasyPoints;
  });

  Object.values(goalieTeams).forEach(({ teamID, fantasyPoints }) => {
    const team = Object.values(Teams).find((t) => t.teamID === teamID);
    if (team) {
      fantasyInfoPlayers.push({
        playerID: -1,
        leagueID: LeagueType.SHL,
        name: team.fullName,
        position: 'G',
        fantasyPoints: Number(fantasyPoints.toFixed(2)),
      });
    }
  });

  try {
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM fantasy', (err) => {
        if (err) {
          reject(new Error('Error clearing table: ' + err.message));
        } else {
          resolve('Table cleared');
        }
      });
    });

    await Promise.all(
      fantasyInfoPlayers.map((entry) => {
        return new Promise<void>((resolve, reject) => {
          db.run(
            `INSERT INTO fantasy (playerID, leagueID, name, position, fantasyPoints) VALUES (?, ?, ?, ?, ?)`,
            [
              entry.playerID,
              entry.leagueID,
              entry.name,
              entry.position,
              entry.fantasyPoints,
            ],
            (err) => {
              if (err) {
                reject(new Error('Error inserting entry: ' + err.message));
              } else {
                resolve();
              }
            },
          );
        });
      }),
    );

    return true;
  } catch (error) {
    logger.error(error);
    return false;
  }
}

async function updateGlobal(db: Database) {
  const url = `https://docs.google.com/spreadsheets/d/${process.env
    .SHEET_ID!}/export?format=csv&gid=${TAB_GID}`;
  const { data } = await axios.get(url);
  const records: GlobalCSVData[] = parse(data, {
    columns: true,
    skip_empty_lines: true,
  });
  try {
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM global', (err) => {
        if (err) {
          reject(new Error('Error clearing table: ' + err.message));
        } else {
          resolve('Table cleared');
        }
      });
    });
    await Promise.all(
      records.map((row) => {
        return new Promise<void>((resolve, reject) => {
          db.run(
            `INSERT INTO global (username, group_number) VALUES (?, ?)`,
            [row.username, row.group],
            (err) => {
              if (err) {
                reject(new Error('Error inserting entry: ' + err.message));
              } else {
                resolve();
              }
            },
          );
        });
      }),
    );
    return true;
  } catch (error) {
    logger.error(error);
    return false;
  }
}

async function updateGroupPlayers(db: Database) {
  const url = `https://docs.google.com/spreadsheets/d/${process.env
    .SHEET_ID!}/export?format=csv&gid=${GROUP_TO_PLAYERS}`;
  const { data } = await axios.get(url);
  const records: PlayersCSVData[] = parse(data, {
    columns: true,
    skip_empty_lines: true,
  });

  try {
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM users_players', (err) => {
        if (err) {
          reject(new Error('Error clearing table: ' + err.message));
        } else {
          resolve('Table cleared');
        }
      });
    });

    await Promise.all(
      records.map((row) => {
        return new Promise<void>((resolve, reject) => {
          db.run(
            `INSERT INTO users_players (username, player) VALUES (?, ?)`,
            [row.username, row.player],
            (err) => {
              if (err) {
                reject(new Error('Error inserting entry: ' + err.message));
              } else {
                resolve();
              }
            },
          );
        });
      }),
    );
    return true;
  } catch (error) {
    logger.error(error);
    return false;
  }
}

async function updateSwaps(db: Database) {
  const url = `https://docs.google.com/spreadsheets/d/${process.env
    .SHEET_ID!}/export?format=csv&gid=${SWAP_SHEET_GID}`;
  const { data } = await axios.get(url);
  const records: SwapsCSVData[] = parse(data, {
    columns: true,
    skip_empty_lines: true,
  });

  try {
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM swaps', (err) => {
        if (err) {
          reject(new Error('Error clearing table: ' + err.message));
        } else {
          resolve('Table cleared');
        }
      });
    });

    const inserts = records.flatMap((record) => {
      const {
        username,
        'Old (Skater)': oldSkater,
        'New (Skater)': newSkater,
        'Old (Goalie)': oldGoalie,
        'New (Goalie)': newGoalie,
        OSA,
        NSA,
      } = record;

      const skaterSwap = {
        username,
        oldPlayer: oldSkater,
        newPlayer: newSkater,
        osa: parseFloat(OSA),
        nsa: parseFloat(NSA),
      };

      const goalieSwap = {
        username,
        oldPlayer: oldGoalie,
        newPlayer: newGoalie,
        osa: parseFloat(OSA),
        nsa: parseFloat(NSA),
      };

      const swaps = [];

      if (oldSkater.trim() === 'None' && oldGoalie.trim() === 'None') {
        return [];
      } else {
        if (oldSkater && newSkater) {
          swaps.push(skaterSwap);
        }

        if (oldGoalie && newGoalie) {
          swaps.push(goalieSwap);
        }
      }

      return swaps;
    });

    await Promise.all(
      inserts.map((swap) => {
        return new Promise<void>((resolve, reject) => {
          db.run(
            `INSERT INTO swaps (username, old_skater, new_skater, OSA, NSA) VALUES (?, ?, ?, ?, ?)`,
            [swap.username, swap.oldPlayer, swap.newPlayer, swap.osa, swap.nsa],
            (err) => {
              if (err) {
                reject(new Error('Error inserting entry: ' + err.message));
              } else {
                resolve();
              }
            },
          );
        });
      }),
    );
    return true;
  } catch (error) {
    logger.error(error);
    return false;
  }
}
