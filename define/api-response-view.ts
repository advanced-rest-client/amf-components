import { ApiResponseViewElement } from '../src/elements/ApiResponseViewElement.js';

window.customElements.define('api-response-view', ApiResponseViewElement);

declare global {
  interface HTMLElementTagNameMap {
    "api-response-view": ApiResponseViewElement;
  }
}
