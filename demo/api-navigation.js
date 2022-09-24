import { html } from 'lit-html';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import '@anypoint-web-components/awc/dist/define/anypoint-checkbox.js';
import '@anypoint-web-components/awc/dist/define/anypoint-radio-button.js';
import '@anypoint-web-components/awc/dist/define/anypoint-radio-group.js';
import { AmfDemoBase } from './lib/AmfDemoBase.js';
import { NavigationContextMenu, NavigationContextMenuCommands } from '../index.js';
import '../define/api-navigation.js';

/** @typedef {import('../').NavigationLayout} NavigationLayout */
/** @typedef {import('@anypoint-web-components/awc').AnypointRadioGroupElement} AnypointRadioGroupElement */
/** @typedef {import('@anypoint-web-components/awc').AnypointRadioButtonElement} AnypointRadioButtonElement */

class ComponentPage extends AmfDemoBase {
  constructor() {
    super();
    this.initObservableProperties([ 
      'summary', 'filter', 'edit', 'layout', 'endpointsExpanded',
    ]);
    this.componentName = 'api-navigation';
    this.noApiNavigation = true;
    this.summary = true;
    this.filter = false;
    this.edit = false;
    this.endpointsExpanded = false;
    /** @type NavigationLayout */
    this.layout = undefined;
  }

  firstRender() {
    super.firstRender();
    const nav = document.querySelector('api-navigation');
    this.menu = new NavigationContextMenu(nav, { cancelNativeWhenHandled: true });
    this.menu.registerCommands(NavigationContextMenuCommands);
    this.menu.connect();
  }

  /**
   * @param {CustomEvent} e
   */
  _navigationHandler(e) {
    console.log(e.detail);
  }

  /** @param {Event} e */
  _toggleLayoutOption(e) {
    const group = /** @type AnypointRadioGroupElement */ (e.target);
    const item = /** @type AnypointRadioButtonElement */ (group.selectedItem);
    if (!item) {
      this.layout = undefined;
    } else {
      this.layout = item.value;
    }
    console.log(item.value);
  }

  contentTemplate() {
    return html`
      <h2>API navigation</h2>
      ${this.demoTemplate()}
    `;
  }

  demoTemplate() {
    return html`
    <section class="documentation-section">
      <h3>Interactive demo</h3>
      <p>
        This demo lets you preview the API summary document with various configuration options.
      </p>

      <div class="api-demo-content">
        ${this.loadedTemplate()}
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
    const { demoStates, darkThemeActive, summary, filter, edit, layout, endpointsExpanded } = this;
    return html`
    <arc-interactive-demo
      .states="${demoStates}"
      @state-changed="${this._demoStateHandler}"
      ?dark="${darkThemeActive}"
    >
      <api-navigation
        ?summary="${summary}"
        ?edit="${edit}"
        ?filter="${filter}"
        .layout="${layout}"
        ?endpointsExpanded="${endpointsExpanded}"
        @apinavigate="${this._navigationHandler}"
        slot="content"
      >
      </api-navigation>

      <label slot="options" id="mainOptionsLabel">Options</label>
      <anypoint-checkbox
        aria-describedby="mainOptionsLabel"
        slot="options"
        name="summary"
        ?checked="${summary}"
        @change="${this._toggleMainOption}"
      >
        Summary
      </anypoint-checkbox>
      <anypoint-checkbox
        aria-describedby="mainOptionsLabel"
        slot="options"
        name="filter"
        ?checked="${filter}"
        @change="${this._toggleMainOption}"
      >
        Filter
      </anypoint-checkbox>
      <anypoint-checkbox
        aria-describedby="mainOptionsLabel"
        slot="options"
        name="edit"
        ?checked="${edit}"
        @change="${this._toggleMainOption}"
      >
        Edit mode
      </anypoint-checkbox>
      <anypoint-checkbox
        aria-describedby="mainOptionsLabel"
        slot="options"
        name="endpointsExpanded"
        ?checked="${endpointsExpanded}"
        @change="${this._toggleMainOption}"
      >
        Expand endpoints
      </anypoint-checkbox>

      <label slot="options" id="mainOptionsLabel">Layout</label>
      <anypoint-radio-group slot="options" @select="${this._toggleLayoutOption}" attrForSelected="value" selectable="anypoint-radio-button">
        <anypoint-radio-button name="layout" value="off">None</anypoint-radio-button>
        <anypoint-radio-button name="layout" value="tree">Tree</anypoint-radio-button>
        <anypoint-radio-button name="layout" value="natural">Natural</anypoint-radio-button>
        <anypoint-radio-button name="layout" value="natural-sort">Natural (sorted)</anypoint-radio-button>
      </anypoint-radio-group>
    </arc-interactive-demo>
    `;
  }

  _apiListTemplate() {
    const result = [];
    [
      ['demo-api', 'Demo API'],
      ['oauth1-fragment', 'OAuth 1 fragment'],
      ['oauth2-fragment', 'OAuth 2 fragment'],
      ['types-list', 'Types list issue'],
      ['missing-endpoints', 'Missing endpoints issue'],
      ['rearrange-api', 'Rearranged endpoints'],
      ['simple-api', 'Simple API'],
      ['api-keys', 'API key'],
      ['oas-demo', 'OAS Demo API'],
      ['oauth-flows', 'OAS OAuth Flow'],
      ['oas-bearer', 'OAS Bearer'],
      ['ext-docs', 'External docs'],
      ['async-api', 'AsyncAPI'],
      ['unordered-endpoints', 'Unordered endpoints API'],
      ['google-drive-api', 'Google Drive'],
      ['mocking-service', 'Lots of methods'],
      ['no-endpoints', 'No endpoints!'],
      ['streetlights2', 'streetlights 2 (unsorted for the tree layout)'],
      ['APIC-449', 'APIC-449'],
      ['APIC-554', 'APIC-554'],
      ['APIC-554-ii', 'APIC-554-ii'],
      ['APIC-641', 'APIC-641'],
      ['APIC-711', 'A library'],
      ['SE-19215', 'SE-19215'],
    ].forEach(([file, label]) => {
      result[result.length] = html`
      <anypoint-item data-src="models/${file}.json">${label}</anypoint-item>`;
    });
    return result;
  }
}
const instance = new ComponentPage();
instance.render();
