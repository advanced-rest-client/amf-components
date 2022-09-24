import Element from '../src/elements/ApiParameterDocumentElement.js';

window.customElements.define('api-parameter-document', Element);

declare global {
  interface HTMLElementTagNameMap {
    "api-parameter-document": Element;
  }
}
