import KeyvFile, { makeField } from 'keyv-file';

class DynamicConfigKeyv extends KeyvFile {
  constructor() {
    super({
      filename: './config.json',
      writeDelay: 100,
      encode: JSON.stringify,
      decode: JSON.parse,
      expiredCheckDelay: Infinity,
    });
  }

  currentSeason = makeField<number>(this, 'currentSeason', 0);
  fantasySheetId = makeField<string>(
    this,
    'fantasySheetId',
    '1CpuPOsETOHsasTAePIbREXbi0W_i1MeoPeQQC',
  );
}

export const DynamicConfig = new DynamicConfigKeyv();
