/* eslint-disable class-methods-use-this */
import { html, TemplateResult, CSSResult } from 'lit';
import { AmfShapes, ApiDefinitions } from '@api-client/core/build/browser.js';
import { MarkdownStyles } from '@advanced-rest-client/highlight';
import '@advanced-rest-client/highlight/arc-marked.js';
import commonStyles from './styles/Common.js';
import elementStyles from './styles/ApiParameter.js';
import schemaStyles from './styles/SchemaCommon.js';
import { readPropertyTypeLabel } from '../lib/Utils.js';
import { paramNameTemplate, typeValueTemplate, detailsTemplate, pillTemplate } from './SchemaCommonTemplates.js';
import { ApiDocumentationBase, descriptionTemplate } from './ApiDocumentationBase.js';

export const queryParameter = Symbol('queryParameter');
export const querySchema = Symbol('querySchema');
export const parameterValue = Symbol('parameterValue');
export const schemaValue = Symbol('schemaValue');
export const computeParamType = Symbol('computeParamType');
export const typeLabelValue = Symbol('typeLabelValue');

/**
 * A web component that renders the documentation for a single request / response parameter.
 */
export default class ApiParameterDocumentElement extends ApiDocumentationBase {
  static get styles(): CSSResult[] {
    return [MarkdownStyles, commonStyles, schemaStyles, elementStyles];
  }

  [parameterValue]?: ApiDefinitions.IApiParameter;

  [schemaValue]?: AmfShapes.IShapeUnion;

  [typeLabelValue]?: string;

  get parameter(): ApiDefinitions.IApiParameter | undefined {
    return this[parameterValue];
  }

  set parameter(value) {
    const old = this[parameterValue];
    if (old === value) {
      return;
    }
    this[parameterValue] = value;
    this.processGraph();
  }

  /**
   * Prepares the values to be rendered.
   */
  async processGraph(): Promise<void> {
    const { parameter } = this;
    if (!parameter) {
      return;
    }
    await this[querySchema]();
    this[computeParamType]();
    this.requestUpdate();
    await this.updateComplete;
  }

  /**
   * Reads the schema from the parameter.
   */
  async [querySchema](): Promise<void> {
    this[schemaValue] = undefined;
    const param = this[parameterValue];
    if (!param || !param.schema) {
      return;
    }
    this[schemaValue] = param.schema;
  }

  /**
   * Computes the schema type label value to render in the type view.
   */
  [computeParamType](): void {
    const schema = this[schemaValue];
    if (!schema) {
      this[typeLabelValue] = undefined;
      return;
    }
    const label = readPropertyTypeLabel(schema);
    this[typeLabelValue] = label;
  }

  render(): TemplateResult {
    const param = this[parameterValue];
    if (!param) {
      return html``;
    }
    const { name, required } = param;
    const type = this[typeLabelValue];
    const schema = this[schemaValue];
    return html`
    <div class="property-container simple">
      <div class="name-column">
        ${paramNameTemplate(name, required)}
        <span class="headline-separator"></span>
        ${typeValueTemplate(type)}
        ${required ? pillTemplate('Required', 'This property is required.') : ''}
      </div>
      <div class="description-column">
        ${this[descriptionTemplate]()}
      </div>
      <div class="details-column">
        ${detailsTemplate(schema)}
      </div>
    </div>
    `;
  }

  /**
   * @returns The template for the parameter description. 
   */
  [descriptionTemplate](): TemplateResult | string {
    const schema = this[schemaValue];
    if (schema && schema.description) {
      return super[descriptionTemplate](schema.description);
    }
    const param = this[parameterValue];
    if (param && param.description) {
      return super[descriptionTemplate](param.description);
    }
    return '';
  }
}
