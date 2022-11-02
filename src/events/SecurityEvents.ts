import { ApiDefinitions } from '@api-client/core/build/browser.js';
import { EventTypes } from './EventTypes.js';
import { ApiStoreContextEvent, ApiStoreReadEvent } from './BaseEvents.js';

export const SecurityEvents = {
  /**
   * Reads a Security definition from the store.
   * Note, do not use this method to read the definition of a security scheme applied to an endpoint or operation.
   * For that use `getRequirement()` instead.
   * 
   * @param target The node on which to dispatch the event
   * @param id The id of the Payload to read.
   */
  get: async (target: EventTarget, id: string): Promise<ApiDefinitions.IApiSecurityScheme> => {
    const e = new ApiStoreReadEvent(EventTypes.Security.get, id);
    target.dispatchEvent(e);
    return e.detail.result as Promise<ApiDefinitions.IApiSecurityScheme>;
  },
  /**
   * Reads a security requirement for an endpoint or operation.
   * 
   * @param target The node on which to dispatch the event
   * @param id The id of the Payload to read.
   */
  getRequirement: async (target: EventTarget, id: string): Promise<ApiDefinitions.IApiSecurityRequirement> => {
    const e = new ApiStoreReadEvent(EventTypes.Security.getRequirement, id);
    target.dispatchEvent(e);
    return e.detail.result as Promise<ApiDefinitions.IApiSecurityRequirement>;
  },
  /**
   * Lists the security definitions for the API.
   * @param target The node on which to dispatch the event
   */
  list: async (target: EventTarget): Promise<ApiDefinitions.IApiSecuritySchemeListItem[]> => {
    const e = new ApiStoreContextEvent(EventTypes.Security.list);
    target.dispatchEvent(e);
    return e.detail.result as Promise<ApiDefinitions.IApiSecuritySchemeListItem[]>;
  },

  /** 
   * Dispatched to inform about security settings change.
   * @param target The node on which to dispatch the event
   * @param settings The settings to apply.
   */
  settingsChanged: (target: EventTarget, settings: unknown): void => {
    const e = new CustomEvent(EventTypes.Security.settingsChanged, {
      detail: settings,
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    target.dispatchEvent(e);
  },
};

Object.freeze(SecurityEvents);
