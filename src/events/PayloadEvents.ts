import { ApiDefinitions } from '@api-client/core/build/browser.js';
import { EventTypes } from './EventTypes.js';
import { ApiStoreReadEvent } from './BaseEvents.js';

export const PayloadEvents = {
  /**
   * Reads a Payload from the store.
   * @param target The node on which to dispatch the event
   * @param id The id of the Payload to read.
   */
  get: async (target: EventTarget, id: string): Promise<ApiDefinitions.IApiPayload> => {
    const e = new ApiStoreReadEvent(EventTypes.Payload.get, id);
    target.dispatchEvent(e);
    return e.detail.result as Promise<ApiDefinitions.IApiPayload>;
  },
}

Object.freeze(PayloadEvents);
