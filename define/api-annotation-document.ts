import Element from '../src/elements/ApiAnnotationDocumentElement.js';

window.customElements.define('api-annotation-document', Element);

declare global {
  interface HTMLElementTagNameMap {
    "api-annotation-document": Element;
  }
}
