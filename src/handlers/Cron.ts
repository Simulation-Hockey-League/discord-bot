import { CronJob } from 'cron';
import {
  ShlIndexApiClient,
  SmjhlIndexApiClient,
} from 'src/db/index/IndexClient';
import { PortalClient } from 'src/db/portal/PortalClient';
import { logger } from 'src/lib/logger';

// Update this file to add cron jobs as well as initial data for the bot.
module.exports = async () => {
  await Promise.all([
    ShlIndexApiClient.reload(),
    SmjhlIndexApiClient.reload(),
    PortalClient.reload(),
  ]);

  if (process.env.NODE_ENV !== 'production') {
    logger.info('✔ Successfully loaded initial data');
    return;
  }

  new CronJob('0 * * * *', async () => {
    ShlIndexApiClient.reloadIfError();
    SmjhlIndexApiClient.reloadIfError();
  }).start();

  new CronJob('0 */30 * * *', async () => {
    PortalClient.reloadIfError();
  }).start();

  logger.info('✔ Successfully loaded initial data and started cron jobs.');
};
