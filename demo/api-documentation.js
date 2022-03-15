import { html } from 'lit-html';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import '@anypoint-web-components/awc/anypoint-checkbox.js';
import '@anypoint-web-components/awc/anypoint-dialog.js';
import '@anypoint-web-components/awc/anypoint-dialog-scrollable.js';
import { AmfDemoBase } from './lib/AmfDemoBase.js';
import '../define/api-request.js';
import '../define/xhr-simple-request.js';
import '../define/api-server-selector.js';
import '../define/api-documentation.js';

/** @typedef {import('../src/events/NavigationEvents').ApiNavigationEvent} ApiNavigationEvent */
/** @typedef {import('../src/types').SelectionType} SelectionType */

class ComponentDemo extends AmfDemoBase {
  constructor() {
    super();

    this.initObservableProperties([
      'domainId', 'domainType', 'operationId',
      'tryItButton', 'tryItPanel',
      'editorOpened', 'editorOperation', 'overrideBaseUri',
      'serverType', 'serverValue', 
      'noServerSelector', 'allowCustomBaseUri',
      'renderCustomServer',
    ]);
    this.componentName = 'api-documentation';
    this.editorOpened = false;
    this.editorOperation = undefined;
    this.domainId = undefined;
    /** @type SelectionType */
    this.domainType = undefined;
    this.operationId = undefined;
    this.tryItButton = true;
    this.tryItPanel = false;
    this.overrideBaseUri = false;
    this.renderCustomServer = false;
    this.noServerSelector = false;
    this.allowCustomBaseUri = false;
    this.demoStates = ['Material', 'Anypoint'];
  }

  /** @param {Event} e */
  _apiChanged(e) {
    this.domainId = 'summary';
    this.domainType = 'summary';
    super._apiChanged(e);
  }

  /**
   * @param {ApiNavigationEvent} e
   */
  _navChanged(e) {
    const { domainId, domainType, parentId, passive } = e.detail;
    if (passive === true) {
      return;
    }
    this.domainType = domainType;
    if (domainType === 'operation') {
      this.operationId = domainId;
      this.domainId = parentId;  
    } else {
      this.operationId = undefined;
      this.domainId = domainId;
    }

    // 
    // Here your application can be smart and determine
    // the domainId and type for fragments and partial models
    // so when the API is loaded it shows a specific value.
    // 
  }

  /**
   * @param {CustomEvent} e
   */
  tryitHandler(e) {
    const { id } = e.detail;
    this.editorOperation = id;
    this.editorOpened = true;
  }

  editorCloseHandler() {
    this.editorOperation = undefined;
    this.editorOpened = false;
  }

  contentTemplate() {
    return html`
      <xhr-simple-request></xhr-simple-request>
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
        This demo lets you preview the API documentation with various configuration options.
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
    ${this.requestEditorDialogTemplate()}
    `;
  }

  componentTemplate() {
    const { demoStates, darkThemeActive, } = this;
    let finalBaseUri;
    if (this.overrideBaseUri) {
      finalBaseUri = 'https://custom.api.com';
    }
    return html`
    <arc-interactive-demo
      .states="${demoStates}"
      @state-changed="${this._demoStateHandler}"
      ?dark="${darkThemeActive}"
    >
      <api-documentation
        slot="content"
        .domainId="${this.domainId}"
        .operationId="${this.operationId}"
        .domainType="${this.domainType}"
        .redirectUri="${this.redirectUri}"
        .tryItPanel="${this.tryItPanel}"
        .tryItButton="${this.tryItButton}"
        .noServerSelector="${this.noServerSelector}"
        .allowCustomBaseUri="${this.allowCustomBaseUri}"
        .baseUri="${finalBaseUri}"
        ?anypoint="${this.anypoint}"
        @tryit="${this.tryitHandler}"
      >
        ${this._addCustomServers()}
      </api-documentation>

      <label slot="options" id="mainOptionsLabel">Options</label>
      <anypoint-checkbox
        aria-describedby="mainOptionsLabel"
        slot="options"
        name="tryItButton"
        .checked="${this.tryItButton}"
        @change="${this._toggleMainOption}"
      >
        Render try it
      </anypoint-checkbox>
      <anypoint-checkbox
        aria-describedby="mainOptionsLabel"
        slot="options"
        name="tryItPanel"
        .checked="${this.tryItPanel}"
        @change="${this._toggleMainOption}"
      >
        Render HTTP editor
      </anypoint-checkbox>
      <anypoint-checkbox
        aria-describedby="mainOptionsLabel"
        slot="options"
        name="overrideBaseUri"
        @change="${this._toggleMainOption}"
      >
        Custom base URI
      </anypoint-checkbox>
      <anypoint-checkbox
        aria-describedby="mainOptionsLabel"
        slot="options"
        name="noServerSelector"
        @change="${this._toggleMainOption}"
      >
        No server selector
      </anypoint-checkbox>
      <anypoint-checkbox
        aria-describedby="mainOptionsLabel"
        slot="options"
        name="allowCustomBaseUri"
        @change="${this._toggleMainOption}"
      >
        Allow custom base URI
      </anypoint-checkbox>
      <anypoint-checkbox
        aria-describedby="mainOptionsLabel"
        slot="options"
        name="renderCustomServer"
        @change="${this._toggleMainOption}"
      >
        Custom servers
      </anypoint-checkbox>
    </arc-interactive-demo>
    `;
  }

  _apiListTemplate() {
    const result = [];
    [
      ['demo-api', 'Demo API'],
      ['httpbin', 'httpbin.org'],
      ['google-drive-api', 'Google Drive'],
      ['multi-server', 'Multiple servers'],
      ['array-body', 'Body with array test case'],
      ['nexmo-sms-api', 'Nexmo SMS API'],
      ['appian-api', 'Applian API'],
      ['APIC-15', 'APIC-15'],
      ['oauth1-fragment', 'OAuth 1 fragment'],
      ['oauth2-fragment', 'OAuth 2 fragment'],
      ['documentation-fragment', 'Documentation fragment'],
      ['type-fragment', 'Type fragment'],
      ['lib-fragment', 'Library fragment'],
      ['SE-10469', 'SE-10469'],
      ['SE-11415', 'SE-11415'],
      ['async-api', 'async-api'],
      ['APIC-711', 'APIC-711: switching to a library']
    ].forEach(([file, label]) => {
      result[result.length] = html`
      <anypoint-item data-src="models/${file}.json">${label}</anypoint-item>`;
    });
    return result;
  }

  _addCustomServers() {
    if (!this.renderCustomServer) {
      return '';
    }
    const { anypoint } = this;
    return html`
    <div class="other-section" slot="custom-base-uri">Other options</div>
    <anypoint-item
      slot="custom-base-uri"
      data-value="http://mocking.com"
      ?anypoint="${anypoint}"
    >Mocking service</anypoint-item>
    <anypoint-item
      slot="custom-base-uri"
      data-value="http://customServer.com2"
      ?anypoint="${anypoint}"
    >Custom instance</anypoint-item>`;
  }

  requestEditorDialogTemplate() {
    return html`
    <anypoint-dialog modal @closed="${this.editorCloseHandler}" .opened="${this.editorOpened}" class="request-dialog">
      <h2>API request</h2>
      <anypoint-dialog-scrollable>
        <api-request
          .domainId="${this.editorOperation}"
          ?anypoint="${this.anypoint}"
          urlLabel
          applyAuthorization
          globalCache
          allowHideOptional
          .redirectUri="${this.redirectUri}"
        >
        </api-request>
      </anypoint-dialog-scrollable>
      <div class="buttons">
        <anypoint-button data-dialog-dismiss>Close</anypoint-button>
      </div>
    </anypoint-dialog>
    `;
  }
}
const instance = new ComponentDemo();
instance.render();
