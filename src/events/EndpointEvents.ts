import { ApiDefinitions } from '@api-client/core/build/browser.js';
import { EventTypes } from './EventTypes.js';
import { ApiStoreContextEvent, ApiStoreReadEvent } from './BaseEvents.js';

/** @typedef {import('../types').ApiEndPointWithOperationsListItem} ApiEndPointWithOperationsListItem */
/** @typedef {import('../helpers/api').ApiEndPoint} ApiEndPoint */

export const EndpointEvents = {
  /**
   * Reads the endpoint model from the store.
   * @param target The node on which to dispatch the event
   * @param id The domain id of the endpoint.
   */
  get: async (target: EventTarget, id: string): Promise<ApiDefinitions.IApiEndPoint> => {
    const e = new ApiStoreReadEvent(EventTypes.Endpoint.get, id);
    target.dispatchEvent(e);
    return e.detail.result as Promise<ApiDefinitions.IApiEndPoint>;
  },
  /**
   * Reads the endpoint model from the store by the path value.
   * @param target The node on which to dispatch the event
   * @param path The path of the endpoint.
   */
  byPath: async (target: EventTarget, path: string): Promise<ApiDefinitions.IApiEndPoint> => {
    const e = new ApiStoreReadEvent(EventTypes.Endpoint.byPath, path);
    target.dispatchEvent(e);
    return e.detail.result as Promise<ApiDefinitions.IApiEndPoint>;
  },
  /**
   * Lists all endpoints with operations included into the result.
   * @param target The node on which to dispatch the event
   */
  list: async (target: EventTarget): Promise<ApiDefinitions.IApiEndPointWithOperationsListItem[]> => {
    const e = new ApiStoreContextEvent(EventTypes.Endpoint.list);
    target.dispatchEvent(e);
    return e.detail.result as Promise<ApiDefinitions.IApiEndPointWithOperationsListItem[]>;
  },
};

Object.freeze(EndpointEvents);
