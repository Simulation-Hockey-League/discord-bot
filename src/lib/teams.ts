import { LeagueType } from 'src/db/index/shared';

import { botEmojis } from './config/config';

export type TeamInfo = {
  teamID: number;
  fullName: string;
  nameRegex: RegExp;
  logoUrl: string;
  emoji: string;
  leagueType: LeagueType;
};

export const Teams = Object.freeze({
  ATLANTA: {
    teamID: 18,
    fullName: 'Atlanta Inferno',
    nameRegex: /atlanta|atl|inferno/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/786280894495195136/atl.png',
    leagueType: LeagueType.SHL,
    emoji: botEmojis.ATL,
  },
  BALTIMORE: {
    teamID: 7,
    fullName: 'Baltimore Platoon',
    nameRegex: /baltimore|bap|platoon/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/786280902799261736/bap.png',
    leagueType: LeagueType.SHL,
    emoji: botEmojis.BAP,
  },
  BUFFALO: {
    teamID: 0,
    fullName: 'Buffalo Stampede',
    nameRegex: /buffalo|buf|stampede/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/786280906683973632/buf.png',
    leagueType: LeagueType.SHL,
    emoji: botEmojis.BUF,
  },
  CHICAGO: {
    teamID: 1,
    fullName: 'Chicago Syndicate',
    nameRegex: /chicago|chi|syndicate/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/786280910928085002/chi.png',
    leagueType: LeagueType.SHL,
    emoji: botEmojis.CHI,
  },
  HAMILTON: {
    teamID: 2,
    fullName: 'Hamilton Steelhawks',
    nameRegex: /hamilton|ham|steelhawks/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/786290158977810552/ham.png',
    leagueType: LeagueType.SHL,
    emoji: botEmojis.HAM,
  },
  MANHATTAN: {
    teamID: 4,
    fullName: 'Manhattan Rage',
    nameRegex: /manhattan|man|rage/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/786281401782763550/man.png',
    leagueType: LeagueType.SHL,
    emoji: botEmojis.MAN,
  },
  NEW_ENGLAND: {
    teamID: 5,
    fullName: 'New England Wolfpack',
    nameRegex: /new|(new england)|wolfpack/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/786281422565408788/new.png',
    leagueType: LeagueType.SHL,
    emoji: botEmojis.NEW,
  },
  TAMPA: {
    teamID: 6,
    fullName: 'Tampa Bay Barracuda',
    nameRegex: /tampa|tbb|barracuda/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/830574109934747669/tbb.png',
    leagueType: LeagueType.SHL,
    emoji: botEmojis.TBB,
  },
  TORONTO: {
    teamID: 3,
    fullName: 'Toronto North Stars',
    nameRegex: /tor|toronto|stars/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/786281382753075200/tor.png',
    leagueType: LeagueType.SHL,
    emoji: botEmojis.TOR,
  },
  CALGARY: {
    teamID: 8,
    fullName: 'Calgary Dragons',
    nameRegex: /calgary|cgy|dragons/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/804599067278704670/cgy.png',
    leagueType: LeagueType.SHL,
    emoji: botEmojis.CGY,
  },
  EDMONTON: {
    teamID: 9,
    fullName: 'Edmonton Blizzard',
    nameRegex: /edmonton|edm|blizzard/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/786280915415334912/edm.png',
    leagueType: LeagueType.SHL,
    emoji: botEmojis.EDM,
  },
  LOS_ANGELES: {
    teamID: 13,
    fullName: 'Los Angeles Panthers',
    nameRegex: /lap|(los angeles)|panthers/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/830574039567302727/lap.png',
    leagueType: LeagueType.SHL,
    emoji: botEmojis.LAP,
  },
  MINNESOTA: {
    teamID: 10,
    fullName: 'Minnesota Monarchs',
    nameRegex: /minnesota|minny|min|monarchs/i,
    logoUrl:
      'https://media.discordapp.net/attachments/744955239114997801/1257738798792708278/Kv2hU7B.png',
    leagueType: LeagueType.SHL,
    emoji: botEmojis.MIN,
  },
  NEW_ORLEANS: {
    teamID: 14,
    fullName: 'New Orleans Specters',
    nameRegex: /nola|nol|(new orleans)|specters/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/786281429851308073/nola.png',
    leagueType: LeagueType.SHL,
    emoji: botEmojis.NOLA,
  },
  SAN_FRANCISCO: {
    teamID: 12,
    fullName: 'San Francisco Pride',
    nameRegex: /sfp|(san francisco)|pride/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/786281366853255208/sfp.png',
    leagueType: LeagueType.SHL,
    emoji: botEmojis.SFP,
  },
  SEATTLE: {
    teamID: 19,
    fullName: 'Seattle Argonauts',
    nameRegex: /seattle|sea|argonauts/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/786281436604137482/sea.png',
    leagueType: LeagueType.SHL,
    emoji: botEmojis.SEA,
  },
  TEXAS: {
    teamID: 15,
    fullName: 'Texas Renegades',
    nameRegex: /tex|texas|renegades/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/786281377850589184/tex.png',
    leagueType: LeagueType.SHL,
    emoji: botEmojis.TEX,
  },
  WINNIPEG: {
    teamID: 11,
    fullName: 'Winnipeg Aurora',
    nameRegex: /winnipeg|wpg|aurora/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/992992181411401738/wpg.png',
    leagueType: LeagueType.SHL,
    emoji: botEmojis.WPG,
  },
  MONTREAL: {
    teamID: 20,
    fullName: 'Montreal Patriotes',
    nameRegex: /mon|mtl|montreal|patriotes|patriots/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/992992505459126272/mtl.png',
    leagueType: LeagueType.SHL,
    emoji: botEmojis.MTL,
  },
  PHILADELPHIA: {
    teamID: 21,
    fullName: 'Philadelphia Forge',
    nameRegex: /phi|philadelphia|philly|forge/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/744955239114997801/1257738649773146143/sonwiVV.png',
    leagueType: LeagueType.SHL,
    emoji: botEmojis.PHI,
  },

  // SMJHL
  YUKON: {
    teamID: 5,
    fullName: 'Yukon Malamutes',
    nameRegex: /yukon|yum|yuk|malamutes/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/978053209199366194/Malamutes.png',
    leagueType: LeagueType.SMJHL,
    emoji: botEmojis.YUM,
  },
  ANCHORAGE: {
    teamID: 0,
    fullName: 'Anchorage Armada',
    nameRegex: /anchorage|anc|armada/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/786290342495256627/anc.png',
    leagueType: LeagueType.SMJHL,
    emoji: botEmojis.ANC,
  },
  CAROLINA: {
    teamID: 9,
    fullName: 'Carolina Kraken',
    nameRegex: /carolina|car|kraken/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/786280907833212928/car.png',
    leagueType: LeagueType.SMJHL,
    emoji: botEmojis.CAR,
  },
  COLORADO: {
    teamID: 6,
    fullName: 'Colorado Raptors',
    nameRegex: /colorado|col|raptors/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/830573975423811614/col.png',
    leagueType: LeagueType.SMJHL,
    emoji: botEmojis.COL,
  },
  DETROIT: {
    teamID: 7,
    fullName: 'Detroit Falcons',
    nameRegex: /detroit|det|falcons/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/786280913746264094/det.png',
    leagueType: LeagueType.SMJHL,
    emoji: botEmojis.DET,
  },
  KELOWNA: {
    teamID: 1,
    fullName: 'Kelowna Knights',
    nameRegex: /kelowna|kel|knights/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/786281054293590046/kel.png',
    leagueType: LeagueType.SMJHL,
    emoji: botEmojis.KEL,
  },
  MAINE: {
    teamID: 2,
    fullName: 'Maine Timber',
    nameRegex: /maine|met|timber/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/786281402844053574/met.png',
    leagueType: LeagueType.SMJHL,
    emoji: botEmojis.MET,
  },
  NEVADA: {
    teamID: 14,
    fullName: 'Nevada Battleborn',
    nameRegex: /nevada|nbb|battleborn/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/859176692013334548/nbb.png',
    leagueType: LeagueType.SMJHL,
    emoji: botEmojis.NBB,
  },
  NEWFOUNDLAND: {
    teamID: 4,
    fullName: 'Newfoundland Berserkers',
    nameRegex: /newfoundland|nl|berserkers/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/786281425946017842/nl.png',
    leagueType: LeagueType.SMJHL,
    emoji: botEmojis.NL,
  },
  QUEBEC: {
    teamID: 15,
    fullName: 'Quebec City Citadelles',
    nameRegex: /quebec|qcc|citadelles/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/786281433132040202/qcc.png',
    leagueType: LeagueType.SMJHL,
    emoji: botEmojis.QCC,
  },
  ST_LOUIS: {
    teamID: 8,
    fullName: 'St. Louis Scarecrows',
    nameRegex: /(st louis)|stl|scarecrows/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/786281370367688714/stl.png',
    leagueType: LeagueType.SMJHL,
    emoji: botEmojis.STL,
  },
  VANCOUVER: {
    teamID: 3,
    fullName: 'Vancouver Whalers',
    nameRegex: /vancouver|van|whalers/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/786290849302315008/van.png',
    leagueType: LeagueType.SMJHL,
    emoji: botEmojis.VAN,
  },
  THUNDER_BAY: {
    teamID: 16,
    fullName: 'Thunder Bay Walleye',
    nameRegex: /(thunder bay)|TBW|walleye/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/711007308846596100/1344388001412808906/Thunder_Bay_Walleye.png',
    leagueType: LeagueType.SMJHL,
    emoji: botEmojis.TBW,
  },
  GREAT_FALLS: {
    teamID: 17,
    fullName: 'Great Falls Grizzlies',
    nameRegex: /(great falls)|gfg|grizzlies/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/880183060199534673/gfg.png',
    leagueType: LeagueType.SMJHL,
    emoji: botEmojis.GFG,
  },
  SAN_DIEGO: {
    teamID: 19,
    fullName: 'San Diego Tidal',
    nameRegex: /(san diego)|sdt|tidal/i,
    logoUrl:
      'https://media.discordapp.net/attachments/1219423597492310126/1222236845719425074/SanDiegoTidal_finished.png',
    leagueType: LeagueType.SMJHL,
    emoji: botEmojis.SDT,
  },
  OTTAWA: {
    teamID: 18,
    fullName: 'Ottawa Highlanders',
    nameRegex: /ottawa|ott|highlanders/i,
    logoUrl:
      'https://media.discordapp.net/attachments/1152983677685469204/1219793270650048714/HighlandersMascotLogo.png',
    leagueType: LeagueType.SMJHL,
    emoji: botEmojis.OTT,
  },

  // IIHF
  TEAM_CANADA: {
    teamID: 5,
    fullName: 'Team Canada',
    nameRegex: /team canada/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/786290158977810552/ham.png',
    leagueType: LeagueType.IIHF,
    emoji: botEmojis.IIHF_CAN,
  },
  TEAM_USA: {
    teamID: 11,
    fullName: 'Team USA',
    nameRegex: /team usa/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/1162742189470781523/1344825061168644156/USA.png',
    leagueType: LeagueType.IIHF,
    emoji: botEmojis.IIHF_USA,
  },
  TEAM_GB: {
    teamID: 1,
    fullName: 'Team Great Britain',
    nameRegex: /team great britain/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/1162742189470781523/1344825060837298176/United_Kingdom.png',
    leagueType: LeagueType.IIHF,
    emoji: botEmojis.IIHF_GB,
  },
  TEAM_SWITZERLAND: {
    teamID: 10,
    fullName: 'Team Switzerland',
    nameRegex: /team switzerland/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/1162742189470781523/1344825060451549205/Switzerland.png',
    leagueType: LeagueType.IIHF,
    emoji: botEmojis.IIHF_SWI,
  },
  TEAM_NORWAY: {
    teamID: 14,
    fullName: 'Team Norway',
    nameRegex: /team norway/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/1162742189470781523/1344825059679801365/Norway.png',
    leagueType: LeagueType.IIHF,
    emoji: botEmojis.IIHF_NOR,
  },
  TEAM_LATVIA: {
    teamID: 13,
    fullName: 'Team Latvia',
    nameRegex: /team latvia/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/1162742189470781523/1344825059185004588/Latvia.png',
    leagueType: LeagueType.IIHF,
    emoji: botEmojis.IIHF_LAT,
  },
  TEAM_JAPAN: {
    teamID: 12,
    fullName: 'Team Japan',
    nameRegex: /team japan/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/1162742189470781523/1344825058782347336/Japan.png',
    leagueType: LeagueType.IIHF,
    emoji: botEmojis.IIHF_JAP,
  },
  TEAM_IRELAND: {
    teamID: 2,
    fullName: 'Team Ireland',
    nameRegex: /team ireland/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/1162742189470781523/1344824992285593610/Ireland.png',
    leagueType: LeagueType.IIHF,
    emoji: botEmojis.IIHF_IRE,
  },
  TEAM_GERMANY: {
    teamID: 0,
    fullName: 'Team Germany',
    nameRegex: /team germany/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/1162742189470781523/1344824991899975700/Germany.png',
    leagueType: LeagueType.IIHF,
    emoji: botEmojis.IIHF_GER,
  },
  TEAM_FINLAND: {
    teamID: 7,
    fullName: 'Team Finland',
    nameRegex: /team finland/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/1162742189470781523/1344824990859661343/Finland.png',
    leagueType: LeagueType.IIHF,
    emoji: botEmojis.IIHF_FIN,
  },
  TEAM_CZECH: {
    teamID: 6,
    fullName: 'Team Czech',
    nameRegex: /team czech/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/1162742189470781523/1344824990603939840/Czechia.png',
    leagueType: LeagueType.IIHF,
    emoji: botEmojis.IIHF_CZH,
  },
  TEAM_FRANCE: {
    teamID: 4,
    fullName: 'Team France',
    nameRegex: /team france/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/1162742189470781523/1344828758443692092/fra_logo-Photoroom.png',
    leagueType: LeagueType.IIHF,
    emoji: botEmojis.IIHF_FRA,
  },
  TEAM_QUEBEC: {
    teamID: 8,
    fullName: 'Team Quebec',
    nameRegex: /team quebec/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/1254464263553159268/1344830612883640333/QBC_Logo.png',
    leagueType: LeagueType.IIHF,
    emoji: botEmojis.IIHF_QCC,
  },
  TEAM_SWEDEN: {
    teamID: 9,
    fullName: 'Team Sweden',
    nameRegex: /team sweden/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/1139522688805777469/1344840858847150112/IIHF_Sweden.png',
    leagueType: LeagueType.IIHF,
    emoji: botEmojis.IIHF_SWE,
  },

  WJC_BRITISH_ISLES: {
    teamID: 0,
    fullName: 'Team British Isles',
    nameRegex: /team british isles/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/1344835291122499674/1344842458869268551/BritishIsles.png',
    leagueType: LeagueType.WJC,
    emoji: botEmojis.WJC_TBI,
  },
  WJC_USB: {
    teamID: 1,
    fullName: 'Team United States Blue',
    nameRegex: /team united states blue/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/1344835291122499674/1344835405912080454/team_united_states_blue.png',
    leagueType: LeagueType.WJC,
    emoji: botEmojis.WJC_USB,
  },
  WJC_RAT: {
    teamID: 2,
    fullName: 'Team Ratvia',
    nameRegex: /team ratvia/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/1344835291122499674/1344835403621859448/team_rativa.png_NEW.png',
    leagueType: LeagueType.WJC,
    emoji: botEmojis.WJC_RAT,
  },
  WJC_WORLD: {
    teamID: 4,
    fullName: 'Team World',
    nameRegex: /team world/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/1344835291122499674/1344835407837401158/TeamWorld.png',
    leagueType: LeagueType.WJC,
    emoji: botEmojis.WJC_WRLD,
  },
  WJC_CANADA_RED: {
    teamID: 5,
    fullName: 'Team Canada Red',
    nameRegex: /team canada red/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/1344835291122499674/1344835369367240847/team_canada_red.png',
    leagueType: LeagueType.WJC,
    emoji: botEmojis.WJC_TCR,
  },
  WJC_FINLAND: {
    teamID: 6,
    fullName: 'Team Finland',
    nameRegex: /team finland/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/1344835291122499674/1344835370138730537/team_finland.png',
    leagueType: LeagueType.WJC,
    emoji: botEmojis.WJC_FIN,
  },
  WJC_USA_WHITE: {
    teamID: 7,
    fullName: 'Team USA White',
    nameRegex: /team usa white/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/1344835291122499674/1344835406230978600/team_united_states_white.png',
    leagueType: LeagueType.WJC,
    emoji: botEmojis.WJC_USW,
  },
  WJC_RHINE: {
    teamID: 9,
    fullName: 'Team Rhine',
    nameRegex: /team rhine/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/1344835291122499674/1344835404406460549/team_rhine.png',
    leagueType: LeagueType.WJC,
    emoji: botEmojis.WJC_RHI,
  },
  WJC_CANADA_BLACK: {
    teamID: 12,
    fullName: 'Team Canada Black',
    nameRegex: /team canada black/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/1344835291122499674/1344835369119780864/team_canada_black.png',
    leagueType: LeagueType.WJC,
    emoji: botEmojis.WJC_TCB,
  },
  WJC_SWEDEN: {
    teamID: 13,
    fullName: 'Team Sweden',
    nameRegex: /team sweden/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/1344835291122499674/1344835404800720947/team_sweden.png',
    leagueType: LeagueType.WJC,
    emoji: botEmojis.WJC_SWE,
  },
  WJC_NORWAY: {
    teamID: 14,
    fullName: 'Team Norway',
    nameRegex: /team norway/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/1344835291122499674/1344835371137241249/team_norway.png',
    leagueType: LeagueType.WJC,
    emoji: botEmojis.WJC_NOR,
  },
  WJC_CZECHIA: {
    teamID: 15,
    fullName: 'Team Czechia',
    nameRegex: /team czechia/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/1344835291122499674/1344835369597665311/team_czechia.png',
    leagueType: LeagueType.WJC,
    emoji: botEmojis.WJC_CZE,
  },
} satisfies Record<string, TeamInfo>);

export const findTeamByName = (teamName: string): TeamInfo | undefined => {
  if (!teamName) return undefined;
  return Object.values(Teams).find((team) => team.nameRegex.test(teamName));
};
export const findTeamByID = (teamID: number, league: LeagueType) => {
  if (teamID === undefined || teamID === null) return undefined;
  return Object.values(Teams).find(
    (team) => team.teamID === teamID && team.leagueType === league,
  );
};
