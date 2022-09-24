import { ApiDefinitions } from '@api-client/core/build/browser.js';
import { EventTypes } from './EventTypes.js';
import { ApiStoreReadEvent } from './BaseEvents.js';

export const OperationEvents = {
  /**
   * Reads the operation from the store.
   * @param target The node on which to dispatch the event
   * @param operationId The domain id of the operation to read.
   * @param endpointId Optional endpoint id. When not set it searches through all endpoints.
   */
  get: async (target: EventTarget, operationId: string, endpointId?: string): Promise<ApiDefinitions.IApiOperation> => {
    const e = new ApiStoreReadEvent(EventTypes.Operation.get, operationId, endpointId);
    target.dispatchEvent(e);
    return e.detail.result as Promise<ApiDefinitions.IApiOperation>;
  },
  /**
   * Reads the operation parent from the store.
   * @param target The node on which to dispatch the event
   * @param operationId The domain id of the operation to read.
   */
  getParent: async (target: EventTarget, operationId: string): Promise<ApiDefinitions.IApiEndPoint> => {
    const e = new ApiStoreReadEvent(EventTypes.Operation.getParent, operationId);
    target.dispatchEvent(e);
    return e.detail.result as Promise<ApiDefinitions.IApiEndPoint>;
  },
};

Object.freeze(OperationEvents);
