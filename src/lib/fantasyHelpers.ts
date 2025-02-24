import axios from 'axios';
import { parse } from 'csv-parse/sync';
import fuzzysort from 'fuzzysort';
import _ from 'lodash';

const SHEET_ID = '1nBaMmwLlzY6lywBZa4RgXGEsRdYHSM2hA2pRPnVYC3g';
const TAB_GID = '1974887086';
const PLAYER_SHEET_GID = '1820127588';
const SWAP_SHEET_GID = '1633490752';

export async function fetchGlobalSheetData() {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${TAB_GID}`;
  const { data } = await axios.get(url);

  const records: any[] = parse(data, { columns: true, skip_empty_lines: true });

  return records.map((row: Record<string, string>) => ({
    username: row['All Players'],
    score: parseInt(row['Score'], 10) || 0,
    group: parseInt(row['Group Number'], 10) || 0,
    groupRank: parseInt(row['Group Rank'], 10) || 0,
    globalRank: parseInt(row['Global Rank'], 10) || 0,
  }));
}

// Fetch the player data for the user
export async function fetchPlayersData(username: string) {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${PLAYER_SHEET_GID}`;
  const { data } = await axios.get(url);
  const records: any[] = parse(data, { columns: true, skip_empty_lines: true });

  // Filter players by the given username
  return records
    .filter((row) => row['username'] === username)
    .map((row) => ({
      player: row['player'],
      score: parseInt(row['player score'], 10) || 0,
    }));
}

// Fetch the swap data related to the user
export async function fetchSwapsData(username: string) {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${SWAP_SHEET_GID}`;
  const { data } = await axios.get(url);
  const records: any[] = parse(data, { columns: true, skip_empty_lines: true });

  // Filter swap data by the given username
  return records
    .filter((row) => row['Name'] === username)
    .map((row) => ({
      oldSkater: row['Old (Skater)'],
      newSkater: row['New (Skater)'],
      oldGoalie: row['Old (Goalie)'],
      newGoalie: row['New (Goalie)'],
      osa: parseInt(row['OSA'], 10) || 0,
      nsa: parseInt(row['NSA'], 10) || 0,
      osc: parseInt(row['OSC'], 10) || 0,
      nsc: parseInt(row['NSC'], 10) || 0,
      difference: parseInt(row['Difference'], 10) || 0,
    }));
}

export const getUserByFuzzy = async (
  name: string,
  users: {
    username: string;
    score: number;
    group: number;
    globalRank: number;
  }[],
) => {
  const match = fuzzysort.go(name, users, {
    key: 'username',
    limit: 1,
    threshold: -10000,
  });
  return match[0]?.obj as
    | { username: string; score: number; group: number; globalRank: number }
    | undefined;
};
