/* eslint-disable no-plusplus */
/* eslint-disable class-methods-use-this */
import { html, TemplateResult, CSSResult, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { Oauth2Credentials } from '@advanced-rest-client/base';
import { ApiDefinitions } from '@api-client/core/build/browser.js';
import { RequestAuthorization } from '@api-client/core/build/legacy.js';
import '@advanced-rest-client/base/define/authorization-method.js';
import elementStyles from './styles/AuthorizationEditor.js';
import '../../define/api-authorization-method.js';
import ApiAuthorizationMethodElement from './ApiAuthorizationMethodElement.js';

/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('../helpers/api').ApiSecurityRequirement} ApiSecurityRequirement */
/** @typedef {import('../helpers/api').ApiParametrizedSecurityScheme} ApiParametrizedSecurityScheme */
/** @typedef {import('../helpers/api').ApiSecurityScheme} ApiSecurityScheme */
/** @typedef {import('../helpers/api').ApiSecurityHttpSettings} ApiSecurityHttpSettings */
/** @typedef {import('./ApiAuthorizationMethodElement').default} ApiAuthorizationMethodElement */
/** @typedef {import('@advanced-rest-client/events').ArcRequest.RequestAuthorization} RequestAuthorization */
/** @typedef {import('@advanced-rest-client/base').Oauth2Credentials} Oauth2Credentials */

interface SecurityMethods {
  types: string[];
  schemes: ApiDefinitions.IApiParametrizedSecurityScheme[];
}

export const querySecurity = Symbol('querySecurity');
export const securityValue = Symbol('securityValue');
export const processModel = Symbol('processModel');
export const methodsValue = Symbol('methodsValue');
export const computeMethods = Symbol('computeMethods');
export const listSchemeLabels = Symbol('listSchemeLabels');
export const methodTemplate = Symbol('methodTemplate');
export const apiKeyTemplate = Symbol('apiKeyTemplate');
export const oa2AuthTemplate = Symbol('oa2AuthTemplate');
export const oa1AuthTemplate = Symbol('oa1AuthTemplate');
export const bearerAuthTemplate = Symbol('bearerAuthTemplate');
export const basicAuthTemplate = Symbol('basicAuthTemplate');
export const digestAuthTemplate = Symbol('digestAuthTemplate');
export const passThroughAuthTemplate = Symbol('passThroughAuthTemplate');
export const ramlCustomAuthTemplate = Symbol('ramlCustomAuthTemplate');
export const methodTitleTemplate = Symbol('methodTitleTemplate');
export const changeHandler = Symbol('changeHandler');
export const createSettings = Symbol('createSettings');
export const openIdConnectTemplate = Symbol('openIdConnectTemplate');

export default class ApiAuthorizationEditorElement extends LitElement {
  static get styles(): CSSResult[] {
    return [elementStyles];
  }

  [securityValue]: ApiDefinitions.IApiSecurityRequirement | undefined;

  [methodsValue]?: SecurityMethods;

  get security(): ApiDefinitions.IApiSecurityRequirement | undefined {
    return this[securityValue];
  }

  set security(value: ApiDefinitions.IApiSecurityRequirement | undefined) {
    const old = this[securityValue];
    if (old === value) {
      return;
    }
    this[securityValue] = value;
    this[processModel]();
    this.requestUpdate();
  }

  /**
   * Current HTTP method. Passed by digest method.
   */
  @property({ type: String })
  httpMethod?: string;

  /**
   * Current request URL. Passed by digest method.
   */
  @property({ type: String })
  requestUrl?: string;

  /**
   * Current request body. Passed by digest method.
   */
  @property({ type: String })
  requestBody?: string;

  /**
   * Whether or not the element is invalid. The validation state changes
   * when settings change or when the `validate()` function is called.
   */
  @property({ type: Boolean, reflect: true })
  invalid?: boolean;

  /**
   * List of credentials source
   */
  @property({ type: Array })
  credentialsSource?: Oauth2Credentials[];

  /**
   * Redirect URL for the OAuth2 authorization.
   */
  @property({ type: String })
  oauth2RedirectUri?: string;

  /** 
   * When set it overrides the `authorizationUri` in the authorization editor,
   * regardless to the authorization scheme applied to the request.
   * This is to be used with the mocking service.
   */
  @property({ type: String })
  oauth2AuthorizationUri?: string;

  /** 
   * When set it overrides the `authorizationUri` in the authorization editor,
   * regardless to the authorization scheme applied to the request.
   * This is to be used with the mocking service.
   */
  @property({ type: String })
  oauth2AccessTokenUri?: string;

  /** 
   * Enables Anypoint platform styles.
   */
  @property({ type: Boolean, reflect: true })
  anypoint?: boolean;

  /** 
   * Enabled Material Design outlined theme
   */
  @property({ type: Boolean, reflect: true })
  outlined?: boolean;

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
  @property({ type: Boolean, reflect: true })
  globalCache?: boolean;

  /**
   * Reads list of authorization methods from the model.
   */
  [processModel](): void {
    const security = this[securityValue];
    if (!security) {
      return;
    }
    this[methodsValue] = this[computeMethods](security.schemes);
  }

  /**
   * Computes list of security schemes that can be applied to the element.
   *
   * @param schemes A list of security schemes to process.
   * @returns A list of authorization methods that can be applied to
   * the current endpoint. Each object describes the list of security types
   * that can be applied to the editor. In OAS an auth method may be an union
   * of methods.
   */
  [computeMethods](schemes: ApiDefinitions.IApiParametrizedSecurityScheme[]): SecurityMethods {
    const result: SecurityMethods = {
      types: [],
      schemes: [],
    };
    schemes.forEach((security) => {
      const type = this[listSchemeLabels](security);
      if (!type) {
        return;
      }
      result.types.push(type);
      result.schemes.push(security);
    });
    return result;
  }

  /**
   * Reads authorization scheme's name and type from the AMF model.
   */
  [listSchemeLabels](security: ApiDefinitions.IApiParametrizedSecurityScheme): string | undefined {
    const { name, scheme } = security;
    if (name === 'null') {
      // RAML allows to define a "null" scheme. This means that the authorization
      // for this endpoint is optional.
      return 'No authorization';
    }
    if (!scheme) {
      return undefined;
    }
    let { type } = scheme;
    if (type === 'http') {
      // HTTP type can be `basic` or `bearer`.
      const config = scheme.settings as ApiDefinitions.IApiSecurityHttpSettings;
      if (!config) {
        // this happens when AMF doesn't properly read graph model back to the store.
        // AMF team promised to fix this...
        type = undefined;
      } else {
        type = config.scheme;
      }
    }
    return type;
  }

  /**
   * A function called each time anything change in the editor.
   * Revalidates the component and dispatches the `change` event.
   */
  [changeHandler](): void {
    this.validate();
    this.dispatchEvent(new CustomEvent('change'));
  }

  /**
   * Validates state of the editor. It sets `invalid` property when called.
   *
   * Exception: OAuth 2 form reports valid even when the `accessToken` is not
   * set. This adjust for this and reports invalid when `accessToken` for OAuth 2
   * is missing.
   *
   * @return {Boolean} True when the form has valid data.
   */
  validate(): boolean {
    const { shadowRoot } = this;
    if (!shadowRoot) {
      return true;
    }
    const nodes = shadowRoot.querySelectorAll('api-authorization-method');
    let valid = true;
    for (let i = 0, len = nodes.length; i < len; i++) {
      const node = nodes[i];
      const methodValid = node.validate();
      if (!methodValid) {
        valid = methodValid;
        break;
      } else if (node.type === 'oauth 2' && !node.accessToken) {
        valid = false;
        break;
      }
    }
    this.invalid = !valid;
    return valid;
  }

  /**
   * Creates a list of configuration by calling the `serialize()` function on each
   * currently rendered authorization form.
   *
   * @returns List of authorization settings.
   */
  serialize(): RequestAuthorization[] {
    const { shadowRoot } = this;
    if (!shadowRoot) {
      throw new Error(`State error. The element is not yet initialized.`);
    }
    const nodes = shadowRoot.querySelectorAll('api-authorization-method');
    const result = [];
    for (let i = 0, len = nodes.length; i < len; i++) {
      const node = nodes[i];
      result.push(this[createSettings](node));
    }
    return result;
  }

  /**
   * Creates an authorization settings object for passed authorization panel.
   * @param {ApiAuthorizationMethodElement} target api-authorization-method instance
   * @return {RequestAuthorization}
   */
  [createSettings](target: ApiAuthorizationMethodElement): RequestAuthorization {
    const config = target.serialize();
    let valid = target.validate();
    const { type } = target;
    if (type === 'oauth 2' && !config.accessToken) {
      valid = false;
    }
    return {
      type,
      valid,
      config,
      enabled: true,
    };
  }

  /**
   * Calls the `authorize()` function on each rendered authorization methods.
   * Currently only `OAuth 1.0` and `OAuth 2.0` actually perform the authorization. 
   * 
   * Each method is called in order to make sure the user is not overwhelmed with 
   * dialogs or other UI elements.
   * 
   * The function rejects when at least one authorization method rejects.
   */
  async authorize(): Promise<void> {
    const { shadowRoot } = this;
    if (!shadowRoot) {
      throw new Error(`State error. The element is not yet initialized.`);
    }
    const nodes = shadowRoot.querySelectorAll('api-authorization-method');
    const list = Array.from(nodes);
    while (list.length) {
      const auth = list.shift();
      if (!auth) {
        break;
      }
      // eslint-disable-next-line no-await-in-loop
      await auth.authorize();
    }
  }

  render(): TemplateResult {
    const methods = this[methodsValue];
    if (!methods || !methods.schemes.length) {
      return html``;
    }
    return html`
    <section class="authorization-union">
    ${methods.schemes.map((scheme, index) => this[methodTemplate](scheme, methods.types[index]))}
    </section>
    `;
  }

  [methodTemplate](scheme: ApiDefinitions.IApiParametrizedSecurityScheme, type: string): TemplateResult | string {
    switch (type) {
      case 'Basic Authentication':
      case 'basic':
        return this[basicAuthTemplate](scheme);
      case 'Digest Authentication':
        return this[digestAuthTemplate](scheme, true);
      case 'Pass Through':
        return this[passThroughAuthTemplate](scheme, true);
      case 'OAuth 2.0':
        return this[oa2AuthTemplate](scheme);
      case 'OAuth 1.0':
        return this[oa1AuthTemplate](scheme, true);
      case 'bearer':
        return this[bearerAuthTemplate](scheme, true);
      case 'Api Key':
        return this[apiKeyTemplate](scheme);
      case 'openIdConnect':
        return this[openIdConnectTemplate](scheme);
      default:
        if (String(type).indexOf('x-') === 0) {
          return this[ramlCustomAuthTemplate](scheme);
        }
    }
    return '';
  }

  /**
   * Renders title to be rendered above authorization method
   * @param {ApiParametrizedSecurityScheme} scheme Authorization scheme to be applied to the method
   * @return {TemplateResult|string}
   */
  [methodTitleTemplate](scheme: ApiDefinitions.IApiParametrizedSecurityScheme): TemplateResult | string {
    const { name } = scheme;
    if (!name) {
      return '';
    }
    return html`<div class="auth-label">${name}</div>`;
  }

  /**
   * Renders a template for Basic authorization.
   */
  [basicAuthTemplate](security: ApiDefinitions.IApiParametrizedSecurityScheme): TemplateResult {
    const { anypoint, outlined, globalCache } = this;
    return html`
    ${this[methodTitleTemplate](security)}
    <api-authorization-method
      ?anypoint="${anypoint}"
      ?outlined="${outlined}"
      ?globalCache="${globalCache}"
      type="basic"
      @change="${this[changeHandler]}"
    ></api-authorization-method>`;
  }

  /**
   * Renders a template for Digest authorization.
   */
  [digestAuthTemplate](security: ApiDefinitions.IApiParametrizedSecurityScheme, renderTitle?: boolean): TemplateResult {
    const {
      anypoint,
      outlined,
      httpMethod,
      requestUrl,
      requestBody,
      globalCache,
    } = this;
    return html`
    ${renderTitle ? this[methodTitleTemplate](security) : ''}
    <api-authorization-method
      ?anypoint="${anypoint}"
      ?outlined="${outlined}"
      ?globalCache="${globalCache}"
      .httpMethod="${httpMethod}"
      .requestUrl="${requestUrl}"
      .requestBody="${requestBody}"
      type="digest"
      @change="${this[changeHandler]}"
    ></api-authorization-method>`;
  }

  /**
   * Renders a template for Pass through authorization.
   *
   * @param {ApiParametrizedSecurityScheme} security Security scheme
   * @param {boolean=} renderTitle
   * @return {TemplateResult}
   */
  [passThroughAuthTemplate](security: ApiDefinitions.IApiParametrizedSecurityScheme, renderTitle?: boolean): TemplateResult {
    const { anypoint, outlined, globalCache, } = this;
    return html`
    ${renderTitle ? this[methodTitleTemplate](security) : ''}
    <api-authorization-method
      ?anypoint="${anypoint}"
      ?outlined="${outlined}"
      ?globalCache="${globalCache}"
      .security="${security}"
      type="pass through"
      @change="${this[changeHandler]}"
    ></api-authorization-method>`;
  }

  /**
   * Renders a template for RAML custom authorization.
   *
   * @param {ApiParametrizedSecurityScheme} security Security scheme
   * @return {TemplateResult}
   */
  [ramlCustomAuthTemplate](security: ApiDefinitions.IApiParametrizedSecurityScheme): TemplateResult {
    const { anypoint, outlined, globalCache, } = this;
    return html`<api-authorization-method
      ?anypoint="${anypoint}"
      ?outlined="${outlined}"
      ?globalCache="${globalCache}"
      .security="${security}"
      type="custom"
      @change="${this[changeHandler]}"
    ></api-authorization-method>`;
  }

  /**
   * Renders a template for Bearer authorization (OAS).
   *
   * @param {ApiParametrizedSecurityScheme} security Security scheme
   * @param {boolean=} renderTitle
   * @return {TemplateResult}
   */
  [bearerAuthTemplate](security: ApiDefinitions.IApiParametrizedSecurityScheme, renderTitle?: boolean): TemplateResult {
    const { anypoint, outlined, globalCache, } = this;
    return html`
    ${renderTitle ? this[methodTitleTemplate](security) : ''}
    <api-authorization-method
      ?anypoint="${anypoint}"
      ?outlined="${outlined}"
      ?globalCache="${globalCache}"
      type="bearer"
      .security="${security}"
      @change="${this[changeHandler]}"
    ></api-authorization-method>`;
  }

  /**
   * Renders a template for OAuth 1 authorization.
   *
   * @param {ApiParametrizedSecurityScheme} security Security scheme
   * @param {boolean=} renderTitle
   * @return {TemplateResult}
   */
  [oa1AuthTemplate](security: ApiDefinitions.IApiParametrizedSecurityScheme, renderTitle?: boolean): TemplateResult {
    const { anypoint, outlined, oauth2RedirectUri, globalCache, } = this;
    return html`
    ${renderTitle ? this[methodTitleTemplate](security) : ''}
    <api-authorization-method
      ?anypoint="${anypoint}"
      ?outlined="${outlined}"
      ?globalCache="${globalCache}"
      type="oauth 1"
      .redirectUri="${oauth2RedirectUri}"
      .security="${security}"
      @change="${this[changeHandler]}"
    ></api-authorization-method>`;
  }

  /**
   * Renders a template for OAuth 2 authorization.
   *
   * @param {ApiParametrizedSecurityScheme} security Security scheme
   * @return {TemplateResult}
   */
  [oa2AuthTemplate](security: ApiDefinitions.IApiParametrizedSecurityScheme): TemplateResult {
    const {
      anypoint,
      outlined,
      oauth2RedirectUri,
      credentialsSource,
      oauth2AuthorizationUri,
      oauth2AccessTokenUri,
      globalCache,
    } = this;
    return html`
    ${this[methodTitleTemplate](security)}
    <api-authorization-method
      ?anypoint="${anypoint}"
      ?outlined="${outlined}"
      ?globalCache="${globalCache}"
      type="oauth 2"
      .redirectUri="${oauth2RedirectUri}"
      .overrideAuthorizationUri="${oauth2AuthorizationUri}"
      .overrideAccessTokenUri="${oauth2AccessTokenUri}"
      .security="${security}"
      .credentialsSource="${credentialsSource}"
      @change="${this[changeHandler]}"
    ></api-authorization-method>`;
  }

  /**
   * Renders a template for OAuth 2 authorization.
   *
   * @param {ApiParametrizedSecurityScheme} security Security scheme
   * @return {TemplateResult}
   */
  [openIdConnectTemplate](security: ApiDefinitions.IApiParametrizedSecurityScheme): TemplateResult {
    const {
      anypoint,
      outlined,
      oauth2RedirectUri,
      credentialsSource,
      oauth2AuthorizationUri,
      oauth2AccessTokenUri,
      globalCache,
    } = this;
    return html`
    ${this[methodTitleTemplate](security)}
    <api-authorization-method
      ?anypoint="${anypoint}"
      ?outlined="${outlined}"
      ?globalCache="${globalCache}"
      type="open id"
      .redirectUri="${oauth2RedirectUri}"
      .overrideAuthorizationUri="${oauth2AuthorizationUri}"
      .overrideAccessTokenUri="${oauth2AccessTokenUri}"
      .security="${security}"
      .credentialsSource="${credentialsSource}"
      @change="${this[changeHandler]}"
    ></api-authorization-method>`;
  }

  /**
   * Renders a template for Api Keys authorization.
   *
   * @param {ApiParametrizedSecurityScheme} security Security scheme
   * @return {TemplateResult}
   */
  [apiKeyTemplate](security: ApiDefinitions.IApiParametrizedSecurityScheme): TemplateResult {
    const { anypoint, outlined, globalCache, } = this;
    return html`
    ${this[methodTitleTemplate](security)}
    <api-authorization-method
      ?globalCache="${globalCache}"
      ?anypoint="${anypoint}"
      ?outlined="${outlined}"
      type="api key"
      .security="${security}"
      @change="${this[changeHandler]}"
    ></api-authorization-method>
    `;
  }
}
