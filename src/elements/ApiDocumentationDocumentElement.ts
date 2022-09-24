/* eslint-disable class-methods-use-this */
import { html, TemplateResult, CSSResult } from 'lit';
import { ApiDefinitions } from '@api-client/core/build/browser.js';
import { MarkdownStyles } from '@advanced-rest-client/highlight';
import { HttpStyles } from '@advanced-rest-client/base/api.js';
import elementStyles from './styles/ApiDocumentationDocument.js';
import commonStyles from './styles/Common.js';
import { ApiDocumentationBase, descriptionTemplate } from './ApiDocumentationBase.js';
import { Events } from '../events/Events.js';

export const documentationValue = Symbol('documentationValue');
export const titleTemplate = Symbol('titleTemplate');
export const queryDocument = Symbol('queryDocument');

/**
 * A web component that renders the documentation page for an API documentation (like in RAML documentations) built from 
 * the AMF graph model.
 */
export default class ApiDocumentationDocumentElement extends ApiDocumentationBase {
  static get styles(): CSSResult[] {
    return [elementStyles, commonStyles, HttpStyles.default, MarkdownStyles];
  }

  [documentationValue]: ApiDefinitions.IApiDocumentation | undefined

  /**
   * The serialized to a JS object graph model
   */
  get documentation(): ApiDefinitions.IApiDocumentation | undefined {
    return this[documentationValue];
  }

  set documentation(value) {
    const old = this[documentationValue];
    if (old === value) {
      return;
    }
    this[documentationValue] = value;
    this.processGraph();
  }

  /**
   * Queries the graph store for the API Documentation data.
   */
  async processGraph(): Promise<void> {
    await this[queryDocument]();
    this.requestUpdate();
    await this.updateComplete;
  }

  /**
   * Queries for the documentation model.
   */
  async [queryDocument](): Promise<void> {
    const { domainId } = this;
    if (!domainId) {
      return;
    }
    if (this[documentationValue] && this[documentationValue].id === domainId) {
      // in case it was set by the parent via the property
      return;
    }
    try {
      const info = await Events.Documentation.get(this, domainId);
      this[documentationValue] = info;
    } catch (e) {
      this[documentationValue] = undefined;
      const ex = e as Error;
      Events.Telemetry.exception(this, ex.message, false);
      Events.Reporting.error(this, ex, `Unable to query for API documentation data: ${ex.message}`, this.localName);
    }
  }

  render(): TemplateResult {
    const docs = this[documentationValue];
    if (!docs) {
      return html``;
    }
    return html`
    ${this[titleTemplate](docs)}
    ${this[descriptionTemplate](docs.description)}
    `;
  }

  /**
   * @returns The template for the Documentation title.
   */
  [titleTemplate](docs: ApiDefinitions.IApiDocumentation): TemplateResult | string {
    const { title } = docs;
    if (!title) {
      return '';
    }
    return html`
    <div class="documentation-header">
      <div class="documentation-title">
        <span class="label text-selectable">${title}</span>
      </div>
    </div>
    `;
  }
}
