/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable class-methods-use-this */
import { html, TemplateResult, CSSResult } from 'lit';
import { property, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { MarkdownStyles } from '@advanced-rest-client/highlight';
import '@advanced-rest-client/highlight/arc-marked.js';
import { AmfNamespace, ApiDefinitions } from '@api-client/core/build/browser.js';
import { HttpStyles } from '@advanced-rest-client/base';
import elementStyles from './styles/ApiSummary.js';
import commonStyles from './styles/Common.js';
import { 
  ApiDocumentationBase, 
  descriptionTemplate, 
  processDebounce,
} from './ApiDocumentationBase.js';
import { sanitizeHTML } from '../lib/Utils.js';
import * as UrlLib from '../lib/UrlUtils.js';
import { NavigationEvents } from '../events/NavigationEvents.js';
import { ApiEvents } from '../events/ApiEvents.js';
import { ReportingEvents } from '../events/ReportingEvents.js';
import { TelemetryEvents } from '../events/TelemetryEvents.js';
import { ServerEvents } from '../events/ServerEvents.js';
import { EndpointEvents } from '../events/EndpointEvents.js';
import { SelectionType } from '../types.js';

export const summaryValue = Symbol('summaryValue');
export const serversValue = Symbol('serversValue');
export const endpointsValue = Symbol('endpointsValue');
export const querySummary = Symbol('querySummary');
export const processSummary = Symbol('processSummary');
export const queryServers = Symbol('queryServers');
export const queryEndpoints = Symbol('queryEndpoints');
export const isAsyncValue = Symbol('isAsyncValue');
export const baseUriValue = Symbol('baseUriValue');
export const navigateHandler = Symbol('navigateHandler');
export const titleTemplate = Symbol('titleTemplate');
export const versionTemplate = Symbol('versionTemplate');
export const serversTemplate = Symbol('serversTemplate');
export const baseUriTemplate = Symbol('baseUriTemplate');
export const serverTemplate = Symbol('serverTemplate');
export const protocolsTemplate = Symbol('protocolsTemplate');
export const contactInfoTemplate = Symbol('contactInfoTemplate');
export const licenseTemplate = Symbol('licenseTemplate');
export const termsOfServiceTemplate = Symbol('termsOfServiceTemplate');
export const endpointsTemplate = Symbol('endpointsTemplate');
export const endpointTemplate = Symbol('endpointTemplate');
export const endpointPathTemplate = Symbol('endpointPathTemplate');
export const endpointNameTemplate = Symbol('endpointNameTemplate');
export const methodTemplate = Symbol('methodTemplate');

/**
 * A web component that renders the documentation page for an API documentation (like in RAML documentations) built from 
 * the AMF graph model.
 */
export default class ApiSummaryElement extends ApiDocumentationBase {
  static get styles(): CSSResult[] {
    return [elementStyles, commonStyles, HttpStyles.default, MarkdownStyles];
  }

  [summaryValue]?: ApiDefinitions.IApiSummary;

  get summary(): ApiDefinitions.IApiSummary | undefined {
    return this[summaryValue];
  }

  [serversValue]?: ApiDefinitions.IApiServer[];

  get servers(): ApiDefinitions.IApiServer[] | undefined {
    return this[serversValue];
  }

  /**
   * A property to set to override AMF's model base URI information.
   * When this property is set, the `endpointUri` property is recalculated.
   * @attribute
   */
  @property({ type: String }) baseUri?: string;

  /**
   * API title header level in value range from 1 to 6.
   * This is made for accessibility. It the component is used in a context
   * where headers order matters then this property is to be set to
   * arrange headers in the right order.
   *
   * @default 2
   * @attribute
   */
  @property({ type: Number }) titleLevel?: number;

  /**
   * A property to hide the table of contents list of endpoints.
   * @attribute
   */
  @property({ type: Boolean }) hideToc?: boolean;

  @state() protocols?: string[];

  [endpointsValue]?: ApiDefinitions.IApiEndPointWithOperationsListItem[];

  [isAsyncValue]?: boolean;

  constructor() {
    super();
    this.titleLevel = 2;
  }

  connectedCallback(): void {
    super.connectedCallback();
    this[processDebounce]();
  }

  /**
   * Queries the graph store for the API data.
   */
  async processGraph(): Promise<void> {
    await this[querySummary]();
    await this[queryServers]();
    await this[queryEndpoints]();
    await this[processSummary]();
    this.requestUpdate();
  }

  /**
   * Queries the API store for the API summary object.
   */
  async [querySummary](): Promise<void> {
    this[summaryValue] = undefined;
    try {
      const info = await ApiEvents.summary(this);
      this[summaryValue] = info;
    } catch (e) {
      const ex = e as Error;
      TelemetryEvents.exception(this, ex.message, false);
      ReportingEvents.error(this, ex, `Unable to query for API summary data: ${ex.message}`, this.localName);
    }
  }

  /**
   * Queries the API store for the API summary object.
   */
  async [queryServers](): Promise<void> {
    this[serversValue] = undefined;
    try {
      const info = await ServerEvents.query(this);
      this[serversValue] = info;
    } catch (e) {
      const ex = e as Error;
      TelemetryEvents.exception(this, ex.message, false);
      ReportingEvents.error(this, ex, `Unable to query for API servers: ${ex.message}`, this.localName);
    }
  }

  /**
   * Logic executed after the summary is requested from the store.
   */
  async [processSummary](): Promise<void> {
    this[isAsyncValue] = undefined;
    const { summary } = this;
    if (!summary) {
      return;
    }
    this[isAsyncValue] = summary.types.includes(AmfNamespace.aml.vocabularies.apiContract.AsyncAPI);
  }

  /**
   * Queries the API endpoints and methods.
   */
  async [queryEndpoints](): Promise<void> {
    this[endpointsValue] = undefined;
    try {
      const info = await EndpointEvents.list(this);
      this[endpointsValue] = info;
    } catch (e) {
      const ex = e as Error;
      TelemetryEvents.exception(this, ex.message, false);
      ReportingEvents.error(this, ex, `Unable to query for API endpoints: ${ex.message}`, this.localName);
    }
  }

  [navigateHandler](e: Event): void {
    e.preventDefault();
    const target = e.composedPath()[0] as HTMLElement;
    const data = target.dataset;
    if (!data.id || !data.shapeType) {
      return;
    }
    NavigationEvents.apiNavigate(this, data.id, (data.shapeType as SelectionType), data.parent);
  }

  render(): TemplateResult {
    const { summary } = this;
    if (!summary) {
      return html``;
    }
    return html`
    ${this[titleTemplate]()}
    ${this[versionTemplate]()}
    ${this[descriptionTemplate](summary.description)}
    ${this[serversTemplate]()}
    ${this[protocolsTemplate]()}
    ${this[contactInfoTemplate]()}
    ${this[licenseTemplate]()}
    ${this[termsOfServiceTemplate]()}
    ${this[endpointsTemplate]()}
    `;
  }

  [titleTemplate](): TemplateResult|string {
    const { summary, titleLevel } = this;
    if (!summary || !summary.name) {
      return '';
    }
    return html`
    <div class="api-title" role="heading" aria-level="${titleLevel || ''}" part="api-title">
      <label part="api-title-label">API title:</label>
      <span class="text-selectable">${summary.name}</span>
    </div>`;
  }

  [versionTemplate](): TemplateResult|string {
    const { summary } = this;
    if (!summary || !summary.version) {
      return '';
    }
    return html`
    <p class="inline-description version" part="api-version">
      <label>Version:</label>
      <span class="text-selectable">${summary.version}</span>
    </p>`;
  }

  /**
   * @returns A template for a server, servers, or no servers
   * whether it's defined in the main API definition or not.
   */
  [serversTemplate](): TemplateResult|string {
    const { servers, baseUri } = this;
    if (baseUri) {
      return this[baseUriTemplate](undefined);
    }
    if (!servers || !servers.length) {
      return '';
    }
    if (servers.length === 1) {
      return this[baseUriTemplate](servers[0]);
    }
    return html`
    <div class="servers" slot="markdown-html">
      <p class="servers-label">API servers</p>
      <ul class="server-lists">
        ${servers.map((server) => this[serverTemplate](server))}
      </ul>
    </div>`;
  }

  /**
   * @param server Server definition
   * @returns A template for a single server in the main API definition
   */
  [baseUriTemplate](server?: ApiDefinitions.IApiServer): TemplateResult {
    const { baseUri, protocols } = this;
    const uri = UrlLib.computeApiBaseUri({ baseUri, server, protocols, });
    return html`
    <div class="endpoint-url">
      <div class="url-value">${uri}</div>
    </div>
    `;
  }

  /**
   * @param server Server definition
   * @returns Template for a server list items when there is more than one server.
   */
  [serverTemplate](server: ApiDefinitions.IApiServer): TemplateResult {
    const { baseUri, protocols } = this;
    const uri = UrlLib.computeApiBaseUri({ baseUri, server, protocols, });
    const { description } = server;
    return html`
    <li class="text-selectable">
      ${uri}
      ${description ? html`<arc-marked .markdown=${description} class="server-description"></arc-marked>` : ''}
    </li>`;
  }

  [protocolsTemplate](): TemplateResult|string {
    const { summary } = this;
    if (!summary || !summary.schemes || !summary.schemes.length) {
      return '';
    }
    const result = summary.schemes.map((item) => html`<span class="chip text-selectable">${item}</span>`);

    return html`
    <label class="section">Supported protocols</label>
    <div class="protocol-chips">${result}</div>`;
  }

  [contactInfoTemplate](): TemplateResult|string {
    const { summary } = this;
    if (!summary || !summary.provider || !summary.provider.name) {
      return '';
    }
    const { name='', email, url } = summary.provider;
    const link = url ? sanitizeHTML(
      `<a href="${url}" target="_blank" class="app-link provider-url text-selectable">${url}</a>`,
    ) : '';
    return html`
    <section role="contentinfo" class="docs-section" part="info-section">
      <label class="section">Contact information</label>
      <p class="inline-description" part="info-inline-desc">
        <span class="provider-name text-selectable">${name}</span>
        ${email ? html`<a class="app-link link-padding provider-email text-selectable" href="mailto:${email}">${email}</a>` : ''}
      </p>
      ${url ? html` <p class="inline-description text-selectable" part="info-inline-desc">${unsafeHTML(link)}</p>` : ''}
    </section>`;
  }

  [licenseTemplate](): TemplateResult|string {
    const { summary } = this;
    if (!summary || !summary.license) {
      return '';
    }
    const { url, name } = summary.license;
    if (!url || !name) {
      return '';
    }
    const link = sanitizeHTML(
      `<a href="${url}" target="_blank" class="app-link text-selectable">${name}</a>`,
    );
    return html`
    <section aria-labelledby="licenseLabel" class="docs-section" part="license-section">
      <label class="section" id="licenseLabel">License</label>
      <p class="inline-description">
        ${unsafeHTML(link)}
      </p>
    </section>`;
  }

  [termsOfServiceTemplate](): TemplateResult|string {
    const { summary } = this;
    if (!summary || !summary.termsOfService || !summary.termsOfService.length) {
      return '';
    }
    return html`
    <section aria-labelledby="tocLabel" class="docs-section">
      <label class="section" id="tocLabel">Terms of service</label>
      <arc-marked .markdown="${summary.termsOfService}" sanitize>
        <div slot="markdown-html" class="markdown-body text-selectable"></div>
      </arc-marked>
    </section>`;
  }

  [endpointsTemplate](): TemplateResult|string {
    if (this.hideToc) {
      return '';
    }
    const endpoints = this[endpointsValue] as ApiDefinitions.IApiEndPointWithOperationsListItem[];
    if (!endpoints || !endpoints.length) {
      return '';
    }
    const result = endpoints.map((item) => this[endpointTemplate](item));
    const pathLabel = this[isAsyncValue] ? 'channels' : 'endpoints';
    return html`
    <div class="separator" part="separator"></div>
    <div class="toc" part="toc">
      <label class="section endpoints-title">API ${pathLabel}</label>
      ${result}
    </div>
    `;
  }

  [endpointTemplate](item: ApiDefinitions.IApiEndPointWithOperationsListItem): TemplateResult {
    const { operations=[] } = item;
    const ops = operations.length ? operations.map((op) => this[methodTemplate](op, item)) : '';
    return html`
    <div class="endpoint-item" @click="${this[navigateHandler]}" @keydown="${() => {}}">
      ${item.name ? this[endpointNameTemplate](item) : this[endpointPathTemplate](item)}
      <div class="endpoint-header">
        ${ops}
      </div>
    </div>`;
  }

  [endpointPathTemplate](item: ApiDefinitions.IApiEndPointWithOperationsListItem): TemplateResult {
    return html`
    <a
      class="endpoint-path text-selectable"
      href="#${item.path}"
      data-id="${ifDefined(item.id)}"
      data-shape-type="resource"
      title="Open endpoint documentation">${item.path}</a>
    `;
  }

  [endpointNameTemplate](item: ApiDefinitions.IApiEndPointWithOperationsListItem): TemplateResult|string {
    if (!item.name) {
      return '';
    }
    return html`
    <a
      class="endpoint-path text-selectable"
      href="#${item.path}"
      data-id="${ifDefined(item.id)}"
      data-shape-type="resource"
      title="Open endpoint documentation">${item.name}</a>
    <p class="endpoint-path-name">${item.path}</p>
    `;
  }

  [methodTemplate](item: ApiDefinitions.IApiOperationListItem, endpoint: ApiDefinitions.IApiEndPointWithOperationsListItem): TemplateResult {
    return html`
      <a
        href="#${`${endpoint.path}/${item.method}`}"
        class="method-label"
        data-method="${item.method}"
        data-id="${item.id}"
        data-shape-type="operation"
        data-parent="${ifDefined(endpoint.id)}"
        title="Open method documentation">${item.method}</a>
    `;
  }
}
