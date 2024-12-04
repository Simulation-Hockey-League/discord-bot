import { LeagueType } from 'src/db/index/shared';

export type TeamInfo = {
  fullName: string;
  nameRegex: RegExp;
  logoUrl: string;
  leagueType: LeagueType;
};

export const Teams = Object.freeze({
  ATLANTA: {
    fullName: 'Atlanta Inferno',
    nameRegex: /atlanta|atl|inferno/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/786280894495195136/atl.png',
    leagueType: LeagueType.SHL,
  },
  BALTIMORE: {
    fullName: 'Baltimore Platoon',
    nameRegex: /baltimore|bap|platoon/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/786280902799261736/bap.png',
    leagueType: LeagueType.SHL,
  },
  BUFFALO: {
    fullName: 'Buffalo Stampede',
    nameRegex: /buffalo|buf|stampede/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/786280906683973632/buf.png',
    leagueType: LeagueType.SHL,
  },
  CHICAGO: {
    fullName: 'Chicago Syndicate',
    nameRegex: /chicago|chi|syndicate/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/786280910928085002/chi.png',
    leagueType: LeagueType.SHL,
  },
  HAMILTON: {
    fullName: 'Hamilton Steelhawks',
    nameRegex: /hamilton|ham|steelhawks/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/786290158977810552/ham.png',
    leagueType: LeagueType.SHL,
  },
  MANHATTAN: {
    fullName: 'Manhattan Rage',
    nameRegex: /manhattan|man|rage/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/786281401782763550/man.png',
    leagueType: LeagueType.SHL,
  },
  NEW_ENGLAND: {
    fullName: 'New England Wolfpack',
    nameRegex: /new|(new england)|wolfpack/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/786281422565408788/new.png',
    leagueType: LeagueType.SHL,
  },
  TAMPA: {
    fullName: 'Tampa Bay Barracuda',
    nameRegex: /tampa|tbb|barracuda/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/830574109934747669/tbb.png',
    leagueType: LeagueType.SHL,
  },
  TORONTO: {
    fullName: 'Toronto North Stars',
    nameRegex: /tor|toronto|stars/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/786281382753075200/tor.png',
    leagueType: LeagueType.SHL,
  },
  CALGARY: {
    fullName: 'Calgary Dragons',
    nameRegex: /calgary|cgy|dragons/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/804599067278704670/cgy.png',
    leagueType: LeagueType.SHL,
  },
  EDMONTON: {
    fullName: 'Edmonton Blizzard',
    nameRegex: /edmonton|edm|blizzard/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/786280915415334912/edm.png',
    leagueType: LeagueType.SHL,
  },
  LOS_ANGELES: {
    fullName: 'Los Angeles Panthers',
    nameRegex: /lap|(los angeles)|panthers/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/830574039567302727/lap.png',
    leagueType: LeagueType.SHL,
  },
  MINNESOTA: {
    fullName: 'Minnesota Monarchs',
    nameRegex: /minnesota|minny|min|monarchs/i,
    logoUrl:
      'https://media.discordapp.net/attachments/744955239114997801/1257738798792708278/Kv2hU7B.png',
    leagueType: LeagueType.SHL,
  },
  NEW_ORLEANS: {
    fullName: 'New Orleans Specters',
    nameRegex: /nola|nol|(new orleans)|specters/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/786281429851308073/nola.png',
    leagueType: LeagueType.SHL,
  },
  SAN_FRANCISCO: {
    fullName: 'San Francisco Pride',
    nameRegex: /sfp|(san francisco)|pride/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/786281366853255208/sfp.png',
    leagueType: LeagueType.SHL,
  },
  SEATTLE: {
    fullName: 'Seattle Argonauts',
    nameRegex: /seattle|sea|argonauts/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/786281436604137482/sea.png',
    leagueType: LeagueType.SHL,
  },
  TEXAS: {
    fullName: 'Texas Renegades',
    nameRegex: /tex|texas|renegades/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/786281377850589184/tex.png',
    leagueType: LeagueType.SHL,
  },
  WINNIPEG: {
    fullName: 'Winnipeg Aurora',
    nameRegex: /winnipeg|wpg|aurora/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/992992181411401738/wpg.png',
    leagueType: LeagueType.SHL,
  },
  MONTREAL: {
    fullName: 'Montreal Patriotes',
    nameRegex: /mon|mtl|montreal|patriotes|patriots/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/992992505459126272/mtl.png',
    leagueType: LeagueType.SHL,
  },
  PHILADELPHIA: {
    fullName: 'Philadelphia Forge',
    nameRegex: /phi|philadelphia|philly|forge/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/744955239114997801/1257738649773146143/sonwiVV.png',
    leagueType: LeagueType.SHL,
  },

  // SMJHL
  YUKON: {
    fullName: 'Yukon Malamutes',
    nameRegex: /yukon|yum|yuk|malamutes/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/978053209199366194/Malamutes.png',
    leagueType: LeagueType.SMJHL,
  },
  ANCHORAGE: {
    fullName: 'Anchorage Armada',
    nameRegex: /anchorage|anc|armada/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/786290342495256627/anc.png',
    leagueType: LeagueType.SMJHL,
  },
  CAROLINA: {
    fullName: 'Carolina Kraken',
    nameRegex: /carolina|car|kraken/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/786280907833212928/car.png',
    leagueType: LeagueType.SMJHL,
  },
  COLORADO: {
    fullName: 'Colorado Raptors',
    nameRegex: /colorado|col|raptors/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/830573975423811614/col.png',
    leagueType: LeagueType.SMJHL,
  },
  DETROIT: {
    fullName: 'Detroit Falcons',
    nameRegex: /detroit|det|falcons/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/786280913746264094/det.png',
    leagueType: LeagueType.SMJHL,
  },
  KELOWNA: {
    fullName: 'Kelowna Knights',
    nameRegex: /kelowna|kel|knights/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/786281054293590046/kel.png',
    leagueType: LeagueType.SMJHL,
  },
  MAINE: {
    fullName: 'Maine Timber',
    nameRegex: /maine|met|timber/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/786281402844053574/met.png',
    leagueType: LeagueType.SMJHL,
  },
  NEVADA: {
    fullName: 'Nevada Battleborn',
    nameRegex: /nevada|nbb|battleborn/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/859176692013334548/nbb.png',
    leagueType: LeagueType.SMJHL,
  },
  NEWFOUNDLAND: {
    fullName: 'Newfoundland Berserkers',
    nameRegex: /newfoundland|nl|berserkers/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/786281425946017842/nl.png',
    leagueType: LeagueType.SMJHL,
  },
  QUEBEC: {
    fullName: 'Quebec City Citadelles',
    nameRegex: /quebec|qcc|citadelles/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/786281433132040202/qcc.png',
    leagueType: LeagueType.SMJHL,
  },
  ST_LOUIS: {
    fullName: 'St. Louis Scarecrows',
    nameRegex: /(st louis)|stl|scarecrows/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/786281370367688714/stl.png',
    leagueType: LeagueType.SMJHL,
  },
  VANCOUVER: {
    fullName: 'Vancouver Whalers',
    nameRegex: /vancouver|van|whalers/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/786290849302315008/van.png',
    leagueType: LeagueType.SMJHL,
  },
  REGINA: {
    fullName: 'Regina Elk',
    nameRegex: /regina|reg|elk/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/880182591020474408/reg.png',
    leagueType: LeagueType.SMJHL,
  },
  GREAT_FALLS: {
    fullName: 'Great Falls Grizzlies',
    nameRegex: /(great falls)|gfg|grizzlies/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/880183060199534673/gfg.png',
    leagueType: LeagueType.SMJHL,
  },
  SAN_DIEGO: {
    fullName: 'San Diego Tidal',
    nameRegex: /(san diego)|sdt|tidal/i,
    logoUrl:
      'https://media.discordapp.net/attachments/1219423597492310126/1222236845719425074/SanDiegoTidal_finished.png',
    leagueType: LeagueType.SMJHL,
  },
  OTTAWA: {
    fullName: 'Ottawa Highlanders',
    nameRegex: /ottawa|ott|highlanders/i,
    logoUrl:
      'https://media.discordapp.net/attachments/1152983677685469204/1219793270650048714/HighlandersMascotLogo.png',
    leagueType: LeagueType.SMJHL,
  },

  // OTHER
  IIHF_TEAM: {
    fullName: 'Random IIHF Team',
    nameRegex: /randomiihf/i,
    logoUrl: '',
    leagueType: LeagueType.IIHF,
  },
  WJC_TEAM: {
    fullName: 'Random WJC Team',
    nameRegex: /randomwjc/i,
    logoUrl: '',
    leagueType: LeagueType.WJC,
  },
} satisfies Record<string, TeamInfo>);

export const findTeamByName = (teamName: string): TeamInfo | undefined => {
  if (!teamName) return undefined;
  return Object.values(Teams).find((team) => team.nameRegex.test(teamName));
};
