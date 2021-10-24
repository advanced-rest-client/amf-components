/* eslint-disable class-methods-use-this */
import { html } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map.js';
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
import { ns } from '../helpers/Namespace.js';
import '../../define/api-request.js';
import '../../define/api-operation-document.js'
import '../../define/api-parameter-document.js';

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
  get styles() {
    return [elementStyles, commonStyles, MarkdownStyles];
  }
  
  /**
   * @returns {ApiEndPoint|undefined}
   */
  get endpoint() {
    return this[endpointValue];
  }

  /**
   * @param {ApiEndPoint} value
   */
  set endpoint(value) {
    const old = this[endpointValue];
    if (old === value) {
      return;
    }
    this[endpointValue] = value;
    this.processGraph();
  }

  /** @returns {string} */
  get operationId() {
    return this[operationIdValue];
  }

  /** @param {string} value */
  set operationId(value) {
    const old = this[operationIdValue];
    if (old === value) {
      return;
    }
    this[operationIdValue] = value;
    this.requestUpdate('operationId', old);
    this[operationIdChanged]();
  }

  /** @returns {string} */
  get serverId() {
    return this[serverIdValue];
  }

  /** @param {string} value */
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

  /** @returns {ApiServer|undefined} */
  get server() {
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

  /** @param {ApiServer} value */
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
   * @returns {ApiServer[]} The list of the servers read from the API and the endpoint.
   */
  get servers() {
    return this[serversValue];
  }

  /**
   * @returns {string|undefined} The list of protocols to render.
   */
  get protocol() {
    const { server } = this;
    if (!server) {
      return undefined;
    }
    const { protocol } = server;
    return protocol;
  }

  /**
   * @returns {string|undefined}
   */
  get baseUri() {
    return this[baseUriValue];
  }

  /**
   * @param {string} value
   */
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
   * @returns {string|undefined} The computed URI for the endpoint.
   */
  get endpointUri() {
    return this[urlValue];
  }

  /**
   * @returns {string[]|undefined} The API's protocols.
   */
  get protocols() {
    return this[protocolsValue];
  }

  static get properties() {
    return {
      /**
       * A property to set to override AMF's model base URI information.
       * When this property is set, the `endpointUri` property is recalculated.
       */
      baseUri: { type: String },
      /** 
       * The id of the currently selected server to use to construct the URL.
       * If not set a first server in the API servers array is used.
       */
      serverId: { type: String, reflect: true },
      /** 
       * When set it scrolls to the operation with the given id, if exists.
       * The operation is performed after render.
       */
      operationId: { type: String, reflect: true },
      /** 
       * When set it opens the parameters section
       */
      parametersOpened: { type: Boolean, reflect: true },
      /** 
       * When set it renders the "try it" button that dispatches the `tryit` event.
       */
      tryItButton: { type: Boolean, reflect: true },
      /** 
       * When set it renders the "try it" panel next to the operation documentation.
       * Setting this automatically disables the `tryItButton` property.
       * 
       * Note, use this only when there's enough space on the screen to render 2 panels side-by-side.
       */
      tryItPanel: { type: Boolean, reflect: true },
      /** 
       * When set it renders the URL input above the URL parameters in the HTTP editor.
       */
      httpUrlEditor: { type: Boolean, reflect: true },
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
      httpApplyAuthorization: { type: Boolean, reflect: true },
      /**
       * List of credentials source passed to the HTTP editor
       */
      httpCredentialsSource: { type: Array },
      /**
       * OAuth2 redirect URI.
       * This value **must** be set in order for OAuth 1/2 to work properly.
       * This is only required in inline mode (`inlineMethods`).
       */
      redirectUri: { type: String },
      /**
       * Optional property to set on the request editor. 
       * When true, the server selector is not rendered
       */
      httpNoServerSelector: { type: Boolean },
      /**
       * When set it renders "add custom" item button in the HTTP request editor.
       * If the element is to be used without AMF model this should always
       * be enabled. Otherwise users won't be able to add a parameter.
       */
      httpAllowCustom: { type: Boolean },
      /**
       * Optional property to set on the request editor. 
       * If true, the server selector custom base URI option is rendered
       */
      httpAllowCustomBaseUri: { type: Boolean },
      /** 
       * When set it renders the view optimised for asynchronous API operation.
       */
      asyncApi: { type: Boolean, reflect: true },
      /**
       * Holds the value of the currently selected server
       * Data type: URI
       */
      serverValue: { type: String },
      /**
       * Holds the type of the currently selected server
       * Values: `server` | `uri` | `custom`
       */
      serverType: { type: String },
    };
  }

  // /**
  //  * @returns {boolean} true when the API operated over an HTTP protocol. By default it returns true.
  //  */
  // get isHttp() {
  //   const { protocol } = this;
  //   return ['http', 'https'].includes(String(protocol).toLowerCase());
  // }

  constructor() {
    super();
    /**
     * @type {ApiEndPoint}
     */
    this[endpointValue] = undefined;
    /**
     * @type {ApiServer[]}
     */
    this[serversValue] = undefined;
    /**
     * @type {string}
     */
    this[urlValue] = undefined;

    this.parametersOpened = false;
    /**
     * @type {string}
     */
    this.operationId = undefined;
    /** @type {boolean} */
    this.tryItButton = undefined;
    /** @type {boolean} */
    this.tryItPanel = undefined;
    /** @type {boolean} */
    this.httpUrlEditor = undefined;
    /** @type {boolean} */
    this.httpNoServerSelector = undefined;
    /** @type {boolean} */
    this.httpAllowCustomBaseUri = undefined;
    /** @type {boolean} */
    this.httpAllowCustom = undefined;
    /** @type {boolean} */
    this.asyncApi = undefined;
    /** @type {string} */
    this.redirectUri = undefined;
    /** @type {ServerType} */
    this.serverType = undefined;
    /** @type {string} */
    this.serverValue = undefined;
    /** @type {boolean} */
    this.httpApplyAuthorization = undefined;
    this.httpCredentialsSource = undefined;
    /** @type ApiServer */
    this[serverValue] = undefined;
    /** @type {Record<string, ApiConsoleRequest>} */
    this[requestValues] = {};
    /** @type string[] */
    this[protocolsValue] = undefined;
  }

  disconnectedCallback() {
    if (this[processSelectionTimeout]) {
      clearTimeout(this[processSelectionTimeout]);
      this[processSelectionTimeout] = undefined;
    }
    super.disconnectedCallback();
  }

  /**
   * Scrolls the view to the operation, when present in the DOM.
   * @param {string} id The operation domain id to scroll into.
   */
  scrollToOperation(id) {
    const elm = this.shadowRoot.querySelector(`api-operation-document[data-domain-id="${id}"]`);
    if (!elm) {
      return;
    }
    elm.scrollIntoView({block: 'start', inline: 'nearest', behavior: 'smooth'});
  }

  /**
   * @returns {Promise<void>}
   */
  async processGraph() {
    await this[queryEndpoint]();
    await this[queryServers]();
    await this[queryProtocols]();
    this[computeUrlValue]();
    await this.requestUpdate();
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
  async [queryProtocols]() {
    this[protocolsValue] = undefined;
    try {
      const info = await ApiEvents.protocols(this);
      this[protocolsValue] = info;
    } catch (e) {
      TelemetryEvents.exception(this, e.message, false);
      ReportingEvents.error(this, e, `Unable to query for API protocols list: ${e.message}`, this.localName);
    }
  }

  /**
   * Queries the store for the endpoint data.
   * @returns {Promise<void>}
   */
  async [queryEndpoint]() {
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
      TelemetryEvents.exception(this, e.message, false);
      ReportingEvents.error(this, e, `Unable to query for API endpoint data: ${e.message}`, this.localName);
    }
  }

  /**
   * Scrolls to the selected operation after view update.
   */
  async [operationIdChanged]() {
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
   * @returns {Promise<void>}
   */
  async [queryServers]() {
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
      TelemetryEvents.exception(this, e.message, false);
      ReportingEvents.error(this, e, `Unable to query for API servers: ${e.message}`, this.localName);
    }
  }

  /**
   * Sets the private server value for the current server defined by `serverId`.
   * Calls the `[processServerSelection]()` function to set server related values.
   * @returns {void} 
   */
  [selectServer]() {
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
  [processServerSelection]() {
    this[computeUrlValue]();
  }

  /**
   * Computes the URL value for the current serves, selected server, and endpoint's path.
   */
  [computeUrlValue]() {
    const endpoint = this[endpointValue];
    const { baseUri, server, protocols } = this;
    const url = UrlLib.computeEndpointUri({ baseUri, server, endpoint, protocols, });
    this[urlValue] = url;
  }

  /**
   * Runs over each request editor and collects request values for code snippets generators.
   */
  [collectCodeSnippets]() {
    const panels = this.shadowRoot.querySelectorAll('api-request');
    if (!panels.length) {
      return;
    }
    Array.from(panels).forEach((panel) => this[readCodeSnippets](panel));
    this.requestUpdate();
  }

  /**
   * @param {Event} e
   */
  [requestChangeHandler](e) {
    const panel = /** @type ApiRequestPanelElement */ (e.target);
    this[readCodeSnippets](panel);
    this.requestUpdate();
  }

  /**
   * Reads the request data from the request panel for the code snippets.
   * @param {ApiRequestPanelElement} panel 
   */
  [readCodeSnippets](panel) {
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

  render() {
    const { endpoint } = this;
    if (!endpoint) {
      return html``;
    }
    return html`
    <style>${this.styles}</style>
    ${this[titleTemplate]()}
    ${this[urlTemplate]()}
    ${this[extensionsTemplate]()}
    ${this[descriptionTemplate](endpoint.description)}
    ${this[customDomainPropertiesTemplate](endpoint.customDomainProperties)}
    ${this[operationsTemplate]()}
    `;
  }

  /**
   * @returns {TemplateResult|string} The template for the Operation title.
   */
  [titleTemplate]() {
    const { endpoint} = this;
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
   * @returns {TemplateResult} The template for the operation's URL.
   */
  [urlTemplate]() {
    const url = this[urlValue];
    return html`
    <div class="endpoint-url">
      <div class="url-value text-selectable">${url}</div>
    </div>
    `;
  }

  /**
   * @returns {TemplateResult|string} The template for the list of operations.
   */
  [operationsTemplate]() {
    const { endpoint } = this;
    const { operations } = endpoint;
    if (!operations.length) {
      return '';
    }
    return html`
    ${operations.map((operation) => this[operationTemplate](operation))}
    `;
  }

  /**
   * @param {ApiOperation} operation The operation to render.
   * @returns {TemplateResult} The template for the API operation.
   */
  [operationTemplate](operation) {
    const { endpoint, serverId, baseUri, tryItPanel, tryItButton, asyncApi } = this;
    const renderTryIt = !tryItPanel && !asyncApi && !!tryItButton;
    const classes = {
      'operation-container': true,
      tryit: tryItPanel,
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
   * @returns {TemplateResult|string} The template for the try it column panel rendered next to the operation documentation/
   */
  [tryItColumnTemplate](operation) {
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
   * @param {ApiOperation} operation The operation to render.
   * @returns {TemplateResult} The template for the request editor.
   */
  [httpRequestTemplate](operation) {
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
   * @param {ApiOperation} operation The operation to render.
   * @returns {TemplateResult|string} The template for the request's code snippets.
   */
  [codeSnippetsPanelTemplate](operation) {
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
        .payload="${/** @type string */ (payload)}"
      ></http-code-snippets>
    </section>
    `;
  }

  /**
   * @return {TemplateResult|string} The template for the endpoint's extensions.
   */
  [extensionsTemplate]() {
    const { endpoint } = this;
    const { extends: extensions } = endpoint;

    if (!extensions || !extensions.length) {
      return '';
    }

    const type = extensions.find(e => e.types.includes(ns.aml.vocabularies.apiContract.ParametrizedResourceType));
    const traits = extensions.filter(e => e.types.includes(ns.aml.vocabularies.apiContract.ParametrizedTrait));
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
   * @param {string} label
   * @returns {TemplateResult|string} The template for the parent resource type.
   */
  [extendsTemplate](label) {
    if (!label) {
      return '';
    }
    return html`<span>Implements </span><span class="resource-type-name text-selectable" title="Resource type applied to this endpoint">${label}</span>.`;
  }

  /**
   * @param {string} label
   * @returns {TemplateResult|string} The template for the traits applied to the resource.
   */
  [traitsTemplate](label) {
    if (!label) {
      return '';
    }
    return html`<span>Mixes in </span><span class="trait-name text-selectable">${label}</span>.`;
  }
}
