/* eslint-disable max-classes-per-file */

/**
 * A base class to use with store events that do not expect a result.
 */
export class ApiStoreContextVoidEvent<T> extends CustomEvent<T> {
  /**
   * @param type The event type
   * @param detail The optional detail object. It adds object's properties to the `detail` with the `result` property.
   */
  constructor(type: string, detail?: T) {
    super(type, {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail,
    });
  }
}

/**
 * Base event detail definition for the events that returns a `result`
 * property on the `detail` object
 */
export interface StoreEventDetailWithResult<T> {
  /**
   * This property is set by the store, a promise resolved when the operation finish
   * with the corresponding result.
   */
  result?: Promise<T> | null;
}


/**
 * A base class to use with store events.
 */
export class ApiStoreContextEvent<T> extends CustomEvent<StoreEventDetailWithResult<T>> {
  /**
   * @param type The event type
   * @param detail The optional detail object. It adds object's properties to the `detail` with the `result` property.
   */
  constructor(type: string, detail?: T) {
    const d = detail || {};
    super(type, {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: {
        result: undefined,
        ...d,
      }
    });
  }
}

export declare interface ApiStoreReadEventDetail<T> extends StoreEventDetailWithResult<T> {
  /**
   * The domain id of the domain object to read.
   */
  id: string;
  /**
   * The domain id of the parent object (like endpoint for an operation).
   */
  parent?: string;
}

/**
 * An event to be used to read an object from the API store.
 */
export class ApiStoreReadEvent<T> extends ApiStoreContextEvent<ApiStoreReadEventDetail<T>> {
  /**
   * @param type The type of the event
   * @param id The domain id of the object to read
   * @param parent The domain id of the parent object (like endpoint for an operation).
   */
  constructor(type: string, id: string, parent?: string) {
    super(type, { id, parent });
  }
}

export declare interface ApiStoreReadBulkEventDetail<T> extends StoreEventDetailWithResult<T[]> {
  /**
   * The list of domain ids to read.
   */
  ids: string[];
}

/**
 * An event to be used to read a list of object from the API store.
 */
export class ApiStoreReadBulkEvent<T> extends ApiStoreContextEvent<ApiStoreReadBulkEventDetail<T>> {
  /**
   * @param type The type of the event
   * @param ids The list of domain ids to read. These must be of the same domain type.
   */
  constructor(type: string, ids: string[]) {
    super(type, { ids });
  }
}
