import { handleErrors } from '../models/antivirus/actions';
import { endpoint } from '../constants';
import { Notifier, NotifierEvent } from '../redux/reducers';
import { configureNotifier, getNestedObject } from './tools';
import { take } from 'rxjs/operators';

/**
 * Buy PRO antivirus version
 *
 * @param presetId - scan options preset Id
 * @param siteId - vepp site ID
 */
export async function purchase(pricelist: string, period: string, pluginId: number, notifier: Notifier): Promise<void> {
  try {
    const searchUrl = location.search.length > 0 ? `${location.search}&` : '?';
    const locationUrl = location.origin + location.pathname + location.hash + searchUrl;

    const requestInit: RequestInit = {
      method: 'POST',
      body: JSON.stringify({
        pricelist,
        period,
        fail_url: locationUrl + 'payment=failed',
        pending_url: location.href,
        success_url: locationUrl + 'payment=success',
      }),
    };

    const response = await fetch(`${endpoint}/api/isp/market/v3/service/plugin/purchase`, requestInit);
    handleErrors(response);
    const json = await response.json();

    configureNotifier(notifier, { plugin: [pluginId], market_order: [json.order_id] });

    notifier
      .getEvents('market_order', json.order_id, 'update')
      .pipe(take(1))
      .subscribe({
        next: async (notifyEvent: NotifierEvent) => {
          console.log('UPDATE market_order', notifyEvent);
          const paymentLink = getNestedObject(notifyEvent, ['data', 'payment_link']);
          if (typeof paymentLink === 'string' && notifyEvent.id === json.order_id) {
            location.replace(paymentLink);
          }
        },
      });
  } catch (error) {
    console.warn(error);
  }
}
