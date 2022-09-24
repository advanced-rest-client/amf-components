import Element from '../src/elements/ApiServerSelectorElement.js';

window.customElements.define('api-server-selector', Element);

declare global {
  interface HTMLElementTagNameMap {
    "api-server-selector": Element;
  }
}
