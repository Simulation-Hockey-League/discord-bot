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
