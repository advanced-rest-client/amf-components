import Element from '../src/elements/XhrSimpleRequestTransportElement.js';

window.customElements.define('xhr-simple-request-transport', Element);

declare global {
  interface HTMLElementTagNameMap {
    "xhr-simple-request-transport": Element;
  }
}
