import { html } from 'lit-html';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import { AmfDemoBase } from './lib/AmfDemoBase.js';
import { AmfSerializer } from '../src/helpers/AmfSerializer.js';
import '../define/api-annotation-document.js';

/** @typedef {import('../src/events/NavigationEvents').ApiNavigationEvent} ApiNavigationEvent */

class ComponentPage extends AmfDemoBase {
  constructor() {
    super();
    this.initObservableProperties([ 
      'shape',
    ]);
    this.shape = undefined;
    this.serializer = new AmfSerializer();
    this.componentName = 'api-annotation-document';
  }

  /** @param {string} file */
  async _loadFile(file) {
    await super._loadFile(file);
    this.serializer.amf = this.amf;
  }

  /**
   * @param {ApiNavigationEvent} e
   */
  _navChanged(e) {
    const { domainId, domainType } = e.detail;
    if (domainType === 'schema') {
      this.setTypeData(domainId);
    } else if (domainType === 'resource') {
      this.setEndpointData(domainId);
    } else if (domainType === 'operation') {
      this.setMethodData(domainId);
    } else {
      this.shape = undefined;
    }
  }

  /**
   * @param {string} id
   */
  setTypeData(id) {
    const declares = this._computeDeclares(this.amf);
    const shape = declares.find((item) => item['@id'] === id);
    if (!shape) {
      console.error('Type not found');
      return;
    }
    this.shape = this.serializer.customDomainProperties(shape);
  }

  /**
   * @param {string} id
   */
  setEndpointData(id) {
    const webApi = this._computeWebApi(this.amf);
    const shape = this._computeEndpointModel(webApi, id);
    this.shape = this.serializer.customDomainProperties(shape);
  }

  /**
   * @param {string} id
   */
  setMethodData(id) {
    const webApi = this._computeWebApi(this.amf);
    const shape = this._computeMethodModel(webApi, id);
    this.shape = this.serializer.customDomainProperties(shape);
  }

  contentTemplate() {
    return html`
      <h2>API annotation</h2>
      ${this.demoTemplate()}
    `;
  }

  demoTemplate() {
    const { loaded } = this;
    return html`
    <section class="documentation-section">
      <h3>Interactive demo</h3>
      <p>
        This demo lets you preview the API annotation document with various configuration options.
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
    const { demoStates, darkThemeActive, shape } = this;
    if (!shape) {
      return html`<p>Select API object in the navigation</p>`;
    }
    return html`
    <arc-interactive-demo
      .states="${demoStates}"
      @state-changed="${this._demoStateHandler}"
      ?dark="${darkThemeActive}"
    >
      <api-annotation-document
        .customProperties="${shape}"
        slot="content"
      >
      </api-annotation-document>
    </arc-interactive-demo>
    `;
  }

  _apiListTemplate() {
    const result = [];
    [
      ['annotated-api', 'Annotated API'],
    ].forEach(([file, label]) => {
      result[result.length] = html`
      <anypoint-item data-src="models/${file}.json">${label}</anypoint-item>`;
    });
    return result;
  }
}
const instance = new ComponentPage();
instance.render();
