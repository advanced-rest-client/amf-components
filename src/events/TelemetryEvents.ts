import { EventTypes } from './EventTypes.js';
import { ApiStoreContextVoidEvent } from './BaseEvents.js';

export interface TelemetryCustomMetric {
  index: number;
  value: number;
}
export interface TelemetryCustomValue {
  index: number;
  value: string;
}

export interface TelemetryDetail {
  customMetrics?: TelemetryCustomMetric[];
  customDimensions?: TelemetryCustomValue[];
}

export interface TelemetryScreenViewDetail extends TelemetryDetail {
  screenName: string;
}

export interface TelemetryEventDetail extends TelemetryDetail {
  category: string;
  action: string;
  label?: string;
  value?: number;
}

export interface TelemetryExceptionDetail extends TelemetryDetail {
  description: string;
  fatal?: boolean;
}

export interface TelemetrySocialDetail extends TelemetryDetail {
  network: string;
  action: string;
  target: string;
}

export interface TelemetryTimingDetail extends TelemetryDetail {
  category: string;
  variable: string;
  value: number;
  label?: string;
}

export const TelemetryEvents = {
  /**
   * Sends application screen view event
   * @param target A node on which to dispatch the event
   * @param screenName The screen name
   * @param detail Analytics base configuration
   */
  view: (target: EventTarget, screenName: string, detail: TelemetryDetail={}): void => {
    const init: TelemetryScreenViewDetail = { ...detail, screenName };
    const e = new ApiStoreContextVoidEvent(EventTypes.Telemetry.view, init);
    target.dispatchEvent(e);
  },
  /**
   * Sends a Google Analytics event information
   * @param target A node on which to dispatch the event
   * @param detail The event configuration
   */
  event: (target: EventTarget, detail: TelemetryEventDetail): void => {
    const e = new ApiStoreContextVoidEvent(EventTypes.Telemetry.event, detail);
    target.dispatchEvent(e);
  },
  /**
   * Sends a Google Analytics exception information
   * @param target A node on which to dispatch the event
   * @param description The exception description
   * @param fatal Whether the exception was fatal to the application
   * @param detail Analytics base configuration
   */
  exception: (target: EventTarget, description: string, fatal=false, detail: TelemetryDetail = {}): void => {
    const init: TelemetryExceptionDetail = { ...detail, description, fatal };
    const e = new ApiStoreContextVoidEvent(EventTypes.Telemetry.exception, init);
    target.dispatchEvent(e);
  },
  /**
   * Sends a Google Analytics social share information
   * @param target A node on which to dispatch the event
   * @param network The network where the shared content is shared
   * @param action The share action, eg. 'Share'
   * @param url The share url
   * @param detail Analytics base configuration
   */
  social: (target: EventTarget, network: string, action: string, url: string, detail: TelemetryDetail = {}): void => {
    const init: TelemetrySocialDetail = { ...detail, network, action, target: url };
    const e = new ApiStoreContextVoidEvent(EventTypes.Telemetry.social, init);
    target.dispatchEvent(e);
  },
  /**
   * Sends a Google Analytics application timing information
   * @param target A node on which to dispatch the event
   * @param category The timing category
   * @param variable The timing variable
   * @param value The timing value
   * @param label The timing label
   * @param detail Analytics base configuration
   */
  timing: (target: EventTarget, category: string, variable: string, value: number, label?: string, detail: TelemetryDetail = {}): void => {
    const init: TelemetryTimingDetail = { ...detail, category, variable, value, label };
    const e = new ApiStoreContextVoidEvent(EventTypes.Telemetry.timing, init);
    target.dispatchEvent(e);
  },
};
Object.freeze(TelemetryEvents);
