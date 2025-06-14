import fuzzysort from 'fuzzysort';
import { Fantasy_Groups_DB, Global_DB } from 'typings/fantasy';
import { GoalieStats, PlayerStats } from 'typings/statsindex';

export function getSkaterFantasyPoints(playerStats: PlayerStats | GoalieStats) {
  let fantasyPoints = 0;
  if (playerStats.position !== 'G') {
    const skaterStats = playerStats as PlayerStats;
    fantasyPoints += skaterStats.goals * 3.7;
    fantasyPoints += skaterStats.assists * 2.7;
    fantasyPoints += skaterStats.shotsOnGoal * 0.2;
    fantasyPoints += skaterStats.hits * 0.4;
    if (
      playerStats.position === 'C' ||
      playerStats.position === 'LW' ||
      playerStats.position === 'RW'
    ) {
      fantasyPoints += skaterStats.shotsBlocked * 0.3;
    } else {
      fantasyPoints += skaterStats.shotsBlocked * 1;
    }
  } else {
    const goalieStats = playerStats as unknown as GoalieStats;
    fantasyPoints += goalieStats.wins * 5;
    fantasyPoints += goalieStats.shutouts * 5;
    fantasyPoints +=
      (goalieStats.shotsAgainst - goalieStats.goalsAgainst) * 0.1;
  }

  return fantasyPoints;
}

export const getUserByFuzzy = async (
  name: string,
  users: Fantasy_Groups_DB[],
) => {
  const match = fuzzysort.go(name, users, {
    key: 'username',
    limit: 1,
    threshold: -10000,
  });
  const matchedUser = match[0]?.obj;
  if (!matchedUser) return undefined;
  return {
    username: matchedUser.username,
    group_number: matchedUser.group_number,
  };
};

export const generateLeaderboard = (
  groupPlayers: Global_DB[],
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

/*
export const getGroupInfo = (
  groupPlayers: groupRecords[],
  playerData: PlayersCSVData[],
  swapData: swapsRecords[],
) => {
  groupPlayers.forEach((groupPlayer) => {
    const players = playerData.filter(
      (score) =>
        score.username === groupPlayer.username &&
        !swapData.some(
          (swap) =>
            swap.oldSkater === score.player && swap.username === score.username,
        ),
    );
    const filteredSwapData = swapData
      .filter((swap) => swap.username === groupPlayer.username)
      .map((swap) => ({
        ...swap,
        difference: swap.nsc - swap.nsa,
      }));

    const playerScore = players.reduce((sum, player) => sum + player, 0);
    const swapScore = filteredSwapData.reduce(
      (sum, swap) => sum + swap.difference,
      0,
    );

    groupPlayer.score = playerScore + swapScore;
  });
  return groupPlayers;
};
*/
