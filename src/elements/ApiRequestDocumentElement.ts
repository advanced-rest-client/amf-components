/* eslint-disable class-methods-use-this */
import { html, TemplateResult, CSSResult } from 'lit';
import { property } from 'lit/decorators.js';
import { AmfShapes, ApiDefinitions } from '@api-client/core/build/browser.js';
import { AnypointRadioGroupElement } from '@anypoint-web-components/awc';
import '@anypoint-web-components/awc/dist/define/anypoint-radio-button.js';
import '@anypoint-web-components/awc/dist/define/anypoint-radio-group.js';
import commonStyles from './styles/Common.js';
import elementStyles from './styles/ApiRequest.js';
import {
  ApiDocumentationBase,
  paramsSectionTemplate,
  schemaItemTemplate,
} from './ApiDocumentationBase.js';
import { QueryParameterProcessor } from '../lib/QueryParameterProcessor.js';
import { Events } from '../events/Events.js';
import '../../define/api-payload-document.js';
import '../../define/api-parameter-document.js';
import { OperationParameter } from '../types.js';

export const queryRequest = Symbol('queryRequest');
export const requestValue = Symbol('requestValue');
export const queryPayloads = Symbol('queryPayloads');
export const payloadsValue = Symbol('payloadsValue');
export const payloadValue = Symbol('payloadValue');
export const notifyMime = Symbol('notifyMime');
export const preselectMime = Symbol('preselectMime');
export const queryParamsTemplate = Symbol('queryParamsTemplate');
export const headersTemplate = Symbol('headersTemplate');
export const cookiesTemplate = Symbol('cookiesTemplate');
export const payloadTemplate = Symbol('payloadTemplate');
export const payloadSelectorTemplate = Symbol('payloadSelectorTemplate');
export const mediaTypeSelectHandler = Symbol('mediaTypeSelectHandler');
export const processQueryParameters = Symbol('processQueryParameters');
export const queryParametersValue = Symbol('queryParametersValue');

/**
 * A web component that renders the documentation page for an API request object.
 */
export default class ApiRequestDocumentElement extends ApiDocumentationBase {
  static get styles(): CSSResult[] {
    return [commonStyles, elementStyles];
  }

  [requestValue]?: ApiDefinitions.IApiRequest;

  [payloadsValue]?: ApiDefinitions.IApiPayload[];

  /**
   * @returns true when has cookie parameters definition
   */
  get hasCookieParameters(): boolean {
    const request = this[requestValue];
    if (!request) {
      return false;
    }
    return Array.isArray(request.cookieParameters) && !!request.cookieParameters.length;
  }

  /**
   * @returns true when has headers parameters definition
   */
  get hasHeaders(): boolean {
    const request = this[requestValue];
    if (!request) {
      return false;
    }
    return Array.isArray(request.headers) && !!request.headers.length;
  }

  /**
   * @returns true when has query parameters definition
   */
  get hasQueryParameters(): boolean {
    const request = this[requestValue];
    if (!request) {
      return false;
    }
    return Array.isArray(request.queryParameters) && !!request.queryParameters.length;
  }

  /**
   * @returns The combined list of path parameters in the server, endpoint, and the request.
   */
  get uriParameters(): ApiDefinitions.IApiParameter[] {
    const request = this[requestValue];
    const { server, endpoint } = this;
    let result: ApiDefinitions.IApiParameter[] = [];
    if (server && Array.isArray(server.variables) && server.variables.length) {
      result = result.concat(server.variables);
    }
    if (endpoint && Array.isArray(endpoint.parameters) && endpoint.parameters.length) {
      result = result.concat(endpoint.parameters);
    }
    if (request && Array.isArray(request.uriParameters) && request.uriParameters.length) {
      result = result.concat(request.uriParameters);
    }
    return result;
  }

  /**
   * @returns true when has query string definition
   */
  get hasQueryString(): boolean {
    const request = this[requestValue];
    if (!request) {
      return false;
    }
    return !!request.queryString;
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

  get request(): ApiDefinitions.IApiRequest | undefined {
    return this[requestValue];
  }

  set request(value: ApiDefinitions.IApiRequest | undefined) {
    const old = this[requestValue];
    if (old === value) {
      return;
    }
    this[requestValue] = value;
    this.processGraph();
  }

  /** 
   * When set it opens the parameters section
   * @attribute
   */
  @property({ type: Boolean, reflect: true }) parametersOpened?: boolean;

  /** 
   * When set it opens the headers section
   * @attribute
   */
  @property({ type: Boolean, reflect: true }) headersOpened?: boolean;

  /** 
   * When set it opens the cookies section
   * @attribute
   */
  @property({ type: Boolean, reflect: true }) cookiesOpened?: boolean;

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
   * The current server in use.
   * It adds path parameters defined for the server.
   */
  @property({ type: Object }) server?: ApiDefinitions.IApiServer;

  /** 
   * The parent endpoint of this request.
   * It adds path parameters defined for the endpoint.
   */
  @property({ type: Object }) endpoint?: ApiDefinitions.IApiEndPoint;

  [queryParametersValue]?: OperationParameter[];

  async processGraph(): Promise<void> {
    this.mimeType = undefined;
    await this[queryRequest]();
    await this[queryPayloads]();
    await this[processQueryParameters]();
    this[preselectMime]();
    this.requestUpdate();
    await this.updateComplete;
  }

  /**
   * Queries the store for the request data, when needed.
   */
  async [queryRequest](): Promise<void> {
    const { domainId } = this;
    if (!domainId) {
      // this[requestValue] = undefined;
      return;
    }
    if (this[requestValue] && this[requestValue].id === domainId) {
      // in case the request model was provided via the property setter.
      return;
    }
    try {
      const info = await Events.Request.get(this, domainId);
      this[requestValue] = info;
    } catch (e) {
      this[requestValue] = undefined;
      const ex = e as Error;
      Events.Telemetry.exception(this, ex.message, false);
      Events.Reporting.error(this, ex, `Unable to query for API request data: ${ex.message}`, this.localName);
    }
  }

  async [queryPayloads](): Promise<void> {
    const { request } = this;
    if (!request || !request.payloads.length) {
      this[payloadsValue] = undefined;
      return;
    }
    this[payloadsValue] = request.payloads;
  }

  /**
   * Creates a parameter 
   */
  async [processQueryParameters](): Promise<void> {
    this[queryParametersValue] = undefined;
    const { request } = this;
    if (!request) {
      return;
    }
    const nodeShape = (request.queryString as AmfShapes.IApiNodeShape);
    if (!nodeShape) {
      return;
    }
    const factory = new QueryParameterProcessor();
    const params = factory.collectOperationParameters(request.queryString as AmfShapes.IShapeUnion, 'query');
    this[queryParametersValue] = params;
  }

  /**
   * Pre-selects when needed the mime type for the current payload.
   */
  [preselectMime](): void {
    const { mimeType } = this;
    const payloads = this[payloadsValue];
    if (!Array.isArray(payloads) || !payloads.length) {
      return;
    }
    const mime: string[] = [];
    let hasCurrent = false;
    payloads.forEach((item) => {
      if (item.mediaType) {
        mime.push(item.mediaType);
        if (!hasCurrent && item.mediaType === mimeType) {
          hasCurrent = true;
        }
      }
    });
    // do not change the selection when already exist.
    if (hasCurrent) {
      return;
    }
    if (!mime.length) {
      return;
    }
    const [first] = mime;
    this.mimeType = first;
    this[notifyMime]();
  }

  [mediaTypeSelectHandler](e: Event): void {
    const group = e.target as AnypointRadioGroupElement;
    const { selectedItem } = group;
    if (!selectedItem) {
      return;
    }
    const mime = selectedItem.dataset.value;
    this.mimeType = mime;
    this[notifyMime]();
  }

  /**
   * Dispatches the `mimechange` event.
   */
  [notifyMime](): void {
    this.dispatchEvent(new Event('mimechange'));
  }

  render(): TemplateResult {
    const { request, server, endpoint } = this;
    if (!request && !server && !endpoint) {
      return html``;
    }
    return html`
    ${this[queryParamsTemplate]()}
    ${this[headersTemplate]()}
    ${this[cookiesTemplate]()}
    ${this[payloadTemplate]()}
    `;
  }

  /**
   * @return The template for the query parameters
   */
  [queryParamsTemplate](): TemplateResult | string {
    const { uriParameters, hasQueryParameters } = this;
    if (!hasQueryParameters && !uriParameters.length) {
      return '';
    }
    const { request } = this;
    let queryParameters: ApiDefinitions.IApiParameter[] = [];
    if (request && Array.isArray(request.queryParameters)) {
      queryParameters = request.queryParameters;
    }
    if (!queryParameters.length && this[queryParametersValue] && this[queryParametersValue].length) {
      queryParameters = this[queryParametersValue].map(i => i.parameter);
    }
    const content: (TemplateResult | string)[] = [];
    uriParameters.forEach(param => content.push(this[schemaItemTemplate](param, 'uri')));
    queryParameters.forEach(param => content.push(this[schemaItemTemplate](param, 'query')));
    return this[paramsSectionTemplate]('Parameters', 'parametersOpened', content);
  }

  /**
   * @return The template for the headers
   */
  [headersTemplate](): TemplateResult | string {
    if (!this.hasHeaders) {
      return '';
    }
    const { request } = this;
    const content = (request as ApiDefinitions.IApiRequest).headers.map((param) => this[schemaItemTemplate](param, 'header'));
    return this[paramsSectionTemplate]('Headers', 'headersOpened', content);
  }

  /**
   * @return The template for the cookies list section
   */
  [cookiesTemplate](): TemplateResult | string {
    if (!this.hasCookieParameters) {
      return '';
    }
    const { request } = this;
    const content = (request as ApiDefinitions.IApiRequest).cookieParameters.map((param) => this[schemaItemTemplate](param, 'cookie'));
    return this[paramsSectionTemplate]('Cookies', 'cookiesOpened', content);
  }

  /**
   * @return The template for the payload section
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
    return this[paramsSectionTemplate]('Request body', 'payloadOpened', content);
  }

  /**
   * @return The template for the payload media type selector.
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
}
