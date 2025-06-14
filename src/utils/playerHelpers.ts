import { GoalieStats } from 'typings/statsindex';

export const getGSAAInfo = (goalieStats: GoalieStats[]) => {
  const { totalSaves, totalShotsAgainst } = goalieStats.reduce(
    (acc, g) => {
      acc.totalSaves += g.saves;
      acc.totalShotsAgainst += g.shotsAgainst;
      return acc;
    },
    { totalSaves: 0, totalShotsAgainst: 0 },
  );
  const leagueAvgSavePct = totalShotsAgainst
    ? totalSaves / totalShotsAgainst
    : 0;
  return leagueAvgSavePct;
};
