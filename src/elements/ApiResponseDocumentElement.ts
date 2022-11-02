/* eslint-disable class-methods-use-this */
import { html, TemplateResult, CSSResult } from 'lit';
import { property } from 'lit/decorators.js';
import { ApiDefinitions } from '@api-client/core/build/browser.js';
import { MarkdownStyles } from '@advanced-rest-client/highlight';
import { AnypointRadioGroupElement } from '@anypoint-web-components/awc';
import '@advanced-rest-client/highlight/arc-marked.js';
import '@anypoint-web-components/awc/dist/define/anypoint-button.js';
import '@anypoint-web-components/awc/dist/define/anypoint-collapse.js';
import '@anypoint-web-components/awc/dist/define/anypoint-radio-button.js';
import '@anypoint-web-components/awc/dist/define/anypoint-radio-group.js';
import '@advanced-rest-client/icons/arc-icon.js';
import commonStyles from './styles/Common.js';
import elementStyles from './styles/ApiResponse.js';
import '../../define/api-payload-document.js';
import '../../define/api-parameter-document.js';
import { 
  ApiDocumentationBase, 
  paramsSectionTemplate, 
  schemaItemTemplate,
  descriptionTemplate,
  customDomainPropertiesTemplate,
} from './ApiDocumentationBase.js';
import { Events } from '../events/Events.js';

export const queryResponse = Symbol('queryResponse');
export const responseValue = Symbol('responseValue');
export const queryPayloads = Symbol('queryPayloads');
export const payloadsValue = Symbol('payloadsValue');
export const payloadValue = Symbol('payloadValue');
export const headersTemplate = Symbol('headersTemplate');
export const payloadTemplate = Symbol('payloadTemplate');
export const payloadSelectorTemplate = Symbol('payloadSelectorTemplate');
export const linksTemplate = Symbol('linksTemplate');
export const linkTemplate = Symbol('linkTemplate');
export const linkOperationTemplate = Symbol('linkOperationTemplate');
export const linkMappingsTemplate = Symbol('mappingsTemplate');
export const linkMappingTemplate = Symbol('linkMappingTemplate');
export const mediaTypeSelectHandler = Symbol('mediaTypeSelectHandler');

/**
 * A web component that renders the documentation page for an API response object.
 */
export default class ApiResponseDocumentElement extends ApiDocumentationBase {
  static get styles(): CSSResult[] {
    return [commonStyles, elementStyles, MarkdownStyles];
  }

  [responseValue]?: ApiDefinitions.IApiResponse;

  [payloadsValue]?: ApiDefinitions.IApiPayload[];

  /**
   * @returns true when has headers parameters definition
   */
  get hasHeaders(): boolean {
    const response = this[responseValue];
    if (!response) {
      return false;
    }
    return Array.isArray(response.headers) && !!response.headers.length;
  }

  get [payloadValue](): ApiDefinitions.IApiPayload | undefined {
    const { mimeType } = this;
    const payloads = this[payloadsValue];
    if (!Array.isArray(payloads) || !payloads.length) {
      return undefined;
    }
    if (!mimeType) {
      return payloads[0];
    }
    return payloads.find((item) => item.mediaType === mimeType);
  }

  @property({ type: Object }) 
  get response(): ApiDefinitions.IApiResponse | undefined {
    return this[responseValue];
  }

  set response(value: ApiDefinitions.IApiResponse | undefined) {
    const old = this[responseValue];
    if (old === value) {
      return;
    }
    this[responseValue] = value;
    this.processGraph();
  }

  /** 
   * When set it opens the headers section
   * @attribute
   */
  @property({ type: Boolean, reflect: true }) headersOpened?: boolean;

  /** 
   * When set it opens the payload section
   * @attribute
   */
  @property({ type: Boolean, reflect: true }) payloadOpened?: boolean;

  /** 
   * The currently selected media type for the payloads.
   * @attribute
   */
  @property({ type: String, reflect: true }) mimeType?: string;

  /**
   * Queries the graph store for the API Response data.
   */
  async processGraph(): Promise<void> {
    await this[queryResponse]();
    await this[queryPayloads]();
    this.requestUpdate();
    await this.updateComplete;
  }

  /**
   * Queries the store for the response data, when needed.
   */
  async [queryResponse](): Promise<void> {
    const { domainId } = this;
    if (!domainId) {
      // this[responseValue] = undefined;
      return;
    }
    if (this[responseValue] && this[responseValue].id === domainId) {
      // in case the response model was provided via the property setter.
      return;
    }
    try {
      const info = await Events.Response.get(this, domainId);
      this[responseValue] = info;
    } catch (e) {
      this[responseValue] = undefined;
      const ex = e as Error;
      Events.Telemetry.exception(this, ex.message, false);
      Events.Reporting.error(this, ex, `Unable to query for API response data: ${ex.message}`, this.localName);
    }
  }

  async [queryPayloads](): Promise<void> {
    const { response } = this;
    if (!response || !Array.isArray(response.payloads) || !response.payloads.length) {
      this[payloadsValue] = undefined;
      return;
    }
    this[payloadsValue] = response.payloads;
  }

  [mediaTypeSelectHandler](e: Event): void {
    const group = e.target as AnypointRadioGroupElement;
    const { selectedItem } = group;
    if (!selectedItem) {
      return;
    }
    const mime = selectedItem.dataset.value;
    this.mimeType = mime;
  }

  render(): TemplateResult {
    if (!this[responseValue]) {
      return html``;
    }
    return html`
    ${this[customDomainPropertiesTemplate](this[responseValue].customDomainProperties)}
    ${this[descriptionTemplate](this[responseValue].description)}
    ${this[headersTemplate]()}
    ${this[linksTemplate]()}
    ${this[payloadTemplate]()}
    `;
  }

  /**
   * @returns The template for the headers
   */
  [headersTemplate](): TemplateResult | string {
    const { response } = this;
    if (!this.hasHeaders || !response) {
      return '';
    }
    const content = response.headers.map((id) => this[schemaItemTemplate](id));
    return this[paramsSectionTemplate]('Headers', 'headersOpened', content);
  }

  /**
   * @returns The template for the payload section
   */
  [payloadTemplate](): TemplateResult | string {
    const payload = this[payloadValue];
    if (!payload) {
      return '';
    }
    const content = html`
    ${this[payloadSelectorTemplate]()}
    <api-payload-document .domainId="${payload.id}" .payload="${payload}" ?anypoint="${this.anypoint}"></api-payload-document>
    `;
    return this[paramsSectionTemplate]('Response body', 'payloadOpened', content);
  }

  /**
   * @returns The template for the payload media type selector.
   */
  [payloadSelectorTemplate](): TemplateResult | string {
    const payloads = this[payloadsValue];
    if (!Array.isArray(payloads) || payloads.length < 2) {
      return '';
    }
    const mime: string[] = [];
    payloads.forEach((item) => {
      if (item.mediaType) {
        mime.push(item.mediaType);
      }
    });
    if (!mime.length) {
      return '';
    }
    const mimeType = this.mimeType || mime[0];
    return html`
    <div class="media-type-selector">
      <label>Body content type</label>
      <anypoint-radio-group 
        @select="${this[mediaTypeSelectHandler]}" 
        attrForSelected="data-value" 
        .selected="${mimeType}"
      >
        ${mime.map((item) => 
          html`<anypoint-radio-button class="response-toggle" name="responseMime" data-value="${item}">${item}</anypoint-radio-button>`)}
      </anypoint-radio-group>
    </div>
    `;
  }

  /**
   * @returns The template for the response links
   */
  [linksTemplate](): TemplateResult | string {
    const { response } = this;
    if (!response) {
      return '';
    }
    const { links=[] } = response;
    if (!Array.isArray(links) || !links.length) {
      return '';
    }
    return html`
    <div class="links-header">Links</div>
    ${links.map((link) => this[linkTemplate](link))}
    `;
  }

  /**
   * @returns A template for the link
   */
  [linkTemplate](link: ApiDefinitions.IApiTemplatedLink): TemplateResult {
    const { name, mapping, operationId, } = link;
    return html`
    <div class="link-header text-selectable">${name}</div>
    ${this[linkOperationTemplate](operationId)}
    <div slot="markdown-html" class="link-table text-selectable">
      ${this[linkMappingsTemplate](mapping)}
    </div>
    `;
  }

  /**
   * @returns The template for the link's operation
   */
  [linkOperationTemplate](operationId?: string): TemplateResult | string {
    if (!operationId) {
      return '';
    }
    return html`
    <div class="operation-id">
      <span class="label">Operation ID:</span>
      <span class="operation-name text-selectable">${operationId}</span>
    </div>
    `;
  }

  /**
   * @returns The template for the link's operation
   */
  [linkMappingsTemplate](mappings?: ApiDefinitions.IApiIriTemplateMapping[]): TemplateResult | string {
    if (!mappings) {
      return '';
    }
    return html`
    <table class="mapping-table text-selectable">
      <tr>
        <th>Variable</th>
        <th>Expression</th>
      </tr>
      ${mappings.map(item => this[linkMappingTemplate](item))}
    </table>
    `;
  }

  /**
   * @returns The template for the link's operation
   */
  [linkMappingTemplate](mapping: ApiDefinitions.IApiIriTemplateMapping): TemplateResult {
    const { linkExpression, templateVariable } = mapping;
    return html`
    <tr>
      <td>${templateVariable}</td>
      <td>${linkExpression}</td>
    </tr>
    `;
  }
}
