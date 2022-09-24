/* eslint-disable class-methods-use-this */
import { html, TemplateResult, CSSResult } from 'lit';
import { property } from 'lit/decorators.js';
import { Response } from '@api-client/core/build/legacy.js';
import { ResponseViewElement, HttpInternals } from '@advanced-rest-client/base/api.js';
import { EventTypes } from '@advanced-rest-client/events';
import { ArcExportFilesystemEvent, dataValue, providerOptionsValue } from '@advanced-rest-client/events/src/dataexport/Events.js';
import '@anypoint-web-components/awc/dist/define/anypoint-icon-item.js';
import '@advanced-rest-client/icons/arc-icon.js';
import '@advanced-rest-client/base/define/headers-list.js';
import elementStyles from './styles/Response.styles.js';

/** @typedef {import('@advanced-rest-client/events').ArcResponse.Response} Response */
/** @typedef {import('lit-element').TemplateResult} TemplateResult */

export const saveFileHandler = Symbol('saveFileHandler');

export class ApiResponseViewElement extends ResponseViewElement {
  static get styles(): CSSResult[] {
    return [elementStyles];
  }

  /** 
   * Whether the response details view is opened.
   * @attribute
   */
  @property({ type: Boolean, reflect: true }) details?: boolean;

  /** 
   * Whether the source ("raw") view is opened.
   * @attribute
   */
  @property({ type: Boolean, reflect: true }) source?: boolean;

  constructor() {
    super();
    this[saveFileHandler] = this[saveFileHandler].bind(this);
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener(EventTypes.DataExport.fileSave, this[saveFileHandler] as EventListener);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener(EventTypes.DataExport.fileSave, this[saveFileHandler] as EventListener);
  }

  /**
   * A handler for the content action drop down item selection
   */
  async [HttpInternals.contentActionHandler](e: CustomEvent): Promise<void> {
    const id = e.detail.selected;
    if (id === 'toggle-details') {
      this.details = !this.details;
      return undefined;
    }
    if (id === 'toggle-raw') {
      this.source = !this.source;
      return undefined;
    }
    if (id === 'clear') {
      this[HttpInternals.clearResponseHandler]();
    }
    return super[HttpInternals.contentActionHandler](e);
  }

  [saveFileHandler](e: ArcExportFilesystemEvent): void {
    const data = e[dataValue];
    const providerOptions = e[providerOptionsValue];
    const { file, contentType='text/plain' } = providerOptions;
    this.downloadFile(data, contentType, file);
  }

  /**
   * @param data The exported data 
   * @param mime The data content type
   * @param file The export file name
   */
  downloadFile(data: BlobPart, mime: string, file: string): void {
    const a = document.createElement('a');
    const blob = new Blob([data], { type: mime });
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = file;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);  
    }, 0); 
  }

  render(): TemplateResult {
    if (!this.hasResponse) {
      return html``;
    }
    const { source } = this;
    return html`
    ${source ? this[HttpInternals.rawTemplate]('raw', true) : this[HttpInternals.responseTemplate]('response', true)}
    `;
  }

  /**
   * @returns {TemplateResult} The template for the response meta drop down options
   */
  [HttpInternals.responseOptionsItemsTemplate](): TemplateResult {
    const { details, source } = this;
    const icon = details ? 'toggleOn' : 'toggleOff';
    const sourceLabel = source ? 'Formatted view' : 'Source view';
    return html`
    <anypoint-icon-item data-id="clear" ?anypoint="${this.anypoint}">
      <arc-icon icon="clear" slot="item-icon"></arc-icon> Clear response
    </anypoint-icon-item>
    ${super[HttpInternals.responseOptionsItemsTemplate]()}
    <anypoint-icon-item data-id="toggle-details" ?anypoint="${this.anypoint}">
      <arc-icon icon="${icon}" slot="item-icon"></arc-icon> Response details
    </anypoint-icon-item>
    <anypoint-icon-item data-id="toggle-raw" ?anypoint="${this.anypoint}">
      <arc-icon icon="code" slot="item-icon"></arc-icon> ${sourceLabel}
    </anypoint-icon-item>
    `;
  }

  /**
   * @returns The template for the response details, when rendered
   */
  [HttpInternals.responsePrefixTemplate](): TemplateResult | string {
    const { details } = this;
    if (!details) {
      return '';
    }
    const info = this.response as Response;
    const headers = info && info.headers;
    return html`
    <div class="response-details">
      ${this[HttpInternals.urlStatusTemplate]()}
      ${headers ? html`<headers-list class="summary-content" .headers="${headers}"></headers-list>` : html`<p class="summary-content">There are no recorded response headers</p>`}
    </div>
    `;
  }
}
