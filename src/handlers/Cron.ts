import { CronJob } from 'cron';
import {
  ShlIndexApiClient,
  SmjhlIndexApiClient,
} from 'src/db/index/api/IndexApiClient';
import { PortalClient } from 'src/db/portal/PortalClient';
import { logger } from 'src/lib/logger';

// Update this file to add cron jobs as well as initial data for the bot.
module.exports = async () => {
  const results = await Promise.allSettled([
    ShlIndexApiClient.reload(),
    SmjhlIndexApiClient.reload(),
    PortalClient.reload(),
  ]);

  results.forEach((result, i) => {
    const name = ['ShlIndex', 'SmjhlIndex', 'Portal'][i];
    if (result.status === 'rejected') {
      logger.warn(
        `⚠ Failed to load initial data for ${name}: ${result.reason?.message}`,
      );
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    logger.info('✔ Successfully loaded initial data');
    return;
  }

  new CronJob('0 */30 * * *', async () => {
    PortalClient.reloadIfError();
  }).start();

  logger.info('✔ Successfully loaded initial data and started cron jobs.');
};
