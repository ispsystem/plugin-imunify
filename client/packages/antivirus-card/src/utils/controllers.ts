import { handleErrors } from '../models/antivirus/actions';
import { endpoint } from '../constants';
import { getNestedObject } from './tools';
import { ISPNotifier } from '@ispsystem/notice-tools';
import { switchMap, catchError, take, map, filter } from 'rxjs/operators';
import { of, Observable, merge, interval, from } from 'rxjs';
import { fromFetch } from 'rxjs/fetch';

/**
 * Payment orders object interface
 */
export interface PaymentOrders {
  last_notify: number;
  list: PaymentOrderItem[];
  size: number;
}

/**
 * One item from Payment orders object
 */
export interface PaymentOrderItem {
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
  status: OrderStatus;
  type: string;
}

/**
 * Order statuses
 */
export enum OrderStatus {
  ACTIVE = 'Active',
  CONFIGURE = 'Configure',
  FAIL = 'Fail',
  INIT = 'Init',
  PAYMENT = 'Payment',
  DELETED = 'Deleted',
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

/**
 * Mark order as deleted
 * @param orderId - order id
 */
export async function markOrderAsDelete(orderId: number): Promise<void> {
  const requestInit: RequestInit = {
    method: 'DELETE',
  };

  await fetch(`${endpoint}/api/isp/market/v3/order/${orderId}`, requestInit);
}

/**
 * Get order info by id
 * @param orderId - order id
 */
export async function getOrderInfo(orderId: number): Promise<PaymentOrderItem> {
  const requestInit: RequestInit = {
    method: 'GET',
  };

  const response = await fetch(`${endpoint}/api/isp/market/v3/order/${orderId}`, requestInit);
  handleErrors(response);
  return response.json();
}

/**
 * Buy PRO antivirus version
 *
 * @param pricelist - tariff identifier
 * @param period - buy period
 * @param notifier - notifier service
 */
export async function purchase(pricelist: string, period: string, notifier: ISPNotifier): Promise<Observable<string | null>> {
  const locationUrl = `${location.origin}${location.pathname}${location.hash}${location.search ? '' : '?'}`;

  const requestInit: RequestInit = {
    method: 'POST',
    body: JSON.stringify({
      pricelist,
      period,
      fail_url: locationUrl + 'payment=failed&order_id={order_id}',
      pending_url: locationUrl + 'payment=pending&order_id={order_id}',
      success_url: locationUrl + 'payment=success&order_id={order_id}',
    }),
  };

  const response = await fetch(`${endpoint}/api/isp/market/v3/service/plugin/purchase`, requestInit);
  handleErrors(response);
  const json: { id: number; order_id: number; task: number } = await response.json();

  // common processing function for payment order
  const getOrderLink = (paymentOrder: PaymentOrderItem): string => {
    if (paymentOrder.status === 'Payment' && typeof paymentOrder.payment_link === 'string') {
      return paymentOrder.payment_link;
    } else if (paymentOrder.status === 'Fail') {
      throw { paymentOrder };
    }
  };

  // get order info hard with simple request to market (need if we didn't get order info with notifier)
  const intervalGetPaymentLink$ = interval(4000).pipe(
    switchMap(() => getPaymentOrders().toPromise()),
    map(paymentOrders => {
      const paymentOrder = (paymentOrders.list || []).find(paymentOrder => paymentOrder.id === json.order_id);
      if (paymentOrder !== undefined) {
        return getOrderLink(paymentOrder);
      }
    }),
  );

  // base subscribe to market orders
  const notifyGetPaymentLink$ = from(notifier.getEvents('market_order', json.order_id, 'update').toPromise()).pipe(
    filter(notifyEvent => getNestedObject(notifyEvent, ['data', 'id']) === json.order_id),
    switchMap(notifyEvent => of(getOrderLink(notifyEvent.data))),
  );

  return merge(intervalGetPaymentLink$, notifyGetPaymentLink$).pipe(
    filter(l => typeof l === 'string'),
    take(1),
  );
}
