import { html } from 'lit-html';
import { classMap } from 'lit-html/directives/class-map.js';
import '@anypoint-web-components/awc/anypoint-icon-button.js';
import '@anypoint-web-components/awc/anypoint-menu-button.js';
import '@anypoint-web-components/awc/anypoint-listbox.js';
import '@anypoint-web-components/awc/anypoint-item.js';
import '@advanced-rest-client/icons/arc-icon.js';
import { MonacoLoader } from "@advanced-rest-client/monaco-support";
import { ApplicationPage } from "./lib/ApplicationPage.js";
import { findRoute, navigate } from './lib/route.js';
import { EventTypes } from '../src/events/EventTypes.js';
import { AmfSerializer } from '../src/helpers/AmfSerializer.js';
import { DomEventsAmfStore } from "../src/store/DomEventsAmfStore.js";
import "../define/api-navigation.js";
import '../define/api-documentation.js';
import '../define/xhr-simple-request.js';

/** @typedef {import('lit-html').TemplateResult} TemplateResult */
/** @typedef {import('@anypoint-web-components/awc').AnypointListboxElement} AnypointListbox */
/** @typedef {import('../src/events/NavigationEvents').ApiNavigationEvent} ApiNavigationEvent */
/** @typedef {import('../src/helpers/amf').AmfDocument} AmfDocument */
/** @typedef {import('../src/types').SelectionType} SelectionType */

const apiTitleValue = Symbol('apiTitleValue');

const ApiList = [
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
  ['async-api', 'Async API'],
  ['Streetlights', 'Streetlights Async API'],
];

export class ApiConsole extends ApplicationPage {
  static get routes() {
    return [
    {
      name: 'api',
      pattern: 'api/(?<apiId>[^/]*)'
    },
    {
      name: 'api',
      pattern: 'api/(?<apiId>[^/]*)/(?<domainType>[^/]*)/(?<domainId>[^/]*)/(?<operationId>.*)'
    }, 
    {
      name: 'api',
      pattern: 'api/(?<apiId>[^/]*)/(?<domainType>[^/]*)/(?<domainId>.*)'
    }, 
    {
      name: 'selector',
      pattern: 'api-selector.*'
    },
    {
      name: 'not-found',
      pattern: '*'
    }];
  }

  /**
   * @returns {string|undefined} The title of the currently loaded API.
   */
  get apiTitle() {
    return this[apiTitleValue];
  }

  constructor() {
    super();
    this.initObservableProperties(
      'apiLoaded', 'route', 'navigationOpened', 'model', 'loading',
      'domainId', 'domainType', 'operationId',
      'apiId', 'initializing'
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
    this.apiLoaded = false;
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
    /**
     * The title of the currently loaded API.
     * @type string
     */
    this[apiTitleValue] = undefined;
    window.addEventListener(EventTypes.Navigation.apiNavigate, this.apiNavigationHandler.bind(this));
    this.initApp();
  }

  /**
   * Loads the Monaco editor and initializes routing.
   */
  async initApp() {
    await this.loadMonaco();
    this.initializing = false;
    this.onRoute();
    window.onpopstate = () => {
      this.onRoute();
    };
  }

  /**
   * Loads the Monaco editor using ARC's helpers.
   * This can be implemented in any way.
   */
  async loadMonaco() {
    const base = `../node_modules/monaco-editor/`;
    MonacoLoader.createEnvironment(base);
    await MonacoLoader.loadMonaco(base);
    await MonacoLoader.monacoReady();
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
    this[apiTitleValue] = undefined;
  }

  /**
   * Called when route change
   */
  onRoute() {
    const url = new URL(window.location.href);
    const path = url.hash.replace('#', '');
    // @ts-ignore
    const { routes } = this.constructor;
    const result = findRoute(routes, path);
    if (!result) {
      return;
    }
    console.info('route', result.route, result.params);
    const { name } = result.route;
    this.route = name;
    if (name === 'api') {
      if (result.params.apiId && this.apiId !== result.params.apiId) {
        this.loadFile(`models/${result.params.apiId}.json`);
      }
      this.apiId = result.params.apiId;
      if (result.params.domainId) {
        this.domainId = result.params.domainId;
      }
      if (result.params.domainType) {
        this.domainType = result.params.domainType;
      }
      if (result.params.operationId) {
        this.operationId = result.params.operationId;
      }
    } else if (name === 'selector') {
      this.cleanUp();
    } else {
      this.cleanUp();
      navigate('api-selector');
    }
  }

  /**
   * @param {ApiNavigationEvent} e Dispatched navigation event
   */
  apiNavigationHandler(e) {
    const { domainId, domainType, parentId, passive } = e.detail;
    if (passive === true) {
      return;
    }
    if (domainType === 'operation') {
      // /operation/{ResourceId}/{OperationId}
      navigate('api', this.apiId, domainType, parentId, domainId);
    } else {
      navigate('api', this.apiId, domainType, domainId);
    }
  }

  menuToggleHandler() {
    this.navigationOpened = !this.navigationOpened;
  }

  /**
   * A handler for the API Console menu selection.
   *
   * @param {CustomEvent} e
   */
  apiConsoleMenuHandler(e) {
    const { item } = e.detail;
    if (!item) {
      // cancelled selection
      return;
    }
    const list = /** @type AnypointListbox */ (e.target);
    list.selected = undefined;
    const { action } = item.dataset;
    switch (action) {
      case 'close':
        this.closeApi();
        break;
      default:
        console.warn(`Unhandled action: ${action}`);
    }
  }

  /**
   * Closes the current API project.
   */
  closeApi() {
    this.apiLoaded = false;
    this.cleanUp();
    navigate('api-selector');
  }

  /**
   * Handler for the API selection change
   * @param {Event} e
   */
  apiSelected(e) {
    const node = /** @type AnypointListbox */ (e.target);
    const item = /** @type HTMLElement */ (node.selectedItem);
    const file = item.dataset.src;
    navigate('api', file, 'summary', 'summary');
  }

  /** @param {string} file */
  async loadFile(file) {
    this.loading = true;
    try {
      const response = await fetch(`./${file}`);
      let data = await response.json();
      if (Array.isArray(data)) {
        [data] = data;
      }
      this.model = data;
      this.store.amf = data;
      this.postApiLoad(data);
      this.apiLoaded = true;
      this.render();
    } catch (e) {
      console.error(e);
    }
    this.loading = false;
  }

  /**
   * Operations performed after the API model is rendered.
   * @param {AmfDocument} model 
   */
  postApiLoad(model) {
    this[apiTitleValue] = undefined;
    if (!model) {
      return;
    }
    const factory = new AmfSerializer(model);
    const api = factory._computeApi(model);
    if (!api) {
      return;
    }
    const summary = factory.apiSummary(api);
    this[apiTitleValue] = summary.name;
  }

  /**
   * @returns {TemplateResult} Main application template
   */
  appTemplate() {
    return html`
    ${this.headerTemplate()}
    ${this.pageTemplate(this.route)}
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
      <span class="spacer"></span>
      ${this.toolbarActionsTemplate()}
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
    const { apiTitle } = this;
    const label  = apiTitle || 'API Console';
    return html`
    <div class="api-name-wrapper">
      <h1>${label}</h1>
    </div>
    `;
  }

  /**
   * @returns {TemplateResult|string} A template for the toolbar actions.
   */
  toolbarActionsTemplate() {
    if (this.route !== 'api') {
      return '';
    }
    return html`
    <anypoint-menu-button
      horizontalAlign="right"
      horizontalOffset="12"
      closeOnActivate
      @select="${this.apiConsoleMenuHandler}"
      class="header-menu"
    >
      <anypoint-icon-button
        slot="dropdown-trigger"
        aria-label="Activate for API Console menu"
        title="API Console menu"
      >
        <arc-icon icon="moreVert"></arc-icon>
      </anypoint-icon-button>
      <anypoint-listbox slot="dropdown-content" selectable="anypoint-item[data-action]">
        <!-- <div class="menu-divider"></div> -->
        <anypoint-item data-action="close" class="menu-item">
          <arc-icon icon="close" class="menu-icon"></arc-icon>
          Close API
        </anypoint-item>
      </anypoint-listbox>
    </anypoint-menu-button>`;
  }

  /**
   * @param {string} route
   * @returns {TemplateResult} The template for the page content
   */
  pageTemplate(route) {
    if (this.initializing) {
      return this.initializingTemplate();
    }
    if (this.loading) {
      return this.loaderTemplate();
    }
    return html`
    <div class="content">
      ${this.navigationDrawerTemplate()}
      <main>
        ${this.renderPage(route)}
      </main>
    </div>
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
   * @returns {TemplateResult} A template for the loader
   */
  loaderTemplate() {
    return html`
    <div class="app-loader">
      <p class="message">Reading API specification data...</p>
    </div>
    `;
  }

  /**
   * @returns {TemplateResult|string} The template for API navigation.
   */
  navigationDrawerTemplate() {
    if (['selector'].includes(this.route)) {
      return '';
    }
    const { isMobile, navigationOpened } = this;
    const classes = {
      navigation: true,
      toggle: isMobile,
      opened: navigationOpened,
    };
    return html`
    <nav class="${classMap(classes)}">
      <api-navigation
        summary
        endpointsOpened
        layout="natural"
      ></api-navigation>
    </nav>`;
  }

  /**
   * @param {string} route The current route name.
   * @returns {TemplateResult} The template for the current page.
   */
  renderPage(route) {
    switch (route) {
      case 'api': return this.apiTemplate();
      case 'selector': return this.apiSelectorTemplate();
      default: return html`<p>404: Unknown route <code>/${route}</code>.</p>`;
    }
  }

  /**
   * @returns {TemplateResult} The template for the API console's main documentation.
   */
  apiTemplate() {
    return html`
    <api-documentation
      slot="content"
      .domainId="${this.domainId}"
      .operationId="${this.operationId}"
      .domainType="${this.domainType}"
      .redirectUri="${this.redirectUri}"
      tryItPanel
    >
    </api-documentation>
    <xhr-simple-request></xhr-simple-request>
    `;
  }

  /**
   * @returns {TemplateResult} The screen when there is no API selection.
   */
  apiSelectorTemplate() {
    return html`
    <section class="api-selector">
      <div class="title-line"><h2>Select an API</h2></div>
      <div class="api-list">
        <anypoint-listbox slot="dropdown-content" id="apiList" @selectedchange="${this.apiSelected}">
        ${ApiList.map(([file, label]) => html`
        <anypoint-item data-src="${file}">${label}</anypoint-item>
        `)}
        </anypoint-listbox>
      </div>
    </section>
    `;
  }
}

const page = new ApiConsole();
page.render();
