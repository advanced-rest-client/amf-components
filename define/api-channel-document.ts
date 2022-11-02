import Element from '../src/elements/ApiChannelDocumentElement.js';

window.customElements.define('api-channel-document', Element);

declare global {
  interface HTMLElementTagNameMap {
    "api-channel-document": Element;
  }
}
