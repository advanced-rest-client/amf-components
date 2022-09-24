import Element from '../src/elements/ApiRequestDocumentElement.js';

window.customElements.define('api-request-document', Element);

declare global {
  interface HTMLElementTagNameMap {
    "api-request-document": Element;
  }
}
