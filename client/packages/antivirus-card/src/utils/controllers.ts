import { handleErrors } from '../models/antivirus/actions';
import { endpoint } from '../constants';
import { configureNotifier, getNestedObject } from './tools';
import { ISPNotifier } from '@ispsystem/notice-tools';
import { take, switchMap, catchError } from 'rxjs/operators';
import { of, Observable } from 'rxjs';
import { fromFetch } from 'rxjs/fetch';

/**
 * Buy PRO antivirus version
 *
 * @param pricelist - tariff identifier
 * @param period - buy period
 * @param pluginId - this plugin ID
 * @param notifier - notifier service
 */
export async function purchase(
  pricelist: string,
  period: string,
  pluginId: number,
  notifier: ISPNotifier,
): Promise<Observable<string | null>> {
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

  return notifier.getEvents('market_order', json.order_id, 'update').pipe(
    take(1),
    switchMap(notifyEvent => {
      const paymentLink = getNestedObject(notifyEvent, ['data', 'payment_link']);
      const status = getNestedObject(notifyEvent, ['data', 'status']);

      if (status !== 'Fail' && typeof paymentLink === 'string' && notifyEvent.id === json.order_id) {
        location.replace(paymentLink);
        return of(paymentLink);
      } else {
        throw { status, paymentLink };
      }
    }),
  );
}

/**
 * Payment orders object interface
 */
interface PaymentOrders {
  last_notify: number;
  list: PaymentOrderItem[];
  size: number;
}

/**
 * One item from Payment orders object
 */
interface PaymentOrderItem {
  id: number;
  payment_id: string;
  payment_link: string;
  pricelist_bill_id: string;
  pricelist_identifier: string;
  reason: string | null;
  service_bill_id: string;
  service_id: number;
  service_instance: number;
  service_status: string;
  service_type: string;
  status: string;
  type: string;
}

/**
 * Get list orders for this plugin
 */
export function getPaymentOrders(): Observable<PaymentOrders> {
  return fromFetch(`${endpoint}/api/isp/market/v3/order/plugin/AVP/list?orderby=id DESC&current_instance=true`).pipe(
    switchMap(response => {
      if (response.ok) {
        return response.json();
      } else {
        return of({ error: true, message: `Error ${response.status}` });
      }
    }),
    catchError(error => of({ error: true, message: error.message })),
  );
}
