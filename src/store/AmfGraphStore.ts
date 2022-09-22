import { v4 } from '@advanced-rest-client/uuid';
import { DomainElement } from '../helpers/amf.js';
import { AmfStore } from './AmfStore.js';

/**
 * The AMF graph store that hosts multiple instances of the AMF graph model.
 * 
 * Note, all methods are asynchronous so this class can be extended to support async communication
 * with the store (like HTTP or WS).
 */
export class AmfGraphStore {
  apis: Map<string, AmfStore>;

  target: EventTarget;

  /**
   * @param target The event target to dispatch the events on.
   */
  constructor(target: EventTarget = window) {
    this.apis = new Map();
    this.target = target;
  }

  /**
   * Creates a new store object.
   * @param graph The graph model to use to initialize the store.
   * @returns The store id to be used to reference when querying the store.
   */
  async add(graph: DomainElement): Promise<string> {
    const id = v4();
    const instance = new AmfStore(this.target, graph);
    this.apis.set(id, instance);
    return id;
  }

  /**
   * Removes all APIs from the store.
   */
  async clear(): Promise<void> {
    this.apis.clear();
  }

  /**
   * Removes a specific API from the store.
   * @param id The graph store identifier generated when calling `add()`.
   */
  async delete(id: string): Promise<void> {
    this.apis.delete(id);
  }

  /**
   * Proxies a read command to the store.
   * @param id The graph store identifier generated when calling `add()`.
   * @param command The command (method name) to call on the store.
   * @param args The list of command arguments.
   */
  async read(id: string, command: string, ...args: any[]): Promise<any> {
    if (!this.apis.has(id)) {
      throw new Error(`No graph defined for ${id}`);
    }
    const instance = this.apis.get(id) as AmfStore;
    const typedCmd = command as keyof AmfStore;
    if (typeof instance[typedCmd] !== 'function') {
      throw new Error(`The command ${command} is not callable on the graph store.`);
    }
    return (instance[typedCmd] as (...opts: any[]) => Promise<any>)(...args);
  }
}
