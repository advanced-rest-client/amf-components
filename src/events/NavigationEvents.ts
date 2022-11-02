/* eslint-disable max-classes-per-file */
import { EventTypes } from './EventTypes.js';
import { SelectionType } from '../types.js';

export interface ApiNavigationEventDetail {
  /**
   * The domain id (graph id) of the selected object.
   */
  domainId: string;
  /**
   *  The type of the selected domain object.
   */
  domainType: SelectionType;
  /**
   * Optional, the parent object domain id (for an operation it is an endpoint)
   */
  parentId?: string;
  /**
   * Whether the selection came from the system processing rather than user interaction.
   */
  passive?: boolean;
}

export class ApiNavigationEvent extends CustomEvent<ApiNavigationEventDetail> {
  /**
   * @param domainId The domain id (graph id) of the selected object
   * @param domainType The type of the selected domain object.
   * @param parentId Optional, the parent object domain id (for an operation it is an endpoint)
   * @param passive Whether the selection came from the system processing rather than user interaction.
   */
  constructor(domainId: string, domainType: SelectionType, parentId?: string, passive?: boolean) {
    super(EventTypes.Navigation.apiNavigate, {
      bubbles: true,
      composed: true,
      cancelable: false,
      detail: {
        domainId, domainType, parentId, passive,
      }
    });
  }
}

export const NavigationEvents = {
  /**
   * Performs a navigation action in AMF components.
   * @param target The node on which to dispatch the event
   * @param domainId The domain id (graph id) of the selected object
   * @param domainType The type of the selected domain object.
   * @param parentId Optional, the parent object domain id (for an operation it is an endpoint)
   * @param passive Whether the selection came from the system processing rather than user interaction.
   */
  apiNavigate: (target: EventTarget, domainId: string, domainType: SelectionType, parentId?: string, passive?: boolean): void => {
    const e = new ApiNavigationEvent(domainId, domainType, parentId, passive);
    target.dispatchEvent(e);
  },
  /**
   * Dispatches an event to inform the application to open a browser window.
   * This is a general purpose action. It has the `detail` object with optional
   * `purpose` property which can be used to support different kind of external navigation.
   * 
   * @param target A node on which to dispatch the event.
   * @param url The URL to open
   * @returns True when the event was cancelled meaning the navigation was handled.
   */
  navigateExternal: (target: EventTarget, url: string): boolean => {
    const e = new CustomEvent(EventTypes.Navigation.navigateExternal, {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: {
        url,
      },
    });
    target.dispatchEvent(e);
    return e.defaultPrevented;
  },
}
Object.freeze(NavigationEvents);
