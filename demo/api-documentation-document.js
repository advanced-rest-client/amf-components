import { html } from 'lit-html';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import { AmfDemoBase } from './lib/AmfDemoBase.js';
import '../define/api-navigation.js';
import '../define/api-documentation-document.js';

/** @typedef {import('../src/events/NavigationEvents').ApiNavigationEvent} ApiNavigationEvent */

class ComponentPage extends AmfDemoBase {
  constructor() {
    super();
    this.initObservableProperties([
      'selectedId', 'selectedType', 'loaded',
    ]);
    this.componentName = 'api-documentation-document';
    this.renderViewControls = true;
    this.loaded = false;
    this.selectedId = undefined;
    this.selectedType = undefined;
    this.endpointsOpened = false;
    this.docsOpened = true;
  }

  /**
   * @param {ApiNavigationEvent} e
   */
  _navChanged(e) {
    const { domainId, domainType, passive } = e.detail;
    if (passive) {
      return;
    }
    if (domainType === 'documentation') {
      this.selectedId = domainId;
      this.selectedType = domainType;
    } else {
      this.selectedId = undefined;
      this.selectedType = undefined;
    }
  }

  async _loadFile(file) {
    await super._loadFile(file);
    this.loaded = true;
  }

  contentTemplate() {
    return html`
      <h2>API documentation</h2>
      ${this.demoTemplate()}
    `;
  }

  demoTemplate() {
    const { loaded } = this;
    return html`
    <section class="documentation-section">
      <h3>Interactive demo</h3>
      <p>
        This demo lets you preview the API documentation document with various configuration options.
      </p>

      <div class="api-demo-content">
        ${!loaded ? html`<p>Load an API model first.</p>` : this._componentTemplate()}
      </div>
    </section>
    `;
  }

  _componentTemplate() {
    const { demoStates, darkThemeActive, selectedId } = this;
    if (!selectedId) {
      return html`<p>Select API documentation in the navigation</p>`;
    }
    return html`
    <arc-interactive-demo
      .states="${demoStates}"
      @state-changed="${this._demoStateHandler}"
      ?dark="${darkThemeActive}"
    >
      <api-documentation-document
        .domainId="${selectedId}"
        slot="content"
      ></api-documentation-document>
    </arc-interactive-demo>
    `;
  }

  _apiListTemplate() {
    const result = [];
    [
      ['demo-api', 'Demo API'],
      ['google-drive-api', 'Google Drive'],
      ['async-api', 'Async API'],
      ['Petstore-v2', 'Petstore OAS API'],
    ].forEach(([file, label]) => {
      result[result.length] = html`
      <anypoint-item data-src="models/${file}-compact.json">${label}</anypoint-item>
      `;
    });
    return result;
  }
}
const instance = new ComponentPage();
instance.render();
