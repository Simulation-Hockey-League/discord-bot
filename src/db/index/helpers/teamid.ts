import { TeamInfo } from 'src/lib/teams';

import { IndexApiClient } from '../api/IndexApiClient';
import { LeagueType } from '../shared';

export const requireFhmTeamId = async (teamInfo: TeamInfo) => {
  const teams = await IndexApiClient.getByTeam(teamInfo).getTeamInfo();
  return teams.find((team) => {
    // IIHF & WJC team names are Team <Location> so we need to look at the location only
    if (
      teamInfo.leagueType === LeagueType.IIHF ||
      teamInfo.leagueType === LeagueType.WJC
    ) {
      return team.location === teamInfo.fullName;
    }
    return team.name === teamInfo.fullName;
  })?.id;
};
