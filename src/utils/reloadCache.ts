// src/utils/cache/reloadCache.ts
import { updateFantasy } from 'src/db/fantasy/updateFantasy';
import {
  IihfIndexApiClient,
  ShlIndexApiClient,
  SmjhlIndexApiClient,
  WjcIndexApiClient,
} from 'src/db/index/api/IndexApiClient';
import { PortalClient } from 'src/db/portal/PortalClient';

export type ReloadableLeague = 'shl' | 'smjhl' | 'iihf' | 'wjc' | 'portal';

export async function reloadCache(
  league: string,
): Promise<
  { ok: true; fantasyMessage?: string } | { ok: false; error: string }
> {
  let fantasyUpdateMessage = '';

  switch (league) {
    case 'shl':
      await ShlIndexApiClient.reload();
      fantasyUpdateMessage = await updateFantasy();
      break;
    case 'smjhl':
      await SmjhlIndexApiClient.reload();
      break;
    case 'iihf':
      await IihfIndexApiClient.reload();
      break;
    case 'wjc':
      await WjcIndexApiClient.reload();
      break;
    case 'portal':
      await PortalClient.reload();
      break;
    default:
      return { ok: false, error: `Invalid reload option: ${league}` };
  }

  return { ok: true, fantasyMessage: fantasyUpdateMessage || undefined };
}
