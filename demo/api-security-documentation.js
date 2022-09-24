/* eslint-disable lit-a11y/click-events-have-key-events */
import { html } from 'lit-html';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import '@anypoint-web-components/awc/dist/define/anypoint-checkbox.js';
import { AmfDemoBase } from './lib/AmfDemoBase.js';
import '../define/api-security-document.js';

/** @typedef {import('../src/events/NavigationEvents').ApiNavigationEvent} ApiNavigationEvent */

class ComponentPage extends AmfDemoBase {
  constructor() {
    super();
    this.initObservableProperties([
      'selectedId', 'selectedType', 'settingsOpened',
    ]);
    this.renderViewControls = true;
    this.selectedId = undefined;
    this.selectedType = undefined;
    this.settingsOpened = true;
    this.componentName = 'api-security-document';
    this.securityOpened = true;
    this.endpointsOpened = false;
  }

  /**
   * @param {ApiNavigationEvent} e
   */
  _navChanged(e) {
    const { domainId, domainType, passive } = e.detail;
    if (passive) {
      return;
    }
    if (domainType === 'security') {
      this.selectedId = domainId;
      this.selectedType = domainType;
    } else {
      this.selectedId = undefined;
      this.selectedType = undefined;
    }
  }

  contentTemplate() {
    return html`
      <h2>API security</h2>
      ${this.demoTemplate()}
    `;
  }

  demoTemplate() {
    const { loaded } = this;
    return html`
    <section class="documentation-section">
      <h3>Interactive demo</h3>
      <p>
        This demo lets you preview the API security document with various configuration options.
      </p>

      <div class="api-demo-content">
        ${!loaded ? html`<p>Load an API model first.</p>` : this._componentTemplate()}
      </div>
    </section>
    `;
  }

  _componentTemplate() {
    const { demoStates, darkThemeActive, selectedId, settingsOpened } = this;
    if (!selectedId) {
      return html`<p>Select API documentation in the navigation</p>`;
    }
    return html`
    <arc-interactive-demo
      .states="${demoStates}"
      @state-changed="${this._demoStateHandler}"
      ?dark="${darkThemeActive}"
    >
      <api-security-document
        .domainId="${selectedId}"
        ?settingsOpened="${settingsOpened}"
        slot="content"
      >
      </api-security-document>

      <label slot="options" id="mainOptionsLabel">Options</label>
      <anypoint-checkbox
        aria-describedby="mainOptionsLabel"
        slot="options"
        name="settingsOpened"
        @change="${this._toggleMainOption}"
      >
        Settings opened
      </anypoint-checkbox>
    </arc-interactive-demo>
    `;
  }

  _apiListTemplate() {
    const result = [];
    [
      ['demo-api', 'Demo API'],
      ['api-keys', 'API key (OAS)'],
      ['oauth-flows', 'OAuth 2 flows'],
      ['oas-bearer', 'Bearer token'],
      ['oauth-pkce', 'OAuth 2 PKCE'],
      ['secured-unions', 'Secured unions'],
      ['secured-api', 'Secured API'],
      ['security-api', 'security-api API'],
    ].forEach(([file, label]) => {
      result[result.length] = html`
      <anypoint-item data-src="models/${file}.json">${label}</anypoint-item>`;
    });
    return result;
  }
}
const instance = new ComponentPage();
instance.render();
