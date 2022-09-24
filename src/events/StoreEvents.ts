import { EventTypes } from './EventTypes.js';

export const StoreEvents = {
  /**
   * Dispatched by the store when the API model change.
   * @param target The node on which to dispatch the event
   */
  graphChange: (target: EventTarget): void => {
    const e = new Event(EventTypes.Store.graphChange, {
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    target.dispatchEvent(e);
  },
};
