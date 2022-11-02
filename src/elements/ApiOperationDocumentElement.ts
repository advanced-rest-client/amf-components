/* eslint-disable class-methods-use-this */
import { html, TemplateResult, CSSResult } from 'lit';
import { property } from 'lit/decorators.js';
import { AmfShapes, ApiDefinitions, ApiSchemaGenerator, ApiSchemaValues, AmfNamespace } from '@api-client/core/build/browser.js';
import { classMap } from 'lit/directives/class-map.js';
import { MarkdownStyles } from '@advanced-rest-client/highlight';
import { AnypointTabsElement } from '@anypoint-web-components/awc';
import '@advanced-rest-client/highlight/arc-marked.js';
import '@anypoint-web-components/awc/dist/define/anypoint-tab.js';
import '@anypoint-web-components/awc/dist/define/anypoint-tabs.js';
import '@advanced-rest-client/icons/arc-icon.js';
import '@advanced-rest-client/http-code-snippets/http-code-snippets.js';
import { HttpStyles } from '@advanced-rest-client/base/api.js';
import { QueryParameterProcessor } from '../lib/QueryParameterProcessor.js';
import elementStyles from './styles/ApiOperation.js';
import commonStyles from './styles/Common.js';
import {
  ApiDocumentationBase,
  paramsSectionTemplate,
  descriptionTemplate,
  customDomainPropertiesTemplate,
  evaluateExample,
} from './ApiDocumentationBase.js';
import { Events } from '../events/Events.js';
import { joinTraitNames } from '../lib/Utils.js';
import * as UrlLib from '../lib/UrlUtils.js';
import { tablePropertyTemplate } from './SchemaCommonTemplates.js';
import schemaStyles from './styles/SchemaCommon.js';
import '../../define/api-request-document.js';
import '../../define/api-response-document.js';
import '../../define/api-security-requirement-document.js';
import ApiRequestDocumentElement from './ApiRequestDocumentElement.js';

export const queryEndpoint = Symbol('queryEndpoint');
export const queryOperation = Symbol('queryOperation');
export const queryServers = Symbol('queryServers');
export const queryResponses = Symbol('queryResponses');
export const operationValue = Symbol('operationValue');
export const endpointValue = Symbol('endpointValue');
export const serversValue = Symbol('serversValue');
export const serverIdValue = Symbol('serverIdValue');
export const urlValue = Symbol('urlValue');
export const queryProtocols = Symbol('queryProtocols');
export const protocolsValue = Symbol('protocolsValue');
export const queryVersion = Symbol('queryVersion');
export const versionValue = Symbol('versionValue');
export const responsesValue = Symbol('responsesValue');
export const computeUrlValue = Symbol('computeUrlValue');
export const computeParametersValue = Symbol('computeParametersValue');
export const snippetsParametersValue = Symbol('snippetsParametersValue');
export const computeSnippetsPayload = Symbol('computeSnippetsPayload');
export const computeSnippetsHeaders = Symbol('computeSnippetsHeaders');
export const snippetsPayloadValue = Symbol('snippetsPayloadValue');
export const snippetsHeadersValue = Symbol('snippetsHeadersValue');
export const baseUriValue = Symbol('baseUriValue');
export const preselectResponse = Symbol('preselectResponse');
export const preselectSecurity = Symbol('preselectSecurity');
export const requestMimeChangeHandler = Symbol('requestMimeChangeHandler');
export const titleTemplate = Symbol('titleTemplate');
export const traitsTemplate = Symbol('traitsTemplate');
export const summaryTemplate = Symbol('summaryTemplate');
export const urlTemplate = Symbol('urlTemplate');
export const requestTemplate = Symbol('requestTemplate');
export const responseTemplate = Symbol('responseTemplate');
export const responseTabsTemplate = Symbol('responseTabsTemplate');
export const responseContentTemplate = Symbol('responseContentTemplate');
export const statusCodeHandler = Symbol('statusCodeHandler');
export const securitySectionTemplate = Symbol('securitySectionTemplate');
export const securityTemplate = Symbol('securityTemplate');
export const deprecatedTemplate = Symbol('deprecatedTemplate');
export const metaDataTemplate = Symbol('metaDataTemplate');
export const tryItTemplate = Symbol('tryItTemplate');
export const tryItHandler = Symbol('tryItHandler');
export const callbacksTemplate = Symbol('callbacksTemplate');
export const callbackTemplate = Symbol('callbackTemplate');
export const snippetsTemplate = Symbol('snippetsTemplate');
export const securitySelectorTemplate = Symbol('securitySelectorTemplate');
export const securitySelectionHandler = Symbol('securitySelectionHandler');
export const securityTabTemplate = Symbol('securityTabTemplate');

/**
 * A web component that renders the documentation page for an API operation built from 
 * the AMF graph model.
 * 
 * @fires tryit
 */
export default class ApiOperationDocumentElement extends ApiDocumentationBase {
  static get styles(): CSSResult[] {
    return [elementStyles, commonStyles, HttpStyles.default, MarkdownStyles, schemaStyles];
  }

  [endpointValue]?: ApiDefinitions.IApiEndPoint;

  [operationValue]?: ApiDefinitions.IApiOperation;

  [serversValue]?: ApiDefinitions.IApiServer[];

  [responsesValue]?: ApiDefinitions.IApiResponse[];

  [serverIdValue]?: string;

  [baseUriValue]?: string;

  [urlValue]?: string;

  [versionValue]?: string;

  [protocolsValue]?: string[];

  [snippetsPayloadValue]?: string;

  [snippetsHeadersValue]?: string;

  [snippetsParametersValue]?: string;

  /** 
   * The id of the currently selected server to use to construct the URL.
   * If not set a first server in the API servers array is used.
   * @attribute
   */
  @property({ type: String, reflect: true })
  get serverId(): string | undefined {
    return this[serverIdValue];
  }

  set serverId(value: string | undefined) {
    const old = this[serverIdValue];
    if (old === value) {
      return;
    }
    this[serverIdValue] = value;
    this[computeUrlValue]();
    this[computeParametersValue]();
    this.requestUpdate();
  }

  /**
   * The computed list of servers.
   */
  get servers(): ApiDefinitions.IApiServer[] | undefined {
    return this[serversValue];
  }

  /**
   * The current server in use.
   */
  get server(): ApiDefinitions.IApiServer | undefined {
    const servers = this[serversValue];
    const serverId = this[serverIdValue];
    let server;
    if (Array.isArray(servers) && servers.length) {
      if (serverId) {
        server = servers.find((item) => item.id === serverId);
      } else {
        [server] = servers;
      }
    }
    return server;
  }

  get operation(): ApiDefinitions.IApiOperation | undefined {
    return this[operationValue];
  }

  set operation(value) {
    const old = this[operationValue];
    if (old === value) {
      return;
    }
    this[operationValue] = value;
    this.processGraph();
  }

  get endpoint(): ApiDefinitions.IApiEndPoint | undefined {
    return this[endpointValue];
  }

  set endpoint(value) {
    const old = this[endpointValue];
    if (old === value) {
      return;
    }
    this[endpointValue] = value;
    this[computeUrlValue]();
    this[computeParametersValue]();
    this.requestUpdate();
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
    this[computeParametersValue]();
    this.requestUpdate();
  }

  /**
   * The computed URI for the endpoint.
   */
  get endpointUri(): string | undefined {
    return this[urlValue];
  }

  get snippetsUri(): string {
    const base = this[urlValue] || '';
    const query = this[snippetsParametersValue] || '';
    return `${base}${query}`
  }

  /**
   * The computed list of responses for this operation.
   */
  get responses(): ApiDefinitions.IApiResponse[] | undefined {
    return this[responsesValue];
  }

  /**
   * The API's protocols.
   */
  get protocols(): string[] | undefined {
    return this[protocolsValue];
  }


  get version(): string | undefined {
    return this[versionValue];
  }

  /** 
   * The domain id of the currently selected security to render.
   * This is only used when a multiple security schemes are applied to the operation.
   * @attribute
   */
  @property({ type: String, reflect: true })
  securityId?: string;

  /** 
   * When set it opens the response section
   * @attribute
   */
  @property({ type: Boolean, reflect: true })
  responsesOpened?: boolean;

  /** 
   * When set it opens the security section
   * @attribute
   */
  @property({ type: Boolean, reflect: true })
  securityOpened?: boolean;

  /** 
   * When set it opens the code snippets section
   * @attribute
   */
  @property({ type: Boolean, reflect: true })
  snippetsOpened?: boolean;

  /** 
   * The selected status code in the responses section.
   * @attribute
   */
  @property({ type: String })
  selectedStatus?: string;

  /** 
   * Whether the callbacks section is opened.
   * @attribute
   */
  @property({ type: Boolean, reflect: true })
  callbacksOpened?: boolean;

  /** 
   * When set it renders the "try it" button that dispatches the `tryit` event.
   * @attribute
   */
  @property({ type: Boolean, reflect: true })
  tryItButton?: boolean;

  /** 
   * When set it renders the view optimised for asynchronous API operation.
   * @attribute
   */
  @property({ type: Boolean, reflect: true })
  asyncApi?: boolean;

  /**
   * When set it renders code examples section is the documentation
   * @attribute
   */
  @property({ type: Boolean, reflect: true })
  renderCodeSnippets?: boolean;

  /**
   * When set it renders security documentation when applicable
   * @attribute
   */
  @property({ type: Boolean, reflect: true })
  renderSecurity?: boolean;

  /** 
   * The currently rendered request panel mime type.
   * @attribute
   */
  @property({ type: String })
  requestMimeType?: string;

  /** 
   * Optional. The parent endpoint id. When set it uses this value to query for the endpoint
   * instead of querying for a parent through the operation id.
   * Also, when `endpoint` is set and the `endpointId` match then it ignores querying for 
   * the endpoint.
   * @attribute
   */
  @property({ type: String })
  endpointId?: string;

  async processGraph(): Promise<void> {
    await this[queryEndpoint]();
    await this[queryOperation]();
    await this[queryServers]();
    await this[queryProtocols]();
    await this[queryResponses]();
    this[preselectResponse]();
    this[preselectSecurity]();
    this[computeUrlValue]();
    this[computeParametersValue]();
    this[computeSnippetsPayload]();
    this[computeSnippetsHeaders]();
    this.requestUpdate();
    await this.updateComplete;
    this.dispatchEvent(new Event('graphload'));
  }

  /**
   * Queries the store for the operation data, when needed.
   */
  async [queryOperation](): Promise<void> {
    const { domainId } = this;
    if (!domainId) {
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
   */
  async [queryEndpoint](): Promise<void> {
    const { domainId, endpointId } = this;
    if (!domainId) {
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
      this[serversValue] = info;
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
   * Queries for the responses data of the current operation.
   */
  async [queryResponses](): Promise<void> {
    this[responsesValue] = undefined;
    const { operation } = this;
    if (!operation) {
      return;
    }
    const { responses = [] } = operation;
    if (!responses.length) {
      return;
    }
    this[responsesValue] = responses;
  }

  /**
   * Updates the `selectedStatus` if not selected or the current selection doesn't 
   * exists in the current list of responses.
   */
  [preselectResponse](): void {
    const responses = this[responsesValue];
    if (!Array.isArray(responses) || !responses.length) {
      return;
    }
    responses.sort((a, b) => {
      if (a.statusCode === b.statusCode) {
        return 0;
      }
      return Number(a.statusCode) > Number(b.statusCode) ? 1 : -1;
    });
    const { selectedStatus } = this;
    if (!selectedStatus) {
      this.selectedStatus = responses[0].statusCode;
      return;
    }
    const selected = responses.find((item) => item.statusCode === selectedStatus);
    if (selected) {
      return;
    }
    this.selectedStatus = responses[0].statusCode;
  }

  /**
   * Updates the `securityId` if not selected or the current selection doesn't 
   * exists in the current list of security.
   */
  [preselectSecurity](): void {
    const { operation, renderSecurity, securityId } = this;
    if (!renderSecurity || !operation || !Array.isArray(operation.security) || !operation.security.length) {
      return;
    }
    if (!securityId) {
      this.securityId = operation.security[0].id;
      return;
    }
    const selected = operation.security.find((item) => item.id === securityId);
    if (selected) {
      return;
    }
    this.securityId = operation.security[0].id;
  }

  /**
   * Computes the URL value for the current serves, selected server, and endpoint's path.
   */
  [computeUrlValue](): void {
    if (this.asyncApi) {
      return;
    }
    const { protocols, version, server, baseUri } = this;
    const endpoint = this[endpointValue];
    const url = UrlLib.computeEndpointUri({ baseUri, server, endpoint, protocols, version, });
    this[urlValue] = url;
  }

  /**
   * Computes query parameters for the code snippets.
   */
  [computeParametersValue](): void {
    this[snippetsParametersValue] = undefined;
    const { operation } = this;
    if (!operation) {
      return;
    }
    const { request } = operation;
    if (!request) {
      return;
    }
    const { queryParameters, queryString } = request;
    let params: ApiDefinitions.IApiParameter[] | undefined;
    if (Array.isArray(queryParameters) && queryParameters.length) {
      params = queryParameters;
    } else if (queryString) {
      const factory = new QueryParameterProcessor();
      const items = factory.collectOperationParameters(request.queryString as AmfShapes.IShapeUnion, 'query');
      if (Array.isArray(items) && items.length) {
        params = items.map(i => i.parameter);
      }
    }
    if (!params || !params.length) {
      return;
    }
    const qp: Record<string, string> = {}
    params.forEach((param) => {
      const { required, schema, paramName, name } = param;
      if (!required) {
        return;
      }
      const parameterName = paramName || name;
      if (!parameterName) {
        return;
      }
      const anySchema = schema as AmfShapes.IApiAnyShape;
      const { defaultValueStr, examples = [] } = anySchema;
      if (defaultValueStr) {
        qp[parameterName] = defaultValueStr;
      } else if (examples.length) {
        const exp = examples.find(e => e.value);
        if (exp && exp.value) {
          qp[parameterName] = exp.value;
        }
      } else {
        const value = ApiSchemaValues.generateDefaultValue(schema as AmfShapes.IApiScalarShape);
        if (value || value === false || value === 0 || value === null) {
          qp[parameterName] = value;
        }
        // if (typeof value === 'undefined') {
        //   qp[parameterName] = '';
        // } else {
        //   qp[parameterName] = value;
        // }
      }
    });
    const value = UrlLib.applyUrlParameters('', qp, true);
    this[snippetsParametersValue] = value;
  }

  /**
   * Computes payload value for the code snippets.
   */
  [computeSnippetsPayload](): void {
    this[snippetsPayloadValue] = undefined
    if (this.asyncApi) {
      return;
    }
    const { operation, requestMimeType } = this;
    if (!operation || !requestMimeType) {
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
    const payload = payloads.find(p => p.mediaType === requestMimeType);
    if (!payload) {
      return;
    }
    const { examples = [], schema } = payload;
    let examplesCopy = [...examples];
    const anySchema = schema as AmfShapes.IApiAnyShape;
    if (Array.isArray(anySchema.examples) && anySchema.examples.length) {
      examplesCopy = examplesCopy.concat(anySchema.examples);
    }
    examplesCopy = examplesCopy.filter((i) => !!i.value || !!i.structuredValue);
    let payloadValue;
    if (examplesCopy.length) {
      const example = examplesCopy.find(e => !!e.value);
      if (example) {
        payloadValue = this[evaluateExample](example, requestMimeType);
      }
    }
    if (!payloadValue) {
      payloadValue = ApiSchemaGenerator.asExample(schema as AmfShapes.IShapeUnion, requestMimeType, {
        renderExamples: true,
        renderOptional: true,
      });
    }
    if (payloadValue && payloadValue.renderValue) {
      this[snippetsPayloadValue] = payloadValue.renderValue as string;
    }
  }

  /**
   * Computes headers value for the code snippets.
   */
  [computeSnippetsHeaders](): void {
    this[snippetsHeadersValue] = undefined;
    if (this.asyncApi) {
      return;
    }
    const { operation, requestMimeType } = this;
    if (!operation) {
      return;
    }
    const { request, method } = operation;
    if (!request) {
      return;
    }
    const { headers = [] } = request;
    const parts = [];
    let hasMime = false;
    headers.forEach((param) => {
      const { paramName, name, schema } = param;
      if (!schema || !schema.types.includes(AmfNamespace.aml.vocabularies.shapes.ScalarShape)) {
        return;
      }
      const typedScalar = schema as AmfShapes.IApiScalarShape;
      let value = ApiSchemaValues.readInputValue(param, typedScalar, { fromExamples: true });
      if (Array.isArray(value)) {
        value = value.join(',');
      }
      if (typeof value !== 'undefined') {
        const headerName = paramName || name || '';
        if (headerName.toLowerCase() === 'content-type') {
          hasMime = true;
        }
        const header = `${paramName || name}: ${value}`;
        parts.push(header);
      }
    });
    if (!hasMime && requestMimeType && method !== 'get') {
      parts.push(`content-type: ${requestMimeType}`);
    }
    this[snippetsHeadersValue] = parts.join('\n');
  }

  /**
   * A handler for the status code tab selection.
   */
  [statusCodeHandler](e: Event): void {
    const tabs = e.target as AnypointTabsElement;
    this.selectedStatus = String(tabs.selected);
  }

  /**
   * A handler for the status code tab selection.
   */
  [securitySelectionHandler](e: Event): void {
    const tabs = e.target as AnypointTabsElement;
    this.securityId = String(tabs.selected);
  }

  /**
   * A handler for the try it button click.
   * It dispatches the `tryit` custom event.
   */
  [tryItHandler](): void {
    const { operation, asyncApi } = this;
    if (!operation || asyncApi) {
      return;
    }
    const { id } = operation;
    const detail = { id };
    const config = {
      bubbles: true,
      composed: true,
      detail,
    };
    [
      'tryit-requested',
      'tryit'
    ].forEach((name) => {
      this.dispatchEvent(new CustomEvent(name, config));
    });
  }

  /**
   * A handler for the request panel mime type change.
   */
  [requestMimeChangeHandler](e: Event): void {
    const panel = e.target as ApiRequestDocumentElement;
    this.requestMimeType = panel.mimeType;
    this[computeSnippetsPayload]();
    this[computeSnippetsHeaders]();
    this.requestUpdate();
  }

  render(): TemplateResult {
    const op = this[operationValue];
    if (!op) {
      return html``;
    }
    return html`
    ${this[titleTemplate](op)}
    ${this[summaryTemplate](op)}
    ${this[urlTemplate](op)}
    ${this[traitsTemplate](op)}
    ${this[deprecatedTemplate](op)}
    ${this[descriptionTemplate](op.description)}
    ${this[metaDataTemplate](op)}
    ${this[customDomainPropertiesTemplate](op.customDomainProperties)}
    ${this[requestTemplate]()}
    ${this[callbacksTemplate](op)}
    ${this[snippetsTemplate](op)}
    ${this[responseTemplate]()}
    ${this[securitySectionTemplate](op)}
    `;
  }

  /**
   * @returns The template for the Operation title.
   */
  [titleTemplate](operation: ApiDefinitions.IApiOperation): TemplateResult {
    const { name, method, deprecated } = operation;
    const label = name || method;
    const labelClasses = {
      label: true,
      'text-selectable': true,
      deprecated,
    };
    const subTitle = this.asyncApi ? 'Async operation' : 'API operation';
    return html`
    <div class="operation-header">
      <div class="operation-title">
        <span class="${classMap(labelClasses)}">${label}</span>
        ${this[tryItTemplate]()}
      </div>
      <p class="sub-header">${subTitle}</p>
    </div>
    `;
  }

  /**
   * @returns The template for the Operation traits.
   */
  [traitsTemplate](operation: ApiDefinitions.IApiOperation): TemplateResult | string {
    const { extends: traits } = operation;
    if (!traits || !traits.length) {
      return '';
    }
    const value = joinTraitNames(traits);
    return html`
    <section class="extensions">
      <p>Mixes in <span class="trait-name text-selectable">${value}</span>.</p>
    </section>`;
  }

  /**
   * @returns The template for the operation summary filed.
   */
  [summaryTemplate](operation: ApiDefinitions.IApiOperation): TemplateResult | string {
    const { summary } = operation;
    if (!summary) {
      return '';
    }
    return html`
    <p class="summary text-selectable">${summary}</p>
    `;
  }

  /**
   * @returns The template for the Operation meta information.
   */
  [metaDataTemplate](operation: ApiDefinitions.IApiOperation): TemplateResult[] | string {
    const { operationId } = operation;
    const result = [];
    if (operationId) {
      result.push(tablePropertyTemplate('Operation ID', operationId, 'operation-id'));
    }
    if (result.length) {
      return result;
    }
    return '';
  }

  /**
   * @returns The template for the deprecated message.
   */
  [deprecatedTemplate](operation: ApiDefinitions.IApiOperation): TemplateResult | string {
    const { deprecated } = operation;
    if (!deprecated) {
      return '';
    }
    return html`
    <div class="deprecated-message">
      <arc-icon icon="warning"></arc-icon>
      <span class="message text-selectable">
      This operation is marked as deprecated.
      </span>
    </div>
    `;
  }

  /**
   * @returns The template for the operation's URL.
   */
  [urlTemplate](operation: ApiDefinitions.IApiOperation): TemplateResult | string {
    if (this.asyncApi) {
      return '';
    }
    const url = this[urlValue];
    const { method } = operation;
    return html`
    <div class="endpoint-url">
      <div class="method-label" data-method="${method}">${method}</div>
      <div class="url-value text-selectable">${url}</div>
    </div>
    `;
  }

  /**
   * @returns The template for the operation's request documentation element.
   */
  [requestTemplate](): TemplateResult | string {
    const { operation } = this;
    if (!operation) {
      return '';
    }
    const { server, endpoint } = this;
    return html`
    <api-request-document 
      .domainId="${operation.request && operation.request.id}" 
      .request="${operation.request}" 
      .server=${server} 
      .endpoint=${endpoint}
      payloadOpened 
      headersOpened 
      parametersOpened
      ?anypoint="${this.anypoint}"
      @mimechange="${this[requestMimeChangeHandler]}"
    ></api-request-document>
    `;
  }

  [callbacksTemplate](operation: ApiDefinitions.IApiOperation): TemplateResult | string {
    const { callbacks } = operation;
    if (!Array.isArray(callbacks) || !callbacks.length) {
      return '';
    }
    const content = callbacks.map(callback => this[callbackTemplate](callback));
    return this[paramsSectionTemplate]('Callbacks', 'callbacksOpened', content);
  }

  /**
   * @returns The template for the operation's request documentation element.
   */
  [callbackTemplate](callback: ApiDefinitions.IApiCallback): TemplateResult {
    const { name, endpoint } = callback;
    if (!endpoint) {
      return html``;
    }
    const { operations = [] } = endpoint;
    const [operation] = operations;
    if (!operation) {
      return html``;
    }
    return html`
    <div class="callback-section">
      <div class="heading4 table-title">${name}</div>
      <api-operation-document 
        .domainId="${operation.id}"
        .operation="${operation}"
        .serverId="${this.serverId as string}" 
        .endpoint="${endpoint}"
        data-domain-id="${operation.id}"
        class="operation"
        ?anypoint="${this.anypoint}"
      ></api-operation-document>
    </div>
    `;
  }

  [responseTemplate](): TemplateResult | string {
    const responses = this[responsesValue];
    if (!Array.isArray(responses) || !responses.length) {
      return '';
    }
    const content = html`
    ${this[responseTabsTemplate](responses)}
    ${this[responseContentTemplate](responses)}
    `;
    return this[paramsSectionTemplate]('Responses', 'responsesOpened', content);
  }

  /**
   * @param responses The responses to render.
   * @returns The template for the responses selector.
   */
  [responseTabsTemplate](responses: ApiDefinitions.IApiResponse[]): TemplateResult | string {
    const { selectedStatus, anypoint } = this;
    const filtered = responses.filter((item) => !!item.statusCode);
    if (!filtered.length) {
      return '';
    }
    return html`
    <div class="status-codes-selector">
      <anypoint-tabs
        scrollable
        .selected="${selectedStatus}"
        attrForSelected="data-status"
        @selected="${this[statusCodeHandler]}"
        ?anypoint="${anypoint}"
      >
        ${filtered.map((item) => html`<anypoint-tab data-status="${item.statusCode || 0}" ?anypoint="${anypoint}">${item.statusCode}</anypoint-tab>`)}
      </anypoint-tabs>
      <div class="codes-selector-divider"></div>
    </div>
    `;
  }

  /**
   * @param responses The responses to render.
   * @returns The template for the currently selected response.
   */
  [responseContentTemplate](responses: ApiDefinitions.IApiResponse[]): TemplateResult {
    const { selectedStatus } = this;
    const response = responses.find((item) => item.statusCode === selectedStatus);
    if (!response) {
      return html`<div class="empty-info">Select a response to render the documentation.</div>`;
    }
    return html`
    <api-response-document 
      .domainId="${response.id}" 
      .response="${response}" 
      headersOpened 
      payloadOpened
      ?anypoint="${this.anypoint}"
      class="method-response"
    ></api-response-document>
    `;
  }

  /**
   * @returns The template for the security list section.
   */
  [securitySectionTemplate](operation: ApiDefinitions.IApiOperation): TemplateResult | string {
    const { renderSecurity, securityId } = this;
    if (!renderSecurity || !operation || !Array.isArray(operation.security) || !operation.security.length) {
      return '';
    }
    const { security } = operation;
    const content = [];
    if (security.length === 1) {
      content.push(this[securityTemplate](security[0]));
    } else if (securityId) {
      content.push(this[securitySelectorTemplate](operation));
      const item = security.find(i => i.id === securityId);
      if (item) {
        content.push(this[securityTemplate](item));
      }
      // security.forEach((model) => content.push(this[securityTemplate](model)));
    }
    return this[paramsSectionTemplate]('Security', 'securityOpened', content);
  }

  [securityTemplate](security: ApiDefinitions.IApiSecurityRequirement): TemplateResult {
    return html`<api-security-requirement-document
      .domainId="${security.id}" 
      .securityRequirement="${security}"
      ?anypoint="${this.anypoint}"
    ></api-security-requirement-document>`
  }


  [securitySelectorTemplate](operation: ApiDefinitions.IApiOperation): TemplateResult {
    const { securityId, anypoint } = this;
    const { security } = operation;
    return html`
    <div class="security-selector">
      <anypoint-tabs
        scrollable
        .selected="${securityId}"
        attrForSelected="data-id"
        @selected="${this[securitySelectionHandler]}"
        ?anypoint="${anypoint}"
      >
        ${security.map((item) => this[securityTabTemplate](item))}
      </anypoint-tabs>
      <div class="codes-selector-divider"></div>
    </div>
    `;
  }


  [securityTabTemplate](security: ApiDefinitions.IApiSecurityRequirement): TemplateResult {
    const { name, schemes = [], id } = security;
    let label = 'unknown';
    if (name) {
      label = name;
    } else if (schemes.length) {
      const parts = schemes.map(i => i.name).filter(i => !!i);
      if (parts.length) {
        label = parts.join('/');
      }
    }
    return html`<anypoint-tab data-id="${id}" ?anypoint="${this.anypoint}">${label}</anypoint-tab>`;
  }

  /**
   * @returns The template for the "try it" button.
   */
  [tryItTemplate](): TemplateResult | string {
    if (!this.tryItButton) {
      return '';
    }
    return html`
    <anypoint-button
      class="action-button"
      @click="${this[tryItHandler]}"
      emphasis="high"
      ?anypoint="${this.anypoint}"
    >Try it</anypoint-button>
    `;
  }

  /**
   * @returns The template for the code snippets.
   */
  [snippetsTemplate](operation: ApiDefinitions.IApiOperation): TemplateResult | string {
    if (!this.renderCodeSnippets || this.asyncApi) {
      return '';
    }
    const content = html`
    <http-code-snippets
      scrollable
      ?anypoint="${this.anypoint}"
      .url="${this.snippetsUri}"
      .method="${(operation.method || '').toUpperCase()}"
      .payload="${this[snippetsPayloadValue] as string}"
      .headers="${this[snippetsHeadersValue] as string}"
    ></http-code-snippets>
    `;
    return this[paramsSectionTemplate]('Code snippets', 'snippetsOpened', content);
  }
}
