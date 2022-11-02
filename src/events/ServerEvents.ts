/* eslint-disable max-classes-per-file */
import { ApiDefinitions } from '@api-client/core/build/browser.js';
import { ServersQueryOptions } from '@api-client/core/build/src/amf/AmfMixin.js';
import { EventTypes } from './EventTypes.js';
import { ApiStoreContextEvent } from './BaseEvents.js';
import { ServerType } from '../types.js';

export interface ServerChangeEventDetail {
  /**
   * The server id (for listed servers in the model), the URI value (when custom base URI is selected), or the `data-value` of the `anypoint-item` attribute rendered into the extra slot.
   */
  value: string;
  /**
   * The changed server type.
   */
  type: ServerType;
}

export interface ServerCountChangeEventDetail {
  /**
   * @param count The number of servers rendered in the selector.
   */
  value: number;
}

/**
 * The event dispatched when a server selection change.
 */
export class ServerChangeEvent extends CustomEvent<ServerChangeEventDetail> {
  /**
   * @param value The server id (for listed servers in the model), the URI value (when custom base URI is selected), or the `data-value` of the `anypoint-item` attribute rendered into the extra slot.
   * @param type The changed server type.
   */
  constructor(value: string, type: ServerType) {
    super(EventTypes.Server.serverChange, {
      bubbles: true,
      composed: true,
      detail: {
        value, type,
      },
    });
  }
}

/**
 * The event dispatched when a server count change. This happens when the server selector discover a change in the number of available servers.
 */
export class ServerCountChangeEvent extends CustomEvent<ServerCountChangeEventDetail> {
  /**
   * @param count The number of servers rendered in the selector.
   */
  constructor(count: number) {
    super(EventTypes.Server.serverCountChange, {
      detail: {
        value: count,
      },
    });
  }
}

export const ServerEvents = {
  /** 
   * @param target The node on which to dispatch the event.
   * @param value The server id (for listed servers in the model), the URI value (when custom base URI is selected), or the `data-value` of the `anypoint-item` attribute rendered into the extra slot.
   * @param type The changed server type.
   */
  serverChange: (target: EventTarget, value: string, type: ServerType): void => {
    const e = new ServerChangeEvent(value, type);
    target.dispatchEvent(e);
  },
  /** 
   * @param target The node on which to dispatch the event.
   * @param count The number of servers rendered in the selector.
   */
  serverCountChange: (target: EventTarget, count: number): void => {
    const e = new ServerCountChangeEvent(count);
    target.dispatchEvent(e);
  },
  /**
   * Queries for the list of servers for method, if defined, or endpoint, if defined, or root level 
   * @param target The node on which to dispatch the event.
   * @param query Server query options
   * @returns The list of servers for given query.
   */
  query: (target: EventTarget, query?: ServersQueryOptions): Promise<ApiDefinitions.IApiServer[]> => {
    const e = new ApiStoreContextEvent(EventTypes.Server.query, query);
    target.dispatchEvent(e);
    return e.detail.result as Promise<ApiDefinitions.IApiServer[]>;
  },
};
