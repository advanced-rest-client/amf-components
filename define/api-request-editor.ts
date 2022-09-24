import Element from '../src/elements/ApiRequestEditorElement.js';

window.customElements.define('api-request-editor', Element);

declare global {
  interface HTMLElementTagNameMap {
    "api-request-editor": Element;
  }
}
