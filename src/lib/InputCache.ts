/* eslint-disable no-param-reassign */

/**
 * A cache of provided by the user values to the input fields.
 * This is used to restore data when the user switches between different operations.
 */
export const globalValues: Map<string, unknown> = new Map();
/**
 * A cache for "local" values cached per instance of the component.
 */
export const localValues: WeakMap<HTMLElement, Map<string, unknown>> = new WeakMap();

/**
 * @param element
 * @param globalCache Whether to use the global cache.
 */
export function getStore(element: HTMLElement, globalCache: boolean): Map<string, unknown> {
  if (globalCache) {
    return globalValues;
  }
  return localValues.get(element) as Map<string, unknown>;
}

/**
 * @param element
 * @param key The key to use
 * @param globalCache Whether to use the global cache.
 */
export function get(element: HTMLElement, key: string, globalCache: boolean): unknown {
  const store = getStore(element, globalCache);
  if (store && store.has(key)) {
    return store.get(key);
  }
  return undefined;
}

/**
 * @param element
 * @param key The key to use
 * @param value The value to store
 * @param globalCache Whether to use the global cache.
 * @param isArray Whether the value is an array.
 * @param index The array index.
 */
export function set(element: HTMLElement, key: string, value: unknown, globalCache: boolean, isArray?: boolean, index?: number): void {
  const store = getStore(element, globalCache);
  if (isArray) {
    if (!store.has(key)) {
      store.set(key, []);
    }
    if (typeof index === "number" && !Number.isNaN(index)) {
      (store.get(key) as unknown[])[index] = value;
    } else {
      (store.get(key) as unknown[]).push(value);
    }
  } else {
    store.set(key, value);
  }
}

/**
 * @param element
 * @param key The key to use
 * @param globalCache Whether to use the global cache.
 */
export function has(element: HTMLElement, key: string, globalCache: boolean): boolean {
  const store = getStore(element, globalCache);
  return store.has(key);
}


export function registerLocal(element: HTMLElement): void {
  localValues.set(element, new Map());
}

export function unregisterLocal(element: HTMLElement): void {
  localValues.delete(element);
}

/**
 * @param element
 * @param key The key to use
 * @param globalCache Whether to use the global cache.
 * @param index When set to a number it expects the value to be array and removes an item on the specified index.
 */
export function remove(element: HTMLElement, key: string, globalCache: boolean, index?: number): void {
  const store = getStore(element, globalCache);
  if (typeof index === "number" && !Number.isNaN(index)) {
    const value = store.get(key);
    if (Array.isArray(value)) {
      value.splice(index, 1);
    }
  } else {
    store.delete(key);
  }
}
