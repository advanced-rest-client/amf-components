/* eslint-disable class-methods-use-this */
import { html, TemplateResult, CSSResult } from 'lit';
import { property } from 'lit/decorators.js';
import { ApiDefinitions } from '@api-client/core/build/browser.js';
import { ApiDocumentationBase, } from './ApiDocumentationBase.js';
import { Events } from '../events/Events.js';
import elementStyles from './styles/ApiSecurityRequirement.js';
import '../../define/api-parametrized-security-scheme.js';

/** @typedef {import('../helpers/api').ApiSecurityRequirement} ApiSecurityRequirement */
/** @typedef {import('../helpers/amf').SecurityRequirement} SecurityRequirement */

export const securityRequirementValue = Symbol('securityRequirementValue');
export const querySecurity = Symbol('querySecurity');

export default class ApiSecurityRequirementDocumentElement extends ApiDocumentationBase {
  static get styles(): CSSResult[] {
    return [elementStyles];
  }

  [securityRequirementValue]?: ApiDefinitions.IApiSecurityRequirement;

  @property({ type: Object }) 
  get securityRequirement(): ApiDefinitions.IApiSecurityRequirement | undefined {
    return this[securityRequirementValue];
  }

  set securityRequirement(value: ApiDefinitions.IApiSecurityRequirement | undefined) {
    const old = this[securityRequirementValue];
    if (old === value) {
      return;
    }
    this[securityRequirementValue] = value;
    this.processGraph();
  }

  async processGraph(): Promise<void> {
    await this[querySecurity]();
    this.requestUpdate();
  }

  /**
   * Queries for the security requirements object.
   */
  async [querySecurity](): Promise<void> {
    const { domainId } = this;
    if (!domainId) {
      // this[securityValue] = undefined;
      return;
    }
    if (this[securityRequirementValue] && this[securityRequirementValue].id === domainId) {
      // in case the security model was provided via the property setter.
      return;
    }
    try {
      const info = await Events.Security.getRequirement(this, domainId);
      this[securityRequirementValue] = info;
    } catch (e) {
      const ex = e as Error;
      this[securityRequirementValue] = undefined;
      Events.Telemetry.exception(this, ex.message, false);
      Events.Reporting.error(this, ex, `Unable to query for API operation data: ${ex.message}`, this.localName);
    }
  }

  render(): TemplateResult {
    const scheme = this[securityRequirementValue];
    if (!scheme || !scheme.schemes || !scheme.schemes.length) {
      return html``;
    }
    return html`
    <div class="security-requirements">
      ${scheme.schemes.map((item) => html`
        <api-parametrized-security-scheme 
          .securityScheme="${item.scheme}" 
          .settings="${item.settings}"
          ?anypoint="${this.anypoint}"
          settingsOpened
        ></api-parametrized-security-scheme>`)}
    </div>
    `;
  }
}
