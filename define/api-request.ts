import Element from '../src/elements/ApiRequestElement.js';

window.customElements.define('api-request', Element);

declare global {
  interface HTMLElementTagNameMap {
    "api-request": Element;
  }
}
