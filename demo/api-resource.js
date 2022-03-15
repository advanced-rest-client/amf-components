import { html } from 'lit-html';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import '@anypoint-web-components/awc/anypoint-checkbox.js';
import '@anypoint-web-components/awc/anypoint-dialog.js';
import '@anypoint-web-components/awc/anypoint-dialog-scrollable.js';
import { AmfDemoBase } from './lib/AmfDemoBase.js';
import '../define/api-resource-document.js';
import '../define/api-request.js';
import '../define/xhr-simple-request.js';
import '../define/api-server-selector.js';

/** @typedef {import('../src/events/NavigationEvents').ApiNavigationEvent} ApiNavigationEvent */

class ComponentPage extends AmfDemoBase {
  constructor() {
    super();
    this.initObservableProperties([ 
      'selectedId', 'selectedType', 'selectedOperation', 'tryItButton', 'tryItPanel',
      'editorOpened', 'editorOperation', 'overrideBaseUri',
      'serverType', 'serverValue',
    ]);
    this.editorOpened = false;
    this.editorOperation = undefined;
    this.selectedId = undefined;
    this.selectedType = undefined;
    this.selectedOperation = undefined;
    this.tryItButton = true;
    this.tryItPanel = false;
    this.overrideBaseUri = false;
    this.componentName = 'api-endpoint-document';
  }

  get baseUri() {
    const { serverValue, serverType } = this;
    if (['custom', 'uri'].includes(serverType)) {
      return serverValue;
    }
    return undefined;
  }

  get serverId() {
    const { serverValue, serverType, selectedId } = this;
    if (!serverValue || ['custom', 'uri'].includes(serverType)) {
      return undefined;
    }
    const servers = this._getServers({ endpointId: selectedId });
    if (!Array.isArray(servers)) {
      return undefined;
    }
    const srv = servers.find((item) => {
      const url = /** @type string */ (this._getValue(item, this.ns.aml.vocabularies.core.urlTemplate));
      return url === serverValue;
    });
    if (srv) {
      return srv['@id'];
    }
    return undefined;
  }

  /**
   * @param {CustomEvent} e
   */
  _serverHandler(e) {
    const { value, type } = e.detail;
    this.serverType = type;
    this.serverValue = value;
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
      <h2>API endpoint</h2>
      ${this.demoTemplate()}
    `;
  }

  demoTemplate() {
    const { loaded } = this;
    return html`
    <section class="documentation-section">
      <h3>Interactive demo</h3>
      <p>
        This demo lets you preview the API endpoint document with various configuration options.
      </p>

      ${this.serverSelectorTemplate()}
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
    const { demoStates, darkThemeActive, selectedId, selectedOperation, tryItButton, tryItPanel, overrideBaseUri, baseUri, serverId } = this;
    if (!selectedId) {
      return html`<p>Select API operation in the navigation</p>`;
    }
    let finalBaseUri;
    if (baseUri) {
      finalBaseUri = baseUri;
    } else if (overrideBaseUri) {
      finalBaseUri = 'https://custom.api.com';
    }
    console.log(finalBaseUri);
    return html`
    <arc-interactive-demo
      .states="${demoStates}"
      @state-changed="${this._demoStateHandler}"
      ?dark="${darkThemeActive}"
    >
      <api-resource-document
        .domainId="${selectedId}"
        .operationId="${selectedOperation}"
        .serverId="${serverId}"
        .redirectUri="${this.redirectUri}"
        .serverType="${this.serverType}"
        .serverValue="${this.serverValue}"
        ?tryItButton="${tryItButton}"
        ?tryItPanel="${tryItPanel}"
        ?anypoint="${this.anypoint}"
        .baseUri="${finalBaseUri}"
        slot="content"
        @tryit="${this.tryitHandler}"
      >
      </api-resource-document>

      <label slot="options" id="mainOptionsLabel">Options</label>
      <anypoint-checkbox
        aria-describedby="mainOptionsLabel"
        slot="options"
        name="tryItButton"
        .checked="${tryItButton}"
        @change="${this._toggleMainOption}"
      >
        Render try it
      </anypoint-checkbox>
      <anypoint-checkbox
        aria-describedby="mainOptionsLabel"
        slot="options"
        name="tryItPanel"
        .checked="${tryItPanel}"
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
    </arc-interactive-demo>
    `;
  }

  _apiListTemplate() {
    const result = [];
    [
      ['demo-api', 'Demo API'],
      ['google-drive-api', 'Google Drive'],
      ['multi-server', 'Multiple servers'],
      ['nexmo-sms-api', 'Nexmo SMS API'],
      ['appian-api', 'Applian API'],
      ['APIC-15', 'APIC-15'],
      ['SE-10469', 'SE-10469'],
      ['SE-11415', 'SE-11415'],
      ['async-api', 'async-api'],
      ['Petstore-v2', 'Petstore OAS API'],
      ['api-keys', 'API key (OAS)'],
      ['oauth-flows', 'OAuth 2 flows'],
      ['oas-bearer', 'Bearer token'],
      ['oauth-pkce', 'OAuth 2 PKCE'],
      ['secured-unions', 'Secured unions'],
      ['secured-api', 'Secured API'],
      ['SE-12957', 'SE-12957: OAS query parameters documentation'],
      ['SE-12959', 'SE-12959: OAS summary field'],
      ['SE-12752', 'SE-12752: Query string'],
      ['SE-12957', 'SE-12957: Path in an operation'],
      ['oas-callbacks', 'OAS 3 callbacks'],
      ['APIC-553', 'APIC-553'],
      ['APIC-560', 'APIC-560'],
      ['APIC-582', 'APIC-582'],
      ['APIC-650', 'APIC-650'],
    ].forEach(([file, label]) => {
      result[result.length] = html`
      <anypoint-item data-src="models/${file}.json">${label}</anypoint-item>`;
    });
    return result;
  }

  requestEditorDialogTemplate() {
    return html`
    <anypoint-dialog modal @closed="${this.editorCloseHandler}" .opened="${this.editorOpened}" class="request-dialog">
      <h2>API request</h2>
      <anypoint-dialog-scrollable>
        <api-request
          .domainId="${this.selectedOperation}"
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

  /**
   * @return {object} A template for the server selector
   */
  serverSelectorTemplate() {
    const {
      serverType,
      serverValue,
      anypoint,
    } = this;
    return html`
    <api-server-selector
      .value="${serverValue}"
      .type="${serverType}"
      autoSelect
      allowCustom
      ?anypoint="${anypoint}"
      @apiserverchanged="${this._serverHandler}"
    ></api-server-selector>`;
  }
}
const instance = new ComponentPage();
instance.render();
