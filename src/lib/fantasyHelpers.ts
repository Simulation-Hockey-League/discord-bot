import axios from 'axios';
import { parse } from 'csv-parse/sync';
import fuzzysort from 'fuzzysort';

const SHEET_ID = '1nBaMmwLlzY6lywBZa4RgXGEsRdYHSM2hA2pRPnVYC3g';
const TAB_GID = '1974887086';
const GROUP_TO_PLAYERS = '1820127588';
const SWAP_SHEET_GID = '1633490752';
const PLAYERS_ONLY = '1680460154';

type GlobalCSVData = {
  'All Players': string;
  Score: string;
  'Group Number': string;
  'Group Rank': string;
  'Global Rank': string;
};

type PlayersCSVData = {
  username: string;
  player: string;
  'player score': string;
};

type SwapsCSVData = {
  Name: string;
  'Old (Skater)': string;
  'New (Skater)': string;
  'Old (Goalie)': string;
  'New (Goalie)': string;
  OSA: string;
  NSA: string;
  OSC: string;
  NSC: string;
  Difference: string;
};

type PlayersOnlyCSVData = {
  playerName: string;
  position: string;
  score: string;
};

export type groupRecords = {
  username: string;
  score: number;
  group: number;
  groupRank: number;
  globalRank: number;
};

export type playersRecords = {
  player: string;
  score: number;
};

export type swapsRecords = {
  oldSkater: string;
  newSkater: string;
  oldGoalie: string;
  newGoalie: string;
  osa: number;
  nsa: number;
  osc: number;
  nsc: number;
  difference: number;
};

export type playersOnlyRecords = {
  playerName: string;
  position: string;
  score: number;
};

export async function fetchGlobalSheetData() {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${TAB_GID}`;
  const { data } = await axios.get(url);
  const records: GlobalCSVData[] = parse(data, {
    columns: true,
    skip_empty_lines: true,
  });

  return records.map((row: GlobalCSVData) => ({
    username: row['All Players'],
    score: parseFloat(row['Score']) || 0,
    group: parseFloat(row['Group Number']) || 0,
    groupRank: parseFloat(row['Group Rank']) || 0,
    globalRank: parseFloat(row['Global Rank']) || 0,
  }));
}

export async function fetchPlayersData(username: string) {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GROUP_TO_PLAYERS}`;
  const { data } = await axios.get(url);
  const records: PlayersCSVData[] = parse(data, {
    columns: true,
    skip_empty_lines: true,
  });

  return records
    .filter((row) => row['username'] === username)
    .map((row) => ({
      player: row['player'],
      score: parseInt(row['player score'], 10) || 0,
    }));
}

export async function fetchSwapsData(username: string) {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${SWAP_SHEET_GID}`;
  const { data } = await axios.get(url);
  const records: SwapsCSVData[] = parse(data, {
    columns: true,
    skip_empty_lines: true,
  });

  return records
    .filter((row) => row['Name'] === username)
    .map((row) => ({
      oldSkater: row['Old (Skater)'],
      newSkater: row['New (Skater)'],
      oldGoalie: row['Old (Goalie)'],
      newGoalie: row['New (Goalie)'],
      osa: parseFloat(row['OSA']) || 0,
      nsa: parseFloat(row['NSA']) || 0,
      osc: parseFloat(row['OSC']) || 0,
      nsc: parseFloat(row['NSC']) || 0,
      difference: parseFloat(row['Difference']) || 0,
    }));
}

export async function fetchPlayersOnlyData(position?: string | null) {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${PLAYERS_ONLY}`;
  const { data } = await axios.get(url);
  const records: PlayersOnlyCSVData[] = parse(data, {
    columns: true,
    skip_empty_lines: true,
  });

  return records
    .filter((row) => !position || row['position'] === position)
    .map((row) => ({
      playerName: row['playerName'],
      position: row['position'],
      score: parseFloat(row['score']) || 0,
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

export const generateLeaderboard = (
  groupPlayers: groupRecords[],
  user: string | null,
): string => {
  return (
    groupPlayers
      .map(
        (p, index) =>
          `${index + 1}.  ${
            p.username === user ? `**${p.username}**` : p.username
          } - ${p.score}`,
      )
      .slice(0, 4)
      .join('\n') +
    '\n' +
    '------\n' +
    groupPlayers
      .slice(4, 8)
      .map(
        (p, index) =>
          `${index + 5}. ${
            p.username === user ? `**${p.username}**` : p.username
          } - ${p.score}`,
      )
      .join('\n')
  );
};
