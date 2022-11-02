import { html } from 'lit-html';
import { classMap } from 'lit-html/directives/class-map.js';
import '@anypoint-web-components/awc/dist/define/anypoint-icon-button.js';
import '@anypoint-web-components/awc/dist/define/anypoint-menu-button.js';
import '@anypoint-web-components/awc/dist/define/anypoint-listbox.js';
import '@anypoint-web-components/awc/dist/define/anypoint-item.js';
import '@advanced-rest-client/icons/arc-icon.js';
import { MonacoTheme, MonacoStyles, MonacoLoader } from '@advanced-rest-client/monaco-support';
import { DomEventsAmfStore } from "../src/store/DomEventsAmfStore.js";
import { ApplicationPage } from "./lib/ApplicationPage.js";
import { EventTypes } from '../src/events/EventTypes.js';
import "../define/api-navigation.js";
import '../define/api-documentation.js';
import '../define/xhr-simple-request.js';
import * as ApiExamples from './lib/ApiExamples.js';

const StorePrefix = 'ApiEditor.Value.';
const ApiFormatKey = 'ApiEditor.Format';
const ApiMediaKey = 'ApiEditor.Media';

/* global monaco */
/** @typedef {import('lit-html').TemplateResult} TemplateResult */
/** @typedef {import('@anypoint-web-components/awc').AnypointListboxElement} AnypointListbox */
/** @typedef {import('monaco-editor').editor.IStandaloneEditorConstructionOptions} IStandaloneEditorConstructionOptions */
/** @typedef {import('../src/events/NavigationEvents').ApiNavigationEvent} ApiNavigationEvent */
/** @typedef {import('../src/helpers/amf').AmfDocument} AmfDocument */
/** @typedef {import('../src/types').SelectionType} SelectionType */
/** @typedef {import('../dev/types').ApiEditorPreviousRequest} ApiEditorPreviousRequest */

try {
  // @ts-ignore
  document.adoptedStyleSheets = document.adoptedStyleSheets.concat(MonacoStyles.styleSheet);
} catch (_) {
  /* istanbul ignore next */
  const s = document.createElement('style');
  s.innerHTML = MonacoStyles.cssText;
  document.getElementsByTagName('head')[0].appendChild(s);
}

export class ApiTextEditor extends ApplicationPage {
  constructor() {
    super();
    this.initObservableProperties(
      'navigationOpened', 'model', 'loading',
      'domainId', 'domainType', 'operationId',
      'initializing', 'apiFormat', 'apiMedia',
      'editorOpened', 'editorOperation',
    );
    this.store = new DomEventsAmfStore(window);
    this.store.listen();
    /**
     * When set the application is initializing its environment.
     */
    this.initializing = true;
    /**
     * When set the application is loading an API model.
     */
    this.loading = false;
    /** 
     * Whether the application navigation is visible, when toggling.
     */
    this.navigationOpened = false;
    /**
     * The loaded AMF model form the demo APIs.
     * 
     * @type {AmfDocument}
     */
    this.model = undefined;
    /**
     * The domain id of the currently selected graph object.
     * @type {string}
     */
    this.domainId = 'summary';
    /**
     * The navigation type of the currently selected graph object.
     * @type {SelectionType}
     */
    this.domainType = 'summary';
    /**
     * When the current domain type is an operation this is the selected operation domain id.
     */
    this.operationId = undefined;
    /** @type string */
    this.apiFormat = 'RAML 1.0';
    /** @type string */
    this.apiMedia='application/yaml';
    /** @type ApiEditorPreviousRequest[] */
    this.requests = [];
    /** 
     * Whether the HTTP editor is opened.
     */
    this.editorOpened = false;
    /** 
     * The domain id of the operation opened in the HTTP editor.
     */
    this.editorOperation = undefined;
    window.addEventListener(EventTypes.Navigation.apiNavigate, this.apiNavigationHandler.bind(this));
    this.initApp();
  }

  /**
   * Loads the Monaco editor and initializes routing.
   */
  async initApp() {
    await this.loadMonaco();
    await this.restoreSession();
    this.initializing = false;
    await this.updateComplete;
    this.httpEditorPositionTarget = document.body.querySelector('aside');
    this.initializeEditor();
  }

  /**
   * Loads the Monaco editor using ARC's helpers.
   * This can be implemented in any way.
   */
  async loadMonaco() {
    const base = new URL('../node_modules/monaco-editor/', import.meta.url).toString();
    // const base = `../node_modules/monaco-editor/`;
    MonacoLoader.createEnvironment(base);
    await MonacoLoader.loadMonaco(base);
    await MonacoLoader.monacoReady();
  }

  /**
   * Restores previously stored session.
   * @returns {Promise<void>}
   */
  async restoreSession() {
    let format = localStorage.getItem(ApiFormatKey);
    if (!format) {
      format = 'OAS 3.0';
    }
    let mime = localStorage.getItem(ApiMediaKey);
    if (!mime) {
      mime = 'application/yaml';
    }
    /** @type string */
    this.apiFormat = format;
    /** @type string */
    this.apiMedia = mime;
    this.value = this.getEditorValue(format, mime);
    this.parse();
  }

  /**
   * Stores the current session in the store.
   */
  async storeSession() {
    const { value='', apiFormat='', apiMedia='' } = this;
    localStorage.setItem(ApiFormatKey, apiFormat);
    localStorage.setItem(ApiMediaKey, apiMedia);
    const key = this.editorValueKey(apiFormat, apiMedia);
    localStorage.setItem(key, value);
  }

  /**
   * Cleans up the API and the selection state,
   */
  cleanUp() {
    this.apiId = undefined;
    this.domainId = undefined;
    this.domainType = undefined;
    this.operationId = undefined;
    this.model = undefined;
  }

  /**
   * @param {ApiNavigationEvent} e Dispatched navigation event
   */
  apiNavigationHandler(e) {
    const { domainId, domainType, parentId, passive } = e.detail;
    if (passive === true) {
      return;
    }
    this.domainType = domainType;
    if (domainType === 'operation') {
      this.domainId = parentId;
      this.operationId = domainId;
    } else {
      this.domainId = domainId;
      this.operationId = undefined;
    }
    if (this.navigationOpened) {
      this.navigationOpened = false;
    }
  }

  menuToggleHandler() {
    this.navigationOpened = !this.navigationOpened;
  }

  /**
   * Generates Monaco configuration
   * @returns {IStandaloneEditorConstructionOptions}
   */
  generateEditorConfig() {
    const { value='', apiMedia: language } = this;
    // @ts-ignore
    this.modelUri = monaco.Uri.parse(`http://api-editor/model.json`);
    // @ts-ignore
    const model = monaco.editor.createModel(value, language || 'json', this.modelUri);

    const schema = {
      uri: "http://api-editor/default-schema.json",
      fileMatch: [this.modelUri.toString()],
      schema: {},
    };
    
    // @ts-ignore
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      schemas: [schema],
    });
    
    let config = /** @type IStandaloneEditorConstructionOptions */ ({
      minimap: {
        enabled: false,
      },
      formatOnType: true,
      folding: true,
      tabSize: 2,
      detectIndentation: true,
      // value,
      automaticLayout: true,
      model,
    });
    // @ts-ignore
    config = MonacoTheme.assignTheme(monaco, config);
    if (language) {
      config.language = language;
    }
    return config;
  }

  initializeEditor() {
    const config = this.generateEditorConfig();
    // @ts-ignore
    const instance = monaco.editor.create(document.body.querySelector('#container'), config);
    // @ts-ignore
    instance.onDidChangeModelContent(this.valueChanged.bind(this));
    this.monacoInstance = instance;
  }

  /**
   * The callback for the Monaco editor value change.
   */
  valueChanged() {
    this.value = this.monacoInstance.getValue();
    if (this.changeTimeout) {
      window.clearTimeout(this.changeTimeout);
    }
    this.changeTimeout = window.setTimeout(() => {
      this.changeTimeout = undefined;
      this.storeSession();
      this.parse();
    }, 400);
  }

  /**
   * @param {Event} e
   */
  formatSelectorHandler(e) {
    const node = /** @type HTMLElement */ (e.target);
    const { vendor } = node.dataset;
    if (!vendor) {
      return;
    }
    this.selectVendor(vendor);
  }

  /**
   * @param {Event} e
   */
  mediaSelectorHandler(e) {
    const node = /** @type HTMLElement */ (e.target);
    const { media } = node.dataset;
    if (!media) {
      return;
    }
    this.selectMedia(media);
  }

  /**
   * @param {string} vendor
   */
  selectVendor(vendor) {
    this.apiFormat = vendor;
    this.apiMedia = 'application/yaml';
    const value = this.getEditorValue(vendor, this.apiMedia);
    this.value = value;
    if (this.monacoInstance) {
      this.monacoInstance.setValue(value);
      const model = this.monacoInstance.getModel();
      // @ts-ignore
      monaco.editor.setModelLanguage(model, this.apiMedia);
    }
    this.domainId = 'summary';
    this.domainType = 'summary';
    this.model = undefined;
  }

  /**
   * @param {string} media
   */
  selectMedia(media) {
    this.apiMedia = media;
    const value = this.getEditorValue(this.apiFormat, media);
    this.value = value;
    if (this.monacoInstance) {
      this.monacoInstance.setValue(value);
      const model = this.monacoInstance.getModel();
      // @ts-ignore
      monaco.editor.setModelLanguage(model, media);
    }
    this.domainId = 'summary';
    this.domainType = 'summary';
    this.model = undefined;
  }

  /**
   * @param {string} vendor The API format.
   * @param {string=} media The API media type.
   * @returns {string} The store key for the value.
   */
  editorValueKey(vendor, media) {
    let suffix = vendor;
    if (media) {
      suffix += `.${media}`;
    }
    return `${StorePrefix}${suffix}`;
  }

  /**
   * @param {string} vendor The API format.
   * @param {string=} media The API media type.
   * @returns {string} The value for the editor.
   */
  getEditorValue(vendor, media) {
    const key = this.editorValueKey(vendor, media);
    const value = localStorage.getItem(key);
    if (!value) {
      return this.getExampleValue(vendor, media)
    }
    return value;
  }

  /**
   * @param {string} vendor The API format.
   * @param {string=} media The API media type.
   * @returns {string} The value for the editor.
   */
  getExampleValue(vendor, media='application/yaml') {
    if (vendor === 'RAML 1.0') {
      return ApiExamples.Raml10.trim();
    }
    if (vendor === 'OAS 2.0') {
      if (media === 'application/yaml') {
        return ApiExamples.Oas20Yaml.trim();
      }
      if (media === 'application/json') {
        return ApiExamples.Oas20Json.trim();
      }
    }
    if (vendor === 'OAS 3.0') {
      if (media === 'application/yaml') {
        return ApiExamples.Oas30Yaml.trim();
      }
      if (media === 'application/json') {
        return ApiExamples.Oas30Json.trim();
      }
    }
    if (vendor === 'ASYNC 2.0') {
      return ApiExamples.Async20.trim();
    }
    return '';
  }

  /**
   * @param {KeyboardEvent} e
   */
  formatSelectorKeyHandler(e) {
    if (!['Enter', 'Space'].includes(e.code)) {
      return;
    }
    const node = /** @type HTMLElement */ (e.target);
    const { media } = node.dataset;
    if (!media) {
      return;
    }
    this.selectMedia(media);
  }

  /**
   * @param {KeyboardEvent} e
   */
  mediaSelectorKeyHandler(e) {
    if (!['Enter', 'Space'].includes(e.code)) {
      return;
    }
    const node = /** @type HTMLElement */ (e.target);
    const { vendor } = node.dataset;
    if (!vendor) {
      return;
    }
    this.selectVendor(vendor);
  }

  /**
   * @param {string} location
   * @returns {string}
   */
  getServerKey(location) {
    const index = location.lastIndexOf('/');
    return location.substr(index + 1);
  }


  /**
   * Parses the current state of the editor.
   * @returns {Promise<void>} 
   */
  async parse() {
    this.loading = true;
    /** @type string */
    let previousKey;
    const lastRequest = this.requests[this.requests.length - 1];
    if (lastRequest) {
      previousKey = lastRequest.key;
      console.log('Cancelling', previousKey);
      lastRequest.ctrl.abort();
    }
    const url = new URL('/amf-server/api/parse-text', window.location.href).toString();
    const { value, apiFormat, apiMedia } = this;
    const headers = {
      'content-type': apiMedia,
      'x-api-vendor': apiFormat,
    }
    if (previousKey) {
      headers['x-previous-request'] = previousKey;
    }
    const response = await fetch(url, {
      method: 'POST',
      body: value,
      headers,
    });
    if (response.status !== 201) {
      this.loading = false;
      return;
    }
    const location = response.headers.get('location');
    if (!location) {
      this.loading = false;
      return;
    }
    const key = this.getServerKey(location);
    const ctrl = new AbortController();
    this.requests.push({
      key,
      ctrl,
    });
    this.checkStatus(location);
  }

  /**
   * Checks the parsing status from the server.
   * @param {string} location
   * @returns {Promise<void>} 
   */
  async checkStatus(location) {
    const key = this.getServerKey(location);
    const index = this.requests.findIndex(item => item.key === key);
    if (index === -1) {
      return;
    }
    const info = this.requests[index];
    if (info.ctrl.signal.aborted) {
      this.requests.splice(index, 1);
      return;
    }
    const url = new URL(location, window.location.href).toString();
    const response = await fetch(url);
    if (response.status === 204) {
      const newLocation = response.headers.get('location');
      if (!newLocation) {
        this.loading = false;
        return;
      }
      setTimeout(() => {
        this.checkStatus(newLocation);
      }, 500);
      return;
    }
    if (response.status === 200) {
      const newLocation = response.headers.get('location');
      if (!newLocation) {
        this.loading = false;
        console.error('The server did not return result location.');
        return;
      }
      this.readResult(newLocation);
      return;
    }

    this.loading = false;
    console.error('Invalid state.');
  }

  /**
   * Reads the parsed model result.
   * @param {string} location
   * @returns {Promise<void>} 
   */
  async readResult(location) {
    const key = this.getServerKey(location);
    const index = this.requests.findIndex(item => item.key === key);
    if (index === -1) {
      return;
    }
    const info = this.requests[index];
    this.requests.splice(index, 1);
    if (info.ctrl.signal.aborted) {
      return;
    }
    const url = new URL(location, window.location.href).toString();
    const response = await fetch(url);
    if (response.status !== 200) {
      this.loading = false;
      return;
    }
    let model = await response.json();
    if (Array.isArray(model)) {
      [model] = model;
    }
    this.model = model;
    this.store.amf = model;
    this.loading = false;
    console.log(model);
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

  /**
   * @returns {TemplateResult} Main application template
   */
  appTemplate() {
    return html`
    ${this.headerTemplate()}
    ${this.pageTemplate()}
    ${this.requestEditorDialogTemplate()}
    `;
  }

  /**
   * @returns {TemplateResult} The application header template
   */
  headerTemplate() {
    const { isMobile } = this;
    return html`
    <header>
      ${isMobile ? this.navigationTriggerTemplate() : this.apiNameHeaderTemplate()}
    </header>`;
  }

  /**
   * @returns {TemplateResult} The navigation trigger button template
   */
  navigationTriggerTemplate() {
    return html`
    <anypoint-icon-button 
      title="Open the menu" 
      aria-label="Activate to open the API navigation"
      @click="${this.menuToggleHandler}"
    >
      <arc-icon icon="menu"></arc-icon>
    </anypoint-icon-button>
    `;
  }

  /**
   * @returns {TemplateResult} The template for the API name.
   */
  apiNameHeaderTemplate() {
    return html`
    <div class="api-name-wrapper">
      <h1>API editor</h1>
    </div>
    `;
  }

  /**
   * @returns {TemplateResult} The template for the page content
   */
  pageTemplate() {
    if (this.initializing) {
      return this.initializingTemplate();
    }
    return html`
    <main>
      ${this.editorInputTemplate()}
      <aside>
        ${this.documentationTemplate()}
      </aside>
    </main>
    `;
  }

  /**
   * @returns {TemplateResult} A template for the loader
   */
  initializingTemplate() {
    return html`
    <div class="app-loader">
      <p class="message">Preparing something spectacular</p>
    </div>
    `;
  }

  /**
   * @returns {TemplateResult} The template for the API input editor
   */
  editorInputTemplate() {
    return html`
    <section class="editing-area">
      ${this.apiSpecFormatSelector()}
      ${this.editorContainerTemplate()}
    </section>
    `;
  }

  /**
   * @returns {TemplateResult} The template for the API format selector
   */
  apiSpecFormatSelector() {
    const { apiFormat } = this;
    return html`
    <div class="format-bar">
      <div class="button-group" @click="${this.formatSelectorHandler}" @keydown="${this.formatSelectorKeyHandler}">
        <anypoint-button ?active="${apiFormat === 'RAML 1.0'}" data-vendor="RAML 1.0">RAML 1.0</anypoint-button>
        <anypoint-button ?active="${apiFormat === 'OAS 2.0'}" data-vendor="OAS 2.0">OAS 2.0</anypoint-button>
        <anypoint-button ?active="${apiFormat === 'OAS 3.0'}" data-vendor="OAS 3.0">OAS 3.0</anypoint-button>
        <anypoint-button ?active="${apiFormat === 'ASYNC 2.0'}" data-vendor="ASYNC 2.0">Async API 2.0</anypoint-button>
      </div>
      ${this.apiMediaTypeSelector()}
    </div>
    `;
  }

  /**
   * @returns {TemplateResult|string} The template for the API media selector
   */
  apiMediaTypeSelector() {
    const { apiFormat, apiMedia } = this;
    const hasMediaType = ['OAS 2.0', 'OAS 3.0'].includes(apiFormat);
    if (!hasMediaType) {
      return '';
    }
    return html`
    <div class="button-group" @click="${this.mediaSelectorHandler}" @keydown="${this.mediaSelectorKeyHandler}">
      <anypoint-button ?active="${apiMedia === 'application/yaml'}" data-media="application/yaml">application/yaml</anypoint-button>
      <anypoint-button ?active="${apiMedia === 'application/json'}" data-media="application/json">application/json</anypoint-button>
    </div>
    `;
  }

  /**
   * @returns {TemplateResult} The template for the Monaco editor.
   */
  editorContainerTemplate() {
    return html`<div id="container"></div>`;
  }

  /**
   * @returns {TemplateResult|string} The template for API navigation.
   */
  navigationDrawerTemplate() {
    const { model, navigationOpened } = this;
    if (!model) {
      return '';
    }
    const classes = {
      navigation: true,
      opened: navigationOpened,
    };
    return html`
    <nav class="${classMap(classes)}">
      <div class="api-doc-toolbar">
        <anypoint-icon-button 
          title="Close the menu" 
          aria-label="Activate to close the API navigation"
          @click="${this.menuToggleHandler}"
        >
          <arc-icon icon="close"></arc-icon>
        </anypoint-icon-button>
      </div>
      <api-navigation
        summary
        endpointsOpened
      ></api-navigation>
    </nav>`;
  }

  /**
   * @returns {TemplateResult} The template for the documentation section.
   */
  documentationTemplate() {
    return html`
    ${this.navigationDrawerTemplate()}
    <section class="api-console">
      ${this.apiLoaderTemplate()}
      ${this.apiTemplate()}
    </section>
    `;
  }

  /**
   * @returns {TemplateResult|string} The template for the API loading indicator.
   */
  apiLoaderTemplate() {
    if (!this.loading) {
      return '';
    }
    return html`
    <progress class="loading-progress"></progress>
    `;
  }

  /**
   * @returns {TemplateResult|string} The template for the API console's main documentation.
   */
  apiTemplate() {
    const { model } = this;
    if (!model) {
      return '';
    }
    return html`
    <div class="api-doc-toolbar">
      ${this.navigationTriggerTemplate()}
    </div>
    <api-documentation
      slot="content"
      .domainId="${this.domainId}"
      .operationId="${this.operationId}"
      .domainType="${this.domainType}"
      .redirectUri="${this.redirectUri}"
      tryItButton
      @tryit="${this.tryitHandler}"
    >
    </api-documentation>
    <xhr-simple-request></xhr-simple-request>
    `;
  }

  requestEditorDialogTemplate() {
    if (!this.httpEditorPositionTarget) {
      return '';
    }
    return html`
    <anypoint-dialog 
      @closed="${this.editorCloseHandler}" 
      .opened="${this.editorOpened}" 
      class="request-dialog"
      horizontalAlign="center"
      verticalAlign="middle"
      .positionTarget="${this.httpEditorPositionTarget}"
    >
      <h2>API request</h2>
      <anypoint-dialog-scrollable>
        <api-request
          .domainId="${this.editorOperation}"
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

const page = new ApiTextEditor();
page.render();
