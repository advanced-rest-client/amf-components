/* eslint-disable default-param-last */
/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
/* eslint-disable class-methods-use-this */
import { html, TemplateResult } from 'lit';
import Oauth2, { oauth2GrantTypes } from '@advanced-rest-client/base/src/elements/authorization/ui/OAuth2.js'
import { OAuth2CustomParameter } from '@advanced-rest-client/oauth';
import { OAuth2Authorization, OAuth2DeliveryMethod, Oauth2GrantType } from '@advanced-rest-client/events/src/authorization/Authorization.js';
import { ns } from '../../helpers/Namespace.js';
import * as InputCache from '../InputCache.js';
import { AmfInputParser, BindingType } from '../AmfInputParser.js';
import { Oauth2RamlCustomData } from '../Oauth2RamlCustomData.js';
import { AmfParameterMixin } from '../AmfParameterMixin.js';
import { ApiArrayNode, ApiCustomDomainProperty, ApiDataNodeUnion, ApiObjectNode, ApiParameter, ApiParametrizedSecurityScheme, ApiScalarNode, ApiSecurityOAuth2Flow, ApiSecurityOAuth2Settings, ApiSecurityScheme, ApiSecurityScope } from '../../helpers/api.js';
import { OperationParameter } from '../../types.js';

const securityValue = Symbol("securityValue");
const gtValue = Symbol("gtValue");

export default class OAuth2Auth extends AmfParameterMixin(Oauth2) {
  [securityValue]?: ApiParametrizedSecurityScheme;

  [gtValue]?: string;

  get security(): ApiParametrizedSecurityScheme | undefined {
    return this[securityValue];
  }

  set security(value: ApiParametrizedSecurityScheme | undefined) {
    const old = this[securityValue];
    if (old === value) {
      return;
    }
    this[securityValue] = value;
    this.initializeApiModel();
  }

  get grantType(): string {
    return this[gtValue] || '';
  }

  set grantType(value) {
    const old = this[gtValue];
    this[gtValue] = value;
    if (old !== value) {
      this.applyFlow(value);
    }
  }

  overrideAuthorizationUri?: string;

  overrideAccessTokenUri?: string;

  initializeApiModel(): void {
    const { security } = this;
    if (!security) {
      this.setupOAuthDeliveryMethod();
      this.updateGrantTypes();
      return;
    }
    if (!security.types.includes(ns.aml.vocabularies.security.ParametrizedSecurityScheme)) {
      this.setupOAuthDeliveryMethod();
      this.updateGrantTypes();
      return;
    }
    const { scheme } = security;
    if (!scheme) {
      this.setupOAuthDeliveryMethod();
      this.updateGrantTypes();
      return;
    }
    const { type } = scheme;
    if (!type || type !== 'OAuth 2.0') {
      this.setupOAuthDeliveryMethod();
      this.updateGrantTypes();
      return;
    }
    this.setupOAuthDeliveryMethod(scheme);
    const config = scheme.settings as ApiSecurityOAuth2Settings;
    if (!config) {
      return;
    }
    this.preFillAmfData(config);
    this.autoHide();
    this.requestUpdate();
  }

  serialize(): OAuth2Authorization {
    const result = super.serialize();
    result.customData = {
      auth: {},
      token: {},
    };
    if (result.grantType === 'application') {
      result.grantType = 'client_credentials'
    }
    const { grantType } = result;
    switch (grantType) {
      case 'implicit':
        this.computeAuthCustomData(result);
        break;
      case 'authorization_code':
        this.computeAuthCustomData(result);
        this.computeTokenCustomData(result);
        break;
      case 'client_credentials':
      case 'password':
        this.computeTokenCustomData(result);
        break;
      default:
        this.computeAuthCustomData(result);
        this.computeTokenCustomData(result);
        break;
    }
    return result;
  }

  setupOAuthDeliveryMethod(scheme?: ApiSecurityScheme): void {
    const info = this.getOauth2DeliveryMethod(scheme);
    if (this.oauthDeliveryMethod !== info.method) {
      this.oauthDeliveryMethod = info.method as OAuth2DeliveryMethod;
    }
    if (this.ccDeliveryMethod !== info.method) {
      this.ccDeliveryMethod = info.method as OAuth2DeliveryMethod;
    }
    if (this.oauthDeliveryName !== info.name) {
      this.oauthDeliveryName = info.name;
    }
  }

  /**
   * Determines placement of OAuth authorization token location.
   * It can be either query parameter or header. This function
   * reads API spec to get this information or provides default if
   * not specifies.
   *
   * @param info Security AMF model
   */
  getOauth2DeliveryMethod(info?: ApiSecurityScheme): { method: string, name: string } {
    const result = {
      method: 'header',
      name: 'authorization'
    };
    if (!info) {
      return result;
    }
    if (Array.isArray(info.headers) && info.headers.length) {
      const [header] = info.headers;
      result.name = header.name as string;
      return result;
    }
    if (Array.isArray(info.queryParameters) && info.queryParameters.length) {
      const [param] = info.queryParameters;
      result.name = param.name as string;
      result.method = 'query';
      return result;
    }
    return result;
  }

  /**
   * Updates list of OAuth grant types supported by current endpoint.
   * The information should be available in RAML file.
   *
   * @param supportedTypes List of supported types. If empty
   * or not set then all available types will be displayed.
   */
  updateGrantTypes(supportedTypes?: string[]): void {
    const available = this.computeGrantList(supportedTypes);
    this.grantTypes = available;
    // check if current selection is still available
    const current = this.grantType;
    const hasCurrent = current ?
      available.some((item) => item.type === current) : false;
    if (!hasCurrent) {
      this.grantType = available[0].type;
    } else if (available.length === 1) {
      this.grantType = available[0].type;
    } else {
      this.applyFlow(current);
    }
  }

  /**
   * Computes list of grant types to render in the form.
   *
   * @param allowed List of types allowed by the
   * component configuration or API spec applied to this element. If empty
   * or not set then all OAuth 2.0 default types are returned.
   */
  computeGrantList(allowed?: string[]): Oauth2GrantType[] {
    let defaults = Array.from(oauth2GrantTypes);
    if (!allowed || !allowed.length) {
      return defaults;
    }
    allowed = Array.from(allowed);
    for (let i = defaults.length - 1; i >= 0; i--) {
      const index = allowed.indexOf(defaults[i].type);
      if (index === -1) {
        defaults.splice(i, 1);
      } else {
        allowed.splice(index, 1);
      }
    }
    if (allowed.length) {
      const mapped: Oauth2GrantType[] = allowed.map((item) => ({
        label: item,
        type: item
      }));
      defaults = defaults.concat(mapped);
    }
    return defaults;
  }

  /**
   * It's quite a bit naive approach to determine whether given model is RAML's
   * or OAS'. There is a significant difference of how to treat grant types
   * (in OAS it is called flows). While in OAS it is mandatory to define a grant type
   * (a flow) RAML has no such requirement. By default this component assumes that
   * all standard (OAuth 2 defined) grant types are supported when grant types are not
   * defined. So it is possible to not define them and the component will work.
   * However, in the AMF model there's always at least one grant type (a flow) whether
   * it's RAML's or OAS' and whether grant type is defined or not.
   *
   * To apply correct settings this component needs to know how to process the data.
   * If it's OAS then when changing grant type it also changes current settings
   * (like scopes, auth uri, etc). If the model is RAML's then change in current grant type
   * won't trigger settings setup.
   *
   * Note, this function returns true when there's no flows whatsoever. It's not
   * really what it means but it is consistent with component's logic.
   *
   * Current method is deterministic and when AMF model change this most probably stop
   * working. It tests whether there's a single grant type and this grant type
   * has no AMF's `security:flow` property.
   *
   * @param flows List of current flows loaded with the AMF model.
   * @returns True if current model should be treated as RAML's model.
   */
  isRamlFlow(flows: ApiSecurityOAuth2Flow[]): boolean {
    if (!Array.isArray(flows)) {
      return true;
    }
    let result = false;
    if (flows.length === 1) {
      const type = flows[0].flow;
      if (!type) {
        result = true;
      }
    }
    return result;
  }

  /**
   * Reads API security definition and applies in to the view as predefined
   * values.
   *
   * @param model AMF model describing settings of the security
   * scheme
   */
  preFillAmfData(model: ApiSecurityOAuth2Settings): void {
    if (!model) {
      return;
    }
    const { flows, authorizationGrants } = model;
    if (Array.isArray(flows) && !this.isRamlFlow(flows)) {
      this.preFillFlowData(flows);
      return;
    }

    const [flow] = flows;
    this.authorizationUri = (this.overrideAuthorizationUri || flow.authorizationUri) as string;
    this.accessTokenUri = this.overrideAccessTokenUri || flow.accessTokenUri || '';
    this.scopes = (flow.scopes || []).map(s => s.name) as string[];
    const settingsExtension = this.findOauth2CustomSettings(model);
    const grants = this.computeGrants(authorizationGrants, settingsExtension);

    if (grants.length) {
      const index = grants.indexOf('code');
      if (index !== -1) {
        grants[index] = 'authorization_code';
      }
      this.updateGrantTypes(grants);
    } else {
      this.updateGrantTypes();
    }
    this.setupAnnotationParameters(settingsExtension);
    this.pkce = this.readPkceValue(model) || false;
  }

  /**
   * API console supports an annotation with additional settings form the OAuth2 authorization
   * defined in https://github.com/raml-org/raml-annotations/blob/master/annotations/security-schemes/oauth-2-custom-settings.raml
   * 
   * This reads (RAML) annotations to build the UI for these settings.
   *
   * @param model AMF model describing settings of the security scheme
   * @returns The extension definition or null
   */
  findOauth2CustomSettings(model: ApiSecurityOAuth2Settings): ApiCustomDomainProperty | undefined {
    const { customDomainProperties = [] } = model;
    const properties = ['accessTokenSettings', 'authorizationGrants', 'authorizationSettings'];
    return customDomainProperties.find((property) => {
      const node = (property.extension as ApiObjectNode);
      if (!node.properties || !node.types.includes(ns.aml.vocabularies.data.Object)) {
        return false;
      }
      return Object.keys(node.properties).some(name => properties.includes(name));
    });
  }

  /**
   * Computes the final list of authorization grants defined in the spec and with applied annotation defined in
   * https://github.com/raml-org/raml-annotations/blob/master/annotations/security-schemes/oauth-2-custom-settings.raml
   * 
   * @param grans The API spec annotation grants
   * @param customProperty The domain extension with the custom data
   * @returns The list of authorization grants to apply to the current operation.
   */
  computeGrants(grans: string[] = [], customProperty?: ApiCustomDomainProperty): string[] {
    if (!customProperty || !customProperty.extension || !customProperty.extension.types.includes(ns.aml.vocabularies.data.Object)) {
      return grans;
    }
    const typed = customProperty.extension as ApiObjectNode;
    if (!typed.properties.authorizationGrants) {
      return grans;
    }
    const array = typed.properties.authorizationGrants as ApiArrayNode;
    const addedGrants: string[] = [];
    array.members.forEach((g) => {
      if (!g.types.includes(ns.aml.vocabularies.data.Scalar)) {
        return;
      }
      const scalar = g as ApiScalarNode;
      if (scalar.value) {
        addedGrants.push(scalar.value);
      }
    });
    let result = grans;
    if (typed.properties.ignoreDefaultGrants) {
      result = [];
    }
    result = result.concat(addedGrants);
    return result;
  }

  /**
   * Pre-fills authorization data with OAS' definition of a grant type
   * which they call a flow. This method populates form with the information
   * find in the model.
   *
   * It tries to match a flow to currently selected `grantType`. When no match
   * then it takes first flow.
   *
   * Note, flow data are applied when `grantType` change.
   *
   * @param flows List of flows in the authorization description.
   */
  preFillFlowData(flows: ApiSecurityOAuth2Flow[]): void {
    // first step is to select the right flow.
    // If the user already selected a grant type before then it this looks
    // for a flow for already selected grant type. If its not present then
    // it uses first available flow.
    let flow = this.flowForType(flows, this.grantType);
    if (!flow) {
      [flow] = flows;
    }
    // finally sets grant types from flows
    const grantTypes = this.readFlowsTypes(flows);
    this.updateGrantTypes(grantTypes);
  }

  /**
   * Searches for a flow in the list of flows for given name.
   *
   * @param flows List of flows to search in.
   * @param type Grant type
   */
  flowForType(flows: ApiSecurityOAuth2Flow[], type?: string): any | undefined {
    if (!type) {
      return undefined;
    }
    for (let i = 0, len = flows.length; i < len; i++) {
      const flow = flows[i];
      if (flow.flow === type) {
        // true for `implicit`, `password`
        return flow;
      }
      if (type === 'authorization_code' && flow.flow === 'authorizationCode') {
        return flow;
      }
      if (type === 'client_credentials' && flow.flow === 'clientCredentials') {
        return flow;
      }
    }
    return undefined;
  }

  /**
   * Reads list of scopes from a flow.
   *
   * @param flow A flow to process.
   * @returns List of scopes required by an endpoint / API.
   */
  readFlowScopes(flow: ApiSecurityOAuth2Flow): string[] | undefined {
    const { security } = this;
    let scopes = this.readSecurityScopes(flow.scopes);
    if (scopes || !security) {
      return scopes;
    }
    // if scopes are not defined in the operation then they may be defined in
    // security settings.
    const config = security.scheme && security.scheme.settings as ApiSecurityOAuth2Settings | undefined;
    if (!config || !config.flows) {
      return undefined;
    }
    const [mainFlow] = config.flows;
    if (mainFlow) {
      scopes = this.readSecurityScopes(mainFlow.scopes);
    }
    return scopes;
  }

  /**
   * Reads list of grant types from the list of flows.
   *
   * @param flows List of flows to process.
   * @returns Grant types supported by this authorization.
   */
  readFlowsTypes(flows: ApiSecurityOAuth2Flow[]): string[] {
    const grants: string[] = [];
    flows.forEach((flow) => {
      let type = flow.flow;
      if (!type) {
        return;
      }
      if (type === 'authorizationCode') {
        type = 'authorization_code';
      } else if (type === 'clientCredentials') {
        type = 'client_credentials';
      }
      grants[grants.length] = type;
    });
    return grants;
  }

  /**
   * Applies settings from a flow to current properties.
   * OAS' flows may define different configuration for each flow.
   * This function is called each time a grant type change. If current settings
   * does not contain flows then this is ignored.
   *
   * @param name Set grant type
   */
  applyFlow(name?: string): void {
    if (!name) {
      return;
    }
    const { security } = this;
    if (!security || !security.scheme || !security.scheme.settings) {
      return;
    }
    const config = security.scheme.settings as ApiSecurityOAuth2Settings;
    const { flows } = config;
    if (!Array.isArray(flows) || this.isRamlFlow(flows)) {
      return;
    }
    if (name === 'client_credentials') {
      name = 'clientCredentials';
    } else if (name === 'authorization_code') {
      name = 'authorizationCode';
    }
    const flow = flows.find(team => team.flow === name);
    // sets basic oauth properties.
    this.scopes = (flow ? this.readFlowScopes(flow) : []) as string[];
    this.authorizationUri = this.overrideAuthorizationUri || flow && flow.authorizationUri || '';
    this.accessTokenUri = this.overrideAccessTokenUri || flow && flow.accessTokenUri || '';
  }

  /**
   * Extracts scopes list from the security definition
   */
  readSecurityScopes(scopes: ApiSecurityScope[]): string[] | undefined {
    if (!scopes) {
      return undefined;
    }
    const result = scopes.map(s => s.name).filter(s => !!s) as string[];
    if (!result.length) {
      return undefined;
    }
    return result;
  }

  /**
   * Checks whether the security scheme is annotated with the `pkce` annotation.
   * This annotation is published at https://github.com/raml-org/raml-annotations/tree/master/annotations/security-schemes
   * @param model Model for the security settings
   * @returns True if the security settings are annotated with PKCE extension
   */
  readPkceValue(model: ApiSecurityOAuth2Settings): boolean | undefined {
    const { customDomainProperties } = model;
    if (!Array.isArray(customDomainProperties) || !customDomainProperties.length) {
      return undefined;
    }
    const pkce = customDomainProperties.find(e => e.name === 'pkce');
    if (!pkce) {
      return undefined;
    }
    const info = pkce.extension as ApiScalarNode;
    if (info.dataType === ns.w3.xmlSchema.boolean) {
      return info.value === 'true';
    }
    return undefined;
  }

  /**
   * Adds `customData` property values that can be applied to the
   * authorization request.
   *
   * @param {OAuth2Authorization} detail Token request detail object. The object is passed
   * by reference so no need for return value
   */
  computeAuthCustomData(detail: OAuth2Authorization): void {
    const all = this.parametersValue;
    const params = all.filter(p => p.binding === 'authQuery');
    if (params.length) {
      if (!detail.customData) {
        detail.customData = {};
      }
      if (!detail.customData.auth) {
        detail.customData.auth = {};
      }
      detail.customData.auth.parameters = this.computeCustomParameters(params, 'authQuery');
    }
  }

  /**
   * Adds `customData` property values that can be applied to the
   * token request.
   *
   * @param detail Token request detail object. The object is passed
   * by reference so no need for return value
   */
  computeTokenCustomData(detail: OAuth2Authorization): void {
    const params = this.parametersValue;
    const tqp = params.filter(p => p.binding === 'tokenQuery');
    const th = params.filter(p => p.binding === 'tokenHeader');
    const tb = params.filter(p => p.binding === 'tokenBody');
    if (!detail.customData) {
      detail.customData = {};
    }
    if (!detail.customData.token) {
      detail.customData.token = {};
    }
    if (!detail.customData.token) {
      detail.customData.token = {};
    }
    if (tqp.length) {
      detail.customData.token.parameters = this.computeCustomParameters(tqp, 'tokenQuery');
    }
    if (th.length) {
      detail.customData.token.headers = this.computeCustomParameters(th, 'tokenHeader');
    }
    if (tb.length) {
      detail.customData.token.body = this.computeCustomParameters(tb, 'tokenBody');
    }
  }

  /**
   * Sets up annotation supported variables to apply form view for:
   * - authorization query parameters
   * - authorization headers
   * - token query parameters
   * - token headers
   * - token body
   *
   * @param customProperty Annotation applied to the OAuth settings
   */
  setupAnnotationParameters(customProperty?: ApiCustomDomainProperty): void {
    this.parametersValue = [];
    /* istanbul ignore if */
    if (!customProperty || !customProperty.extension) {
      return;
    }
    const typed = customProperty.extension as ApiObjectNode;
    const authSettings = (typed.properties.authorizationSettings as ApiObjectNode | undefined);
    const tokenSettings = (typed.properties.accessTokenSettings as ApiObjectNode | undefined);
    if (authSettings) {
      const qp = (authSettings.properties.queryParameters as ApiObjectNode | undefined);
      if (qp && qp.properties) {
        this.setupAuthRequestQueryParameters(qp.properties);
      }
    }
    if (tokenSettings) {
      const qp = (tokenSettings.properties.queryParameters as ApiObjectNode | undefined);
      const headerParams = (tokenSettings.properties.headers as ApiObjectNode | undefined);
      const bodyParams = (tokenSettings.properties.body as ApiObjectNode | undefined);
      if (qp && qp.properties) {
        this.setupTokenRequestQueryParameters(qp.properties);
      }
      if (headerParams && headerParams.properties) {
        this.setupTokenRequestHeaders(headerParams.properties);
      }
      if (bodyParams && bodyParams.properties) {
        this.setupTokenRequestBody(bodyParams.properties);
      }
    }
  }

  /**
   * Appends a list of parameters to the list of rendered parameters
   */
  appendToParams(list: ApiParameter[], source: string): void {
    const params = this.parametersValue;
    if (Array.isArray(list)) {
      list.forEach((param) => {
        params.push({
          paramId: param.id,
          parameter: { ...param, binding: source },
          binding: source,
          source,
          schema: param.schema,
          schemaId: param.schema && param.schema.id ? param.schema.id : undefined,
        });
      });
    }
  }

  /**
   * Sets up query parameters to be used with authorization request.
   *
   * @param properties List of parameters from the annotation.
   */
  setupAuthRequestQueryParameters(properties: { [key: string]: ApiDataNodeUnion }): void {
    const source = 'authQuery';
    this.parametersValue = this.parametersValue.filter(item => item.source !== source);
    const factory = new Oauth2RamlCustomData();
    const items = factory.readParams(properties);
    this.appendToParams(items, source);
  }

  /**
   * Sets up query parameters to be used with token request.
   *
   * @param properties List of parameters from the annotation.
   */
  setupTokenRequestQueryParameters(properties: { [key: string]: ApiDataNodeUnion }): void {
    const source = 'tokenQuery';
    this.parametersValue = this.parametersValue.filter(item => item.source !== source);
    const factory = new Oauth2RamlCustomData();
    const items = factory.readParams(properties);
    this.appendToParams(items, source);
  }

  /**
   * Sets up headers to be used with token request.
   *
   * @param properties params List of parameters from the annotation.
   */
  setupTokenRequestHeaders(properties: { [key: string]: ApiDataNodeUnion }): void {
    const source = 'tokenHeader';
    this.parametersValue = this.parametersValue.filter(item => item.source !== source);
    const factory = new Oauth2RamlCustomData();
    const items = factory.readParams(properties);
    this.appendToParams(items, source);
  }

  /**
   * Sets up body parameters to be used with token request.
   *
   * @param properties params List of parameters from the annotation.
   */
  setupTokenRequestBody(properties: { [key: string]: ApiDataNodeUnion }): void {
    const source = 'tokenBody';
    this.parametersValue = this.parametersValue.filter(item => item.source !== source);
    const factory = new Oauth2RamlCustomData();
    const items = factory.readParams(properties);
    this.appendToParams(items, source);
  }

  /**
   * Computes list of parameter values from current model.
   *
   * This function ignores empty values if they are not required.
   * Required property are always included, even if the value is not set.
   *
   * @param params Model for form inputs.
   * @param reportKey The key name in the report.
   * @returns Array of objects with `name` and `value` properties or undefined if `params` is empty or no values are available.
   */
  computeCustomParameters(params: OperationParameter[], reportKey: keyof BindingType): OAuth2CustomParameter[] {
    const result: OAuth2CustomParameter[] = [];
    const report = AmfInputParser.reportRequestInputs(params.map(p => p.parameter), InputCache.getStore(this.target, this.globalCache), this.nilValues);
    const values = report[reportKey];
    if (!values) {
      return result;
    }
    Object.keys(values).forEach((key) => {
      const value = values[key];
      const info = params.find(p => p.parameter.name === key) as OperationParameter;
      if (info.parameter.required !== true) {
        const type = typeof value;
        if (type === 'number') {
          if (!value && value !== 0) {
            return;
          }
        }
        if (type === 'string') {
          if (!value) {
            return;
          }
        }
        if (Array.isArray(value)) {
          if (!value[0]) {
            return;
          }
        }
        if (type === 'undefined') {
          return;
        }
      }
      result.push({
        name: key,
        value: value || ''
      });
    });
    return result;
  }

  oauth2CustomPropertiesTemplate(): TemplateResult {
    const params = this.parametersValue;
    const aqp = params.filter(p => p.binding === 'authQuery');
    const tqp = params.filter(p => p.binding === 'tokenQuery');
    const th = params.filter(p => p.binding === 'tokenHeader');
    const tb = params.filter(p => p.binding === 'tokenBody');
    return html`
    ${aqp.length ? html`
    <section class="params-section">
      <div class="section-title"><span class="label">Authorization request query parameters</span></div>
      ${aqp.map(param => this.parameterTemplate(param))}
    </section>
    ` : ''}
    ${tqp.length ? html`
    <section class="params-section">
      <div class="section-title"><span class="label">Token request query parameters</span></div>
      ${tqp.map(param => this.parameterTemplate(param))}
    </section>
    ` : ''}
    ${th.length ? html`
    <section class="params-section">
      <div class="section-title"><span class="label">Token request headers</span></div>
      ${th.map(param => this.parameterTemplate(param))}
    </section>
    ` : ''}
    ${tb.length ? html`
    <section class="params-section">
      <div class="section-title"><span class="label">Token request body</span></div>
      ${tb.map(param => this.parameterTemplate(param))}
    </section>
    ` : ''}
    `;
  }
}
