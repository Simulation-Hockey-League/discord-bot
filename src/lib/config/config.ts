const isDevelopment = process.env.NODE_ENV === 'development';

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
      CHI: '<:CHI:1344510698746544188>',
      HAM: '<:HAM:1344510715280621569>',
      MAN: '<:MAN:1344510731261050890>',
      NEW: '<:NEW:1344510755327840346>',
      TBB: '<:TBB:1344510796637536298>',
      TOR: '<:TOR:1344510810608635955>',
      CGY: '<:CGY:1344510691419357204>',
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

      ATL: '<:ATL:PROD_EMOJI_ID>',
      BAP: '<:BAP:PROD_EMOJI_ID>',
      BUF: '<:BUF:PROD_EMOJI_ID>',
      CHI: '<:CHI:PROD_EMOJI_ID>',
      HAM: '<:HAM:PROD_EMOJI_ID>',
      MAN: '<:MAN:PROD_EMOJI_ID>',
      NEW: '<:NEW:PROD_EMOJI_ID>',
      TBB: '<:TBB:PROD_EMOJI_ID>',
      TOR: '<:TOR:PROD_EMOJI_ID>',
      CGY: '<:CGY:PROD_EMOJI_ID>',
      EDM: '<:EDM:PROD_EMOJI_ID>',
      LAP: '<:LAP:PROD_EMOJI_ID>',
      MIN: '<:MIN:PROD_EMOJI_ID>',
      NOLA: '<:NOLA:PROD_EMOJI_ID>',
      SFP: '<:SFP:PROD_EMOJI_ID>',
      SEA: '<:SEA:PROD_EMOJI_ID>',
      TEX: '<:TEX:PROD_EMOJI_ID>',
      WPG: '<:WPG:PROD_EMOJI_ID>',
      MTL: '<:MTL:PROD_EMOJI_ID>',
      PHI: '<:PHI:PROD_EMOJI_ID>',

      YUM: '<:YUM:PROD_EMOJI_ID>',
      ANC: '<:ANC:PROD_EMOJI_ID>',
      CAR: '<:CAR:PROD_EMOJI_ID>',
      COL: '<:COL:PROD_EMOJI_ID>',
      DET: '<:DET:PROD_EMOJI_ID>',
      KEL: '<:KEL:PROD_EMOJI_ID>',
      MET: '<:MET:PROD_EMOJI_ID>',
      NBB: '<:NBB:PROD_EMOJI_ID>',
      NL: '<:NL:PROD_EMOJI_ID>',
      QCC: '<:QCC:PROD_EMOJI_ID>',
      STL: '<:STL:PROD_EMOJI_ID>',
      VAN: '<:VAN:PROD_EMOJI_ID>',
      TBW: '<:TBW:PROD_EMOJI_ID>',
      GFG: '<:GFG:PROD_EMOJI_ID>',
      SDT: '<:SDT:PROD_EMOJI_ID>',
      OTT: '<:OTT:PROD_EMOJI_ID>',

      IIHF_USA: '<:IIHF_USA:PROD_EMOJI_ID>',
      IIHF_GB: '<:IIHF_GB:PROD_EMOJI_ID>',
      IIHF_SWI: '<:IIHF_SWI:PROD_EMOJI_ID>',
      IIHF_NOR: '<:IIHF_NOR:PROD_EMOJI_ID>',
      IIHF_LAT: '<:IIHF_LAT:PROD_EMOJI_ID>',
      IIHF_JAP: '<:IIHF_JAP:PROD_EMOJI_ID>',
      IIHF_IRE: '<:IIHF_IRE:PROD_EMOJI_ID>',
      IIHF_GER: '<:IIHF_GER:PROD_EMOJI_ID>',
      IIHF_FIN: '<:IIHF_FIN:PROD_EMOJI_ID>',
      IIHF_CZH: '<:IIHF_CZH:PROD_EMOJI_ID>',
      IIHF_CAN: '<:IIHF_CAN:PROD_EMOJI_ID>',
      IIHF_FRA: '<:IIHF_FRA:PROD_EMOJI_ID>',
      IIHF_QCC: '<:IIHF_QCC:PROD_EMOJI_ID>',
      IIHF_SWE: '<:IIHF_SWE:PROD_EMOJI_ID>',

      WJC_TBI: '<:WJC_TBI:PROD_EMOJI_ID>',
      WJC_TCB: '<:WJC_RANB:PROD_EMOJI_ID>',
      WJC_TCR: '<:WJC_CANR:PROD_EMOJI_ID>',
      WJC_CZE: '<:WJC_CZE:PROD_EMOJI_ID>',
      WJC_FIN: '<:WJC_FIN:PROD_EMOJI_ID>',
      WJC_NOR: '<:WJC_NOR:PROD_EMOJI_ID>',
      WJC_RAT: '<:WJC_RATVIA:PROD_EMOJI_ID>',
      WJC_RHI: '<:WJC_RHINE:PROD_EMOJI_ID>',
      WJC_SWE: '<:WJC_SWE:PROD_EMOJI_ID>',
      WJC_USB: '<:WJC_USB:PROD_EMOJI_ID>',
      WJC_USW: '<:WJC_USW:PROD_EMOJI_ID>',
      WJC_WRLD: '<:WJC_World:PROD_EMOJI_ID>',
    };
