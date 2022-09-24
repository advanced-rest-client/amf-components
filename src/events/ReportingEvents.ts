import { EventTypes } from './EventTypes.js';
import { ApiStoreContextEvent } from './BaseEvents.js';

export declare interface ReportingErrorEventDetail {
  error: Error;
  description: string;
  component?: string;
}

export const ReportingEvents = {
  /**
   * Dispatches the general error event for logging purposes.
   * @param target A node on which to dispatch the event
   * @param error The error object that caused this event
   * @param description The description to be reported to the logger.
   * @param component Optional component name that triggered the exception.
   */
  error: (target: EventTarget, error: Error, description: string, component?: string): void => {
    const detail: ReportingErrorEventDetail = {
      error, 
      description, 
      component,
    };
    const e = new ApiStoreContextEvent(EventTypes.Reporting.error, detail);
    target.dispatchEvent(e);
  },
};
Object.freeze(ReportingEvents);
