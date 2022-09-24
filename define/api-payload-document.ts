import Element from '../src/elements/ApiPayloadDocumentElement.js';

window.customElements.define('api-payload-document', Element);

declare global {
  interface HTMLElementTagNameMap {
    "api-payload-document": Element;
  }
}
