/* eslint-disable class-methods-use-this */
import { html, TemplateResult } from 'lit';
import { AmfNamespace, ApiDefinitions, AmfShapes } from '@api-client/core/build/browser.js';
import '@advanced-rest-client/highlight/arc-marked.js';
import { RamlCustomAuthorization } from '@advanced-rest-client/events/src/authorization/Authorization.js';
import { AuthUiInit } from '@advanced-rest-client/base/api.js';
import ApiUiBase from './ApiUiBase.js';
import * as InputCache from '../InputCache.js';
import { OperationParameter } from '../../types.js';

export default class CustomAuth extends ApiUiBase {
  
  schemeName?: string;
  
  schemeDescription?: string;
  
  descriptionOpened?: boolean;

  constructor(init: AuthUiInit) {
    super(init);
    this.clearInit();

    this.toggleDescription = this.toggleDescription.bind(this);
  }

  clearInit(): void {
    this.schemeName = undefined;
    this.schemeDescription = undefined;
    this.anypoint = false;
    this.descriptionOpened = undefined;
  }

  reset(): void {
    this.clearInit();
    this.clearCache();
  }

  initializeApiModel(): void {
    const { security } = this;
    this.clearInit();
    const source = 'settings';
    const list = this.parametersValue;
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
    if (!type || !type.startsWith('x-')) {
      return;
    }
    const params = this.parametersValue;
    const { headers, queryParameters, queryString } = scheme;
    if (Array.isArray(headers)) {
      headers.forEach((p) => {
        const param = { ...p, required: true };
        params.push({
          binding: param.binding || '',
          paramId: param.id,
          parameter: param,
          source,
          schemaId: param.schema && param.schema.id,
          schema: param.schema,
        });
      });
    }
    let addedParameters = false;
    if (Array.isArray(queryParameters)) {
      queryParameters.forEach((p) => {
        addedParameters = true;
        const param = { ...p, required: true };
        params.push({
          binding: param.binding || '',
          paramId: param.id,
          parameter: param,
          source,
          schemaId: param.schema && param.schema.id,
          schema: param.schema,
        });
      });
    }
    if (!addedParameters && queryString) {
      const shape = queryString as AmfShapes.IApiNodeShape;
      const { properties } = shape;
      const binding = 'query';
      if (!properties) {
        params.push(this.createParameterFromSchema(shape, binding, source));
      } else {
        properties.forEach((property) => {
          params.push(this.createParameterFromProperty(property, binding, source));
        });
      }
    }
    this.schemeName = security.name || scheme.name;
    this.schemeDescription = scheme.description;
    this.requestUpdate();
    this.notifyChange();
  }

  createParameterFromSchema(shape: AmfShapes.IShapeUnion, binding: string, source: string): OperationParameter {
    const { id, name } = shape;
    const constructed: ApiDefinitions.IApiParameter = {
      id,
      binding,
      schema: shape,
      name,
      examples: [],
      payloads: [],
      types: [AmfNamespace.aml.vocabularies.apiContract.Parameter],
      required: false,
      customDomainProperties: [],
    };
    return {
      binding,
      paramId: id,
      parameter: constructed,
      source,
      schemaId: id,
      schema: shape,
    };
  }

  createParameterFromProperty(property: AmfShapes.IApiPropertyShape, binding: string, source: string): OperationParameter {
    const { id, range, name, minCount=0 } = property;
    const constructed: ApiDefinitions.IApiParameter = {
      id,
      binding,
      schema: range,
      name,
      examples: [],
      payloads: [],
      types: [AmfNamespace.aml.vocabularies.apiContract.Parameter],
      required: minCount > 0,
      customDomainProperties: [],
    };
    return {
      binding,
      paramId: id,
      parameter: constructed,
      source,
      schemaId: property.id,
      schema: property as AmfShapes.IShapeUnion,
    };
  }

  /**
   * Updates, if applicable, query parameter value.
   *
   * This does nothing if the query parameter has not been defined for the current
   * scheme.
   *
   * @param name The name of the changed parameter
   * @param newValue A value to apply. May be empty but must be defined.
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
   * @param name The name of the changed header
   * @param newValue A value to apply. May be empty but must be defined.
   */
  updateHeader(name: string, newValue: string): void {
    const list = this.parametersValue;
    const param = list.find(i => i.binding === 'header' && i.parameter.name === name);
    if (param) {
      InputCache.set(this.target, param.paramId, newValue, this.globalCache);
    }
  }

  restore(state: RamlCustomAuthorization): void {
    if (!state) {
      return;
    }
    this.restoreModelValue('header', state.header);
    this.restoreModelValue('query', state.query);
    this.requestUpdate();
  }

  restoreModelValue(binding: string, restored?: RamlCustomAuthorization): void {
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
        InputCache.set(this.target, param.paramId, restored[name as keyof RamlCustomAuthorization], this.globalCache);
      }
    });
  }

  serialize(): RamlCustomAuthorization {
    const params = this.parametersValue;
    const result: RamlCustomAuthorization = {};
    (params || []).forEach((param) => {
      if (!result[param.binding as keyof RamlCustomAuthorization]) {
        result[param.binding as keyof RamlCustomAuthorization] = {};
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
      (result[param.binding as keyof RamlCustomAuthorization] as Record<string, string>)[param.parameter.name || ''] = value as string;
    });
    return result;
  }

  validate(): boolean {
    const nils = this.nilValues;
    const params = this.parametersValue;
    return !params.some((param) => {
      if (nils.includes(param.paramId)) {
        return false;
      }
      const value = InputCache.get(this.target, param.paramId, this.globalCache);
      if (!value && !param.parameter.required) {
        return false;
      }
      return !value;
    });
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
    <form autocomplete="on" class="custom-auth">
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
