import fuzzysort from 'fuzzysort';
import _ from 'lodash';

import { PortalClient } from './PortalClient';

const getUserByFuzzyName = async (name: string) => {
  const allUsers = await PortalClient.getUserInfo();

  const match = fuzzysort.go(name, allUsers, {
    key: 'username',
    limit: 1,
    threshold: -10000,
  });
  return match[0];
};

export const getUserByFuzzy = async (name: string) => {
  const canidates = await Promise.all([getUserByFuzzyName(name)]);
  return _.maxBy(canidates, (candidate) => candidate?.score ?? -1)?.obj;
};
