import Element from '../src/elements/ApiSummaryElement.js';

window.customElements.define('api-summary', Element);

declare global {
  interface HTMLElementTagNameMap {
    "api-summary": Element;
  }
}
