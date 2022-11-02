import { ApiDefinitions } from '@api-client/core/build/browser.js';
import { EventTypes } from './EventTypes.js';
import { ApiStoreReadEvent, ApiStoreContextEvent } from './BaseEvents.js';

/** @typedef {import('../helpers/api').ApiDocumentation} ApiDocumentation */

export const DocumentationEvents = {
  /**
   * Reads RAML's/OAS's documentation page.
   * @param target The node on which to dispatch the event
   * @param id The domain id of the documentation.
   */
  get: async (target: EventTarget, id: string): Promise<ApiDefinitions.IApiDocumentation> => {
    const e = new ApiStoreReadEvent(EventTypes.Documentation.get, id);
    target.dispatchEvent(e);
    return e.detail.result as Promise<ApiDefinitions.IApiDocumentation>;
  },
  /**
   * Lists the documentation definitions for the API.
   * @param target The node on which to dispatch the event
   * @returns The list of documentations.
   */
  list: async (target: EventTarget): Promise<ApiDefinitions.IApiDocumentation[]> => {
    const e = new ApiStoreContextEvent(EventTypes.Documentation.list);
    target.dispatchEvent(e);
    return e.detail.result as Promise<ApiDefinitions.IApiDocumentation[]>;
  },
}
Object.freeze(DocumentationEvents);
