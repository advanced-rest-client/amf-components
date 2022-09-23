import { ApiDefinitions } from '@api-client/core/build/browser.js';
import { EventTypes } from './EventTypes.js';
import { ApiStoreContextEvent } from './BaseEvents.js';
import { DocumentMeta } from '../types.js';

export const ApiEvents = {
  /**
   * Reads basic info about the API.
   * @param target The node on which to dispatch the event
   */
  summary: async (target: EventTarget): Promise<ApiDefinitions.IApiSummary | undefined> => {
    const e = new ApiStoreContextEvent(EventTypes.Api.summary);
    target.dispatchEvent(e);
    return e.detail.result as Promise<ApiDefinitions.IApiSummary | undefined>;
  },

  /**
   * Reads the current API's protocols.
   * @param target The node on which to dispatch the event
   */
  protocols: async (target: EventTarget): Promise<string[] | undefined> => {
    const e = new ApiStoreContextEvent(EventTypes.Api.protocols);
    target.dispatchEvent(e);
    return e.detail.result as Promise<string[] | undefined>;
  },

  /**
   * Reads the current API's version.
   * @param target The node on which to dispatch the event
   */
  version: async (target: EventTarget): Promise<string | undefined> => {
    const e = new ApiStoreContextEvent(EventTypes.Api.version);
    target.dispatchEvent(e);
    return e.detail.result as Promise<string | undefined>;
  },

  /**
   * Reads the meta information about the currently loaded document from the store.
   * @param target The node on which to dispatch the event
   */
  documentMeta: async (target: EventTarget): Promise<DocumentMeta | undefined> => {
    const e = new ApiStoreContextEvent(EventTypes.Api.documentMeta);
    target.dispatchEvent(e);
    return e.detail.result as Promise<DocumentMeta | undefined>;
  },
}
Object.freeze(ApiEvents);
