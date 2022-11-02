/* eslint-disable class-methods-use-this */
import { html, TemplateResult, CSSResult } from 'lit';
import { property } from 'lit/decorators.js';
import { ApiDefinitions } from '@api-client/core/build/browser.js';
import commonStyles from './styles/Common.js';
import elementStyles from './styles/ApiPayload.js';
import { 
  ApiDocumentationBase,
  evaluateExamples,
  examplesTemplate,
  examplesValue,
} from './ApiDocumentationBase.js';
import { Events } from '../events/Events.js';
import '../../define/api-schema-document.js';

/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('../helpers/api').ApiPayload} ApiPayload */
/** @typedef {import('../helpers/api').ApiShapeUnion} ApiShapeUnion */
/** @typedef {import('../helpers/api').ApiExample} ApiExample */
/** @typedef {import('../types').SchemaExample} SchemaExample */

export const queryPayload = Symbol('queryPayload');
export const queryExamples = Symbol('queryExamples');
export const payloadValue = Symbol('payloadValue');
export const processPayload = Symbol('processPayload');
export const mediaTypeTemplate = Symbol('mediaTypeTemplate');
export const nameTemplate = Symbol('nameTemplate');
export const schemaTemplate = Symbol('schemaTemplate');

export default class ApiPayloadDocumentElement extends ApiDocumentationBase {
  static get styles(): CSSResult[] {
    return [commonStyles, elementStyles];
  }

  [payloadValue]: ApiDefinitions.IApiPayload | undefined

  @property({ type: Object })
  get payload(): ApiDefinitions.IApiPayload | undefined {
    return this[payloadValue];
  }

  set payload(value) {
    const old = this[payloadValue];
    if (old === value) {
      return;
    }
    this[payloadValue] = value;
    this.processGraph();
  }

  /**
   * Queries the graph store for the API Payload data.
   */
  async processGraph(): Promise<void> {
    await this[queryPayload]();
    await this[processPayload]();
    this.requestUpdate();
    await this.updateComplete;
  }

  /**
   * Queries the store for the payload data, when needed.
   * @returns {Promise<void>}
   */
  async [queryPayload](): Promise<void> {
    const { domainId } = this;
    if (!domainId) {
      // this[requestValue] = undefined;
      return;
    }
    if (this[payloadValue] && this[payloadValue].id === domainId) {
      // in case the request model was provided via the property setter.
      return;
    }
    try {
      const info = await Events.Payload.get(this, domainId);
      this[payloadValue] = info;
    } catch (e) {
      this[payloadValue] = undefined;
      const ex = e as Error;
      Events.Telemetry.exception(this, ex.message, false);
      Events.Reporting.error(this, ex, `Unable to query for API payload data: ${ex.message}`, this.localName);
    }
  }

  async [processPayload](): Promise<void> {
    this[examplesValue] = undefined;
    const { payload } = this;
    if (!payload) {
      return;
    }
    const { mediaType='' } = payload;
    const { examples } = payload;
    if (Array.isArray(examples) && examples.length) {
      this[examplesValue] = this[evaluateExamples](examples, mediaType);
    }
  }

  render(): TemplateResult {
    const { payload } = this;
    if (!payload) {
      return html``;
    }
    return html`
    ${this[nameTemplate](payload)}
    ${this[mediaTypeTemplate](payload)}
    ${this[examplesTemplate]()}
    ${this[schemaTemplate](payload)}
    `;
  }

  /**
   * @returns The template for the payload mime type.
   */
  [mediaTypeTemplate](payload: ApiDefinitions.IApiPayload): TemplateResult | string {
    const { mediaType } = payload;
    if (!mediaType) {
      return '';
    }
    return html`
    <div class="media-type">
      <label>Media type:</label>
      <span>${mediaType}</span>
    </div>
    `;
  }

  /**
   * @returns The template for the payload name
   */
  [nameTemplate](payload: ApiDefinitions.IApiPayload): TemplateResult | string {
    const { name } = payload;
    if (!name) {
      return '';
    }
    return html`
    <div class="payload-name text-selectable">${name}</div>
    `;
  }

  /**
   * @returns The template for the payload's schema
   */
  [schemaTemplate](payload: ApiDefinitions.IApiPayload): TemplateResult {
    const { schema, mediaType } = payload;
    if (!schema) {
      return html`<div class="empty-info">Schema is not defined for this payload.</div>`;
    }
    return html`
    <api-schema-document class="schema-renderer" .schema="${schema}" .mimeType="${mediaType}" ?anypoint="${this.anypoint}" forceExamples schemaTitle></api-schema-document>
    `;
  }
}
