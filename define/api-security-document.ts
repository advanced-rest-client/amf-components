import Element from '../src/elements/ApiSecurityDocumentElement.js';

window.customElements.define('api-security-document', Element);

declare global {
  interface HTMLElementTagNameMap {
    "api-security-document": Element;
  }
}
