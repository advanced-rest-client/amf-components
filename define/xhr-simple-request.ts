import Element from '../src/elements/XhrSimpleRequestElement.js';

window.customElements.define('xhr-simple-request', Element);

declare global {
  interface HTMLElementTagNameMap {
    "xhr-simple-request": Element;
  }
}
