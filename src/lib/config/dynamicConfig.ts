import path from 'path';

import KeyvFile, { makeField } from 'keyv-file';

class DynamicConfigKeyv extends KeyvFile {
  constructor() {
    super({
      filename: path.resolve('../../../config.json'),
    });
  }

  currentSeason = makeField<number>(this, 'currentSeason', 0);
  fantasySheetId = makeField<string>(this, 'fantasySheetId', '');
}

export const DynamicConfig = new DynamicConfigKeyv();
