/* eslint-disable class-methods-use-this */
import { html, TemplateResult, CSSResult } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { AmfNamespace, ApiDefinitions } from '@api-client/core/build/browser.js';
import { Oauth2Credentials } from '@advanced-rest-client/base';
import { MarkdownStyles } from '@advanced-rest-client/highlight';
import elementStyles from './styles/ApiResource.js';
import commonStyles from './styles/Common.js';
import { 
  ApiDocumentationBase,
  descriptionTemplate,
  customDomainPropertiesTemplate,
} from './ApiDocumentationBase.js';
import { joinTraitNames } from '../lib/Utils.js';
import { SecurityProcessor } from '../lib/SecurityProcessor.js';
import * as UrlLib from '../lib/UrlUtils.js';
import { ReportingEvents } from '../events/ReportingEvents.js';
import { TelemetryEvents } from '../events/TelemetryEvents.js';
import { EndpointEvents } from '../events/EndpointEvents.js';
import { ServerEvents } from '../events/ServerEvents.js';
import { ApiEvents } from '../events/ApiEvents.js';
import '../../define/api-request.js';
import '../../define/api-operation-document.js'
import '../../define/api-parameter-document.js';
import { ApiConsoleRequest } from '../types.js';
import ApiRequestElement from './ApiRequestElement.js';

/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('../helpers/api').ApiEndPoint} ApiEndPoint */
/** @typedef {import('../helpers/api').ApiServer} ApiServer */
/** @typedef {import('../helpers/api').ApiOperation} ApiOperation */
/** @typedef {import('../helpers/api').ApiAnyShape} ApiAnyShape */
/** @typedef {import('../helpers/api').ApiScalarShape} ApiScalarShape */
/** @typedef {import('../types').ServerType} ServerType */
/** @typedef {import('./ApiRequestElement').default} ApiRequestPanelElement */
/** @typedef {import('../types').ApiConsoleRequest} ApiConsoleRequest */

export const operationIdValue = Symbol('operationIdValue');
export const queryEndpoint = Symbol('queryEndpoint');
export const queryServers = Symbol('queryServers');
export const endpointValue = Symbol('endpointValue');
export const serversValue = Symbol('serversValue');
export const serverValue = Symbol('serverValue');
export const serverIdValue = Symbol('serverIdValue');
export const queryProtocols = Symbol('queryProtocols');
export const protocolsValue = Symbol('protocolsValue');
export const urlValue = Symbol('urlValue');
export const baseUriValue = Symbol('baseUriValue');
export const computeUrlValue = Symbol('computeUrlValue');
export const titleTemplate = Symbol('titleTemplate');
export const urlTemplate = Symbol('urlTemplate');
export const operationsTemplate = Symbol('operationsTemplate');
export const operationTemplate = Symbol('operationTemplate');
export const operationIdChanged = Symbol('operationIdChanged');
export const selectServer = Symbol('selectServer');
export const processServerSelection = Symbol('processServerSelection');
export const extensionsTemplate = Symbol('extensionsTemplate');
export const tryItColumnTemplate = Symbol('tryItColumnTemplate');
export const httpRequestTemplate = Symbol('tryItPanelTemplate');
export const codeSnippetsPanelTemplate = Symbol('codeSnippetsPanelTemplate');
export const requestChangeHandler = Symbol('requestChangeHandler');
export const requestValues = Symbol('requestValues');
export const collectCodeSnippets = Symbol('collectCodeSnippets');
export const processSelectionTimeout = Symbol('processSelectionTimeout');
export const extendsTemplate = Symbol('extendsTemplate');
export const traitsTemplate = Symbol('traitsTemplate');
export const readCodeSnippets = Symbol('readCodeSnippets');

/**
 * A web component that renders the resource documentation page for an API resource built from 
 * the AMF graph model.
 * 
 * @fires tryit
 */
export default class ApiResourceDocumentationElement extends ApiDocumentationBase {
  static get styles(): CSSResult[] {
    return [elementStyles, commonStyles, MarkdownStyles];
  }

  [endpointValue]?: ApiDefinitions.IApiEndPoint;

  [serverValue]?: ApiDefinitions.IApiServer;

  [serversValue]?: ApiDefinitions.IApiServer[];

  [operationIdValue]?: string;

  [serverIdValue]?: string;

  [baseUriValue]?: string;

  [urlValue]?: string;

  [protocolsValue]?: string[];

  [requestValues]: Record<string, ApiConsoleRequest>;

  [processSelectionTimeout]: any;
  
  get endpoint(): ApiDefinitions.IApiEndPoint | undefined {
    return this[endpointValue];
  }

  set endpoint(value) {
    const old = this[endpointValue];
    if (old === value) {
      return;
    }
    this[endpointValue] = value;
    this.processGraph();
  }

  get operationId(): string | undefined {
    return this[operationIdValue];
  }

  /** 
   * When set it scrolls to the operation with the given id, if exists.
   * The operation is performed after render.
   * @attribute
   */
  @property({ type: String, reflect: true })
  set operationId(value) {
    const old = this[operationIdValue];
    if (old === value) {
      return;
    }
    this[operationIdValue] = value;
    this.requestUpdate('operationId', old);
    this[operationIdChanged]();
  }

  get serverId(): string | undefined {
    return this[serverIdValue];
  }

  /** 
   * The id of the currently selected server to use to construct the URL.
   * If not set a first server in the API servers array is used.
   * @attribute
   */
  @property({ type: String, reflect: true })
  set serverId(value) {
    const old = this[serverIdValue];
    if (old === value) {
      return;
    }
    this[serverIdValue] = value;
    this[selectServer]();
    this[processServerSelection]();
    this.requestUpdate();
  }

  get server(): ApiDefinitions.IApiServer | undefined {
    if (this[serverValue]) {
      return this[serverValue];
    }
    const servers = this[serversValue];
    if (Array.isArray(servers) && servers.length) {
      const [server] = servers;
      if (server) {
        this[serverValue] = server;
      }
    }
    return this[serverValue];
  }

  set server(value) {
    const old = this[serverValue];
    if (old === value) {
      return;
    }
    this[serverValue] = value;
    this[processServerSelection]();
    this.requestUpdate();
  }

  /**
   * The list of the servers read from the API and the endpoint.
   */
  get servers(): ApiDefinitions.IApiServer[] | undefined {
    return this[serversValue];
  }

  /**
   * The list of protocols to render.
   */
  get protocol(): string | undefined {
    const { server } = this;
    if (!server) {
      return undefined;
    }
    const { protocol } = server;
    return protocol;
  }

  /**
   * A property to set to override AMF's model base URI information.
   * When this property is set, the `endpointUri` property is recalculated.
   * @attribute
   */
  @property({ type: String })
  get baseUri(): string | undefined {
    return this[baseUriValue];
  }


  set baseUri(value) {
    const old = this[baseUriValue];
    if (old === value) {
      return;
    }
    this[baseUriValue] = value;
    this[computeUrlValue]();
    this.requestUpdate();
  }

  /**
   * The computed URI for the endpoint.
   */
  get endpointUri(): string | undefined {
    return this[urlValue];
  }

  /**
   * The API's protocols.
   */
  get protocols(): string[] | undefined {
    return this[protocolsValue];
  }

  
  /** 
   * When set it opens the parameters section
   * @attribute
   */
  @property({ type: Boolean, reflect: true })
  parametersOpened?: boolean;

  /** 
   * When set it renders the "try it" button that dispatches the `tryit` event.
   * @attribute
   */
  @property({ type: Boolean, reflect: true })
  tryItButton?: boolean;

  /** 
   * When set it renders the "try it" panel next to the operation documentation.
   * Setting this automatically disables the `tryItButton` property.
   * 
   * Note, use this only when there's enough space on the screen to render 2 panels side-by-side.
   * @attribute
   */
  @property({ type: Boolean, reflect: true })
  tryItPanel?: boolean;

  /** 
   * When set it renders the URL input above the URL parameters in the HTTP editor.
   * @attribute
   */
  @property({ type: Boolean, reflect: true })
  httpUrlEditor?: boolean;

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
  @property({ type: Boolean, reflect: true })
  httpApplyAuthorization?: boolean;

  /**
   * List of credentials source passed to the HTTP editor
   */
  @property({ type: Array })
  httpCredentialsSource?: Oauth2Credentials[];

  /**
   * OAuth2 redirect URI.
   * This value **must** be set in order for OAuth 1/2 to work properly.
   * This is only required in inline mode (`inlineMethods`).
   * @attribute
   */
  @property({ type: String })
  redirectUri?: string;

  /**
   * Optional property to set on the request editor. 
   * When true, the server selector is not rendered
   * @attribute
   */
  @property({ type: Boolean, reflect: true })
  httpNoServerSelector?: boolean;

  /**
   * When set it renders "add custom" item button in the HTTP request editor.
   * If the element is to be used without AMF model this should always
   * be enabled. Otherwise users won't be able to add a parameter.
   * @attribute
   */
  @property({ type: Boolean, reflect: true })
  httpAllowCustom?: boolean;

  /**
   * Optional property to set on the request editor. 
   * If true, the server selector custom base URI option is rendered
   * @attribute
   */
  @property({ type: Boolean, reflect: true })
  httpAllowCustomBaseUri?: boolean;

  /** 
   * When set it renders the view optimised for asynchronous API operation.
   * @attribute
   */
  @property({ type: Boolean, reflect: true })
  asyncApi?: boolean;

  /**
   * Holds the value of the currently selected server
   * Data type: URI
   * @attribute
   */
  @property({ type: String })
  serverValue?: string;

  /**
   * Holds the type of the currently selected server
   * Values: `server` | `uri` | `custom`
   * @attribute
   */
  @property({ type: String })
  serverType?: string;

  // /**
  //  * true when the API operated over an HTTP protocol. By default it returns true.
  //  */
  // get isHttp(): boolean {
  //   const { protocol } = this;
  //   return ['http', 'https'].includes(String(protocol).toLowerCase());
  // }

  constructor() {
    super();
    
    this[requestValues] = {};
  }

  disconnectedCallback(): void {
    if (this[processSelectionTimeout]) {
      clearTimeout(this[processSelectionTimeout]);
      this[processSelectionTimeout] = undefined;
    }
    super.disconnectedCallback();
  }

  /**
   * Scrolls the view to the operation, when present in the DOM.
   * @param id The operation domain id to scroll into.
   */
  scrollToOperation(id: string): void {
    const { shadowRoot } = this;
    if (!shadowRoot) {
      return;
    }
    const elm = shadowRoot.querySelector(`api-operation-document[data-domain-id="${id}"]`);
    if (!elm) {
      return;
    }
    elm.scrollIntoView({block: 'start', inline: 'nearest', behavior: 'smooth'});
  }

  async processGraph(): Promise<void> {
    await this[queryEndpoint]();
    await this[queryServers]();
    await this[queryProtocols]();
    this[computeUrlValue]();
    this.requestUpdate();
    await this.updateComplete;
    if (this[processSelectionTimeout]) {
      clearTimeout(this[processSelectionTimeout]);
      this[processSelectionTimeout] = undefined;
    }
    // this timeout gives few milliseconds for operations to render.
    this[processSelectionTimeout] = setTimeout(() => {
      this[processSelectionTimeout] = undefined;
      this[collectCodeSnippets]();
      if (this.operationId) {
        this.scrollToOperation(this.operationId);
      }
    }, 200);
  }

  /**
   * Queries the API store for the API summary object.
   */
  async [queryProtocols](): Promise<void> {
    this[protocolsValue] = undefined;
    try {
      const info = await ApiEvents.protocols(this);
      this[protocolsValue] = info;
    } catch (e) {
      const ex = e as Error;
      TelemetryEvents.exception(this, ex.message, false);
      ReportingEvents.error(this, ex, `Unable to query for API protocols list: ${ex.message}`, this.localName);
    }
  }

  /**
   * Queries the store for the endpoint data.
   * @returns {Promise<void>}
   */
  async [queryEndpoint](): Promise<void> {
    const { domainId } = this;
    if (!domainId) {
      // this[endpointValue] = undefined;
      return;
    }
    if (this[endpointValue] && this[endpointValue].id === domainId) {
      // in case the endpoint model was provided via property setter.
      return;
    }
    try {
      const info = await EndpointEvents.get(this, domainId);
      this[endpointValue] = info;
    } catch (e) {
      const ex = e as Error;
      TelemetryEvents.exception(this, ex.message, false);
      ReportingEvents.error(this, ex, `Unable to query for API endpoint data: ${ex.message}`, this.localName);
    }
  }

  /**
   * Scrolls to the selected operation after view update.
   */
  async [operationIdChanged](): Promise<void> {
    await this.updateComplete;
    const { operationId } = this;
    if (operationId) {
      this.scrollToOperation(operationId);
    } else {
      this.scrollIntoView({block: 'start', inline: 'nearest', behavior: 'smooth'});
    }
  }

  /**
   * Queries the store for the current servers value.
   */
  async [queryServers](): Promise<void> {
    this[serversValue] = undefined;
    const { domainId } = this;
    const endpointId = this[endpointValue] && this[endpointValue].id;
    try {
      const info = await ServerEvents.query(this, {
        endpointId,
        methodId: domainId,
      });
      this[serversValue] = info;
    } catch (e) {
      const ex = e as Error;
      TelemetryEvents.exception(this, ex.message, false);
      ReportingEvents.error(this, ex, `Unable to query for API servers: ${ex.message}`, this.localName);
    }
  }

  /**
   * Sets the private server value for the current server defined by `serverId`.
   * Calls the `[processServerSelection]()` function to set server related values.
   */
  [selectServer](): void {
    this[serverValue] = undefined;
    const { serverId } = this;
    const servers = this[serversValue];
    if (!serverId || !Array.isArray(servers)) {
      return;
    }
    this[serverValue] = servers.find(s => s.id === serverId);
  }
  
  /**
   * Performs actions after a server is selected.
   */
  [processServerSelection](): void {
    this[computeUrlValue]();
  }

  /**
   * Computes the URL value for the current serves, selected server, and endpoint's path.
   */
  [computeUrlValue](): void {
    const endpoint = this[endpointValue];
    const { baseUri, server, protocols } = this;
    const url = UrlLib.computeEndpointUri({ baseUri, server, endpoint, protocols, });
    this[urlValue] = url;
  }

  /**
   * Runs over each request editor and collects request values for code snippets generators.
   */
  [collectCodeSnippets](): void {
    const { shadowRoot } = this;
    if (!shadowRoot) {
      return;
    }
    const panels = shadowRoot.querySelectorAll('api-request');
    if (!panels.length) {
      return;
    }
    Array.from(panels).forEach((panel) => this[readCodeSnippets](panel));
    this.requestUpdate();
  }

  [requestChangeHandler](e: Event): void {
    const panel = e.target as ApiRequestElement;
    this[readCodeSnippets](panel);
    this.requestUpdate();
  }

  /**
   * Reads the request data from the request panel for the code snippets.
   */
  [readCodeSnippets](panel: ApiRequestElement): void {
    const { requestId } = panel.dataset;
    if (!requestId) {
      return;
    }
    try {
      const request = panel.serialize();
      if (request.authorization && request.authorization.length) {
        SecurityProcessor.applyAuthorization(request, request.authorization);
      }
      this[requestValues][requestId] = request;
    } catch (e) {
      // what can go wrong it that the request is not yet set on the editor
      // due to the debouncer and we are trying to serialize a request
      // that is not yet ready. This will redo the operation when the request panel 
      // render the HTTP editor.
      // ...
    }
  }

  render(): TemplateResult {
    const { endpoint } = this;
    if (!endpoint) {
      return html``;
    }
    return html`
    ${this[titleTemplate](endpoint)}
    ${this[urlTemplate]()}
    ${this[extensionsTemplate](endpoint)}
    ${this[descriptionTemplate](endpoint.description)}
    ${this[customDomainPropertiesTemplate](endpoint.customDomainProperties)}
    ${this[operationsTemplate](endpoint)}
    `;
  }

  /**
   * @returns The template for the Operation title.
   */
  [titleTemplate](endpoint: ApiDefinitions.IApiEndPoint): TemplateResult | string {
    const { name, path } = endpoint;
    const label = name || path;
    if (!label) {
      return '';
    }
    const subLabel = this.asyncApi ? 'API channel' : 'API endpoint';
    return html`
    <div class="endpoint-header">
      <div class="endpoint-title">
        <span class="label text-selectable">${label}</span>
      </div>
      <p class="sub-header">${subLabel}</p>
    </div>
    `;
  }

  /**
   * @returns The template for the operation's URL.
   */
  [urlTemplate](): TemplateResult {
    const url = this[urlValue];
    return html`
    <div class="endpoint-url">
      <div class="url-value text-selectable">${url}</div>
    </div>
    `;
  }

  /**
   * @returns The template for the list of operations.
   */
  [operationsTemplate](endpoint: ApiDefinitions.IApiEndPoint): TemplateResult | string {
    const { operations } = endpoint;
    if (!operations.length) {
      return '';
    }
    return html`
    ${operations.map((operation) => this[operationTemplate](endpoint, operation))}
    `;
  }

  /**
   * @param operation The operation to render.
   * @returns The template for the API operation.
   */
  [operationTemplate](endpoint: ApiDefinitions.IApiEndPoint, operation: ApiDefinitions.IApiOperation): TemplateResult {
    const { serverId, baseUri, tryItPanel, tryItButton, asyncApi } = this;
    const renderTryIt = !tryItPanel && !asyncApi && !!tryItButton;
    const classes = {
      'operation-container': true,
      tryit: !!tryItPanel,
    };
    return html`
    <div class="${classMap(classes)}">
      <api-operation-document
        .domainId="${operation.id}"
        .operation="${operation}"
        .endpoint="${endpoint}"
        .endpointId="${endpoint.id}"
        .serverId="${serverId}" 
        .baseUri="${baseUri}" 
        ?anypoint="${this.anypoint}"
        data-domain-id="${operation.id}"
        ?tryItButton="${renderTryIt}"
        responsesOpened
        renderSecurity
        ?renderCodeSnippets="${!tryItPanel}"
        ?asyncApi="${this.asyncApi}"
        class="operation"
      ></api-operation-document>
      ${tryItPanel ? this[tryItColumnTemplate](operation) : ''}
    </div>
    `;
  }

  /**
   * @param {ApiOperation} operation The operation to render.
   * @returns The template for the try it column panel rendered next to the operation documentation/
   */
  [tryItColumnTemplate](operation: ApiDefinitions.IApiOperation): TemplateResult | string {
    if (this.asyncApi) {
      return '';
    }
    return html`
    <div class="try-it-column">
      <!-- <div class="sticky-content"> -->
        ${this[httpRequestTemplate](operation)}
        ${this[codeSnippetsPanelTemplate](operation)}
      <!-- </div> -->
    </div>
    `;
  }

  /**
   * @param operation The operation to render.
   * @returns The template for the request editor.
   */
  [httpRequestTemplate](operation: ApiDefinitions.IApiOperation): TemplateResult {
    const content = html`
    <api-request
      .domainId="${operation.id}"
      .serverValue="${this.serverValue}"
      .serverType="${this.serverType}"
      .baseUri="${this.baseUri}"
      .redirectUri="${this.redirectUri}"
      .credentialsSource="${this.httpCredentialsSource}"
      ?anypoint="${this.anypoint}"
      ?urlEditor="${this.httpUrlEditor}"
      ?urlLabel="${!this.httpUrlEditor}"
      ?noServerSelector="${this.httpNoServerSelector}"
      ?applyAuthorization="${this.httpApplyAuthorization}"
      ?allowCustomBaseUri="${this.httpAllowCustomBaseUri}"
      ?allowCustom="${this.httpAllowCustom}"
      allowHideOptional
      globalCache
      data-request-id="${operation.id}"
      @change="${this[requestChangeHandler]}"
    ></api-request>
    `;

    return content;
  }

  /**
   * @param operation The operation to render.
   * @returns The template for the request's code snippets.
   */
  [codeSnippetsPanelTemplate](operation: ApiDefinitions.IApiOperation): TemplateResult | string {
    const values = this[requestValues][operation.id];
    if (!values) {
      return '';
    }
    let { payload } = values
    if (payload && typeof payload !== 'string') {
      payload = '';
    }
    return html`
    <section class="snippets text-selectable">
      <http-code-snippets
        scrollable
        .url="${values.url}"
        .method="${values.method}"
        .headers="${values.headers}"
        .payload="${(payload as string)}"
      ></http-code-snippets>
    </section>
    `;
  }

  /**
   * @return The template for the endpoint's extensions.
   */
  [extensionsTemplate](endpoint: ApiDefinitions.IApiEndPoint): TemplateResult | string {
    const { extends: extensions } = endpoint;

    if (!extensions || !extensions.length) {
      return '';
    }

    const type = extensions.find(e => e.types.includes(AmfNamespace.aml.vocabularies.apiContract.ParametrizedResourceType));
    const traits = extensions.filter(e => e.types.includes(AmfNamespace.aml.vocabularies.apiContract.ParametrizedTrait));
    const traitsLabel = joinTraitNames(traits);
    const typeLabel = type && type.name;
    if (!traitsLabel && !typeLabel) {
      return '';
    }
    return html`
    <section class="extensions">
      ${this[extendsTemplate](typeLabel)} ${this[traitsTemplate](traitsLabel)}
    </section>
    `;
  }

  /**
   * @returns The template for the parent resource type.
   */
  [extendsTemplate](label?: string): TemplateResult | string {
    if (!label) {
      return '';
    }
    return html`<span>Implements </span><span class="resource-type-name text-selectable" title="Resource type applied to this endpoint">${label}</span>.`;
  }

  /**
   * @returns The template for the traits applied to the resource.
   */
  [traitsTemplate](label?: string): TemplateResult | string {
    if (!label) {
      return '';
    }
    return html`<span>Mixes in </span><span class="trait-name text-selectable">${label}</span>.`;
  }
}
