/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable class-methods-use-this */
import { dedupeMixin } from '@open-wc/dedupe-mixin';
import { EventsTargetMixin } from  '@anypoint-web-components/awc';
import { EventTypes } from '../../events/EventTypes.js';

export const eventHandler = Symbol('eventHandler');

const eventsMap: Record<string, { target: string, args?: string[], eventProperties?: boolean, passDetail?: boolean }> = {
  [EventTypes.Api.summary]: { target: 'apiSummary' },
  [EventTypes.Api.protocols]: { target: 'apiProtocols' },
  [EventTypes.Api.version]: { target: 'apiVersion' },
  [EventTypes.Api.documentMeta]: { target: 'documentMeta' },
  [EventTypes.Endpoint.get]: { target: 'getEndpoint', args: ['id'], },
  [EventTypes.Endpoint.byPath]: { target: 'getEndpointByPath', args: ['id'], },
  [EventTypes.Endpoint.list]: { target: 'listEndpointsWithOperations' },
  [EventTypes.Operation.get]: { target: 'getOperation', args: ['id', 'parent'] },
  [EventTypes.Operation.getParent]: { target: 'getOperationParent', args: ['id'] },
  [EventTypes.Server.query]: { target: 'queryServers', passDetail: true },
  [EventTypes.Documentation.list]: { target: 'listDocumentations' },
  [EventTypes.Documentation.get]: { args: ['id'], target: 'getDocumentation' },
  [EventTypes.Security.get]: { args: ['id'], target: 'getSecurityScheme' },
  [EventTypes.Security.getRequirement]: { args: ['id'], target: 'getSecurityRequirement' },
  [EventTypes.Security.list]: { target: 'listSecurity' },
  [EventTypes.Request.get]: { args: ['id'], target: 'getRequest', },
  [EventTypes.Response.get]: { args: ['id'], target: 'getResponse', },
  [EventTypes.Payload.get]: { args: ['id'], target: 'getPayload', },
  [EventTypes.Type.list]: { target: 'listTypes' },
  [EventTypes.Type.get]: { args: ['id'], target: 'getType' },
};

type Constructor<T = {}> = new (...args: any[]) => T;

/**
 * This mixin adds events listeners for DOM events related to the AMF store.
 * It does not provide implementations for the functions called by each handler.
 * This to be mixed in with an instance of the `AmfStoreService`.
 * 
 * The implementation by default listens on the `window` object.
 * Set `eventsTarget` property to listen to the events on a specific node.
 * 
 * @mixin
 */
export interface AmfStoreDomEventsMixinInterface {
  [eventHandler](e: CustomEvent): void;
  /**
   * Listens for the store DOM events.
   */
  listen(node?: EventTarget): void;

  /**
   * Removes store's DOM events.
   */
  unlisten(node?: EventTarget): void;
}

/**
 * This mixin adds events listeners for DOM events related to the AMF store.
 * It does not provide implementations for the functions called by each handler.
 * This to be mixed in with an instance of the `AmfStoreService`.
 * 
 * The implementation by default listens on the `window` object.
 * Set `eventsTarget` property to listen to the events on a specific node.
 * 
 * @mixin
 */
export const AmfStoreDomEventsMixin = dedupeMixin(<T extends Constructor<any>>(superClass: T): Constructor<AmfStoreDomEventsMixinInterface> & T => {
  class AmfStoreDomEventsMixinClass extends EventsTargetMixin(superClass) {
    /**
     * @param args Base class arguments
     */
     constructor(...args: any[]) {
      super(...args);
      this[eventHandler] = this[eventHandler].bind(this);
    }

    /**
     * Listens for the store DOM events.
     */
    listen(node: EventTarget = window): void {
      Object.keys(eventsMap).forEach(type => node.addEventListener(type, this[eventHandler] as EventListener));
    }

    /**
     * Removes store's DOM events.
     */
    unlisten(node: EventTarget = window): void {
      Object.keys(eventsMap).forEach(type => node.removeEventListener(type, this[eventHandler] as EventListener));
    }

    _attachListeners(node: EventTarget): void {
      super._attachListeners(node);
      this.listen(node);
    }

    _detachListeners(node: EventTarget): void {
      super._detachListeners(node);
      this.unlisten(node);
    }

    [eventHandler](e: CustomEvent): void {
      if (e.defaultPrevented) {
        return;
      }
      e.preventDefault();
      const info = eventsMap[e.type];
      if (!info) {
        // eslint-disable-next-line no-console
        console.warn(`Incorrectly handled event ${e.type}`);
        return;
      }
      const { args, target, passDetail } = info;
      if (passDetail) {
        const cp = { ...(e.detail || {}) };
        e.detail.result = this[target](cp);
      } else if (!Array.isArray(args) || !args.length) {
        e.detail.result = this[target]();
      } else {
        const params: any[] = [];
        args.forEach(n => {
          const value = info.eventProperties ? (e as any)[n] : e.detail[n];
          params.push(value);
        });
        e.detail.result = this[target](...params);
      }
    }
  }
  return AmfStoreDomEventsMixinClass as Constructor<AmfStoreDomEventsMixinInterface> & T;
});
