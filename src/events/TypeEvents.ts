import { ApiDefinitions, AmfShapes } from '@api-client/core/build/browser.js';
import { EventTypes } from './EventTypes.js';
import { ApiStoreContextEvent, ApiStoreReadEvent } from './BaseEvents.js';

export const TypeEvents = {
  /**
   * Lists the type (schema) definitions for the API.
   * @param target The node on which to dispatch the event
   */
  list: async (target: EventTarget): Promise<ApiDefinitions.IApiNodeShapeListItem[]> => {
    const e = new ApiStoreContextEvent(EventTypes.Type.list);
    target.dispatchEvent(e);
    return e.detail.result as Promise<ApiDefinitions.IApiNodeShapeListItem[]>;
  },
  /**
   * Reads a type (schema) from the store.
   * @param target The node on which to dispatch the event
   * @param id The id of the object to read.
   */
  get: async (target: EventTarget, id: string): Promise<AmfShapes.IShapeUnion> => {
    const e = new ApiStoreReadEvent(EventTypes.Type.get, id);
    target.dispatchEvent(e);
    return e.detail.result as Promise<AmfShapes.IShapeUnion>;
  },
};

Object.freeze(TypeEvents);
