/* eslint-disable max-classes-per-file */
import { ApiDefinitions } from '@api-client/core/build/browser.js';
import { EventTypes } from './EventTypes.js';
import { ApiStoreReadEvent } from './BaseEvents.js';
import { ApiConsoleRequest, ApiConsoleResponse, AbortRequestEventDetail } from '../types.js';

/**
 * The event dispatched to transport request from the api request editor.
 */
export class ApiRequestEvent extends CustomEvent<ApiConsoleRequest> {
  /**
   * @param type The event type.
   * @param request The request to transport
   */
  constructor(type: string, request: ApiConsoleRequest) {
    super(type, {
      bubbles: true,
      composed: true,
      detail: request,
    });
  }
}

/**
 * The event dispatched when response is ready.
 */
export class ApiResponseEvent extends CustomEvent<ApiConsoleResponse> {
  /**
   * @param type The event type.
   * @param response The request to transport
   */
  constructor(type: string, response: ApiConsoleResponse) {
    super(type, {
      bubbles: true,
      composed: true,
      detail: response,
    });
  }
}

/**
 * The event dispatched when cancelling ongoing HTTP request.
 */
export class AbortRequestEvent extends CustomEvent<AbortRequestEventDetail> {
  constructor(type: string, detail: AbortRequestEventDetail) {
    super(type, {
      bubbles: true,
      composed: true,
      detail,
    });
  }
}

export const RequestEvents = {
  /** 
   * @param target The node on which to dispatch the event.
   * @param request The request to transport
   */
  apiRequest: (target: EventTarget, request: ApiConsoleRequest): void => {
    const e = new ApiRequestEvent(EventTypes.Request.apiRequest, request);
    target.dispatchEvent(e);
  },
  /** 
   * @param target The node on which to dispatch the event.
   * @param request The request to transport
   */
  apiRequestLegacy: (target: EventTarget, request: ApiConsoleRequest): void => {
    const e = new ApiRequestEvent(EventTypes.Request.apiRequestLegacy, request);
    target.dispatchEvent(e);
  },
  /** 
   * @param target The node on which to dispatch the event.
   */
  abortApiRequest: (target: EventTarget, detail: AbortRequestEventDetail): void => {
    const e = new AbortRequestEvent(EventTypes.Request.abortApiRequest, detail);
    target.dispatchEvent(e);
  },
  /** 
   * @param target The node on which to dispatch the event.
   */
  abortApiRequestLegacy: (target: EventTarget, detail: AbortRequestEventDetail): void => {
    const e = new AbortRequestEvent(EventTypes.Request.abortApiRequestLegacy, detail);
    target.dispatchEvent(e);
  },
  /** 
   * @param target The node on which to dispatch the event.
   */
  apiResponse: (target: EventTarget, response: ApiConsoleResponse): void => {
    const e = new ApiResponseEvent(EventTypes.Request.apiResponse, response);
    target.dispatchEvent(e);
  },
  /** 
   * @param target The node on which to dispatch the event.
   */
  apiResponseLegacy: (target: EventTarget, response: ApiConsoleResponse): void => {
    const e = new ApiResponseEvent(EventTypes.Request.apiResponseLegacy, response);
    target.dispatchEvent(e);
  },
  /**
   * Reads a Request from the store.
   * @param target The node on which to dispatch the event
   * @param id The id of the request to read.
   */
  get: async (target: EventTarget, id: string): Promise<ApiDefinitions.IApiRequest> => {
    const e = new ApiStoreReadEvent(EventTypes.Request.get, id);
    target.dispatchEvent(e);
    return e.detail.result as Promise<ApiDefinitions.IApiRequest>;
  },
}
