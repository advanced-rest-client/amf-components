/* eslint-disable class-methods-use-this */
import { html, TemplateResult, CSSResult } from 'lit';
import { property } from 'lit/decorators.js';
import { ApiDefinitions, AmfNamespace, AmfShapes } from '@api-client/core/build/browser.js';
import { MarkdownStyles } from '@advanced-rest-client/highlight';
import '@advanced-rest-client/highlight/arc-marked.js';
import '@anypoint-web-components/awc/dist/define/anypoint-tab.js';
import '@anypoint-web-components/awc/dist/define/anypoint-tabs.js';
import { AnypointTabsElement } from '@anypoint-web-components/awc';
import { QueryParameterProcessor } from '../lib/QueryParameterProcessor.js';
import { 
  ApiDocumentationBase, 
  paramsSectionTemplate, 
  schemaItemTemplate,
  descriptionTemplate,
} from './ApiDocumentationBase.js';
import { Events } from '../events/Events.js';
import commonStyles from './styles/Common.js';
import elementStyles from './styles/ApiSecurityDocument.js';
import schemaStyles from './styles/SchemaCommon.js';
import '../../define/api-parameter-document.js';
import '../../define/api-response-document.js'

export const querySecurity = Symbol('querySecurity');
export const processSecurity = Symbol('processSecurity');
export const securityValue = Symbol('securityValue');
export const titleTemplate = Symbol('titleTemplate');
export const queryParamsTemplate = Symbol('queryParamsTemplate');
export const headersTemplate = Symbol('headersTemplate');
export const responsesValue = Symbol('responsesValue');
export const queryParametersValue = Symbol('queryParametersValue');
export const processQueryParameters = Symbol('processQueryParameters');
export const preselectResponse = Symbol('preselectResponse');
export const responseContentTemplate = Symbol('responseContentTemplate');
export const responseTabsTemplate = Symbol('responseTabsTemplate');
export const responseTemplate = Symbol('responseTemplate');
export const statusCodeHandler = Symbol('statusCodeHandler');
export const settingsTemplate = Symbol('settingsTemplate');
export const apiKeySettingsTemplate = Symbol('apiKeySettingsTemplate');
export const openIdConnectSettingsTemplate = Symbol('openIdConnectSettingsTemplate');
export const oAuth2SettingsTemplate = Symbol('oAuth2SettingsTemplate');
export const apiKeyHeaderExample = Symbol('apiKeyHeaderExample');
export const apiKeyCookieExample = Symbol('apiKeyCookieExample');
export const apiKeyQueryExample = Symbol('apiKeyQueryExample');
export const exampleTemplate = Symbol('exampleTemplate');
export const oAuth2FlowsTemplate = Symbol('oAuth2FlowsTemplate');
export const oAuth2GrantsTemplate = Symbol('oAuth2GrantsTemplate');
export const oAuth2FlowTemplate = Symbol('oAuth2FlowTemplate');
export const getLabelForGrant = Symbol('getLabelForGrant');
export const accessTokenUriTemplate = Symbol('accessTokenUriTemplate');
export const authorizationUriTemplate = Symbol('authorizationUriTemplate');
export const refreshUriTemplate = Symbol('refreshUriTemplate');
export const scopesTemplate = Symbol('scopesTemplate');
export const scopeTemplate = Symbol('scopeTemplate');
export const grantTitleTemplate = Symbol('grantTitleTemplate');
export const oAuth1SettingsTemplate = Symbol('oAuth1SettingsTemplate');
export const tokenCredentialsUriTemplate = Symbol('tokenCredentialsUriTemplate');
export const signaturesTemplate = Symbol('signaturesTemplate');

/**
 * A web component that renders the documentation page for an API response object.
 */
export default class ApiSecurityDocumentElement extends ApiDocumentationBase {
  static get styles(): CSSResult[] {
    return [commonStyles, elementStyles, MarkdownStyles, schemaStyles];
  }

  /** 
   * When set it opens the parameters section
   * @attribute
   */
  @property({ type: Boolean, reflect: true }) parametersOpened?: boolean;

  /** 
   * When set it opens the headers section
   * @attribute
   */
  @property({ type: Boolean, reflect: true }) headersOpened?: boolean;

  /** 
   * When set it opens the response section
   * @attribute
   */
  @property({ type: Boolean, reflect: true }) responsesOpened?: boolean;

  /** 
   * When set it opens the settings section
   * @attribute
   */
  @property({ type: Boolean, reflect: true }) settingsOpened?: boolean;

  /** 
   * The selected status code in the responses section.
   * @attribute
   */
  @property({ type: String, reflect: true }) selectedStatus?: string;


  [securityValue]?: ApiDefinitions.IApiSecurityScheme;

  [queryParametersValue]?: ApiDefinitions.IApiParameter[];

  @property({ type: Object })
  get securityScheme(): ApiDefinitions.IApiSecurityScheme|undefined {
    return this[securityValue];
  }

  set securityScheme(value: ApiDefinitions.IApiSecurityScheme|undefined) {
    const old = this[securityValue];
    if (old === value) {
      return;
    }
    this[securityValue] = value;
    this[processSecurity]();
    this[processQueryParameters]();
    this.requestUpdate();
  }

  [responsesValue]?: ApiDefinitions.IApiResponse[];

  constructor() {
    super();
    this.headersOpened = false;
    this.parametersOpened = false;
    this.settingsOpened = false;
  }

  async processGraph(): Promise<void> {
    await this[querySecurity]();
    await this[processQueryParameters]();
    this.dispatchEvent(new Event('graphload'));
    this.requestUpdate();
    await this.updateComplete;
  }

  /**
   * Queries for the security requirements object.
   */
  async [querySecurity](): Promise<void> {
    const { domainId } = this;
    if (!domainId) {
      // this[securityValue] = undefined;
      return;
    }
    if (this[securityValue] && this[securityValue].id === domainId) {
      // in case the security model was provided via the property setter.
      return;
    }
    try {
      const info = await Events.Security.get(this, domainId);
      this[securityValue] = info;
    } catch (e) {
      this[securityValue] = undefined;
      const ex = e as Error;
      Events.Telemetry.exception(this, ex.message, false);
      Events.Reporting.error(this, ex, `Unable to query for API operation data: ${ex.message}`, this.localName);
    }
  }

  async [processSecurity](): Promise<void> {
    const scheme = this[securityValue];
    if (!scheme) {
      this[responsesValue] = undefined;
      return;
    }
    const { responses=[] } = scheme;
    this[responsesValue] = responses;
    this[preselectResponse]();
  }

  /**
   * Creates a parameter 
   */
  async [processQueryParameters](): Promise<void> {
    this[queryParametersValue] = undefined;
    const scheme = this[securityValue];
    if (!scheme) {
      return;
    }
    if (Array.isArray(scheme.queryParameters) && scheme.queryParameters.length) {
      this[queryParametersValue] = scheme.queryParameters;
      return;
    }
    const nodeShape = scheme.queryString as AmfShapes.IApiNodeShape;
    if (!nodeShape) {
      return;
    }
    const factory = new QueryParameterProcessor();
    const params = factory.collectOperationParameters(scheme.queryString as AmfShapes.IShapeUnion, 'query');
    this[queryParametersValue] = params.map(p => p.parameter);
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
   * A handler for the status code tab selection.
   */
  [statusCodeHandler](e: Event): void {
    const tabs = e.target as AnypointTabsElement;
    this.selectedStatus = String(tabs.selected);
  }

  /**
   * @param grant The oauth2 grant (flow) name
   * @returns Friendly name for the grant.
   */
  [getLabelForGrant](grant: string): string {
    switch (grant) {
      case "implicit":
        return "Implicit";
      case "authorization_code":
      case "authorizationCode":
        return "Authorization code";
      case "password":
        return "Password";
      case "client_credentials":
      case "clientCredentials":
        return "Client credentials";
      default:
        return grant;
    }
  }

  render(): TemplateResult {
    const scheme = this[securityValue];
    if (!scheme) {
      return html``;
    }
    return html`
    ${this[titleTemplate](scheme)}
    ${this[descriptionTemplate](scheme.description)}
    ${this[queryParamsTemplate]()}
    ${this[headersTemplate](scheme)}
    ${this[responseTemplate]()}
    ${this[settingsTemplate](scheme)}
    `;
  }

  [titleTemplate](scheme: ApiDefinitions.IApiSecurityScheme): TemplateResult {
    const { name, type, displayName } = scheme;
    const title = displayName || name;
    return html`
    <div class="security-header">
      <div class="security-title">
        <span class="label text-selectable">${title}</span>
      </div>
      <p class="sub-header text-selectable">${type}</p>
    </div>
    `;
  }

  /**
   * @returns The template for the query parameters
   */
  [queryParamsTemplate](): TemplateResult | string {
    const params = this[queryParametersValue];
    if (!Array.isArray(params) || !params.length) {
      return '';
    }
    const content = params.map((param) => this[schemaItemTemplate](param, 'query'));
    return this[paramsSectionTemplate]('Parameters', 'parametersOpened', content);
  }

  /**
   * @returns The template for the headers
   */
  [headersTemplate](scheme: ApiDefinitions.IApiSecurityScheme): TemplateResult | string {
    if (!Array.isArray(scheme.headers) || !scheme.headers.length) {
      return '';
    }
    const content = scheme.headers.map((param) => this[schemaItemTemplate](param, 'header'));
    return this[paramsSectionTemplate]('Headers', 'headersOpened', content);
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
  [responseTabsTemplate](responses: ApiDefinitions.IApiResponse[]): TemplateResult {
    const { selectedStatus, anypoint } = this;
    const filtered = responses.filter((item) => !!item.statusCode);
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
      return html`<div class="empty-info text-selectable">Select a response to render the documentation.</div>`;
    }
    return html`
    <api-response-document .response="${response}" ?anypoint="${this.anypoint}" headersOpened payloadOpened></api-response-document>
    `;
  }

  /**
   * @returns The template for the security settings, when required.
   */
  [settingsTemplate](scheme: ApiDefinitions.IApiSecurityScheme): TemplateResult | string {
    const { settings } = scheme;
    if (!settings) {
      return '';
    }
    const { types } = settings;
    if (types.includes(AmfNamespace.aml.vocabularies.security.ApiKeySettings)) {
      return this[apiKeySettingsTemplate](settings);
    }
    if (types.includes(AmfNamespace.aml.vocabularies.security.OpenIdConnectSettings)) {
      return this[openIdConnectSettingsTemplate](settings);
    }
    if (types.includes(AmfNamespace.aml.vocabularies.security.OAuth2Settings)) {
      return this[oAuth2SettingsTemplate]((settings as ApiDefinitions.IApiSecurityOAuth2Settings));
    }
    if (types.includes(AmfNamespace.aml.vocabularies.security.OAuth1Settings)) {
      return this[oAuth1SettingsTemplate]((settings as ApiDefinitions.IApiSecurityOAuth1Settings));
    }
    return '';
  }

  /**
   * @returns The template for API Key security definition.
   */
  [apiKeySettingsTemplate](settings: ApiDefinitions.IApiSecurityApiKeySettings): TemplateResult {
    const { in: paramLocation='Unknown', name } = settings;
    const content = html`
    <div class="param-info">
      <div class="location text-selectable">Location: ${paramLocation}</div>
      ${name ? html`<div class="label text-selectable">Parameter: ${name}</div>` : ''}
    </div>
    ${paramLocation === 'header' ? this[apiKeyHeaderExample](name) : ''}
    ${paramLocation === 'cookie' ? this[apiKeyCookieExample](name) : ''}
    ${paramLocation === 'query' ? this[apiKeyQueryExample](name) : ''}
    `;
    return this[paramsSectionTemplate]('Settings', 'settingsOpened', content);
  }

  /**
   * @param name The name of the API Key parameter
   * @returns The template for API Key header example
   */
  [apiKeyHeaderExample](name = ''): TemplateResult {
    const value = `${name}: abcdef12345`;
    return this[exampleTemplate](value);
  }

  /**
   * @param name The name of the API Key parameter
   * @returns The template for API Key cookie example
   */
  [apiKeyCookieExample](name = ''): TemplateResult {
    const value = `Cookie: ${name}=abcdef12345`;
    return this[exampleTemplate](value);
  }

  /**
   * @param name The name of the API Key parameter
   * @returns The template for API Key query parameter example
   */
  [apiKeyQueryExample](name = ''): TemplateResult {
    const value = `GET /api?${name}=abcdef12345`;
    return this[exampleTemplate](value);
  }

  /**
   * @returns The template for a single example
   */
  [exampleTemplate](value = ''): TemplateResult {
    return html`
    <details class="schema-example" open>
      <summary>Example</summary>
      <div class="example-content">
        <pre class="code-value text-selectable"><code>${value}</code></pre>
      </div>
    </details>
    `;
  }

  /**
   * @returns The template for API Key security definition.
   */
  [openIdConnectSettingsTemplate](settings: ApiDefinitions.IApiSecurityOpenIdConnectSettings): TemplateResult | string {
    const { url } = settings;
    if (!url) {
      return '';
    }
    const content = html`
    <div class="param-info">
      <div class="location">OpenID Connect Discovery URL</div>
      <div class="example-content">
        <pre class="code-value text-selectable"><code>${url}</code></pre>
      </div>
    </div>
    `;
    return this[paramsSectionTemplate]('Settings', 'settingsOpened', content);
  }

  /**
   * @returns The template for OAuth 2 security definition.
   */
  [oAuth2SettingsTemplate](settings: ApiDefinitions.IApiSecurityOAuth2Settings): TemplateResult | string {
    const { authorizationGrants=[], flows=[] } = settings;
    if (!authorizationGrants.length && !flows.length) {
      return '';
    }
    const content: (TemplateResult|string)[] = [];
    const grants = this[oAuth2GrantsTemplate](authorizationGrants);
    const flowsContent = this[oAuth2FlowsTemplate](flows);
    if (grants) {
      content.push(grants);
    }
    if (flowsContent) {
      content.push(flowsContent);
    }
    return this[paramsSectionTemplate]('Settings', 'settingsOpened', content);
  }

  /**
   * @returns The template for OAuth 2 flows list.
   */
  [oAuth2GrantsTemplate](grants: string[]): TemplateResult | string {
    if (!grants.length) {
      return '';
    }
    return html`
    <h4 data-type="authorization-grants" class="value-title">Authorization grants</h4>
    <ul>
    ${grants.map(grant => html`<li data-type="authorization-grant" class="settings-list-value">${grant}</li>`)}
    </ul>
    `;
  }

  /**
   * @returns The template for OAuth 2 flows list.
   */
  [oAuth2FlowsTemplate](flows: ApiDefinitions.IApiSecurityOAuth2Flow[]): TemplateResult | string {
    if (!flows.length) {
      return '';
    }
    return html`
    ${flows.map((flow) => this[oAuth2FlowTemplate](flow))}
    `;
  }

  /**
   * @returns The template for an OAuth 2 flow.
   */
  [oAuth2FlowTemplate](flow: ApiDefinitions.IApiSecurityOAuth2Flow): TemplateResult {
    const { scopes, accessTokenUri, authorizationUri, refreshUri, flow: grant } = flow;
    return html`
    <div class="flow-description">
      ${this[grantTitleTemplate](grant)}
      ${this[accessTokenUriTemplate](accessTokenUri)}
      ${this[authorizationUriTemplate](authorizationUri)}
      ${this[refreshUriTemplate](refreshUri)}
      ${this[scopesTemplate](scopes)}
    </div>
    `;
  }

  /**
   * @param grant The grant name
   * @returns The template for OAuth 2 grant title.
   */
  [grantTitleTemplate](grant?: string): TemplateResult | string {
    if (!grant) {
      return '';
    }
    return html`
    <div>
      <h4 class="grant-title">${this[getLabelForGrant](grant)}</h4>
    </div>`;
  }

  /**
   * @param uri The access token URI
   * @returns The template for the access token URI
   */
  [accessTokenUriTemplate](uri?: string): TemplateResult | string {
    if (!uri) {
      return '';
    }
    return html`
    <div class="flow-section">
      <h5 data-type="token-uri" class="value-title">Access token URI</h5>
      <div class="example-content">
        <pre class="code-value text-selectable"><code>${uri}</code></pre>
      </div>
    </div>`;
  }

  /**
   * @param uri The access token URI
   * @returns The template for the authorization endpoint URI
   */
  [authorizationUriTemplate](uri?: string): TemplateResult | string {
    if (!uri) {
      return '';
    }
    return html`
    <div class="flow-section">
      <h5 data-type="authorization-uri" class="value-title">Authorization URI</h5>
      <div class="example-content">
        <pre class="code-value text-selectable"><code>${uri}</code></pre>
      </div>
    </div>`;
  }

  /**
   * @param uri The access token URI
   * @returns The template for the refresh token endpoint URI
   */
  [refreshUriTemplate](uri?: string): TemplateResult | string {
    if (!uri) {
      return '';
    }
    return html`
    <div class="flow-section">
      <h5 data-type="refresh-uri" class="value-title">Token refresh URI</h5>
      <div class="example-content">
        <pre class="code-value text-selectable"><code>${uri}</code></pre>
      </div>
    </div>`;
  }

  /**
   * @param scopes The oauth scopes
   * @returns The template for the scopes list
   */
  [scopesTemplate](scopes?: ApiDefinitions.IApiSecurityScope[]): TemplateResult | string {
    if (!Array.isArray(scopes) || !scopes.length) {
      return '';
    }
    return html`
    <div class="flow-section">
      <h5 data-type="authorization-scopes" class="value-title">Authorization scopes</h5>
      <ul class="scopes-list">
        ${scopes.map((scope) => this[scopeTemplate](scope))}
      </ul>
    </div>`;
  }

  /**
   * @param scope The access token URI
   * @returns The template for an oauth scope
   */
  [scopeTemplate](scope: ApiDefinitions.IApiSecurityScope): TemplateResult {
    const { name, description } = scope;
    return html`
    <li class="scope-value">
      <span class="scope-name text-selectable">${name}</span>
      ${description ? html`<span class="scope-description text-selectable">${description}</span>` : ''}
    </li>
    `;
  }

  /**
   * @returns The template for OAuth 1 security definition.
   */
  [oAuth1SettingsTemplate](settings: ApiDefinitions.IApiSecurityOAuth1Settings) : TemplateResult {
    const { signatures=[], authorizationUri, requestTokenUri, tokenCredentialsUri } = settings;
    const content: (TemplateResult | string)[] = [];
    if (authorizationUri) {
      content.push(this[authorizationUriTemplate](authorizationUri));
    }
    if (requestTokenUri) {
      content.push(this[accessTokenUriTemplate](requestTokenUri));
    }
    if (tokenCredentialsUri) {
      content.push(this[tokenCredentialsUriTemplate](tokenCredentialsUri));
    }
    if (signatures.length) {
      content.push(this[signaturesTemplate](signatures));
    }
    return this[paramsSectionTemplate]('Settings', 'settingsOpened', content);
  }

  /**
   * @param uri The token credentials URI
   * @returns The template for the token credentials URI
   */
  [tokenCredentialsUriTemplate](uri?: string): TemplateResult | string {
    if (!uri) {
      return '';
    }
    return html`
    <div class="flow-section">
      <h5 data-type="token-credentials-uri" class="value-title text-selectable">Token credentials URI</h5>
      <div class="example-content">
        <pre class="code-value text-selectable"><code>${uri}</code></pre>
      </div>
    </div>`;
  }

  /**
   * @param signatures The OAuth1 signatures.
   * @returns The template for the OAuth1 signatures.
   */
  [signaturesTemplate](signatures: string[]): TemplateResult {
    return html`
    <div class="flow-section">
      <h5 data-type="signatures" class="value-title">Supported signatures</h5>
      <ul>
      ${signatures.map((item) => html`<li><pre class="code-value text-selectable"><code>${item}</code></pre></li>`)}
      </ul>
    </div>`;
  }
}
