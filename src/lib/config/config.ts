import { LeagueType } from 'src/db/index/shared';

const isDevelopment = process.env.NODE_ENV === 'development';

export const inviteLink =
  'https://discord.com/oauth2/authorize?client_id=1344493590461808650&permissions=414464723008&integration_type=0&scope=bot+applications.commands';

export const Config = {
  indexApiUrlV1: `https://index.simulationhockey.com/api/v1`,
  indexApiUrlV2: `https://index.simulationhockey.com/api/v2`,
  portalApiUrl: `https://portal.simulationhockey.com/api/v1`,
  googleSheetUrl: (sheetId: string) =>
    `https://docs.google.com/spreadsheets/d/${sheetId}`,
  devTeamIds: [
    '188350850530410497', // esilverm
    '85935575793688576', //  downer
    '330186318921334784', // caltroit
    '102175890393288704', // luke
    '176202363089059840', // teddy
    '225009798846873600', // lemonoppy
  ],
  indexUpdateServerId: isDevelopment
    ? process.env.TEST_SERVER_ID
    : '602893231621144586',
  indexUpdateChannelId: isDevelopment
    ? process.env.TEST_CHANNEL_ID
    : '816772168045953084',
  botErrorChannelId: '1257895502234783905',
  fantasy: {
    noSwapName: 'None',
    ranges: {
      index: 'Index!A1:Q164',
      global: 'Global!D4:E323',
      categories: 'Categories!C3:Z324',
      team: (groupNumber: number) => `${groupNumber}!C17:V167`,
    },
  },
  leagues: {
    shl: {
      id: 0,
      logoUrl: 'https://i.imgur.com/16bLqHF.png',
      cupName: 'Challenge Cup',
    },
    smjhl: {
      id: 1,
      logoUrl: 'https://i.imgur.com/7M65irp.png',
      cupName: 'Four Star Cup',
    },
    iihf: {
      id: 2,
      logoUrl: 'https://i.imgur.com/7BeajZI.png',
      cupName: '',
    },
    wjc: {
      id: 3,
      logoUrl: 'https://i.imgur.com/aK7iEjI.png',
      cupName: '',
    },
  },
};

export const skaterRookieCutoffs = [
  { league: LeagueType.SHL, gamesPlayed: 15 },
  { league: LeagueType.SMJHL, gamesPlayed: 20 },
  { league: LeagueType.IIHF, gamesPlayed: 1 },
  { league: LeagueType.WJC, gamesPlayed: 1 },
] as const;

export const goalieRookieCutoffs = [
  { league: LeagueType.SHL, gamesPlayed: 12 },
  { league: LeagueType.SMJHL, gamesPlayed: 12 },
  { league: LeagueType.IIHF, gamesPlayed: 1 },
  { league: LeagueType.WJC, gamesPlayed: 1 },
];

export enum UserRole {
  REGULAR = 0,
  SERVER_ADMIN = 1,
  BOT_OWNERS = 2,
}

export const botEmojis = isDevelopment
  ? {
      // Development Bot

      //Misc Emojis
      win: '<:Win:1343076655765389342>',
      loss: '<:Loss:1343076631128051772>',
      otl: '<:OTL:1343076600853299312>',

      ATL: '<:ATL:1344510664470958080>',
      BAP: '<:BAP:1344510675376013322>',
      BUF: '<:BUF:1344510682804260964>',
      CGY: '<:CGY:1344510691419357204>',
      CHI: '<:CHI:1344510698746544188>',
      HAM: '<:HAM:1344510715280621569>',
      MAN: '<:MAN:1344510731261050890>',
      NEW: '<:NEW:1344510755327840346>',
      TBB: '<:TBB:1344510796637536298>',
      TOR: '<:TOR:1344510810608635955>',
      EDM: '<:EDM:1344510707621953567>',
      LAP: '<:LAP:1344510723740532838>',
      MIN: '<:MIN:1344510738928238723>',
      NOLA: '<:NOLA:1344510762445439047>',
      SFP: '<:SFP:1344510786885910570>',
      SEA: '<:SEA:1344510778300170262>',
      TEX: '<:TEX:1344510804099207318>',
      WPG: '<:WPG:1344510818477277184>',
      MTL: '<:MTL:1344510749158146068>',
      PHI: '<:PHI:1344510770263625748>',

      YUM: '<:YUM:1344511930789793894>',
      ANC: '<:ANC:1344511185235738717>',
      CAR: '<:CAR:1344512082401300501>',
      COL: '<:COL:1344511205330522113>',
      DET: '<:DET:1344511212360171612>',
      KEL: '<:KEL:1344511908237152369>',
      MET: '<:MET:1344511239295995954>',
      NBB: '<:NBB:1344511194731515925>',
      NL: '<:NL:1344511248380985375>',
      QCC: '<:QCC:1344512155206291528>',
      STL: '<:STL:1344511274582540381>',
      VAN: '<:VAN:1344512204728176640>',
      TBW: '<:TBW:1344511283805818941>',
      GFG: '<:GFG:1344511880638496930>',
      SDT: '<:SDT:1344511290441207809>',
      OTT: '<:OTT:1344511255058317414>',

      IIHF_USA: '<:IIHF_USA:1344826795794366586>',
      IIHF_GB: '<:IIHF_GB:1344826787603026052>',
      IIHF_SWI: '<:IIHF_SWI:1344826776911872061>',
      IIHF_NOR: '<:IIHF_NOR:1344826742560391279>',
      IIHF_LAT: '<:IIHF_LAT:1344826734544949248>',
      IIHF_JAP: '<:IIHF_JAP:1344826725456150628>',
      IIHF_IRE: '<:IIHF_IRE:1344826716471951442>',
      IIHF_GER: '<:IIHF_GER:1344827722119122974>',
      IIHF_FIN: '<:IIHF_FIN:1344826699585556501>',
      IIHF_CZH: '<:IIHF_CZH:1344826691712712734>',
      IIHF_CAN: '<:IIHF_CAN:1344826682217074710>',
      IIHF_FRA: '<:IIHF_FRA:1344828360425214083>',
      IIHF_QCC: '<:IIHF_QCC:1344831338842296330>',
      IIHF_SWE: '<:WJC_SWE:1344835597713281135>',

      WJC_TBI: '<:WJC_TBI:1344840272575729825>',
      WJC_TCB: '<:WJC_RANB:1344835496945258516>',
      WJC_TCR: '<:WJC_CANR:1344835511025406012>',
      WJC_CZE: '<:WJC_CZE:1344835520043286613>',
      WJC_FIN: '<:WJC_FIN:1344835540129943714>',
      WJC_NOR: '<:WJC_NOR:1344835573478592652>',
      WJC_RAT: '<:WJC_RATVIA:1344835581632315493>',
      WJC_RHI: '<:WJC_RHINE:1344835589370810491>',
      WJC_SWE: '<:WJC_SWE:1344835597713281135>',
      WJC_USB: '<:WJC_USB:1344835624095711313>',
      WJC_USW: '<:WJC_USW:1344835632932978753>',
      WJC_WRLD: '<:WJC_World:1344835658266706025>',
    }
  : {
      // Production Bot

      //Misc Emojis
      win: '<:win:1344495116861050960>',
      loss: '<:loss:1344495129729171536>',
      otl: '<:otl:1344495142081658880>',

      ATL: '<:ATL:1344845851834581084>',
      BAP: '<:BAP:1344845859719741460>',
      BUF: '<:BUF:1344845867886055497>',
      CGY: '<:CGY:1344845881270210661>',
      CHI: '<:CHI:1344845888748523672>',
      EDM: '<:EDM:1344845896927674409>',
      HAM: '<:HAM:1344845905031073813>',
      LAP: '<:LAP:1344845913474203769>',
      MTL: '<:MTL:1344845938438438953>',
      MAN: '<:MAN:1344845920591679571>',
      MIN: '<:MIN:1344845928582086768>',
      NEW: '<:NEW:1344845944658727003>',
      NOLA: '<:NOLA:1344845950237151264>',
      PHI: '<:PHI:1344845957073731674>',
      TBB: '<:TBB:1344845978670207028>',
      TOR: '<:TOR:1344845992440234126>',
      SEA: '<:SEA:1344845964342464513>',
      SFP: '<:SFP:1344845970919395351>',
      TEX: '<:TEX:1344845985536282685>',
      WPG: '<:WPG:1344846002976198707>',

      YUM: '<:YUM:1344846159138525256>',
      ANC: '<:ANC:1344846029664682034>',
      CAR: '<:CAR:1344846049554202755>',
      COL: '<:COL:1344846057443557416>',
      DET: '<:DET:1344846064393650296>',
      KEL: '<:KEL:1344846078788374659>',
      MET: '<:MET:1344846089035190444>',
      NBB: '<:NBB:1344846038564864030>',
      NL: '<:NL:1344846101756379267>',
      QCC: '<:QCC:1344846117149474876>',
      STL: '<:STL:1344846127144374283>',
      VAN: '<:VAN:1344846151559548988>',
      TBW: '<:TBW:1344846135159685163>',
      GFG: '<:GFG:1344846072270553138>',
      SDT: '<:SDT:1344846143678578789>',
      OTT: '<:OTT:1344846108974776370>',

      IIHF_USA: '<:IIHF_USA:1344846353498505276>',
      IIHF_GB: '<:IIHF_GB:1344846341268045834>',
      IIHF_SWI: '<:IIHF_SWI:1344846317477957712>',
      IIHF_NOR: '<:IIHF_NOR:1344846292630638602>',
      IIHF_LAT: '<:IIHF_LAT:1344846285932466236>',
      IIHF_JAP: '<:IIHF_JAP:1344846279032967220>',
      IIHF_IRE: '<:IIHF_IRE:1344846271176900628>',
      IIHF_GER: '<:IIHF_GER:1344846256396308521>',
      IIHF_FIN: '<:IIHF_FIN:1344846208950075432>',
      IIHF_CZH: '<:IIHF_CZE:1344846201908101161>',
      IIHF_CAN: '<:IIHF_CAN:1344846194647633972>',
      IIHF_FRA: '<:IIHF_FRA:1344846241506529394>',
      IIHF_QCC: '<:IIHF_QCC:1344846300511993908>',
      IIHF_SWE: '<:IIHF_SWE:1344846264109629490>',

      WJC_TBI: '<:WJC_TBI:1344855135737614347>',
      WJC_TCB: '<:WJC_CAN_BLACK:1344855147683119209>',
      WJC_TCR: '<:WJC_CAN_RED:1344855159297151008>',
      WJC_CZE: '<:WJC_CZE:1344855161738231921>',
      WJC_FIN: '<:WJC_FIN:1344855174329536588>',
      WJC_NOR: '<:WJC_NOR:1344855186061000754>',
      WJC_RAT: '<:WJC_RAT:1344855193099042948>',
      WJC_RHI: '<:WJC_RHINE:1344855199658938379>',
      WJC_SWE: '<:WJC_SWE:1344855206008983673>',
      WJC_USB: '<:WJC_USB:1344855221146353706>',
      WJC_USW: '<:WJC_USW:1344855230910693527>',
      WJC_WRLD: '<:WJC_WRLD:1344855243992731778>',
    };
