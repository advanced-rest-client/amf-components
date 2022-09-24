/* eslint-disable no-continue */
/* eslint-disable no-plusplus */
/* eslint-disable class-methods-use-this */
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
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { uuidV4, Headers, ApiDefinitions, AmfShapes } from '@api-client/core/build/browser.js';
import { AnypointInputElement, AnypointListboxElement, AnypointRadioGroupElement, EventsTargetMixin } from '@anypoint-web-components/awc';
import { RequestEventTypes } from '@advanced-rest-client/events';
import { BodyFormdataEditorElement, BodyRawEditorElement, ifProperty, Oauth2Credentials } from '@advanced-rest-client/base';
import '@anypoint-web-components/awc/dist/define/anypoint-dropdown-menu.js';
import '@anypoint-web-components/awc/dist/define/anypoint-listbox.js';
import '@anypoint-web-components/awc/dist/define/anypoint-item.js';
import '@anypoint-web-components/awc/dist/define/anypoint-item-body.js';
import '@anypoint-web-components/awc/dist/define/anypoint-radio-button.js';
import '@anypoint-web-components/awc/dist/define/anypoint-radio-group.js';
import '@anypoint-web-components/awc/dist/define/anypoint-icon-button.js';
import '@anypoint-web-components/awc/dist/define/anypoint-switch.js';
import '@advanced-rest-client/base/define/body-formdata-editor.js';
import '@advanced-rest-client/base/define/body-multipart-editor.js';
import '@advanced-rest-client/base/define/body-raw-editor.js';
import '@advanced-rest-client/icons/arc-icon.js';
import elementStyles from './styles/Editor.styles.js';
import { ensureContentType, generateHeaders } from "../lib/Utils.js";
import { cachePayloadValue, getPayloadValue, PayloadInfo, readCachePayloadValue } from "../lib/PayloadUtils.js";
import { applyUrlParameters, applyUrlVariables, computeEndpointUri, applyQueryParamStringToObject } from '../lib/UrlUtils.js';
import { SecurityProcessor } from '../lib/SecurityProcessor.js';
import { AmfParameterMixin } from '../lib/AmfParameterMixin.js';
import { AmfInputParser } from '../lib/AmfInputParser.js';
import * as InputCache from '../lib/InputCache.js';
import { Events } from '../events/Events.js';
import { EventTypes } from '../events/EventTypes.js';
import '../../define/api-authorization-editor.js';
import '../../define/api-server-selector.js';
import { AbortRequestEventDetail, ApiConsoleRequest, OperationParameter, PopulationInfo, SecuritySelectorListItem } from '../types.js';

export const EventCategory = 'API Request editor';

export const domainIdValue = Symbol('domainIdValue');
export const operationValue = Symbol('currentModel');
export const endpointValue = Symbol('endpointValue');
export const loadingRequestValue = Symbol('loadingRequestValue');
export const requestIdValue = Symbol('requestIdValue');
export const baseUriValue = Symbol('baseUriValue');
export const urlInvalidValue = Symbol('urlInvalidValue');
export const serverLocalValue = Symbol('serverLocalValue');
export const processOperation = Symbol('processOperation');
export const processEndpoint = Symbol('processEndpoint');
export const processSecurity = Symbol('processSecurity');
export const processPayload = Symbol('processPayload');
export const appendToParams = Symbol('appendToParams');
export const securityList = Symbol('securityList');
export const updateServer = Symbol('updateServer');
export const updateServerParameters = Symbol('updateServerParameters');
export const updateEndpointParameters = Symbol('updateEndpointParameters');
export const computeUrlValue = Symbol('computeUrlValue');
export const getOrderedPathParams = Symbol('getOrderedPathParams');
export const validateUrl = Symbol('validateUrl');
export const readUrlValidity = Symbol('readUrlValidity');
export const authSelectorHandler = Symbol('authSelectorHandler');
export const mediaTypeSelectHandler = Symbol('mediaTypeSelectHandler');
export const modelBodyEditorChangeHandler = Symbol('modelBodyEditorChangeHandler');
export const rawBodyChangeHandler = Symbol('rawBodyChangeHandler');
export const serverCountHandler = Symbol('serverCountHandler');
export const serverHandler = Symbol('serverHandler');
export const populateAnnotatedFieldsHandler = Symbol('populateAnnotatedFieldsHandler');
export const authRedirectChangedHandler = Symbol('authRedirectChangedHandler');
export const responseHandler = Symbol('responseHandler');
export const sendHandler = Symbol('sendHandler');
export const abortHandler = Symbol('abortHandler');
export const optionalToggleHandler = Symbol('optionalToggleHandler');
export const addCustomHandler = Symbol('addCustomHandler');
export const internalSendHandler = Symbol('internalSendHandler');
export const authorizationTemplate = Symbol('authorizationTemplate');
export const authorizationSelectorTemplate = Symbol('authorizationSelectorTemplate');
export const authorizationSelectorItemTemplate = Symbol('authorizationSelectorItemTemplate');
export const mediaTypeSelectorTemplate = Symbol('mediaTypeSelectorTemplate');
export const bodyTemplate = Symbol('bodyTemplate');
export const formDataEditorTemplate = Symbol('formDataEditorTemplate');
export const multipartEditorTemplate = Symbol('multipartEditorTemplate');
export const rawEditorTemplate = Symbol('rawEditorTemplate');
export const headersTemplate = Symbol('headersTemplate');
export const parametersTemplate = Symbol('parametersTemplate');
export const serverSelectorTemplate = Symbol('serverSelectorTemplate');
export const toggleOptionalTemplate = Symbol('toggleOptionalTemplate');
export const urlLabelTemplate = Symbol('urlLabelTemplate');
export const formActionsTemplate = Symbol('formActionsTemplate');
export const abortButtonTemplate = Symbol('abortButtonTemplate');
export const sendButtonTemplate = Symbol('sendButtonTemplate');
export const addCustomButtonTemplate = Symbol('addCustomButtonTemplate');
export const urlEditorTemplate = Symbol('urlEditorTemplate');
export const urlEditorChangeHandler = Symbol('urlEditorChangeHandler');
export const computeUrlRegexp = Symbol('computeUrlRegexp');
export const urlSearchRegexpValue = Symbol('urlSearchRegexpValue');
export const applyUriValues = Symbol('applyUriValues');
export const applyQueryParamsValues = Symbol('applyQueryParamsValues');
export const orderPathParameters = Symbol('orderPathParameters');
export const queryOperation = Symbol('queryOperation');
export const queryEndpoint = Symbol('queryEndpoint');
export const queryServers = Symbol('queryServers');
export const queryProtocols = Symbol('queryProtocols');
export const protocolsValue = Symbol('protocolsValue');
export const serversValue = Symbol('serversValue');
export const queryVersion = Symbol('queryVersion');
export const versionValue = Symbol('versionValue');
export const graphChangeHandler = Symbol('graphChangeHandler');
export const debounceValue = Symbol('debounceValue');
export const processDebounce = Symbol('processDebounce');
export const authorizationChangeHandler = Symbol('authorizationChangeHandler');

export default class ApiRequestEditorElement extends AmfParameterMixin(EventsTargetMixin(LitElement)) {
  static get styles(): CSSResult[] {
    return [
      elementStyles,
    ];
  }

  /** 
   * The currently selected media type for the payloads.
   * @attribute
   */
  @property({ type: String, reflect: true, }) mimeType?: string;

  /**
   * When set it renders a label with the computed URL.
   * @attribute
   */
  @property({ type: Boolean, reflect: true }) urlLabel?: boolean;

  /**
   * When set it renders the URL input above the URL parameters.
   * @attribute
   */
  @property({ type: Boolean, reflect: true }) urlEditor?: boolean;

  /**
   * If set it computes `hasOptional` property and shows checkbox in the
   * form to show / hide optional properties.
   * @attribute
   */
  @property({ type: Boolean, reflect: true }) allowHideOptional?: boolean;

  /**
   * When set, renders "add custom" item button.
   * If the element is to be used without AMF model this should always
   * be enabled. Otherwise users won't be able to add a parameter.
   * @attribute
   */
  @property({ type: Boolean, reflect: true }) allowCustom?: boolean;

  /**
   * Enables Anypoint platform styles.
   * @attribute
   */
  @property({ type: Boolean, reflect: true }) anypoint?: boolean;

  /**
   * Enables Material Design outlined style
   * @attribute
   */
  @property({ type: Boolean, reflect: true }) outlined?: boolean;

  /**
   * OAuth2 redirect URI.
   * This value **must** be set in order for OAuth 1/2 to work properly.
   * @attribute
   */
  @property({ type: String }) redirectUri?: string;

  /**
   * Final request URL including settings like `baseUri`, AMF
   * model settings and user provided parameters.
   * @attribute
   */
  @property({ type: String }) url?: string;

  /**
   * Holds the value of the currently selected server
   * Data type: URI
   * @attribute
   */
  @property({ type: String }) serverValue?: string;

  /**
   * Holds the type of the currently selected server
   * Values: `server` | `uri` | `custom`
   * @attribute
   */
  @property({ type: String }) serverType?: string;

  /**
   * Optional property to set
   * If true, the server selector is not rendered
   * @attribute
   */
  @property({ type: Boolean, reflect: true }) noServerSelector?: boolean;

  /**
   * Optional property to set
   * If true, the server selector custom base URI option is rendered
   * @attribute
   */
  @property({ type: Boolean, reflect: true }) allowCustomBaseUri?: boolean;
  
  /**
   * List of credentials source
   */
  @property({ type: Array }) credentialsSource?: Oauth2Credentials[];

  /** 
   * The index of the selected security definition to apply.
   * @attribute
   */
  @property({ type: Number }) selectedSecurity: number;

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
   * @attribute
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
   * @attribute
   */
  @property({ type: Boolean, reflect: true }) globalCache: boolean;

  /** 
   * Optional. The parent endpoint id. When set it uses this value to query for the endpoint
   * instead of querying for a parent through the operation id.
   * Also, when `endpoint` is set and the `endpointId` match then it ignores querying for 
   * the endpoint.
   * @attribute
   */
  @property({ type: String }) endpointId?: string;

  [domainIdValue]: string | undefined;

  /**
   * The domain id (AMF id) of the rendered operation.
   * @attribute
   */
  @property({ type: String, reflect: true })
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
    this[processDebounce]();
  }

  [endpointValue]: ApiDefinitions.IApiEndPoint | undefined;


  get endpoint(): ApiDefinitions.IApiEndPoint | undefined {
    return this[endpointValue];
  }

  set endpoint(value: ApiDefinitions.IApiEndPoint | undefined) {
    const old = this[endpointValue];
    if (old === value) {
      return;
    }
    this[endpointValue] = value;
    this.requestUpdate();
    this.readUrlData();
    this.notifyChange();
  }

  /**
   * The HTTP method name.
   */
  get httpMethod(): string | undefined {
    const op = this[operationValue];
    if (!op) {
      return undefined;
    }
    return op.method;
  }

  [loadingRequestValue]: boolean | undefined;

  /**
   * A flag set when the request is being made.
   */
  get loadingRequest(): boolean | undefined {
    return this[loadingRequestValue];
  }

  [requestIdValue]: string | undefined;
  
  /**
   * Generated request ID when the request is sent. This value is reported in send and abort events
   */
  get requestId(): string | undefined {
    return this[requestIdValue];
  }

  [baseUriValue]: string | undefined;

  /**
   * A base URI for the API. To be set if RAML spec is missing `baseUri`
   * declaration and this produces invalid URL input. This information
   * is passed to the URL editor that prefixes the URL with `baseUri` value
   * if passed URL is a relative URL.
   * @attribute
   */
  @property({ type: String }) get baseUri(): string | undefined {
    return this[baseUriValue];
  }

  set baseUri(value: string | undefined) {
    const old = this[baseUriValue];
    if (old === value) {
      return;
    }
    this[baseUriValue] = value;
    this.readUrlData();
    this.requestUpdate('baseUri', old);
  }

  [serversValue]: ApiDefinitions.IApiServer[] | undefined;

  /**
   * The computed list of servers.
   */
  get servers(): ApiDefinitions.IApiServer[] | undefined {
    return this[serversValue];
  }

  [serverLocalValue]: ApiDefinitions.IApiServer | undefined;

  get server(): ApiDefinitions.IApiServer | undefined {
    return this[serverLocalValue];
  }

  /**
   * This is the final computed value for the baseUri to propagate downwards
   * If baseUri is defined, return baseUri
   * Else, return the selectedServerValue if serverType is not `server`
   */
  get effectiveBaseUri(): string {
    if (this.baseUri) {
      return this.baseUri;
    }
    if (this.serverType !== 'server') {
      return this.serverValue as string;
    }
    return '';
  }

  /**
   * @return True when there are not enough servers to render the selector
   */
  get serverSelectorHidden(): boolean {
    const { serversCount = 0, noServerSelector = false, allowCustomBaseUri } = this;
    return noServerSelector || (!allowCustomBaseUri && serversCount < 2);
  }

  /** 
   * The list of security list items to render.
   * An operation may have multiple security definition in an or/and fashion.
   * This allows to render the selector to pick the current security.
   */
  [securityList]: SecuritySelectorListItem[] | undefined;

  /**
   * The security requirement for the operation or undefined.
   */
  get security(): SecuritySelectorListItem[] | undefined {
    const items = this[securityList];
    if (Array.isArray(items) && items.length) {
      return items;
    }
    return undefined;
  }

  /**
   * The currently rendered payload, if any.
   */
  get payload(): ApiDefinitions.IApiPayload | undefined {
    const { payloads } = this;
    if (!payloads) {
      return undefined;
    }
    const { mimeType } = this;
    let payload: ApiDefinitions.IApiPayload | undefined;
    if (mimeType) {
      payload = payloads.find(i => i.mediaType === mimeType);
    }
    if (!payload) {
      [payload] = payloads;
    }
    return payload;
  }

  /**
   * The list of all possible payloads for this operation.
   */
  get payloads(): ApiDefinitions.IApiPayload[] | undefined {
    const operation = this[operationValue];
    if (!operation) {
      return undefined;
    }
    const { request } = operation;
    if (!request) {
      return undefined;
    }
    const { payloads } = request;
    if (!Array.isArray(payloads) || !payloads.length) {
      return undefined;
    }
    return payloads;
  }

  /**
   * @returns {string|undefined} API defined base URI (current server + the endpoint)
   */
  get apiBaseUri(): string | undefined {
    const endpoint = this[endpointValue];
    const server = this[serverLocalValue];
    if (!server || !endpoint) {
      return undefined;
    }
    const { path = '' } = endpoint;
    let { url = '' } = server;
    if (url.endsWith('/')) {
      url = url.substr(0, url.length - 1);
    }
    return `${url}${path}`;
  }

  [urlInvalidValue]?: boolean;

  /**
   * True when the URL input is invalid.
   */
  get urlInvalid(): boolean | undefined {
    return this[urlInvalidValue];
  }

  [protocolsValue]: string[] | undefined;

  /**
   * The API's protocols.
   */
  get protocols(): string[] | undefined {
    return this[protocolsValue];
  }

  [versionValue]: string | undefined;

  /**
   * The API's version.
   */
  get version(): string | undefined {
    return this[versionValue];
  }

  queryDebouncerTimeout: number;

  /** 
   * Set when the selection change, this is a JS object created form the 
   * supportedOperation definition of the AMF graph.
   */
  [operationValue]?: ApiDefinitions.IApiOperation;

  /** 
   * The list of parameter groups that are opened when `allowHideOptional` is set.
   */
  openedOptional: string[];

  [debounceValue]: any;

  [urlSearchRegexpValue]: RegExp | undefined;

  serversCount?: number;

  /**
   * @constructor
   */
  constructor() {
    super();
    /** 
     * The timeout after which the `queryGraph()` function is called 
     * in the debouncer.
     */
    this.queryDebouncerTimeout = 1;
    this[responseHandler] = this[responseHandler].bind(this);
    this[authRedirectChangedHandler] = this[authRedirectChangedHandler].bind(this);
    this[populateAnnotatedFieldsHandler] = this[populateAnnotatedFieldsHandler].bind(this);
    this[internalSendHandler] = this[internalSendHandler].bind(this);
    this.selectedSecurity = 0;
    this.openedOptional = [];
    this.globalCache = false;
    
    // for the AmfParameterMixin
    this.target = this;
    InputCache.registerLocal(this);
    this[graphChangeHandler] = this[graphChangeHandler].bind(this);
  }

  // for the AmfParameterMixin
  notifyChange(): void {
    this.dispatchEvent(new Event('change'));
  }

  connectedCallback(): void {
    super.connectedCallback();
    this[processDebounce]();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this[debounceValue]) {
      clearTimeout(this[debounceValue]);
      this[debounceValue] = undefined;
    }
  }

  _attachListeners(node: EventTarget): void {
    node.addEventListener(EventTypes.Store.graphChange, this[graphChangeHandler]);
    node.addEventListener(EventTypes.Request.apiResponse, this[responseHandler] as EventListener);
    node.addEventListener(EventTypes.Request.apiResponseLegacy, this[responseHandler] as EventListener);
    node.addEventListener(EventTypes.Request.redirectUriChange, this[authRedirectChangedHandler] as EventListener);
    node.addEventListener(EventTypes.Request.redirectUriChangeLegacy, this[authRedirectChangedHandler] as EventListener);
    node.addEventListener(EventTypes.Request.populateAnnotatedFields, this[populateAnnotatedFieldsHandler] as EventListener);
    node.addEventListener(EventTypes.Request.populateAnnotatedFieldsLegacy, this[populateAnnotatedFieldsHandler] as EventListener);
    this.addEventListener(RequestEventTypes.send, this[internalSendHandler]);
    super._attachListeners(node);
  }

  _detachListeners(node: EventTarget): void {
    node.removeEventListener(EventTypes.Store.graphChange, this[graphChangeHandler]);
    node.removeEventListener(EventTypes.Request.apiResponse, this[responseHandler] as EventListener);
    node.removeEventListener(EventTypes.Request.apiResponseLegacy, this[responseHandler] as EventListener);
    node.removeEventListener(EventTypes.Request.redirectUriChange, this[authRedirectChangedHandler] as EventListener);
    node.removeEventListener(EventTypes.Request.redirectUriChangeLegacy, this[authRedirectChangedHandler] as EventListener);
    node.removeEventListener(EventTypes.Request.populateAnnotatedFields, this[populateAnnotatedFieldsHandler] as EventListener);
    node.removeEventListener(EventTypes.Request.populateAnnotatedFieldsLegacy, this[populateAnnotatedFieldsHandler] as EventListener);
    this.removeEventListener(RequestEventTypes.send, this[internalSendHandler]);
    super._detachListeners(node);
  }

  /**
   * Handler for the event dispatched by the store when the graph model change.
   */
  [graphChangeHandler](): void {
    this[processDebounce]()
  }

  /**
   * Calls the `queryGraph()` function in a debouncer.
   */
  [processDebounce](): void {
    if (this[debounceValue]) {
      clearTimeout(this[debounceValue]);
    }
    this[debounceValue] = setTimeout(() => {
      this[debounceValue] = undefined;
      this.processGraph();
    }, this.queryDebouncerTimeout);
  }

  /**
   * Reads the URL data from the ApiUrlDataModel library and sets local variables.
   */
  readUrlData(): void {
    this[updateServerParameters]();
    this[orderPathParameters]()
    this[computeUrlValue]();
  }

  /**
   * It makes sure that the path parameters are rendered in order (server, endpoint) and in order of occurrence in the URL. 
   */
  [orderPathParameters](): void {
    const params = this[getOrderedPathParams]();
    if (!params || !params.length) {
      return;
    }
    this.parametersValue = this.parametersValue.filter(item => item.binding !== 'path');
    this.parametersValue = this.parametersValue.concat(params);
  }

  /**
   * A function to be overwritten by child classes to execute an action when a parameter has changed.
   */
  paramChanged(key: string): void {
    this[computeUrlValue]();
    this[validateUrl]();
    const param = this.parametersValue.find(p => p.paramId === key);
    if (param && param.binding === 'header' && (param.parameter.name || '').toLocaleLowerCase() === 'content-type') {
      const value = InputCache.get(this, param.paramId, this.globalCache) as string;
      this.mimeType = value;
    }
  }

  /**
   * Computes the URL value for the current serves, selected server, and endpoint's path.
   */
  [computeUrlValue](): void {
    const { effectiveBaseUri, server, protocols, version } = this;
    const endpoint = this[endpointValue];
    const result = computeEndpointUri({
      baseUri: effectiveBaseUri,
      server,
      endpoint,
      protocols,
      version,
      forceHttpProtocol: true,
    });
    const params = this.parametersValue.map(p => p.parameter);
    const report = AmfInputParser.reportRequestInputs(params, InputCache.getStore(this, this.globalCache), this.nilValues);
    let url = applyUrlVariables(result, report.path, true);
    url = applyUrlParameters(url, report.query, true);
    this.url = url;
  }

  /**
   * Checks if the current server has variables and update the parameters array
   */
  [updateServerParameters](): void {
    const { server } = this;
    const source = 'server';
    // clears previously set request parameters related to server configuration.
    this.parametersValue = this.parametersValue.filter(item => item.source !== source);
    if (!server || ['custom', 'uri'].includes(this.serverType || '')) {
      // we don't need to compute server variables for a custom URLs.
      return;
    }
    if (Array.isArray(server.variables) && server.variables.length) {
      server.variables.forEach((param) => {
        const item: OperationParameter = {
          binding: param.binding || '',
          paramId: param.id,
          parameter: param,
          source,
        };
        if (param.schema) {
          item.schema = param.schema;
          item.schemaId = param.schema.id;
        }
        this.parametersValue.push(item);
      });
    }
  }

  /**
   * Checks if the current endpoint has variables and requests them when needed.
   */
  [updateEndpointParameters](): void {
    const source = 'endpoint';
    // clears previously set request parameters related to server configuration.
    this.parametersValue = this.parametersValue.filter(item => item.source !== source);
    const endpoint = this[endpointValue];
    if (!endpoint) {
      // we don't need to compute endpoint variables for a custom URLs.
      return;
    }
    if (Array.isArray(endpoint.parameters) && endpoint.parameters.length) {
      endpoint.parameters.forEach((param) => {
        const item: OperationParameter = {
          binding: param.binding || '',
          paramId: param.id,
          parameter: param,
          source,
        };
        if (param.schema) {
          item.schema = param.schema;
          item.schemaId = param.schema.id;
        }
        this.parametersValue.push(item);
      });
    }
  }

  reset(): void {
    this[securityList] = undefined;
    this.mimeType = undefined;
    this.parametersValue = [];
  }

  /**
   * Processes the selection of the domain id for an operation.
   */
  async processGraph(): Promise<void> {
    await this[queryEndpoint]();
    await this[queryOperation]();
    await this[queryServers]();
    await this[queryProtocols]();
    this[processEndpoint]();
    this[processOperation]();
    this[processSecurity]();
    this[processPayload]();
    this[computeUrlValue]();
    this.readUrlData();
    this.notifyChange();
  }

  /**
   * Queries the store for the operation data, when needed.
   */
  async [queryOperation](): Promise<void> {
    const { domainId } = this;
    if (!domainId || domainId === 'undefined') {
      // this[operationValue] = undefined;
      return;
    }
    if (this[operationValue] && this[operationValue].id === domainId) {
      // in case the operation model was provided via the property setter.
      return;
    }
    try {
      const endpointId = this[endpointValue] && this[endpointValue].id;
      const info = await Events.Operation.get(this, domainId, endpointId);
      this[operationValue] = info;
    } catch (e) {
      const ex = e as Error;
      Events.Telemetry.exception(this, ex.message, false);
      Events.Reporting.error(this, ex, `Unable to query for API operation data: ${ex.message}`, this.localName);
    }
  }

  /**
   * Queries the store for the endpoint data.
   * @returns {Promise<void>}
   */
  async [queryEndpoint](): Promise<void> {
    const { domainId, endpointId } = this;
    if (!domainId || domainId === 'undefined') {
      // this[endpointValue] = undefined;
      return;
    }
    if (this[endpointValue] && this[endpointValue].id === endpointId) {
      // in case the endpoint model was provided via the property setter.
      return;
    }
    this[endpointValue] = undefined;
    try {
      const info = await (endpointId ? Events.Endpoint.get(this, endpointId) : Events.Operation.getParent(this, domainId));
      this[endpointValue] = info;
    } catch (e) {
      const ex = e as Error;
      Events.Telemetry.exception(this, ex.message, false);
      Events.Reporting.error(this, ex, `Unable to query for API endpoint data: ${ex.message}`, this.localName);
    }
  }

  /**
   * Queries for the current servers value.
   */
  async [queryServers](): Promise<void> {
    const { domainId } = this;
    const endpointId = this[endpointValue] && this[endpointValue].id;
    try {
      const info = await Events.Server.query(this, {
        endpointId,
        methodId: domainId,
      });
      this[serversValue] = info || undefined;
    } catch (e) {
      const ex = e as Error;
      this[serversValue] = undefined;
      Events.Telemetry.exception(this, ex.message, false);
      Events.Reporting.error(this, ex, `Unable to query for API servers: ${ex.message}`, this.localName);
    }
  }

  /**
   * Queries the API store for the API protocols list.
   */
  async [queryProtocols](): Promise<void> {
    this[protocolsValue] = undefined;
    try {
      const info = await Events.Api.protocols(this);
      this[protocolsValue] = info;
    } catch (e) {
      const ex = e as Error;
      Events.Telemetry.exception(this, ex.message, false);
      Events.Reporting.error(this, ex, `Unable to query for API protocols list: ${ex.message}`, this.localName);
    }
  }

  /**
   * Queries the API store for the API version value.
   */
  async [queryVersion](): Promise<void> {
    this[versionValue] = undefined;
    try {
      const info = await Events.Api.version(this);
      this[versionValue] = info;
    } catch (e) {
      const ex = e as Error;
      Events.Telemetry.exception(this, ex.message, false);
      Events.Reporting.error(this, ex, `Unable to query for API version value: ${ex.message}`, this.localName);
    }
  }

  /**
   * Searches for the current operation endpoint and sets variables from the endpoint definition.
   */
  [processEndpoint](): void {
    this[updateEndpointParameters]();
    this[computeUrlRegexp]();
  }

  /**
   * Collects operations input parameters into a single object.
   */
  [processOperation](): void {
    const source = 'request';
    const operation = this[operationValue];
    // clears previously set request parameters (query, path, headers)
    this.parametersValue = this.parametersValue.filter(item => item.source !== source);
    if (!operation) {
      return;
    }
    const { request } = operation;
    if (!request) {
      return;
    }
    const uri: ApiDefinitions.IApiParameter[] = [];
    if (Array.isArray(request.uriParameters)) {
      // OAS has this weird thing where you can define URI parameters on the endpoint and the operation.
      // this eliminates the duplicates and merges the schemas
      request.uriParameters.forEach((param) => {
        if (!param.paramName) {
          uri.push(param);
          return;
        }
        const index = this.parametersValue.findIndex(p => p.binding === 'path' && p.parameter.paramName === param.paramName);
        if (index !== -1) {
          // remove the parameter that is being replaced by the local definition
          this.parametersValue.splice(index, 1);
        }
        uri.push(param);
      });
    }
    this[appendToParams](uri, source);
    this[appendToParams](request.queryParameters, source);
    this[appendToParams](request.headers, source);
    this[appendToParams](request.cookieParameters, source);
  }

  /**
   * Processes security information for the UI.
   */
  [processSecurity](): void {
    const operation = this[operationValue];
    if (!operation) {
      return;
    }
    const { security } = operation;
    this[securityList] = SecurityProcessor.readSecurityList(security);
    this.selectedSecurity = 0;
  }

  /**
   * Makes sure the correct mime type is selected for the current selection.
   */
  [processPayload](): void {
    const operation = this[operationValue];
    if (!operation) {
      return;
    }
    const { request } = operation;
    if (!request) {
      return;
    }
    const { payloads = [] } = request;
    if (!payloads.length) {
      return;
    }
    let mime = this.mimeType;
    if (mime) {
      const has = payloads.find(p => p.mediaType === mime);
      if (!has) {
        mime = undefined;
      }
    }
    if (!mime) {
      const first = payloads.find(p => p.mediaType);
      if (first) {
        mime = first.mediaType;
      }
    }
    this.mimeType = mime;
  }

  /**
   * Appends a list of parameters to the list of rendered parameters
   */
  [appendToParams](list: ApiDefinitions.IApiParameter[], source: string): void {
    const params = this.parametersValue;
    if (Array.isArray(list)) {
      list.forEach((param) => {
        params.push({
          paramId: param.id,
          parameter: param,
          binding: param.binding || '',
          source,
          schema: param.schema,
          schemaId: param.schema && param.schema.id ? param.schema.id : undefined,
        });
      });
    }
  }

  /**
   * A handler for the change event dispatched by the `raw` editor.
   */
  [rawBodyChangeHandler](e: Event): void {
    const editor = e.target as BodyRawEditorElement;
    const { value, dataset } = editor;
    const { payloadId } = dataset;
    if (!payloadId) {
      return;
    }
    cachePayloadValue(payloadId, value);
  }

  /**
   * A handler for the change event dispatched by the 
   * `urlEncode` editor.
   * Updated the local value, model, and notifies the change.
   */
  [modelBodyEditorChangeHandler](e: Event): void {
    const editor = e.target as BodyFormdataEditorElement;
    const { value, model, dataset } = editor;
    const { payloadId } = dataset;
    if (!payloadId) {
      return;
    }
    cachePayloadValue(payloadId, value, model);
  }

  [authSelectorHandler](e: Event): void {
    const list = e.target as AnypointListboxElement;
    const { selected } = list;
    this.selectedSecurity = Number(selected);
    this.requestUpdate();
  }

  /**
   * Handles send button click.
   * Depending on authorization validity it either sends the
   * request or forces authorization and sends the request.
   */
  [sendHandler](): void {
    this.execute();
  }

  /**
   * To be called when the user want to execute the request but
   * authorization is invalid (missing values).
   * This function brings the auth panel to front and displays error toast
   *
   * TODO: There is a case when the user didn't requested OAuth2 token
   * but provided all the data. This function should check for this
   * condition and call authorization function automatically.
   */
  async authAndExecute(): Promise<void> {
    const { shadowRoot } = this;
    if (!shadowRoot) {
      throw new Error(`Invalid state. The element is not initialized.`);
    }

    const panel = shadowRoot.querySelector('api-authorization-editor');
    if (!panel) {
      throw new Error(`Invalid state. The authorization editor element was removed from the DOM.`);
    }
    await panel.authorize();
    const valid = panel.validate();
    if (valid) {
      this.execute();
    }
  }

  /**
   * Executes the request by dispatching `api-request` custom event.
   * The event must be handled by hosting application to ensure transport.
   * Use `advanced-rest-client/xhr-simple-request` component to add logic
   * that uses XHR as a transport.
   *
   * Hosting application also must reset state of `loadingRequest` property
   * once the response is ready. It also can dispatch `api-response`
   * custom event handled by this element to reset state. This is also
   * handled by `xhr-simple-request` component.
   */
  execute(): void {
    const request = this.serialize();
    const uuid = uuidV4();
    this[requestIdValue] = uuid;
    request.id = uuid;
    this[loadingRequestValue] = true;
    Events.Request.apiRequest(this, request);
    Events.Request.apiRequestLegacy(this, request);
    Events.Telemetry.event(this, {
      category: EventCategory,
      action: 'request-execute',
      label: 'true'
    });
    this.requestUpdate();
  }

  /**
   * Sends the `abort-api-request` custom event to cancel the request.
   * Calling this method before sending request may have unexpected
   * behavior because `requestId` is only set with `execute()` method.
   */
  abort(): void {
    const { url, requestId } = this;
    if (!url || !requestId) {
      return;
    }
    const detail: AbortRequestEventDetail = {
      url,
      id: requestId,
    };
    Events.Request.abortApiRequest(this, detail);
    Events.Request.abortApiRequestLegacy(this, detail);
    Events.Telemetry.event(this, {
      category: EventCategory,
      action: 'request-abort',
      label: 'true'
    });
    this[loadingRequestValue] = false;
    this[requestIdValue] = undefined;
    this.requestUpdate();
  }

  /**
   * Event handler for abort click.
   */
  [abortHandler](): void {
    this.abort();
  }

  /**
   * Serializes the state of the request editor into the `ApiConsoleRequest` object.
   */
  serialize(): ApiConsoleRequest {
    const op = this[operationValue];
    if (!op) {
      throw new Error(`No API operation defined on the editor`);
    }
    const method = (op.method || 'get').toUpperCase();
    const params: ApiDefinitions.IApiParameter[] = [];
    this.parametersValue.forEach((item) => {
      const { parameter, enabled } = item;
      if (enabled === false) {
        return;
      }
      params.push(parameter);
    });
    const report = AmfInputParser.reportRequestInputs(params, InputCache.getStore(this, this.globalCache), this.nilValues);
    const serverUrl = computeEndpointUri({
      baseUri: this.effectiveBaseUri,
      server: this.server,
      endpoint: this[endpointValue],
      protocols: this.protocols,
      forceHttpProtocol: true,
    });
    let url = applyUrlVariables(serverUrl, report.path, true);
    url = applyUrlParameters(url, report.query, true);
    const headers = generateHeaders(report.header);
    const request: ApiConsoleRequest = {
      method,
      url,
      headers,
    };
    if (!['GET', 'HEAD'].includes(method)) {
      let body: any;
      const { payload } = this;
      if (payload) {
        const info = readCachePayloadValue(payload.id);
        if (info && info.value) {
          body = info.value;
        }
      }
      if (body instanceof FormData) {
        const parser = new Headers(request.headers);
        parser.delete('content-type');
        request.headers = parser.toString();
      } else if (payload) {
        request.headers = ensureContentType(request.headers || '', payload.mediaType);
      }
      if (typeof body !== 'undefined') {
        request.payload = body;
      }
    }
    const authElement = this.shadowRoot?.querySelector('api-authorization-editor');
    if (authElement) {
      const auth = authElement.serialize();
      request.authorization = auth;
      if (this.applyAuthorization) {
        SecurityProcessor.applyAuthorization(request, auth);
      }
    }
    return request;
  }

  /**
   * Handler for the `api-response` custom event.
   * Clears the loading state.
   */
  [responseHandler](e: CustomEvent): void {
    if (!e.detail || (e.detail.id !== this.requestId)) {
      return;
    }
    this[loadingRequestValue] = false;
    this.requestUpdate();
  }

  /**
   * Handler for the `oauth2-redirect-uri-changed` custom event. Changes
   * the `redirectUri` property.
   */
  [authRedirectChangedHandler](e: CustomEvent): void {
    this.redirectUri = e.detail.value;
  }

  /**
   * Handle event for populating annotated fields in the editor.
   */
  [populateAnnotatedFieldsHandler](e: CustomEvent): void {
    const populationInfoArray: PopulationInfo[] = e.detail.values;
    const { parametersValue = [] } = this;
    const allAnnotated = parametersValue.filter(param => Array.isArray(param.parameter.customDomainProperties) && !!param.parameter.customDomainProperties.length);
    let update = false;
    populationInfoArray.forEach(({ annotationName, annotationValue, fieldValue }) => {
      allAnnotated.forEach((item) => {
        const { parameter, paramId } = item;
        const hasAnnotation = (parameter.customDomainProperties || []).some((prop) => prop.name === annotationName && (prop.extension as AmfShapes.IApiScalarNode).value === annotationValue);
        if (!hasAnnotation) {
          return;
        }
        InputCache.set(this, paramId, fieldValue, this.globalCache);
        update = true;
      });
    });
    if (update) {
      this.requestUpdate();
    }
    /* @TODO populate values for the security schema. */
  }

  /**
   * Computes a current server value for selection made in the server selector.
   */
  [updateServer](): void {
    const { serverValue, serverType, servers = [] } = this;
    if (serverType !== 'server') {
      this[serverLocalValue] = undefined;
    } else {
      this[serverLocalValue] = servers.find(server => server.url === serverValue);
    }
    this.readUrlData();
    this[computeUrlRegexp]();
  }

  /**
   * Handler for the change dispatched from the server selector.
   */
  [serverCountHandler](e: CustomEvent): void {
    const { value=0 } = e.detail;
    this.serversCount = value;
    this[updateServer]();
    this.requestUpdate();
  }

  /**
   * Handler for the change dispatched from the server selector.
   */
  [serverHandler](e: CustomEvent): void {
    const { value, type } = e.detail;
    this.serverType = type;
    this.serverValue = value;
    this[updateServer]();
    this[computeUrlRegexp]();
  }

  /**
   * Computes a regexp for the base URI defined in the server to process URL input change
   * and set the `[urlSearchRegexpValue]` value.
   * This should be computed only when a server and en endpoint change.
   */
  [computeUrlRegexp](): void {
    const { effectiveBaseUri } = this;
    let value;
    if (effectiveBaseUri) {
      value = computeEndpointUri({
        baseUri: effectiveBaseUri,
        endpoint: this[endpointValue],
        forceHttpProtocol: true,
      });
    } else {
      value = this.apiBaseUri;
    }
    if (!value) {
      this[urlSearchRegexpValue] = undefined;
    } else {
      value = value.replace('?', '\\?');
      value = value.replace(/(\.|\/)/g, '\\$1');
      value = value.replace(/{[\w\\+]+}/g, '([a-zA-Z0-9\\$\\-_\\.~\\+!\'\\(\\)\\*\\{\\}]+)');
      value += '.*';
      this[urlSearchRegexpValue] = new RegExp(value);
    }
  }

  [mediaTypeSelectHandler](e: Event): void {
    const select = e.target as AnypointRadioGroupElement;
    const { selected } = select;
    const mime = String(selected);
    this.mimeType = mime;
    const ctParam = this.parametersValue.find(p => p.binding === 'header' && (p.parameter.name || '').toLocaleLowerCase() === 'content-type');
    if (ctParam) {
      InputCache.set(this, ctParam.paramId, mime, this.globalCache);
    }
  }

  /**
   * Toggles optional parameter groups.
   */
  async [optionalToggleHandler](e: Event): Promise<void> {
    const node = e.target as HTMLElement;
    const { target } = node.dataset;
    if (!target) {
      return;
    }
    if (!Array.isArray(this.openedOptional)) {
      this.openedOptional = [];
    }
    if (this.openedOptional.includes(target)) {
      const index = this.openedOptional.indexOf(target);
      this.openedOptional.splice(index, 1);
    } else {
      this.openedOptional.push(target);
    }
    this.requestUpdate();
    await this.updateComplete;
    this.dispatchEvent(new Event('resize', { bubbles: true, composed: true }));
  }

  /**
   * When enabled it adds a new custom parameter to the request section defined in the source button.
   */
  [addCustomHandler](e: Event): void {
    const button = e.currentTarget as HTMLElement;
    const { type } = button.dataset;
    if (!['query', 'header'].includes(type as string)) {
      return;
    }
    const id = uuidV4();
    const param: OperationParameter = {
      binding: type || '',
      source: 'custom',
      paramId: id,
      parameter: {
        id,
        required: true,
        binding: type,
        name: '',
        examples: [],
        payloads: [],
        customDomainProperties: [],
        types: [],
      },
    };
    this.parametersValue.push(param);
    this.requestUpdate();
  }

  /**
   * Updates path/query model from user input.
   *
   * @param e The change event
   */
  [urlEditorChangeHandler](e: Event): void {
    const { value } = e.target as HTMLInputElement;
    let matches;
    const uriRegexp = this[urlSearchRegexpValue];
    // parameters must be in order from server to the endpoint
    const pathParams = this[getOrderedPathParams]();
    let changed = false;
    if (pathParams.length && uriRegexp) {
      matches = value.match(uriRegexp);
      if (matches) {
        matches.shift();
        changed = this[applyUriValues](matches, pathParams);
      }
    }
    const matchesNew = value.match(/[^&?]*?=[^&?]*/g);
    if (matchesNew) {
      const params: Record<string, string|string[]> = {};
      matchesNew.forEach((item) => applyQueryParamStringToObject(item, params));
      const qpChanged = this[applyQueryParamsValues](params);
      if (!changed) {
        changed = qpChanged;
      }
    }
    this.url = value;
    this[validateUrl]();
    this.notifyChange();
    this.requestUpdate();
  }

  /**
   * Sets the value of `[urlInvalidValue]` and therefore `urlInvalid` properties.
   */
  [validateUrl](): void {
    this[urlInvalidValue] = !this[readUrlValidity]();
    this.requestUpdate();
  }

  /**
   * Validates the current URL value.
   * @returns True when the current URL is a valid URL.
   */
  [readUrlValidity](): boolean {
    const { url } = this;
    if (!url) {
      return false;
    }
    if (typeof url !== 'string') {
      return false;
    }
    if (url.indexOf('{') !== -1 && url.indexOf('}') !== -1) {
      return false;
    }
    const { shadowRoot } = this;
    if (!shadowRoot) {
      return true;
    }
    const inputElement = shadowRoot.querySelector('.url-input') as AnypointInputElement;
    if (inputElement) {
      return inputElement.checkValidity();
    }
    return true;
  }

  /**
   * Reads the ordered list of path parameters from the server and the endpoint.
   */
  [getOrderedPathParams](): OperationParameter[] {
    const result: OperationParameter[] = [];
    const { effectiveBaseUri } = this;
    let url;
    if (effectiveBaseUri) {
      url = computeEndpointUri({
        baseUri: effectiveBaseUri,
        endpoint: this[endpointValue],
        forceHttpProtocol: true,
      });
    } else {
      url = this.apiBaseUri;
    }
    if (!url) {
      return result;
    }
    const matches = url.match(/{[\w\\+]+}/g);
    if (!matches) {
      return result;
    }
    const all = this.parametersValue;
    matches.forEach((tpl) => {
      const name = tpl.substr(1, tpl.length - 2);
      const param = all.find(p => p.binding === 'path' && p.parameter.name === name);
      if (param) {
        result.push(param);
      }
    });
    return result;
  }

  /**
   * Applies values from the `values` array to the uri parameters which names are in the `names` array.
   * Both lists are ordered list of parameters.
   *
   * @param values Values for the parameters
   * @param params List of path parameters.
   * @returns True when any parameter was changed.
   */
  [applyUriValues](values: string[], params: OperationParameter[]): boolean {
    let changed = false;
    for (let i = 0, len = params.length; i < len; i++) {
      const value = values[i];
      if (value && value[0] === '{') {
        // This is still a variable
        continue;
      }
      const param = params[i];
      if (InputCache.get(this, param.paramId, this.globalCache) !== value) {
        InputCache.set(this, param.paramId, value, this.globalCache);
        changed = true;
      }
    }
    return changed;
  }

  /**
   * Applies query parameters values to the render list.
   *
   * @returns True when any parameter was changed.
   */
  [applyQueryParamsValues](map: Record<string, string|string[]>): boolean {
    if (!map) {
      return false;
    }
    const keys = Object.keys(map);
    let changed = false;
    keys.forEach((key) => {
      const value = map[key];
      if (value && value[0] === '{') {
        // This is still a variable
        return;
      }
      const param = this.parametersValue.find(p => p.binding === 'query' && p.parameter.name === key);
      if (param) {
        if (InputCache.get(this, param.paramId, this.globalCache) !== value) {
          InputCache.set(this, param.paramId, value, this.globalCache);
          changed = true;
        }
      }
    });
    return changed;
  }

  [internalSendHandler](e: Event): void {
    e.stopPropagation();
    this.execute();
  }

  /**
   * A handler for the change event on the authorization panel.
   */
  [authorizationChangeHandler](): void {
    this.notifyChange();
  }

  render(): TemplateResult {
    return html`
    <div class="content">
      ${this[serverSelectorTemplate]()}
      ${this[urlLabelTemplate]()}
      ${this[urlEditorTemplate]()}
      ${this[parametersTemplate]()}
      ${this[headersTemplate]()}
      ${this[mediaTypeSelectorTemplate]()}
      ${this[bodyTemplate]()}
      ${this[authorizationTemplate]()}
      ${this[formActionsTemplate]()}
    </div>`;
  }

  /**
   * @return Template for the request URL label.
   */
  [urlLabelTemplate](): TemplateResult | string {
    const { urlLabel, url } = this;
    if (!urlLabel) {
      return '';
    }
    return html`<div class="url-label text-selectable" title="Current request URL">${url}</div>`;
  }

  [authorizationTemplate](): TemplateResult | string {
    const { security } = this;
    if (!security) {
      return '';
    }
    const { selectedSecurity = 0, anypoint, outlined, redirectUri, credentialsSource, globalCache } = this;
    const rendered = security[selectedSecurity];
    return html`
    <section class="authorization params-section">
      <div class="section-title"><span class="label">Credentials</span></div>
      ${security.length > 1 ? this[authorizationSelectorTemplate](security, selectedSecurity) : ''}
      <api-authorization-editor 
        .security="${rendered.security}"
        .anypoint="${anypoint}"
        .outlined="${outlined}"
        .oauth2RedirectUri="${redirectUri}"
        .credentialsSource="${credentialsSource}"
        ?globalCache="${globalCache}"
        @change="${this[authorizationChangeHandler]}"></api-authorization-editor>
    </section>
    `;
  }

  /**
   * @returns The template for the security drop down selector.
   */
  [authorizationSelectorTemplate](security: SecuritySelectorListItem[], selected: number): TemplateResult {
    const { anypoint } = this;
    return html`
    <anypoint-dropdown-menu
      name="selected"
      ?anypoint="${anypoint}"
      class="auth-selector"
    >
      <label slot="label">Authorization method</label>
      <anypoint-listbox slot="dropdown-content"
        .selected="${selected}"
        @selectedchange="${this[authSelectorHandler]}"
        .anypoint="${anypoint}"
        attrForItemTitle="data-label"
      >
        ${security.map((item) => this[authorizationSelectorItemTemplate](item))}
      </anypoint-listbox>
    </anypoint-dropdown-menu>
    `;
  }

  /**
   * @returns The template for the security drop down selector list item.
   */
  [authorizationSelectorItemTemplate](info: SecuritySelectorListItem): TemplateResult {
    const { labels, types } = info;
    const label = labels.join(', ');
    const type = types.join(', ');
    const single = !type;
    return html`
    <anypoint-item
      ?anypoint="${this.anypoint}"
      data-label="${label}"
    >
      <anypoint-item-body ?twoline="${!single}">
        <div>${label}</div>
        ${!single ? html`<div data-secondary>${type}</div>` : ''}
      </anypoint-item-body>
    </anypoint-item>
    `;
  }

  [formActionsTemplate](): TemplateResult {
    const loading = this[loadingRequestValue];
    return html`
    <div class="action-bar">
      ${loading ? this[abortButtonTemplate]() : this[sendButtonTemplate]()}
      <progress ?hidden="${!loading}"></progress>
    </div>`;
  }

  /**
   * Creates a template for the "abort" button.
   */
  [abortButtonTemplate](): TemplateResult {
    const { anypoint } = this;
    return html`
    <anypoint-button
      class="send-button abort"
      emphasis="high"
      ?anypoint="${anypoint}"
      @click="${this[abortHandler]}"
    >Abort</anypoint-button>`;
  }

  /**
   * Creates a template for the "send" or "auth and send" button.
   */
  [sendButtonTemplate](): TemplateResult {
    const {
      anypoint,
    } = this;
    return html`
    <anypoint-button
      class="send-button"
      emphasis="high"
      ?anypoint="${anypoint}"
      @click="${this[sendHandler]}"
    >Send</anypoint-button>`;
  }

  /**
   * @return A template for the server selector
   */
  [serverSelectorTemplate](): TemplateResult {
    const {
      serverType,
      serverValue,
      allowCustomBaseUri,
      outlined,
      anypoint,
      serverSelectorHidden,
      domainId,
    } = this;
    return html`
    <api-server-selector
      ?hidden="${serverSelectorHidden}"
      ?allowCustom="${allowCustomBaseUri}"
      .value="${serverValue}"
      .type="${serverType}"
      .domainId="${domainId}"
      domainType="operation"
      autoSelect
      ?anypoint="${anypoint}"
      ?outlined="${outlined}"
      @serverscountchanged="${this[serverCountHandler]}"
      @apiserverchanged="${this[serverHandler]}"
    >
      <slot name="custom-base-uri" slot="custom-base-uri"></slot>
    </api-server-selector>`;
  }

  /**
   * @return 
   */
  [parametersTemplate](): TemplateResult | string {
    const qp: OperationParameter[] = [];
    const path: OperationParameter[] = [];
    // NOTE, the "* Required field" has been added after the a11y audit of API Console.
    let hasRequired = false;
    this.parametersValue.forEach((item) => {
      if (!hasRequired && item.parameter && item.parameter.required) {
        hasRequired = true;
      }
      if (item.binding === 'query') {
        qp.push(item);
      } else if (item.binding === 'path') {
        path.push(item);
      }
    });
    const { allowCustom, openedOptional = [] } = this;
    if (!allowCustom && !qp.length && !path.length) {
      return '';
    }
    const pathOptions = Object.freeze({ required: true });
    const queryClasses = {
      'query-params': true,
      'hide-optional': !!this.allowHideOptional && !openedOptional.includes('query'),
    };
    return html`
    <section class="params-section parameter">
      <div class="section-title"><span class="label">Parameters</span></div>
      ${hasRequired ? html`<p class="required-field">* Required field</p>` : ''}
      <div class="path-params">
        ${path.map(param => this.parameterTemplate(param, pathOptions))}
      </div>
      <div class="${classMap(queryClasses)}">
        ${this[toggleOptionalTemplate]('query', qp)}
        ${qp.map(param => this.parameterTemplate(param))}
        ${allowCustom ? this[addCustomButtonTemplate]('query') : ''}
      </div>
    </section>
    `;
  }

  [headersTemplate](): TemplateResult | string {
    const headers: OperationParameter[] = [];
    // NOTE, the "* Required field" has been added after the a11y audit of API Console.
    let hasRequired = false;
    this.parametersValue.forEach((item) => {
      if (item.binding === 'header') {
        headers.push(item);
        if (!hasRequired && item.parameter && item.parameter.required) {
          hasRequired = true;
        }
      }
    });
    const { allowCustom, openedOptional = [] } = this;
    if (!allowCustom && !headers.length) {
      return '';
    }
    const classes = {
      'header-params': true,
      'hide-optional': !!this.allowHideOptional && !openedOptional.includes('header'),
    };
    return html`
    <section class="params-section header">
      <div class="section-title"><span class="label">Headers</span></div>
      ${hasRequired ? html`<p class="required-field">* Required field</p>` : ''}
      ${this[toggleOptionalTemplate]('header', headers)}
      <div class="${classMap(classes)}">
        ${headers.map(param => this.parameterTemplate(param))}
        ${allowCustom ? this[addCustomButtonTemplate]('header') : ''}
      </div>
    </section>
    `;
  }

  /**
   * @returns The template for the add custom parameter button
   */
  [addCustomButtonTemplate](type: string): TemplateResult {
    return html`
    <div class="add-custom-button">
      <anypoint-button
        data-type="${type}"
        title="Adds a new custom parameter to the request"
        @click="${this[addCustomHandler]}"
      >
        <arc-icon icon="addCircleOutline"></arc-icon>
        Add custom
      </anypoint-button>
    </div>
    `;
  }

  /**
   * @return The template for the payload's mime type selector.
   */
  [mediaTypeSelectorTemplate](): TemplateResult | string {
    const { payloads, mimeType } = this;
    if (!payloads || payloads.length === 1) {
      return '';
    }
    const mimes = payloads.map(p => p.mediaType);
    let index = mimes.indexOf(mimeType);
    if (index === -1) {
      index = 0;
    }

    return html`
    <div class="payload-mime-selector">
      <label>Payload media type</label>
      <anypoint-radio-group 
        @selected="${this[mediaTypeSelectHandler]}" 
        .selected="${index}"
        attrForSelected="data-value" 
      >
        ${mimes.map((item) => html`<anypoint-radio-button name="mediaTypeValue" data-value="${item || ''}">${item}</anypoint-radio-button>`)}
      </anypoint-radio-group>
    </div>
    `;
  }

  /**
   * @returns The template for the body editor. 
   */
  [bodyTemplate](): TemplateResult | string {
    const { payload } = this;
    if (!payload) {
      return '';
    }
    const mimeType = payload.mediaType;
    const info = getPayloadValue(payload);
    if (mimeType === 'application/x-www-form-urlencoded') {
      return this[formDataEditorTemplate](info, payload.id);
    }
    if (mimeType === 'multipart/form-data') {
      return this[multipartEditorTemplate](info, payload.id);
    }
    return this[rawEditorTemplate](info, payload.id, mimeType);
  }

  /**
   * @returns The template for the editor that specializes in the URL encoded form data
   */
  [formDataEditorTemplate](info: PayloadInfo, id: string): TemplateResult {
    const editorModel = info.model;
    const effectiveValue = Array.isArray(editorModel) && editorModel.length ? undefined : info.value;
    return html`
    <body-formdata-editor 
      class="body-editor"
      autoEncode
      .value="${ifProperty(effectiveValue)}"
      .model="${ifProperty(editorModel)}"
      data-payload-id="${id}"
      @change="${this[modelBodyEditorChangeHandler]}"
    ></body-formdata-editor>
    `;
  }

  /**
   * @returns The template for the editor that specializes in the multipart form data
   */
  [multipartEditorTemplate](info: PayloadInfo, id: string): TemplateResult {
    const editorModel = info.model;
    const effectiveValue = Array.isArray(editorModel) && editorModel.length ? undefined : info.value;
    return html`
    <body-multipart-editor 
      class="body-editor"
      .value="${ifProperty(effectiveValue)}"
      .model="${ifProperty(editorModel)}"
      ignoreContentType
      data-payload-id="${id}"
      @change="${this[modelBodyEditorChangeHandler]}"
    ></body-multipart-editor>
    `;
  }

  /**
   * @returns The template for the editor that specializes in any text data
   */
  [rawEditorTemplate](info: PayloadInfo, id: string, mimeType?: string): TemplateResult {
    let schemas;
    if (Array.isArray(info.schemas) && info.schemas.length) {
      schemas = info.schemas;
    }
    return html`
    <body-raw-editor
      class="body-editor" 
      .value="${info.value}" 
      .contentType="${mimeType}"
      .schemas="${ifProperty(schemas)}"
      data-payload-id="${id}"
      @change="${this[rawBodyChangeHandler]}"
    ></body-raw-editor>
    `;
  }

  /**
   * @param target The name of the target parameter group.
   * @param params The list of parameters. When all are required or empty it won't render then button.
   * @returns Template for the switch button to toggle visibility of the optional items.
   */
  [toggleOptionalTemplate](target: string, params: OperationParameter[]): TemplateResult | string {
    const { openedOptional = [], allowHideOptional } = this;
    if (!allowHideOptional || !params || !params.length) {
      return '';
    }
    const optional = params.some(p => !!p.parameter && !p.parameter.required);
    if (!optional) {
      return '';
    }
    const checked = openedOptional.includes(target);
    return html`
    <div class="optional-checkbox">
      <anypoint-switch
        class="toggle-optional-switch"
        .checked="${checked}"
        @change="${this[optionalToggleHandler]}"
        title="Toggles optional parameters"
        data-target="${target}"
      >Show optional parameters</anypoint-switch>
    </div>
    `;
  }

  /**
   * @returns A template for the URL editor.
   */
  [urlEditorTemplate](): TemplateResult | string {
    const { urlEditor, url, urlInvalid } = this;
    if (!urlEditor) {
      return '';
    }
    return html`
    <div class="url-input-wrapper">
      <anypoint-input 
        name="url" 
        type="url" 
        class="url-input"
        ?invalid="${urlInvalid}"
        required
        invalidMessage="The URL is invalid"
        .value="${url}"
        ?anypoint="${this.anypoint}"
        ?outlined="${this.outlined}"
        @change="${this[urlEditorChangeHandler]}"
        @blur="${this[validateUrl]}"
      >
        <label slot="label">Request URL</label>
      </anypoint-input>
    </div>
    `;
  }
}
