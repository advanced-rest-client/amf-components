import Element from '../src/elements/ApiDocumentationDocumentElement.js';

window.customElements.define('api-documentation-document', Element);

declare global {
  interface HTMLElementTagNameMap {
    "api-documentation-document": Element;
  }
}
