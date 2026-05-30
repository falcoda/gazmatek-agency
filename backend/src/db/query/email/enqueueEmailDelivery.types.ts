/** Types generated for queries found in "src/db/query/email/enqueueEmailDelivery.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'EnqueueEmailDelivery' parameters type */
export interface IEnqueueEmailDeliveryParams {
  locale: string;
  payload: Json;
  recipient: string;
  template: string;
}

/** 'EnqueueEmailDelivery' return type */
export interface IEnqueueEmailDeliveryResult {
  id: string;
  status: string;
}

/** 'EnqueueEmailDelivery' query type */
export interface IEnqueueEmailDeliveryQuery {
  params: IEnqueueEmailDeliveryParams;
  result: IEnqueueEmailDeliveryResult;
}

const enqueueEmailDeliveryIR: any = {"usedParamSet":{"template":true,"recipient":true,"locale":true,"payload":true},"params":[{"name":"template","required":true,"transform":{"type":"scalar"},"locs":[{"a":99,"b":108}]},{"name":"recipient","required":true,"transform":{"type":"scalar"},"locs":[{"a":111,"b":121}]},{"name":"locale","required":true,"transform":{"type":"scalar"},"locs":[{"a":124,"b":131}]},{"name":"payload","required":true,"transform":{"type":"scalar"},"locs":[{"a":134,"b":142}]}],"statement":"INSERT INTO email_deliveries (template, recipient, locale, payload, status, next_retry_at)\nVALUES (:template!, :recipient!, :locale!, :payload!, 'pending', NOW())\nRETURNING id, status"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO email_deliveries (template, recipient, locale, payload, status, next_retry_at)
 * VALUES (:template!, :recipient!, :locale!, :payload!, 'pending', NOW())
 * RETURNING id, status
 * ```
 */
export const enqueueEmailDelivery = new PreparedQuery<IEnqueueEmailDeliveryParams,IEnqueueEmailDeliveryResult>(enqueueEmailDeliveryIR);


