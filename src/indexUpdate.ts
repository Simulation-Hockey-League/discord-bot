import { REST, Routes } from 'discord.js';
import express from 'express';

import { logger } from 'src/lib/logger';
import { Config } from 'src/utils/config/config';

import { reloadCache } from './utils/reloadCache';

const app = express();
app.use(express.json());

const INDEX_UPDATE_SECRET = process.env.INDEX_UPDATE_SECRET;
const token =
  process.env.NODE_ENV === 'development'
    ? process.env.DEV_TOKEN
    : process.env.TOKEN;

const rest = token ? new REST({ version: '10' }).setToken(token) : null;

app.post('/index-update', async (req, res) => {
  const authHeader = req.get('x-webhook-secret');
  if (!INDEX_UPDATE_SECRET || authHeader !== INDEX_UPDATE_SECRET) {
    logger.warn('Rejected index-update request: bad or missing secret.');
    return res.sendStatus(401);
  }

  const { season, league, link } = req.body ?? {};

  if (!season || !league || !link) {
    logger.warn({ body: req.body }, 'Rejected index-update: missing fields.');
    return res.sendStatus(400);
  }

  logger.info({ season, league, link }, 'Received index update.');

  const channelId = Config.indexUpdateChannelId;
  if (!rest || !channelId) {
    logger.error('Cannot post index update: missing bot token or channel ID.');
    return res.sendStatus(500);
  }

  const reloadResult = await reloadCache(league);

  let message: string;
  if (reloadResult.ok) {
    logger.info({ league }, 'Cache reloaded successfully.');
    message = `Index Updated - Season: ${season} League: ${league} - ${link}`;
    if (reloadResult.fantasyMessage) {
      message += `\n${reloadResult.fantasyMessage}`;
    }
  } else {
    logger.error({ league }, `Cache reload failed: ${reloadResult.error}`);
    message = `Index Update FAILED - Season: ${season} League: ${league} - ${link}\nReason: ${reloadResult.error}`;
  }

  try {
    await rest.post(Routes.channelMessages(channelId), {
      body: { content: message },
    });
    logger.info(
      `Posted index update result for season ${season}, league ${league}.`,
    );
    res.sendStatus(reloadResult.ok ? 200 : 500);
  } catch (error: unknown) {
    logger.error(error, 'Failed to post index update to Discord.');
    res.sendStatus(502);
  }
});

const PORT = Number(Config.indexUpdatePort);

app.listen(PORT, () => {
  logger.info(`Index-update listener running on port ${PORT}.`);
});
