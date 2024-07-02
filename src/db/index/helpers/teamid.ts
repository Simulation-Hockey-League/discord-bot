import { TeamInfo } from 'src/lib/teams';

import { IndexApiClient } from '../api/IndexApiClient';

export const requireFhmTeamId = async (teamInfo: TeamInfo) => {
  return (await IndexApiClient.getByTeam(teamInfo).getTeamInfo()).find(
    (team) => team.name === teamInfo.fullName,
  )?.id;
};
