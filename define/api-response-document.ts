import Element from '../src/elements/ApiResponseDocumentElement.js';

window.customElements.define('api-response-document', Element);

declare global {
  interface HTMLElementTagNameMap {
    "api-response-document": Element;
  }
}
