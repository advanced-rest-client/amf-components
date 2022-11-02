/* eslint-disable no-param-reassign */
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
import { property, state } from 'lit/decorators.js';
import { Headers } from '@api-client/core/build/browser.js';
import { ApiConsoleRequest } from '../types.js';

/**
 * `xhr-simple-request`
 * A XHR request that works with API components.
 *
 * This is a copy of `iron-request` element from PolymerElements library but
 * adjusted to work with `API request` object (or ARC request object).
 *
 * It also handles custom events related to request flow.
 */
export default class XhrSimpleRequestTransportElement extends LitElement {
  /**
   * A reference to the XMLHttpRequest instance used to generate the
   * network request.
   */
  @state() _xhr: XMLHttpRequest;

  /**
   * A reference to the parsed response body, if the `xhr` has completely
   * resolved.
   */
  @state() _response?: string | null | undefined;

  /**
   * A reference to response headers, if the `xhr` has completely resolved.
   */
  @state() _headers?: string;

  /**
   * A reference to the status code, if the `xhr` has completely resolved.
   */
  @state() _status?: number;

  /**
   * A reference to the status text, if the `xhr` has completely resolved.
   */
  @state() _statusText?: string;

  /**
   * A promise that resolves when the `xhr` response comes back, or rejects
   * if there is an error before the `xhr` completes.
   * The resolve callback is called with the original request as an argument.
   * By default, the reject callback is called with an `Error` as an argument.
   * If `rejectWithRequest` is true, the reject callback is called with an
   * object with two keys: `request`, the original request, and `error`, the
   * error object.
   */
  @state() _completes: Promise<{ response: string | null | undefined, headers: string | undefined }>;

  /**
   * Aborted will be true if an abort of the request is attempted.
   */
  @state() _aborted?: boolean;

  /**
   * It is true when the browser fired an error event from the
   * XHR object (mainly network errors).
   */
  @state() _error?: boolean;

  /**
   * TimedOut will be true if the XHR threw a timeout event.
   */
  @state() _timedOut?: boolean;

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
  
  /**
   * A reference to the parsed response body, if the `xhr` has completely
   * resolved.
   */
  get response(): string | null | undefined {
    return this._response;
  }

  /**
   * A reference to response headers, if the `xhr` has completely
   * resolved.
   */
  get headers(): string | undefined {
    return this._headers;
  }

  /**
   * A reference to the status code, if the `xhr` has completely resolved.
   */
  get status(): number | undefined {
    return this._status;
  }

  get statusText(): string | undefined {
    return this._statusText;
  }

  /**
   * A promise that resolves when the `xhr` response comes back, or rejects
   * if there is an error before the `xhr` completes.
   * The resolve callback is called with the original request as an argument.
   * By default, the reject callback is called with an `Error` as an argument.
   * If `rejectWithRequest` is true, the reject callback is called with an
   * object with two keys: `request`, the original request, and `error`, the
   * error object.
   */
  get completes(): Promise<{ response: string | null | undefined, headers: string | undefined }> {
    return this._completes;
  }

  /**
   * Aborted will be true if an abort of the request is attempted.
   *
   * @default false
   */
  get aborted(): boolean | undefined {
    return this._aborted;
  }

  /**
   * Error will be true if the browser fired an error event from the
   * XHR object (mainly network errors).
   */
  get error(): boolean | undefined {
    return this._error;
  }

  /**
   * Aborted will be true if an abort of the request is attempted.
   */
  get timedOut(): boolean | undefined {
    return this._timedOut;
  }

  resolveCompletes?: (value: { response: string | null | undefined, headers: string | undefined }) => void;

  rejectCompletes?: (err: { request: XMLHttpRequest, headers?: string | undefined, error: Error | ProgressEvent }) => void;

  constructor() {
    super();
    this._xhr = new XMLHttpRequest();
    this._response = null;
    this._status = 0;
    this._statusText = '';
    this.appendHeaders = undefined;
    this._completes = new Promise<{ response: string | null | undefined, headers: string | undefined }>((resolve, reject) => {
      this.resolveCompletes = resolve;
      this.rejectCompletes = reject;
    });
    this._aborted = false;
    this._error = false;
    this._timedOut = false;
    this.proxy = undefined;
    this.proxyEncodeUrl = false;
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('aria-hidden', 'true');
  }

  /**
   * Succeeded is true if the request succeeded. The request succeeded if it
   * loaded without error, wasn't aborted, and the status code is ≥ 200, and
   * < 300, or if the status code is 0.
   *
   * The status code 0 is accepted as a success because some schemes - e.g.
   * file:// - don't provide status codes.
   */
  get succeeded(): boolean {
    if (this.error || this.aborted || this.timedOut) {
      return false;
    }
    const status = this._xhr?.status || 0;

    // Note: if we are using the file:// protocol, the status code will be 0
    // for all outcomes (successful or otherwise).
    return status === 0 || (status >= 200 && status < 300);
  }

  /**
   * Sends a request.
   *
   * @param options API request object
   */
  send(options: ApiConsoleRequest): Promise<{ response: string | null | undefined, headers: string | undefined }> | null {
    const xhr = this._xhr;
    if (xhr.readyState > 0) {
      return null;
    }
    xhr.addEventListener('error', (error) => this._errorHandler(error));
    xhr.addEventListener('timeout', (error) => this._timeoutHandler(error));
    xhr.addEventListener('abort', () => this._abortHandler());
    // Called after all of the above.
    xhr.addEventListener('loadend', () => this._loadEndHandler());
    const url = this._appendProxy(options.url);
    xhr.open(options.method || 'GET', url, true);
    this._applyHeaders(xhr, options.headers, options.payload instanceof FormData);
    if (typeof options.timeout === 'number') {
      xhr.timeout = options.timeout;
    }
    xhr.withCredentials = !!options.withCredentials;
    try {
      xhr.send(options.payload);
    } catch (e) {
      this._errorHandler(e as Error);
    }
    return this.completes;
  }

  /**
   * Applies headers to the XHR object.
   *
   * @param xhr
   * @param headers HTTP headers
   * @param isFormData Prevents setting content-type header for Multipart requests.
   */
  _applyHeaders(xhr: XMLHttpRequest, headers?: string | Headers, isFormData?: boolean): void {
    const fixed = this._computeAddHeaders(this.appendHeaders);
    const fixedNames: string[] = [];
    if (fixed) {
      fixed.forEach((value, name) => {
        fixedNames[fixedNames.length] = name;
        try {
          xhr.setRequestHeader(name, value);
        } catch (e) {
          // ..
        }
      });
    }
    if (headers) {
      const parsed = new Headers(headers);
      parsed.forEach((value, name) => {
        if (fixedNames.indexOf(name) !== -1) {
          return;
        }
        if (isFormData && name.toLowerCase() === 'content-type') {
          return;
        }
        try {
          xhr.setRequestHeader(name, value);
        } catch (e) {
          // ..
        }
      });
    }
  }

  _computeAddHeaders(headers?: string): Headers | undefined {
    if (!headers) {
      return undefined;
    }
    headers = String(headers).replace('\\n', '\n');
    return new Headers(headers);
  }

  /**
   * Handler for XHR `error` event.
   *
   * @param error https://xhr.spec.whatwg.org/#event-xhr-error
   */
  _errorHandler(error: ProgressEvent | Error): void {
    if (this.aborted) {
      return;
    }
    this._error = true;
    this._updateStatus();
    this._headers = this.collectHeaders();
    const response = {
      error,
      request: this._xhr,
      headers: this.headers
    };
    if (this.rejectCompletes) {
      this.rejectCompletes(response);
    }
  }

  /**
   * Handler for XHR `timeout` event.
   *
   * @param error https://xhr.spec.whatwg.org/#event-xhr-timeout
   */
  _timeoutHandler(error: ProgressEvent): void {
    this._timedOut = true;
    this._updateStatus();
    const response = {
      error,
      request: this._xhr
    };
    if (this.rejectCompletes) {
      this.rejectCompletes(response);
    }
  }

  /**
   * Handler for XHR `abort` event.
   */
  _abortHandler(): void {
    this._aborted = true;
    this._updateStatus();
    const error = new Error('Request aborted');
    const response = {
      error,
      request: this._xhr
    };
    if (this.rejectCompletes) {
      this.rejectCompletes(response);
    }
  }

  /**
   * Handler for XHR `loadend` event.
   */
  _loadEndHandler(): void {
    if (this.aborted || this.timedOut) {
      return;
    }
    this._updateStatus();
    this._headers = this.collectHeaders();
    this._response = this.parseResponse();
    if (!this.succeeded) {
      const error = new Error(`The request failed with status code: ${  this._xhr.status}`);
      const response = {
        error,
        request: this._xhr,
        headers: this.headers
      };
      if (this.rejectCompletes) {
        this.rejectCompletes(response);
      }
    } else if (this.resolveCompletes) {
      this.resolveCompletes({
        response: this.response,
        headers: this.headers
      });
    }
  }
  
  /**
   * Aborts the request.
   */
  abort(): void {
    this._aborted = true;
    this._xhr?.abort();
  }

  /**
   * Updates the status code and status text.
   */
  _updateStatus(): void {
    this._status = this._xhr?.status;
    this._statusText = (this._xhr?.statusText === undefined ? '' : this._xhr.statusText);
  }

  /**
   * Attempts to parse the response body of the XHR. If parsing succeeds,
   * the value returned will be deserialized based on the `responseType`
   * set on the XHR.
   *
   * TODO: The `responseType` will always be empty string because
   * send function does not sets the response type.
   * API request object does not support this property. However in the future
   * it may actually send this information extracted from the AMF model.
   * This function will be ready to handle this case.
   *
   * @returns The parsed response, or undefined if there was an empty response or parsing failed.
   */
  parseResponse(): string | null | undefined {
    const xhr = this._xhr as XMLHttpRequest;
    const { responseType } = xhr;
    const preferResponseText = !xhr.responseType;
    try {
      switch (responseType) {
        case 'json':
          // If the xhr object doesn't have a natural `xhr.responseType`,
          // we can assume that the browser hasn't parsed the response for us,
          // and so parsing is our responsibility. Likewise if response is
          // undefined, as there's no way to encode undefined in JSON.
          if (preferResponseText || xhr.response === undefined) {
            // Try to emulate the JSON section of the response body section of
            // the spec: https://xhr.spec.whatwg.org/#response-body
            // That is to say, we try to parse as JSON, but if anything goes
            // wrong return null.
            try {
              return JSON.parse(xhr.responseText);
            } catch (_) {
              return null;
            }
          }
          return xhr.response;
        // case 'xml':
        //   return xhr.responseXML;
        case 'blob':
        case 'document':
        case 'arraybuffer':
          return xhr.response;
        case 'text':
          return xhr.responseText;
        default: {
          return xhr.responseText;
        }
      }
    } catch (e) {
      if (this.rejectCompletes) {
        this.rejectCompletes({
          error: new Error(`Could not parse response. ${(e as Error).message}`),
          request: this._xhr,
        });
      }
    }
    return undefined;
  }

  /**
   * Collects response headers string from the XHR object.
   */
  collectHeaders(): string|undefined {
    let data: string | undefined;
    try {
      data = this._xhr?.getAllResponseHeaders();
    } catch (_) {
      // ...
    }
    return data;
  }

  /**
   * Sets the proxy URL if the `proxy` property is set.
   * @param url Request URL to alter if needed.
   * @returns The URL to use with request.
   */
  _appendProxy(url: string): string {
    const { proxy } = this;
    if (!proxy) {
      return url;
    }
    let result = this.proxyEncodeUrl ? encodeURIComponent(url) : url;
    result = proxy + result;
    return result;
  }
}
