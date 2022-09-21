/* eslint-disable class-methods-use-this */
import { html, TemplateResult } from 'lit';
import { ApiKeyAuthorization } from '@advanced-rest-client/events/src/authorization/Authorization.js';
import { ns } from '../../helpers/Namespace.js';
import ApiUiBase from './ApiUiBase.js';
import * as InputCache from '../InputCache.js';
import { ApiParameter, ApiSecurityApiKeySettings, ApiShapeUnion } from '../../helpers/api.js';

export default class ApiKeyAuth extends ApiUiBase {
  async initializeApiModel(): Promise<void> {
    const { security } = this;
    const source = 'settings';
    const list = (this.parametersValue);
    this.parametersValue = list.filter(item => item.source !== source);

    if (!security) {
      return;
    }
    if (!security.types.includes(ns.aml.vocabularies.security.ParametrizedSecurityScheme)) {
      return;
    }
    const { scheme } = security;
    if (!scheme) {
      return;
    }
    const { type } = scheme;
    if (!type || !type.startsWith('Api Key')) {
      return;
    }
    const config = scheme.settings as ApiSecurityApiKeySettings | undefined;
    if (!config) {
      return;
    }
    const { in: binding = '', id } = config;
    if (!InputCache.has(this.target, id, this.globalCache)) {
      InputCache.set(this.target, id, '', this.globalCache);
    }
    const params = this.parametersValue;
    params.push({
      binding,
      paramId: id,
      parameter: { ... (config as ApiParameter), binding },
      source: 'settings',
      schemaId: scheme.id,
      schema: (scheme as unknown as ApiShapeUnion),
    });
    
    await this.requestUpdate();
    this.notifyChange();
  }

  /**
   * Updates, if applicable, query parameter value.
   *
   * This does nothing if the query parameter has not been defined for the current
   * scheme.
   *
   * @param {string} name The name of the changed parameter
   * @param {string} newValue A value to apply. May be empty but must be defined.
   */
  updateQueryParameter(name: string, newValue: string): void {
    const list = /** @type OperationParameter[] */ (this.parametersValue);
    const param = list.find(i => i.binding === 'query' && i.parameter.name === name);
    if (param) {
      InputCache.set(this.target, param.paramId, newValue, this.globalCache);
    }
  }

  /**
   * Updates, if applicable, header value.
   * This is supported for RAML custom scheme and Pass Through
   * that operates on headers model which is only an internal model.
   *
   * This does nothing if the header has not been defined for current
   * scheme.
   *
   * @param {string} name The name of the changed header
   * @param {string} newValue A value to apply. May be empty but must be defined.
   */
  updateHeader(name: string, newValue: string): void {
    const list = /** @type OperationParameter[] */ (this.parametersValue);
    const param = list.find(i => i.binding === 'header' && i.parameter.name === name);
    if (param) {
      InputCache.set(this.target, param.paramId, newValue, this.globalCache);
    }
  }

  /**
   * Updates, if applicable, cookie value.
   * This is supported in OAS' Api Key.
   *
   * This does nothing if the cookie has not been defined for current
   * scheme.
   *
   * @param {string} name The name of the changed cookie
   * @param {string} newValue A value to apply. May be empty but must be defined.
   */
  updateCookie(name: string, newValue: string): void {
    const list = /** @type OperationParameter[] */ (this.parametersValue);
    const param = list.find(i => i.binding === 'cookie' && i.parameter.name === name);
    if (param) {
      InputCache.set(this.target, param.paramId, newValue, this.globalCache);
    }
  }

  reset(): void {
    const params = this.parametersValue;
    (params || []).forEach((param) => {
      InputCache.set(this.target, param.paramId, '', this.globalCache)
    });
  }

  /**
   * Restores previously serialized values
   */
  restore(state: ApiKeyAuthorization): void {
    if (!state) {
      return;
    }
    this.restoreModelValue('header', state.header);
    this.restoreModelValue('query', state.query);
    this.restoreModelValue('cookie', state.query);
    this.requestUpdate();
  }

  restoreModelValue(binding: string, restored?: ApiKeyAuthorization): void {
    if (!restored) {
      return;
    }
    const list = this.parametersValue;
    const params = list.filter(i => i.binding === binding);
    if (!params) {
      return;
    }
    Object.keys(restored).forEach((name) => {
      const param = params.find(i => i.parameter.name === name);
      if (param) {
        InputCache.set(this.target, param.paramId, restored[name as keyof ApiKeyAuthorization], this.globalCache);
      }
    });
  }

  serialize(): ApiKeyAuthorization {
    const params = this.parametersValue;
    const result: ApiKeyAuthorization = {};
    (params || []).forEach((param) => {
      if (!result[param.binding as keyof ApiKeyAuthorization]) {
        result[param.binding as keyof ApiKeyAuthorization] = {};
      }
      let value = InputCache.get(this.target, param.paramId, this.globalCache) as string | boolean;
      if (value === '' || value === undefined) {
        if (param.parameter.required === false) {
          return;
        }
        value = '';
      }
      if (value === false && param.parameter.required === false) {
        return;
      }
      if (value === null) {
        value = '';
      }
      (result[param.binding as keyof ApiKeyAuthorization] as Record<string, string>)[param.parameter.name || ''] = value as string;
    });
    return result;
  }

  validate(): boolean {
    const nils = this.nilValues;
    const params = this.parametersValue;
    return !params.some((param) => {
      if (nils.includes(param.paramId)) {
        return true;
      }
      const value = InputCache.get(this.target, param.paramId, this.globalCache);
      return !value;
    });
  }

  render(): TemplateResult {
    return html`
    ${this.titleTemplate()}
    <form autocomplete="on" class="custom-auth">
      ${this.headersTemplate()}
      ${this.queryTemplate()}
      ${this.cookieTemplate()}
    </form>
    `;
  }

  /**
   * Method that renders scheme's title
   */
  titleTemplate(): TemplateResult {
    return html`
    <div class="subtitle">
      <span>Scheme: Api Key</span>
    </div>`;
  }

  /**
   * Method that renders headers, if any
   *
   * @returns Empty string is returned when the section
   * should not be rendered, as documented in `lit-html` library.
   */
  headersTemplate(): TemplateResult|string {
    const headers = this.parametersValue.filter(item => item.binding === 'header');
    if (!headers.length) {
      return '';
    }
    return html`
    <section class="params-section">
      <div class="section-title"><span class="label">Headers</span></div>
      ${headers.map(param => this.parameterTemplate(param))}
    </section>
    `;
  }

  /**
   * Method that renders query parameters, if any
   *
   * @returns Empty string is returned when the section
   * should not be rendered, as documented in `lit-html` library.
   */
  queryTemplate(): TemplateResult|string {
    const headers = this.parametersValue.filter(item => item.binding === 'query');
    if (!headers.length) {
      return '';
    }
    return html`
    <section class="params-section">
      <div class="section-title"><span class="label">Query parameters</span></div>
      ${headers.map(param => this.parameterTemplate(param))}
    </section>
    `;
  }

  /**
   * Method that renders cookies, if any
   *
   * @returns Empty string is returned when the section
   * should not be rendered, as documented in `lit-html` library.
   */
  cookieTemplate(): TemplateResult|string {
    const headers = this.parametersValue.filter(item => item.binding === 'cookie');
    if (!headers.length) {
      return '';
    }
    return html`
    <section class="params-section">
      <div class="section-title"><span class="label">Cookies</span></div>
      ${headers.map(param => this.parameterTemplate(param))}
    </section>
    `;
  }
}
