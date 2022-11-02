
import Element from '../src/elements/ApiAuthorizationMethodElement.js';

window.customElements.define('api-authorization-method', Element);

declare global {
  interface HTMLElementTagNameMap {
    "api-authorization-method": Element;
  }
}
