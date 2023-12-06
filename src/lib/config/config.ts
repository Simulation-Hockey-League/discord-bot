const isDevelopment = process.env.NODE_ENV === 'development';

export const Config = {
  indexApiUrlV1: `https://index.simulationhockey.com/api/v1`,
  indexApiUrlV2: `https://index.simulationhockey.com/api/v2`,
  portalApiUrl: `https://index.simulationhockey.com/portal`,
  googleSheetUrl: (sheetId: string) =>
    `https://docs.google.com/spreadsheets/d/${sheetId}`,
  devTeamIds: [
    '188350850530410497', // esilverm
    '85935575793688576', //  downer
    '330186318921334784', // caltroit
    '102175890393288704', // luke
    '176202363089059840', // teddy
  ],
  indexUpdateServerId: isDevelopment
    ? process.env.TEST_SERVER_ID
    : '602893231621144586',
  indexUpdateChannelId: isDevelopment
    ? process.env.TEST_CHANNEL_ID
    : '816772168045953084',
  fantasy: {
    noSwapName: 'None',
    ranges: {
      index: 'Index!A1:Q164',
      global: 'Global!D4:E323',
      categories: 'Categories!C3:Z324',
      team: (groupNumber: number) => `${groupNumber}!C17:V167`,
    },
  },
};
