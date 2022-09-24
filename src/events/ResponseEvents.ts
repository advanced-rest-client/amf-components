import { ApiDefinitions } from '@api-client/core/build/browser.js';
import { EventTypes } from './EventTypes.js';
import { ApiStoreReadEvent } from './BaseEvents.js';

export const ResponseEvents = {
  /**
   * Reads a Response from the store.
   * @param target The node on which to dispatch the event
   * @param id The id of the response to read.
   */
  get: async (target: EventTarget, id: string): Promise<ApiDefinitions.IApiResponse> => {
    const e = new ApiStoreReadEvent(EventTypes.Response.get, id);
    target.dispatchEvent(e);
    return e.detail.result as Promise<ApiDefinitions.IApiResponse>;
  },
}

Object.freeze(ResponseEvents);
