/* eslint-disable class-methods-use-this */
/**
@license
Copyright 2018 The Advanced REST client authors <arc@mulesoft.com>
Licensed under the Apache License, Version 2.0 (the "License"); you may not
use this file except in compliance with the License. You may obtain a copy of
the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
License for the specific language governing permissions and limitations under
the License.
*/
import { LitElement } from 'lit';
import { EventsTargetMixin } from '@anypoint-web-components/awc';
import { property } from 'lit/decorators.js';
import { EventTypes } from '../events/EventTypes.js';
import { RequestEvents } from '../events/RequestEvents.js';
import { ApiConsoleHTTPResponse, ApiConsoleRequest, ApiConsoleResponse, XHRQueueItem } from '../types.js';
import XhrSimpleRequestTransportElement from './XhrSimpleRequestTransportElement.js';
import '../../define/xhr-simple-request-transport.js';

/**
 * `xhr-simple-request`
 * A XHR request that works with API components.
 *
 * It handles `api-request` and `abort-api-request` custom events that control
 * request flow in API components ecosystem.
 *
 * This makes a request by using `XMLHttpRequest` object.
 *
 * ## ARC request data model
 *
 * The `api-request` custom event has to contain ARC (Advanced REST client)
 * request data model. It expects the following properties:
 * - url (`String`) - Request URL
 * - method (`String`) - Request HTTP method.
 * - headers (`String|undefined`) - HTTP headers string
 * - payload (`String|FormData|File|ArrayBuffer|undefined`) Request body
 * - id (`String`) **required**, request id. It can be any string, it must be unique.
 *
 * Note, this library does not validates the values and use them as is.
 * Any error related to validation has to be handled by the application.
 *
 * ## api-response data model
 *
 * When response is ready the element dispatches `api-response` custom event
 * with following properties in the detail object.
 * - id (`String`) - Request incoming ID
 * - request (`Object`) - Original request object from `api-request` event
 * - loadingTime (`Number`) - High precise timing used by the performance API
 * - isError (`Boolean`) - Indicates if the request is error
 * - error (`Error|undefined`) - Error object
 * - response (`Object`) - The response data:
 *  - status (`Number`) - Response status code
 *  - statusText (`String`) - Response status text. Can be empty string.
 *  - payload (`String|Document|ArrayBuffer|Blob`) - Response body
 *  - headers (`String|undefined`) - Response headers
 *
 * Please note that aborting the request always sends `api-response` event
 * with `isError` set to true.
 */
export default class XhrSimpleRequestElement extends EventsTargetMixin(LitElement) {
  /**
   * Map of active request objects.
   * Keys in the map is the request ID and value is instance of the
   * `XhrSimpleRequestTransport`
   */
  activeRequests: Map<string, XHRQueueItem>;

  /**
   * Appends headers to each request handled by this component.
   *
   * Example
   *
   * ```html
   * <xhr-simple-request
   *  append-headers="x-token: 123\nx-api-demo: true"></xhr-simple-request>
   * ```
   * @attribute
   */
  @property({ type: String }) appendHeaders?: string;

  /**
   * If set every request made from the console will be proxied by the service provided in this
   * value.
   * It will prefix entered URL with the proxy value. so the call to
   * `http://domain.com/path/?query=some+value` will become
   * `https://proxy.com/path/http://domain.com/path/?query=some+value`
   *
   * If the proxy require a to pass the URL as a query parameter define value as follows:
   * `https://proxy.com/path/?url=`. In this case be sure to set `proxy-encode-url`
   * attribute.
   * @attribute
   */
  @property({ type: String }) proxy?: string;

  /**
   * If `proxy` is set, it will URL encode the request URL before appending it to the proxy URL.
   * `http://domain.com/path/?query=some+value` will become
   * `https://proxy.com/?url=http%3A%2F%2Fdomain.com%2Fpath%2F%3Fquery%3Dsome%2Bvalue`
   * @attribute
   */
  @property({ type: Boolean }) proxyEncodeUrl?: boolean;

  __loading?: boolean;
  
  /**
   * True while loading latest started requests.
   */
  get loading(): boolean | undefined {
    return this._loading;
  }

  /**
   * True while loading latest started requests.
   */
  get _loading(): boolean | undefined {
    return this.__loading;
  }

  set _loading(value: boolean | undefined) {
    const old = this.__loading;
    if (old === value) {
      return;
    }
    this.__loading = old;
    this.dispatchEvent(new Event('loadingchange'));
    // @deprecated
    this.dispatchEvent(new CustomEvent('loading-changed', {
      detail: {
        value
      }
    }));
  }

  constructor() {
    super();
    this._requestHandler = this._requestHandler.bind(this);
    this._abortHandler = this._abortHandler.bind(this);
    this.activeRequests = new Map();
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('aria-hidden', 'true');
  }

  _attachListeners(node: EventTarget): void {
    node.addEventListener(EventTypes.Request.apiRequest, this._requestHandler as EventListener);
    node.addEventListener(EventTypes.Request.abortApiRequest, this._abortHandler as EventListener);
  }

  _detachListeners(node: EventTarget): void {
    node.removeEventListener(EventTypes.Request.apiRequest, this._requestHandler as EventListener);
    node.removeEventListener(EventTypes.Request.abortApiRequest, this._abortHandler as EventListener);
  }

  /**
   * Creates instance of transport object with current configuration.
   */
  _createRequest(): XhrSimpleRequestTransportElement {
    const request = document.createElement('xhr-simple-request-transport');
    request.appendHeaders = this.appendHeaders;
    request.proxy = this.proxy;
    request.proxyEncodeUrl = this.proxyEncodeUrl;
    return request;
  }

  /**
   * Handles for the `api-request` custom event. Transports the request.
   */
  _requestHandler(e: CustomEvent): void {
    if (e.defaultPrevented) {
      return;
    }
    e.preventDefault();
    const opts = e.detail as ApiConsoleRequest;
    this.execute(opts);
  }

  async execute(request: ApiConsoleRequest): Promise<void> {
    const { id } = request;
    if (!id) {
      throw new Error(`The id does not exist on the request object.`);
    }
    const xhr = this._createRequest();
    const item: XHRQueueItem = {
      startTime: new Date().getTime(),
      request,
      xhr,
    };
    this.activeRequests.set(id, item);
    this._loading = true;
    try {
      await xhr.send(request);
      this._responseHandler(id);
    } catch (e) {
      this._errorHandler(e, id);
    }
    this._discardRequest(id);
  }

  /**
   * Handler for `abort-api-request` event. Aborts the request and reports
   * error response.
   * It expects the event to have `id` property set on the detail object.
   */
  _abortHandler(e: CustomEvent): void {
    if (e.defaultPrevented) {
      return;
    }
    e.preventDefault();
    const { id } = e.detail;
    const info = this.activeRequests.get(id);
    if (!info) {
      return;
    }
    info.xhr.abort();
    // Error thrown by the abort event will clear the request.
  }

  /**
   * Creates a detail object for `api-response` custom event
   *
   * @param info Request object
   * @param id Request original ID
   * @return The value of the `detail` property.
   */
  _createDetail(info: XHRQueueItem, id: string): ApiConsoleResponse {
    const { startTime, request, xhr } = info;
    const loadingTime = new Date().getTime() - startTime;
    const result: ApiConsoleResponse = {
      id,
      request,
      isError: false,
      response: {
        status: xhr.status || 0,
        statusText: xhr.statusText,
        payload: xhr.response,
        headers: xhr.headers,
      } as ApiConsoleHTTPResponse,
      loadingTime,
    };
    return result;
  }

  /**
   * Handles response from the transport.
   *
   * @param id Request ID
   */
  _responseHandler(id: string): void {
    this._loading = false;
    const info = this.activeRequests.get(id);
    if (!info) {
      return;
    }
    const result = this._createDetail(info, id);
    RequestEvents.apiResponse(this, result);
  }

  /**
   * Handles transport error
   *
   * @param err Transport error object.
   * @param id Request ID
   */
  _errorHandler(err: any, id: string): void {
    this._loading = false;
    let { error } = err;
    if (error instanceof ProgressEvent) {
      error = new Error('Unable to connect');
    }
    const request = this.activeRequests.get(id);
    if (!request) {
      return;
    }
    const result = this._createDetail(request, id);
    result.isError = true;
    result.error = error;
    RequestEvents.apiResponse(this, result);
  }

  /**
   * Removes request from active requests.
   *
   * @param id Request ID.
   */
  _discardRequest(id: string): void {
    this.activeRequests.delete(id);
  }
}
