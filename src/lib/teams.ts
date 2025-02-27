import { LeagueType } from 'src/db/index/shared';

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
    emoji: '<:ATL:1344510664470958080>',
  },
  BALTIMORE: {
    teamID: 7,
    fullName: 'Baltimore Platoon',
    nameRegex: /baltimore|bap|platoon/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/786280902799261736/bap.png',
    leagueType: LeagueType.SHL,
    emoji: '<:BAP:1344510675376013322>',
  },
  BUFFALO: {
    teamID: 0,
    fullName: 'Buffalo Stampede',
    nameRegex: /buffalo|buf|stampede/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/786280906683973632/buf.png',
    leagueType: LeagueType.SHL,
    emoji: '<:BUF:1344510682804260964>',
  },
  CHICAGO: {
    teamID: 1,
    fullName: 'Chicago Syndicate',
    nameRegex: /chicago|chi|syndicate/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/786280910928085002/chi.png',
    leagueType: LeagueType.SHL,
    emoji: '<:CHI:1344510698746544188>',
  },
  HAMILTON: {
    teamID: 2,
    fullName: 'Hamilton Steelhawks',
    nameRegex: /hamilton|ham|steelhawks/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/786290158977810552/ham.png',
    leagueType: LeagueType.SHL,
    emoji: '<:HAM:1344510715280621569>',
  },
  MANHATTAN: {
    teamID: 4,
    fullName: 'Manhattan Rage',
    nameRegex: /manhattan|man|rage/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/786281401782763550/man.png',
    leagueType: LeagueType.SHL,
    emoji: '<:MAN:1344510731261050890>',
  },
  NEW_ENGLAND: {
    teamID: 5,
    fullName: 'New England Wolfpack',
    nameRegex: /new|(new england)|wolfpack/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/786281422565408788/new.png',
    leagueType: LeagueType.SHL,
    emoji: '<:NEW:1344510755327840346>',
  },
  TAMPA: {
    teamID: 6,
    fullName: 'Tampa Bay Barracuda',
    nameRegex: /tampa|tbb|barracuda/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/830574109934747669/tbb.png',
    leagueType: LeagueType.SHL,
    emoji: '<:TBB:1344510796637536298>',
  },
  TORONTO: {
    teamID: 3,
    fullName: 'Toronto North Stars',
    nameRegex: /tor|toronto|stars/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/786281382753075200/tor.png',
    leagueType: LeagueType.SHL,
    emoji: '<:TOR:1344510810608635955>',
  },
  CALGARY: {
    teamID: 8,
    fullName: 'Calgary Dragons',
    nameRegex: /calgary|cgy|dragons/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/804599067278704670/cgy.png',
    leagueType: LeagueType.SHL,
    emoji: '<:CGY:1344510691419357204>',
  },
  EDMONTON: {
    teamID: 9,
    fullName: 'Edmonton Blizzard',
    nameRegex: /edmonton|edm|blizzard/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/786280915415334912/edm.png',
    leagueType: LeagueType.SHL,
    emoji: '<:EDM:1344510707621953567>',
  },
  LOS_ANGELES: {
    teamID: 13,
    fullName: 'Los Angeles Panthers',
    nameRegex: /lap|(los angeles)|panthers/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/830574039567302727/lap.png',
    leagueType: LeagueType.SHL,
    emoji: '<:LAP:1344510723740532838>',
  },
  MINNESOTA: {
    teamID: 10,
    fullName: 'Minnesota Monarchs',
    nameRegex: /minnesota|minny|min|monarchs/i,
    logoUrl:
      'https://media.discordapp.net/attachments/744955239114997801/1257738798792708278/Kv2hU7B.png',
    leagueType: LeagueType.SHL,
    emoji: '<:MIN:1344510738928238723>',
  },
  NEW_ORLEANS: {
    teamID: 14,
    fullName: 'New Orleans Specters',
    nameRegex: /nola|nol|(new orleans)|specters/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/786281429851308073/nola.png',
    leagueType: LeagueType.SHL,
    emoji: '<:NOLA:1344510762445439047>',
  },
  SAN_FRANCISCO: {
    teamID: 12,
    fullName: 'San Francisco Pride',
    nameRegex: /sfp|(san francisco)|pride/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/786281366853255208/sfp.png',
    leagueType: LeagueType.SHL,
    emoji: '<:SFP:1344510786885910570>',
  },
  SEATTLE: {
    teamID: 19,
    fullName: 'Seattle Argonauts',
    nameRegex: /seattle|sea|argonauts/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/786281436604137482/sea.png',
    leagueType: LeagueType.SHL,
    emoji: '<:SEA:1344510778300170262>',
  },
  TEXAS: {
    teamID: 15,
    fullName: 'Texas Renegades',
    nameRegex: /tex|texas|renegades/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/786281377850589184/tex.png',
    leagueType: LeagueType.SHL,
    emoji: '<:TEX:1344510804099207318>',
  },
  WINNIPEG: {
    teamID: 11,
    fullName: 'Winnipeg Aurora',
    nameRegex: /winnipeg|wpg|aurora/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/992992181411401738/wpg.png',
    leagueType: LeagueType.SHL,
    emoji: '<:WPG:1344510818477277184>',
  },
  MONTREAL: {
    teamID: 20,
    fullName: 'Montreal Patriotes',
    nameRegex: /mon|mtl|montreal|patriotes|patriots/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/992992505459126272/mtl.png',
    leagueType: LeagueType.SHL,
    emoji: '<:MTL:1344510749158146068>',
  },
  PHILADELPHIA: {
    teamID: 21,
    fullName: 'Philadelphia Forge',
    nameRegex: /phi|philadelphia|philly|forge/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/744955239114997801/1257738649773146143/sonwiVV.png',
    leagueType: LeagueType.SHL,
    emoji: '<:PHI:1344510770263625748>',
  },

  // SMJHL
  YUKON: {
    teamID: 5,
    fullName: 'Yukon Malamutes',
    nameRegex: /yukon|yum|yuk|malamutes/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/978053209199366194/Malamutes.png',
    leagueType: LeagueType.SMJHL,
    emoji: '<:YUM:1344511930789793894>',
  },
  ANCHORAGE: {
    teamID: 0,
    fullName: 'Anchorage Armada',
    nameRegex: /anchorage|anc|armada/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/786290342495256627/anc.png',
    leagueType: LeagueType.SMJHL,
    emoji: '<:ANC:1344511185235738717>',
  },
  CAROLINA: {
    teamID: 9,
    fullName: 'Carolina Kraken',
    nameRegex: /carolina|car|kraken/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/786280907833212928/car.png',
    leagueType: LeagueType.SMJHL,
    emoji: '<:CAR:1344512082401300501>',
  },
  COLORADO: {
    teamID: 6,
    fullName: 'Colorado Raptors',
    nameRegex: /colorado|col|raptors/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/830573975423811614/col.png',
    leagueType: LeagueType.SMJHL,
    emoji: '<:COL:1344511205330522113>',
  },
  DETROIT: {
    teamID: 7,
    fullName: 'Detroit Falcons',
    nameRegex: /detroit|det|falcons/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/786280913746264094/det.png',
    leagueType: LeagueType.SMJHL,
    emoji: '<:DET:1344511212360171612>',
  },
  KELOWNA: {
    teamID: 1,
    fullName: 'Kelowna Knights',
    nameRegex: /kelowna|kel|knights/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/786281054293590046/kel.png',
    leagueType: LeagueType.SMJHL,
    emoji: '<:KEL:1344511908237152369>',
  },
  MAINE: {
    teamID: 2,
    fullName: 'Maine Timber',
    nameRegex: /maine|met|timber/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/786281402844053574/met.png',
    leagueType: LeagueType.SMJHL,
    emoji: '<:MET:1344511239295995954>',
  },
  NEVADA: {
    teamID: 14,
    fullName: 'Nevada Battleborn',
    nameRegex: /nevada|nbb|battleborn/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/859176692013334548/nbb.png',
    leagueType: LeagueType.SMJHL,
    emoji: '<:NBB:1344511194731515925>',
  },
  NEWFOUNDLAND: {
    teamID: 4,
    fullName: 'Newfoundland Berserkers',
    nameRegex: /newfoundland|nl|berserkers/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/786281425946017842/nl.png',
    leagueType: LeagueType.SMJHL,
    emoji: '<:NL:1344511248380985375>',
  },
  QUEBEC: {
    teamID: 15,
    fullName: 'Quebec City Citadelles',
    nameRegex: /quebec|qcc|citadelles/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/786281433132040202/qcc.png',
    leagueType: LeagueType.SMJHL,
    emoji: '<:QCC:1344512155206291528>',
  },
  ST_LOUIS: {
    teamID: 8,
    fullName: 'St. Louis Scarecrows',
    nameRegex: /(st louis)|stl|scarecrows/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/786281370367688714/stl.png',
    leagueType: LeagueType.SMJHL,
    emoji: '<:STL:1344511274582540381>',
  },
  VANCOUVER: {
    teamID: 3,
    fullName: 'Vancouver Whalers',
    nameRegex: /vancouver|van|whalers/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/786290849302315008/van.png',
    leagueType: LeagueType.SMJHL,
    emoji: '<:VAN:1344512204728176640>',
  },
  THUNDER_BAY: {
    teamID: 16,
    fullName: 'Thunder Bay Walleye',
    nameRegex: /(thunder bay)|TBW|walleye/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/711007308846596100/1344388001412808906/Thunder_Bay_Walleye.png',
    leagueType: LeagueType.SMJHL,
    emoji: '<:TBW:1344511283805818941>',
  },
  GREAT_FALLS: {
    teamID: 17,
    fullName: 'Great Falls Grizzlies',
    nameRegex: /(great falls)|gfg|grizzlies/i,
    logoUrl:
      'https://cdn.discordapp.com/attachments/623122991504687104/880183060199534673/gfg.png',
    leagueType: LeagueType.SMJHL,
    emoji: '<:GFG:1344511880638496930>',
  },
  SAN_DIEGO: {
    teamID: 19,
    fullName: 'San Diego Tidal',
    nameRegex: /(san diego)|sdt|tidal/i,
    logoUrl:
      'https://media.discordapp.net/attachments/1219423597492310126/1222236845719425074/SanDiegoTidal_finished.png',
    leagueType: LeagueType.SMJHL,
    emoji: '<:SDT:1344511290441207809>',
  },
  OTTAWA: {
    teamID: 18,
    fullName: 'Ottawa Highlanders',
    nameRegex: /ottawa|ott|highlanders/i,
    logoUrl:
      'https://media.discordapp.net/attachments/1152983677685469204/1219793270650048714/HighlandersMascotLogo.png',
    leagueType: LeagueType.SMJHL,
    emoji: '<:OTT:1344511255058317414>',
  },

  // OTHER
  IIHF_TEAM: {
    teamID: 0,
    fullName: 'Random IIHF Team',
    nameRegex: /randomiihf/i,
    logoUrl: '',
    leagueType: LeagueType.IIHF,
    emoji: '',
  },
  WJC_TEAM: {
    teamID: 0,
    fullName: 'Random WJC Team',
    nameRegex: /randomwjc/i,
    logoUrl: '',
    leagueType: LeagueType.WJC,
    emoji: '',
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
