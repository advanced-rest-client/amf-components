import Element from '../src/elements/ApiParametrizedSecuritySchemeElement.js';

window.customElements.define('api-parametrized-security-scheme', Element);

declare global {
  interface HTMLElementTagNameMap {
    "api-parametrized-security-scheme": Element;
  }
}
