import { html, TemplateResult } from 'lit';
import { ApiDefinitions } from '@api-client/core/build/browser.js';
import ApiResourceDocumentElement, {
  endpointValue,
  urlValue,
  urlTemplate,
  titleTemplate,
  computeUrlValue,
  operationTemplate,
} from './ApiResourceDocumentElement.js';
import '../../define/api-operation-document.js'
import '../../define/api-parameter-document.js';

/**
 * A web component that renders the async API Channel documentation page
 */
export default class ApiChannelDocumentElement extends ApiResourceDocumentElement {
  /**
   * Computes the URL value for the current serves, selected server, and endpoint's path.
   */
  [computeUrlValue](): void {
    const { server, protocol='' } = this;
    let url = '';
    if (server) {
      url = server.url;
      if (url.endsWith('/')) {
        url = url.substr(0, url.length - 1);
      }
    }
    let result = '';
    if (protocol && !url.includes('://')) {
      result = `${protocol}://`;
    }
    result += url;
    if (!result) {
      result = '(unknown server)';
    }
    this[urlValue] = result;
  }

  /**
   * @returns The template for the Operation title.
   */
  [titleTemplate](): TemplateResult|string {
    const endPoint = this[endpointValue];
    if (!endPoint) {
      return '';
    }
    const { name, path } = endPoint;
    const label = name || path;
    if (!label) {
      return '';
    }
    return html`
    <div class="endpoint-header">
      <div class="endpoint-title">
        <span class="label">${label}</span>
      </div>
      <p class="sub-header">API channel</p>
    </div>
    `;
  }

  /**
   * @returns The template for the operation's URL.
   */
  [urlTemplate](): TemplateResult {
    const url = this[urlValue];
    return html`
    <div class="endpoint-url">
      <div class="url-value text-selectable">${url}</div>
    </div>
    `;
  }

  /**
   * @param operation The graph id of the operation.
   * @returns The template for the API operation.
   */
  [operationTemplate](endpoint: ApiDefinitions.IApiEndPoint, operation: ApiDefinitions.IApiOperation): TemplateResult {
    const { serverId, baseUri } = this;
    return html`<api-operation-document 
      .domainId="${operation.id}"
      .operation="${operation}"
      .endpoint="${endpoint}"
      .endpointId="${endpoint.id}"
      .serverId="${serverId as string}"
      .baseUri="${baseUri as string}" 
      ?anypoint="${this.anypoint}"
      data-domain-id="${operation.id}"
      responsesOpened
      renderSecurity
      asyncApi
      class="operation"
    ></api-operation-document>`;
  }
}
