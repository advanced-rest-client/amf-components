import Element from '../src/elements/ApiResourceDocumentElement.js';

window.customElements.define('api-resource-document', Element);

declare global {
  interface HTMLElementTagNameMap {
    "api-resource-document": Element;
  }
}
