import Element from '../src/elements/ApiSecurityRequirementDocumentElement.js';

window.customElements.define('api-security-requirement-document', Element);

declare global {
  interface HTMLElementTagNameMap {
    "api-security-requirement-document": Element;
  }
}
