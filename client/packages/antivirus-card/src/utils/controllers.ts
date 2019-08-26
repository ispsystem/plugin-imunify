import { handleErrors } from '../models/antivirus/actions';
import { endpoint } from '../constants';
import { configureNotifier, getNestedObject } from './tools';
import { take } from 'rxjs/operators';
import { ISPNotifier, ISPNotifierEvent } from '@ispsystem/notice-tools';

/**
 * Buy PRO antivirus version
 *
 * @param pricelist - tariff identifier
 * @param period - buy period
 * @param pluginId - this plugin ID
 * @param notifier - notifier service
 */
export async function purchase(pricelist: string, period: string, pluginId: number, notifier: ISPNotifier): Promise<void> {
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
    const json: { id: number; order_id: number; task: number } = await response.json();

    configureNotifier(notifier, { plugin: [pluginId], market_order: [json.order_id] });

    notifier
      .getEvents('market_order', json.order_id, 'update')
      .pipe(take(1))
      .subscribe({
        next: (notifyEvent: ISPNotifierEvent) => {
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