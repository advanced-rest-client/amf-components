/* eslint-disable class-methods-use-this */
import { html, TemplateResult } from 'lit';
import { AuthUiInit } from '@advanced-rest-client/base/api.js';
import { AmfNamespace, ApiDefinitions, AmfShapes } from '@api-client/core/build/browser.js';
import '@advanced-rest-client/highlight/arc-marked.js';
import { PassThroughAuthorization } from '@advanced-rest-client/events/src/authorization/Authorization.js';
import ApiUiBase from './ApiUiBase.js';
import * as InputCache from '../InputCache.js';

export default class PassThroughAuth extends ApiUiBase {
  schemeName?: string;
  
  schemeDescription?: string;
  
  descriptionOpened?: boolean;

  constructor(init: AuthUiInit) {
    super(init);
    this.toggleDescription = this.toggleDescription.bind(this);
  }

  reset(): void {
    const params = this.parametersValue;
    (params || []).forEach((param) => {
      InputCache.set(this.target, param.paramId, '', this.globalCache)
    });
  }

  initializeApiModel(): void {
    const { security } = this;
    this.reset();
    const source = 'settings';
    const list = (this.parametersValue);
    this.parametersValue = list.filter(item => item.source !== source);
    if (!security) {
      return;
    }
    if (!security.types.includes(AmfNamespace.aml.vocabularies.security.ParametrizedSecurityScheme)) {
      return;
    }
    const { scheme } = security;
    if (!scheme) {
      return;
    }
    const { type } = scheme;
    if (!type || !type.startsWith('Pass Through')) {
      return;
    }
    const { headers, queryParameters, queryString } = scheme;
    this.appendToParams(headers, 'header', true);
    this.appendToParams(queryParameters, 'query', true);
    if (queryString && (!queryParameters || !queryParameters.length)) {
      this.appendQueryString(queryString);
    }
    this.schemeName = security.name || scheme.name;
    this.schemeDescription = scheme.description;
    this.notifyChange();
    this.requestUpdate();
  }

  appendQueryString(queryString: AmfShapes.IShapeUnion): void {
    const object = queryString as AmfShapes.IApiNodeShape;
    if (!object.properties || !object.properties.length) {
      return;
    }
    const list = object.properties.map((item) => {
      const { id, range, name, minCount = 0 } = item;
      return {
        id,
        binding: 'query',
        schema: range,
        name,
        examples: [],
        payloads: [],
        types: [AmfNamespace.aml.vocabularies.apiContract.Parameter],
        required: minCount > 0,
        customDomainProperties: [],
      } as ApiDefinitions.IApiParameter;
    });
    this.appendToParams(list, 'query', true);
  }

  /**
   * Appends a list of parameters to the list of rendered parameters.
   * @param list
   * @param source
   * @param clear When set it clears the previously set parameters
   */
  appendToParams(list: ApiDefinitions.IApiParameter[], source: string, clear=false): void {
    let params = this.parametersValue;
    if (clear) {
      params = params.filter(p => p.source !== source);
    }
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
    this.parametersValue = params;
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
    const list = (this.parametersValue);
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
    const list = (this.parametersValue);
    const param = list.find(i => i.binding === 'header' && i.parameter.name === name);
    if (param) {
      InputCache.set(this.target, param.paramId, newValue, this.globalCache);
    }
  }

  restore(state: PassThroughAuthorization): void {
    if (!state) {
      return;
    }
    this.restoreModelValue('header', state.header);
    this.restoreModelValue('query', state.query);
    this.requestUpdate();
  }

  restoreModelValue(binding: string, restored?: PassThroughAuthorization): void {
    if (!restored) {
      return;
    }
    const list = (this.parametersValue);
    const params = list.filter(i => i.binding === binding);
    if (!params) {
      return;
    }
    Object.keys(restored).forEach((name) => {
      const param = params.find(i => i.parameter.name === name);
      if (param) {
        InputCache.set(this.target, param.paramId, restored[name as keyof PassThroughAuthorization], this.globalCache);
      }
    });
  }

  serialize(): PassThroughAuthorization {
    const params = (this.parametersValue);
    const result: PassThroughAuthorization = {};
    (params || []).forEach((param) => {
      if (!result[param.binding as keyof PassThroughAuthorization]) {
        result[param.binding as keyof PassThroughAuthorization] = {};
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
      (result[param.binding as keyof PassThroughAuthorization] as Record<string, string>)[param.parameter.name as keyof PassThroughAuthorization] = value as string;
    });
    return result;
  }

  validate(): boolean {
    const nils = this.nilValues;
    const params = (this.parametersValue);
    const hasInvalid = params.some((param) => {
      if (nils.includes(param.paramId)) {
        return false;
      }
      const value = InputCache.get(this.target, param.paramId, this.globalCache);
      if (!value && !param.parameter.required) {
        return false;
      }
      return !value;
    });
    return !hasInvalid;
  }

  /**
   * Toggles value of `descriptionOpened` property.
   *
   * This is a utility method for UI event handling. Use `descriptionOpened`
   * attribute directly instead of this method.
   */
  toggleDescription(): void {
    this.descriptionOpened = !this.descriptionOpened;
    this.requestUpdate();
  }

  render(): TemplateResult {
    return html`
    ${this.titleTemplate()}
    <form autocomplete="on" class="passthrough-auth">
      ${this.headersTemplate()}
      ${this.queryTemplate()}
    </form>
    `;
  }

  titleTemplate(): TemplateResult | string {
    const {
      schemeName,
      schemeDescription,
      anypoint,
      descriptionOpened,
    } = this;
    if (!schemeName) {
      return '';
    }
    return html`
    <div class="subtitle">
      <span>Scheme: ${schemeName}</span>
      ${schemeDescription ? html`<anypoint-icon-button
        class="hint-icon"
        title="Toggle description"
        aria-label="Activate to toggle the description"
        ?anypoint="${anypoint}"
        @click="${this.toggleDescription}"
      >
        <arc-icon icon="help"></arc-icon>
      </anypoint-icon-button>` : ''}
    </div>
    ${schemeDescription && descriptionOpened ? html`<div class="docs-container">
      <arc-marked .markdown="${schemeDescription}" class="main-docs" sanitize>
        <div slot="markdown-html" class="markdown-body"></div>
      </arc-marked>
    </div>` : ''}`;
  }

  headersTemplate(): TemplateResult | string {
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

  queryTemplate(): TemplateResult | string {
    const params = this.parametersValue.filter(item => item.binding === 'query');
    if (!params.length) {
      return '';
    }
    return html`
    <section class="params-section">
      <div class="section-title"><span class="label">Query parameters</span></div>
      ${params.map(param => this.parameterTemplate(param))}
    </section>
    `;
  }
}
