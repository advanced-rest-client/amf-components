import { html } from 'lit-html';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import '@anypoint-web-components/awc/dist/define/anypoint-checkbox.js';
import { AmfDemoBase } from './lib/AmfDemoBase.js';
import '../define/api-channel-document.js';

/** @typedef {import('../src/events/NavigationEvents').ApiNavigationEvent} ApiNavigationEvent */

class ComponentPage extends AmfDemoBase {
  constructor() {
    super();
    this.initObservableProperties([ 
      'selectedId', 'selectedType', 'selectedOperation',
    ]);
    this.selectedId = undefined;
    this.selectedType = undefined;
    this.selectedOperation = undefined;
    this.componentName = 'api-channel-document';
  }

  /**
   * @param {ApiNavigationEvent} e
   */
  _navChanged(e) {
    const { domainId, domainType, passive, parentId } = e.detail;
    if (passive) {
      return;
    }
    if (domainType === 'resource') {
      this.selectedId = domainId;
      this.selectedType = domainType;
      this.selectedOperation = undefined;
    } else if (domainType === 'operation') {
      this.selectedId = parentId;
      this.selectedType = 'endpoint';
      this.selectedOperation = domainId;
    } else {
      this.selectedId = undefined;
      this.selectedType = undefined;
      this.selectedOperation = undefined;
    }
  }

  editorCloseHandler() {
    this.editorOperation = undefined;
    this.editorOpened = false;
  }

  contentTemplate() {
    return html`
      <h2>API channel</h2>
      ${this.demoTemplate()}
    `;
  }

  demoTemplate() {
    const { loaded } = this;
    return html`
    <section class="documentation-section">
      <h3>Interactive demo</h3>
      <p>
        This demo lets you preview the API channel document with various configuration options.
      </p>

      <div class="api-demo-content">
        ${!loaded ? html`<p>Load an API model first.</p>` : this.loadedTemplate()}
      </div>
    </section>
    `;
  }

  loadedTemplate() {
    return html`
    ${this.componentTemplate()}
    `;
  }

  componentTemplate() {
    const { demoStates, darkThemeActive, selectedId, selectedOperation } = this;
    if (!selectedId) {
      return html`<p>Select API operation in the navigation</p>`;
    }
    return html`
    <arc-interactive-demo
      .states="${demoStates}"
      @state-changed="${this._demoStateHandler}"
      ?dark="${darkThemeActive}"
    >
      <api-channel-document
        .domainId="${selectedId}"
        .operationId="${selectedOperation}"
        slot="content"
      >
      </api-channel-document>

      <label slot="options" id="mainOptionsLabel">Options</label>
      <anypoint-checkbox
        aria-describedby="mainOptionsLabel"
        slot="options"
        name="tryIt"
        @change="${this._toggleMainOption}"
      >
        Render try it
      </anypoint-checkbox>
    </arc-interactive-demo>
    `;
  }

  _apiListTemplate() {
    const result = [];
    [
      ['async-api', 'Demo API'],
      ['Streetlights', 'Streetlights API'],
    ].forEach(([file, label]) => {
      result[result.length] = html`
      <anypoint-item data-src="models/${file}.json">${label}</anypoint-item>`;
    });
    return result;
  }
}
const instance = new ComponentPage();
instance.render();
