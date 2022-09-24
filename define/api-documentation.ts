import Element from '../src/elements/ApiDocumentationElement.js';

window.customElements.define('api-documentation', Element);

declare global {
  interface HTMLElementTagNameMap {
    "api-documentation": Element;
  }
}
