import Element from '../src/elements/ApiSchemaDocumentElement.js';

window.customElements.define('api-schema-document', Element);

declare global {
  interface HTMLElementTagNameMap {
    "api-schema-document": Element;
  }
}
