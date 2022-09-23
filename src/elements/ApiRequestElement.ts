/**
@license
Copyright 2021 The Advanced REST client authors <arc@mulesoft.com>
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
import { html, LitElement, CSSResult, TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';
import { ErrorResponse, TransportRequest, Response, ApiType, ArcBaseRequest } from '@api-client/core/build/legacy.js';
import { ArcHeaders, Oauth2Credentials } from '@advanced-rest-client/base/api.js';
import { EventsTargetMixin } from '@anypoint-web-components/awc/dist/index.js';
import elementStyles from './styles/Panel.styles.js';
import { EventTypes } from '../events/EventTypes.js';
import '../../define/api-request-editor.js';
import '../../define/api-response-view.js';
import { ApiConsoleRequest, ApiConsoleResponse } from '../types.js';
import { ApiRequestEvent, ApiResponseEvent } from '../events/RequestEvents.js';
import { ApiNavigationEvent } from '../events/NavigationEvents.js';

/* eslint-disable no-plusplus */
/* eslint-disable class-methods-use-this */

export const domainIdValue = Symbol('domainIdValue');
export const domainIdChanged = Symbol('domainIdChanged');
export const appendProxy = Symbol('appendProxy');
export const propagateResponse = Symbol('propagateResponse');
export const responseHandler = Symbol('responseHandler');
export const requestHandler = Symbol('requestHandler');
export const appendConsoleHeaders = Symbol('appendConsoleHeaders');
export const navigationHandler = Symbol('navigationHandler');
export const requestTemplate = Symbol('requestTemplate');
export const responseTemplate = Symbol('requestTemplate');
export const changeHandler = Symbol('changeHandler');

export default class ApiRequestElement extends EventsTargetMixin(LitElement) {
  static get styles(): CSSResult[] {
    return [elementStyles];
  }

  /**
   * True when the panel render the response.
   */
  get hasResponse(): boolean {
    return !!this.response;
  }

  /**
   * By default application hosting the element must set `domainId`
   * property. When using `api-navigation` element
   * by setting this property the element listens for navigation events
   * and updates the state
   */
  @property({ type: Boolean, reflect: true }) handleNavigationEvents?: boolean;

  /**
   * When set it renders the URL input above the URL parameters.
   */
  @property({ type: Boolean, reflect: true }) urlEditor?: boolean;

  /**
   * When set it renders a label with the computed URL.
   */
  @property({ type: Boolean, reflect: true }) urlLabel?: boolean;
  
  /**
   * A base URI for the API. To be set if RAML spec is missing `baseUri`
   * declaration and this produces invalid URL input. This information
   * is passed to the URL editor that prefixes the URL with `baseUri` value
   * if passed URL is a relative URL.
   */
  @property({ type: String }) baseUri?: string;
  
  /**
   * OAuth2 redirect URI.
   * This value **must** be set in order for OAuth 1/2 to work properly.
   */
  @property({ type: String }) redirectUri?: string;

  /**
   * Enables Anypoint platform styles.
   */
  @property({ type: Boolean, reflect: true }) anypoint?: boolean;

  /**
   * Enables Material Design outlined style
   */
  @property({ type: Boolean, reflect: true }) outlined?: boolean;

  /**
   * Created by the transport `request` object
   */
  @state() request?: TransportRequest;

  /**
   * Created by the transport ARC `response` object.
   */
  @state() response?: ErrorResponse | Response;

  /**
   * Forces the console to send headers defined in this string overriding any used defined
   * header.
   * This should be an array of headers with `name` and `value` keys, e.g.:
   * ```
   * [{
   *   name: "x-token",
   *   value: "value"
   * }]
   * ```
   */
  @property({ type: Array }) appendHeaders?: ApiType[];

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
   */
  @property({ type: String }) proxy?: string;

  /**
   * If `proxy` is set, it will URL encode the request URL before appending it to the proxy URL.
   * `http://domain.com/path/?query=some+value` will become
   * `https://proxy.com/?url=http%3A%2F%2Fdomain.com%2Fpath%2F%3Fquery%3Dsome%2Bvalue`
   */
  @property({ type: Boolean, reflect: true }) proxyEncodeUrl?: boolean;
  
  /**
   * ID of latest request.
   * It is received from the `api-request-editor` when `api-request`
   * event is dispatched. When `api-response` event is handled
   * the id is compared and if match it renders the result.
   *
   * This system allows to use different request panels on single app
   * and don't mix the results.
   */
  @state() lastRequestId?: string;

  /**
   * If set it computes `hasOptional` property and shows checkbox in the
   * form to show / hide optional properties.
   */
  @property({ type: Boolean, reflect: true }) allowHideOptional?: boolean;

  /**
   * When set, renders "add custom" item button.
   * If the element is to be used without AMF model this should always
   * be enabled. Otherwise users won't be able to add a parameter.
   */
  @property({ type: Boolean, reflect: true }) allowCustom?: boolean;

  /**
   * Holds the value of the currently selected server
   * Data type: URI
   */
  @property({ type: String }) serverValue?: string;

  /**
   * Holds the type of the currently selected server
   * Values: `server` | `slot` | `custom`
   */
  @property({ type: String }) serverType?: string;

  /**
   * Optional property to set
   * If true, the server selector is not rendered
   */
  @property({ type: Boolean, reflect: true }) noServerSelector?: boolean;

  /**
   * Optional property to set
   * If true, the server selector custom base URI option is rendered
   */
  @property({ type: Boolean, reflect: true }) allowCustomBaseUri?: boolean;

  /**
   * List of credentials source
   */
  @property({ type: Array }) credentialsSource?: Oauth2Credentials[];

  /** 
   * When set it applies the authorization values to the request dispatched
   * with the API request event.
   * If possible, it applies the authorization values to query parameter or headers
   * depending on the configuration.
   * 
   * When the values arr applied to the request the authorization config is kept in the
   * request object, but its `enabled` state is always `false`, meaning other potential
   * processors should ignore this values.
   * 
   * If this property is not set then the application hosting this component should
   * process the authorization data and apply them to the request.
   */
  @property({ type: Boolean, reflect: true }) applyAuthorization?: boolean;

  /**
   * By default the element stores user input in a map that is associated with the specific
   * instance of this element. This way the element can be used multiple times in the same document.
   * However, this way parameter values generated by the generators or entered by the user won't
   * get populated in different operations.
   *
   * By setting this value the element prefers a global cache for values. Once the user enter
   * a value it is registered in the global cache and restored when the same parameter is used again.
   *
   * Do not use this option when the element is embedded multiple times in the page. It will result
   * in generating request data from the cache and not what's in the form inputs and these may not be in sync.
   *
   * These values are stored in memory only. Listen to the `change` event to learn that something changed.
   */
  @property({ type: Boolean, reflect: true }) globalCache?: boolean;

  [domainIdValue]?: string;

  /**
   * The domain id (AMF's id) of an API operation.
   */
  @property({ type: String }) 
  get domainId(): string | undefined {
    return this[domainIdValue];
  }

  set domainId(value: string | undefined) {
    const old = this[domainIdValue];
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this[domainIdValue] = value;
    this.requestUpdate('domainId', old);
    this[domainIdChanged](value);
  }

  constructor() {
    super();
    this[responseHandler] = this[responseHandler].bind(this);
    this[requestHandler] = this[requestHandler].bind(this);
    this[navigationHandler] = this[navigationHandler].bind(this);
    this.proxyEncodeUrl = false;
    this.handleNavigationEvents = false;
    this.allowHideOptional = false;
    this.allowCustom = false;
    this.anypoint = false;
    this.outlined = false;
    this.noServerSelector = false;
    this.allowCustomBaseUri = false;
  }

  _attachListeners(node: EventTarget): void {
    this.addEventListener(EventTypes.Request.apiRequest, this[requestHandler] as EventListener);
    node.addEventListener(EventTypes.Request.apiResponse, this[responseHandler] as EventListener);
    node.addEventListener(EventTypes.Request.apiResponseLegacy, this[responseHandler] as EventListener);
    node.addEventListener(EventTypes.Navigation.apiNavigate, this[navigationHandler] as EventListener);
  }

  _detachListeners(node: EventTarget): void {
    this.removeEventListener(EventTypes.Request.apiRequest, this[requestHandler] as EventListener);
    node.removeEventListener(EventTypes.Request.apiResponse, this[responseHandler] as EventListener);
    node.removeEventListener(EventTypes.Request.apiResponseLegacy, this[responseHandler] as EventListener);
    node.removeEventListener(EventTypes.Navigation.apiNavigate, this[navigationHandler] as EventListener);
  }

  /**
   * Serializes the state of the request editor into the `ApiConsoleRequest` object.
   * 
   * Note this is the same object as the one passed to the detail of the api request event.
   */
  serialize(): ApiConsoleRequest {
    const { shadowRoot } = this;
    if (!shadowRoot) {
      throw new Error(`The component is not yet initialized.`);
    }
    const editor = shadowRoot.querySelector('api-request-editor');
    if (!editor) {
      throw new Error(`The request editor has been manually removed from the DOM.`);
    }
    return editor.serialize();
  }

  /**
   * A handler for the API call.
   * This handler will only check if there is authorization required
   * and if the user is authorized.
   *
   * @param e `api-request` event
   */
  [requestHandler](e: ApiRequestEvent): void {
    this.lastRequestId = e.detail.id;
    this[appendConsoleHeaders](e);
    this[appendProxy](e);
  }

  /**
   * Appends headers defined in the `appendHeaders` array.
   * @param e The `api-request` event.
   */
  [appendConsoleHeaders](e: ApiRequestEvent): void {
    const headersToAdd = this.appendHeaders;
    if (!headersToAdd) {
      return;
    }
    const parser = new ArcHeaders(e.detail.headers || '');
    headersToAdd.forEach((header) => {
      const { name, value } = header;
      parser.set(name, value);
    });
    e.detail.headers = parser.toString();
  }

  /**
   * Sets the proxy URL if the `proxy` property is set.
   * @param e The `api-request` event.
   */
  [appendProxy](e: ApiRequestEvent): void {
    const { proxy } = this;
    if (!proxy) {
      return;
    }
    let { url } = e.detail;
    if (this.proxyEncodeUrl) {
      url = encodeURIComponent(url);
    }
    e.detail.url = `${proxy}${url}`;
  }

  /**
   * Handler for the `api-response` custom event. Sets values on the response
   * panel when response is ready.
   */
  [responseHandler](e: ApiResponseEvent): void {
    const response = e.detail as ApiConsoleResponse;
    if (this.lastRequestId !== response.id) {
      return;
    }
    this[propagateResponse](response);
  }

  /**
   * Propagate `api-response` detail object.
   * 
   * Until API Console v 6.x it was using a different response view. The current version 
   * uses new response view based on ARC response view which uses different data structure.
   * This function transforms the response to the one of the corresponding data types used in ARC.
   * However, this keeps compatibility with previous versions of the transport library so it is
   * safe to upgrade the console without changing the HTTP request process.
   *
   * @param {ApiConsoleResponse} data Event's detail object
   */
  async [propagateResponse](data: ApiConsoleResponse): Promise<void> {
    if (data.isError) {
      this.response = {
        error: data.error,
        statusText: data.response.statusText,
        status: data.response.status,
        headers: data.response.headers,
        id: data.id,
        payload: data.response.payload,
      } as ErrorResponse;
    } else {
      this.response = {
        loadingTime: data.loadingTime,
        statusText: data.response.statusText,
        status: data.response.status,
        headers: data.response.headers,
        id: data.id,
        payload: data.response.payload,
      } as Response;
    }

    const transportRequest: TransportRequest = {
      httpMessage: '',
      method: data.request.method,
      endTime: 0,
      startTime: 0,
      url: data.request.url,
      headers: data.request.headers,
      payload: data.request.payload,
    };

    const arcRequest: ArcBaseRequest = {
      method: data.request.method,
      url: data.request.url,
      payload: data.request.payload,
      headers: data.request.headers,
      kind: 'ARC#HttpRequest',
      transportRequest,
      response: this.response,
    };

    this.request = arcRequest;
    await this.updateComplete;
    this.dispatchEvent(new Event('resize', { bubbles: true, composed: true }));
  }

  /**
   * Clears response panel when the `domainId` change.
   */
  [domainIdChanged](id: string): void {
    if (!id) {
      return;
    }
    this.clearResponse();
  }

  /**
   * Clears response panel.
   */
  clearResponse() {
    if (this.request) {
      this.request = undefined;
    }
    if (this.response) {
      this.response = undefined;
    }
  }

  /**
   * Handles navigation events and computes available servers.
   *
   * When `handleNavigationEvents` is set then it also manages the selection.
   */
  [navigationHandler](e: ApiNavigationEvent): void {
    if (this.handleNavigationEvents) {
      const { domainId, domainType } = e.detail;
      this.domainId = domainType === 'operation' ? domainId : undefined;
    }
  }

  /**
   * Retargets the change event from the editor.
   */
  [changeHandler]() {
    this.dispatchEvent(new Event('change'));
  }

  render(): TemplateResult {
    return html`${this[requestTemplate]()}${this[responseTemplate]()}`;
  }

  /**
   * @returns A template for the request panel
   */
  [requestTemplate](): TemplateResult {
    const {
      redirectUri,
      domainId,
      urlEditor,
      urlLabel,
      baseUri,
      eventsTarget,
      allowHideOptional,
      allowCustom,
      anypoint,
      outlined,
      serverValue,
      serverType,
      noServerSelector,
      allowCustomBaseUri,
      credentialsSource,
      globalCache,
      applyAuthorization,
    } = this;

    return html`
    <api-request-editor
      .redirectUri="${redirectUri}"
      domainId="${domainId}"
      ?urlEditor="${urlEditor}"
      ?urlLabel="${urlLabel}"
      .baseUri="${baseUri}"
      .eventsTarget="${eventsTarget}"
      ?allowHideOptional="${allowHideOptional}"
      ?allowCustom="${allowCustom}"
      ?outlined="${outlined}"
      ?anypoint="${anypoint}"
      .serverValue="${serverValue}"
      .serverType="${serverType}"
      ?noServerSelector="${noServerSelector}"
      ?allowCustomBaseUri="${allowCustomBaseUri}"
      .credentialsSource="${credentialsSource}"
      ?globalCache="${globalCache}"
      ?applyAuthorization="${applyAuthorization}"
      @change="${this[changeHandler]}"
    >
      <slot name="custom-base-uri" slot="custom-base-uri"></slot>
    </api-request-editor>`;
  }

  /**
   * @returns A template for the response view
   */
  [responseTemplate](): TemplateResult | string {
    const { hasResponse } = this;
    if (!hasResponse) {
      return '';
    }
    return html`<api-response-view
      .request="${this.request}"
      .response="${this.response}"
      ?anypoint="${this.anypoint}"
    ></api-response-view>`;
  }
}
