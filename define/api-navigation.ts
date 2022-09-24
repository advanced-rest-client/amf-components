import Element from '../src/elements/ApiNavigationElement.js';

window.customElements.define('api-navigation', Element);

declare global {
  interface HTMLElementTagNameMap {
    "api-navigation": Element;
  }
}
