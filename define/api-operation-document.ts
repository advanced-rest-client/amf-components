import Element from '../src/elements/ApiOperationDocumentElement.js';

window.customElements.define('api-operation-document', Element);

declare global {
  interface HTMLElementTagNameMap {
    "api-operation-document": Element;
  }
}
