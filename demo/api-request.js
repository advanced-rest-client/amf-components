import { html } from 'lit-html';
import '@anypoint-web-components/awc/anypoint-checkbox.js';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import { AmfDemoBase } from './lib/AmfDemoBase.js';
import '../define/api-navigation.js';
import '../define/xhr-simple-request.js';
import '../define/api-request.js';

/** @typedef {import('../src/events/NavigationEvents').ApiNavigationEvent} ApiNavigationEvent */

class ComponentDemo extends AmfDemoBase {
  constructor() {
    super();

    this.initObservableProperties([
      'outlined',
      'narrow',
      'selectedAmfId',
      'allowCustom',
      'allowHideOptional',
      'allowDisableParams',
      'noDocs',
      'urlEditor',
      'renderCustomServer',
      'allowCustomBaseUri',
      'noServerSelector',
      'urlLabel',
      'selectedServerValue',
      'applyAuthorization',
    ]);
    this.componentName = 'api-request';
    this.allowCustom = false;
    this.allowHideOptional = true;
    this.allowDisableParams = true;
    this.renderCustomServer = false;
    this.noServerSelector = false;
    this.allowCustomBaseUri = false;
    this.applyAuthorization = true;
    this.urlLabel = false;
    this.urlEditor = true;

    this.demoStates = ['Filled', 'Outlined', 'Anypoint'];
  }

  _demoStateHandler(e) {
    const state = e.detail.value;
    this.outlined = state === 1;
    this.anypoint = state === 2;
    this._updateAnypoint();
  }

  _authSettingsChanged(e) {
    const value = e.detail;
    this.authSettings = value;
    this.authSettingsValue = value ? JSON.stringify(value, null, 2) : '';
  }

  /**
   * @param {ApiNavigationEvent} e
   */
  _navChanged(e) {
    this.selectedAmfId = undefined;
    const { domainId, domainType } = e.detail;
    if (domainType === 'operation') {
      this.selectedAmfId = domainId;
      this.hasData = true;
    } else {
      this.hasData = false;
    }
  }

  _apiListTemplate() {
    return [
      ['google-drive-api', 'Google Drive'],
      ['httpbin', 'httpbin.org'],
      ['demo-api', 'Demo API'],
      ['multi-server', 'Multiple servers'],
      ['appian-api', 'Applian API'],
      ['loan-microservice', 'Loan microservice (OAS)'],
      ['array-body', 'Request body with an array (reported issue)'],
      ['SE-12042', 'Default values issue (SE-12042)'],
      ['SE-12224', 'Scope is not an array issues (SE-12224)'],
      ['APIC-168', 'Custom scheme support (APIC-168)'],
      ['async-api', 'AsyncAPI'],
      ['APIC-289', 'OAS param names (APIC-289)'],
      ['api-keys', 'API key'],
      ['oas-demo', 'OAS Demo API'],
      ['oauth-flows', 'OAS OAuth Flow'],
      ['oas-bearer', 'OAS Bearer'],
      ['secured-api', 'Security demo'],
      ['21143', '21143'],
      ['annotated-parameters', 'annotated-parameters'],
      ['secured-unions', 'Secured unions']
    ].map(
      ([file, label]) => html`
        <anypoint-item data-src="models/${file}.json">${label}</anypoint-item>
      `
    );
  }

  _addCustomServers() {
    if (!this.renderCustomServer) {
      return html``;
    }
    return html`<anypoint-item
        slot="custom-base-uri"
        data-value="http://customServer.com"
        >http://customServer.com</anypoint-item
      >
      <anypoint-item slot="custom-base-uri" data-value="http://customServer.com2"
        >http://customServer.com2</anypoint-item
      >`;
  }

  _serverChangeHandler(e) {
    const { value } = e.detail;
    // The parent keeps current selection which is then passed back to the
    // server selector. In API Console, the console holds the selected value
    // so it can be distributed between api-documentation and api-request,
    // even when panels are re-rendered. This way the application don't loose
    // track of that was selected.
    // The selector take cares of a situation when current selection is no
    // longer available and clears the state.
    this.selectedServerValue = value;
  }

  contentTemplate() {
    return html`
      <xhr-simple-request></xhr-simple-request>
      <h2 class="centered main">API request</h2>
      ${this.demoTemplate()}
    `;
  }

  demoTemplate() {
    const { loaded } = this;
    return html`
    <section class="documentation-section">
      <h3>Interactive demo</h3>
      <p>
        This demo lets you preview the API request element with various
        configuration options.
      </p>
      <div class="api-demo-content">
        ${!loaded ? html`<p>Load an API model first.</p>` : this.loadedTemplate()}
      </div>
    </section>`;
  }

  loadedTemplate() {
    return html`
    ${this.componentTemplate()}
    `;
  }

  componentTemplate() {
    const {
      demoStates,
      darkThemeActive,
      outlined,
      anypoint,
      redirectUri,
      allowCustom,
      allowHideOptional,
      allowDisableParams,
      selectedAmfId,
      noServerSelector,
      allowCustomBaseUri,
      urlEditor,
      urlLabel,
      selectedServerValue,
      applyAuthorization,
    } = this;
    return html`
    <arc-interactive-demo
      .states="${demoStates}"
      @state-changed="${this._demoStateHandler}"
      ?dark="${darkThemeActive}"
    >
      <div slot="content">
        <api-request
          .domainId="${selectedAmfId}"
          ?allowCustom="${allowCustom}"
          ?allowHideOptional="${allowHideOptional}"
          ?outlined="${outlined}"
          ?anypoint="${anypoint}"
          ?urlEditor="${urlEditor}"
          ?urlLabel="${urlLabel}"
          ?noServerSelector="${noServerSelector}"
          ?allowCustomBaseUri="${allowCustomBaseUri}"
          .redirectUri="${redirectUri}"
          .serverValue="${selectedServerValue}"
          ?applyAuthorization="${applyAuthorization}"
          globalCache
          @apiserverchanged="${this._serverChangeHandler}"
        >
          ${this._addCustomServers()}
        </api-request>
      </div>
      <label slot="options" id="mainOptionsLabel">Options</label>
      <anypoint-checkbox
        aria-describedby="mainOptionsLabel"
        slot="options"
        name="allowCustom"
        .checked="${allowCustom}"
        @change="${this._toggleMainOption}"
        >Allow custom</anypoint-checkbox
      >
      <anypoint-checkbox
        aria-describedby="mainOptionsLabel"
        slot="options"
        name="allowHideOptional"
        .checked="${allowHideOptional}"
        @change="${this._toggleMainOption}"
        >Allow hide optional</anypoint-checkbox
      >
      <anypoint-checkbox
        aria-describedby="mainOptionsLabel"
        slot="options"
        name="allowDisableParams"
        .checked="${allowDisableParams}"
        @change="${this._toggleMainOption}"
        >Allow disable params</anypoint-checkbox
      >
      <anypoint-checkbox
        aria-describedby="mainOptionsLabel"
        slot="options"
        name="urlEditor"
        .checked="${urlEditor}"
        @change="${this._toggleMainOption}"
        >URL editor</anypoint-checkbox
      >
      <anypoint-checkbox
        aria-describedby="mainOptionsLabel"
        slot="options"
        name="urlLabel"
        @change="${this._toggleMainOption}"
        >URL label</anypoint-checkbox
      >
      <anypoint-checkbox
        aria-describedby="mainOptionsLabel"
        slot="options"
        name="renderCustomServer"
        @change="${this._toggleMainOption}"
        >Custom servers</anypoint-checkbox
      >
      <anypoint-checkbox
        aria-describedby="mainOptionsLabel"
        slot="options"
        name="allowCustomBaseUri"
        @change="${this._toggleMainOption}"
        >Allow Custom Base Uri</anypoint-checkbox
      >
      <anypoint-checkbox
        aria-describedby="mainOptionsLabel"
        slot="options"
        name="noServerSelector"
        @change="${this._toggleMainOption}"
        >No Server Selector</anypoint-checkbox
      >
      <anypoint-checkbox
        aria-describedby="mainOptionsLabel"
        slot="options"
        name="applyAuthorization"
        .checked="${applyAuthorization}"
        @change="${this._toggleMainOption}"
        title="Applies authorization configuration to the request when dispatching the event"
      >
        Apply authorization
      </anypoint-checkbox>
    </arc-interactive-demo>
    `;
  }
}
const instance = new ComponentDemo();
instance.render();
