import { html } from 'lit';
import { DemoPage } from "@advanced-rest-client/arc-demo-helper";
import { MonacoLoader } from "@advanced-rest-client/monaco-support";
import '@anypoint-web-components/awc/dist/define/anypoint-dropdown-menu.js';
import '@anypoint-web-components/awc/dist/define/anypoint-listbox.js';
import '@anypoint-web-components/awc/dist/define/anypoint-item.js';
import { EventTypes as ArcEventTypes } from '@advanced-rest-client/events';
import { OAuth2Authorization, OidcAuthorization } from '@api-client/core/build/browser.js';
import { DomEventsAmfStore } from "../../src/store/DomEventsAmfStore.js";
import { AmfHelperMixin } from "../../src/helpers/AmfHelperMixin.js";
import { EventTypes } from '../../src/events/EventTypes.js';
import { navigate, findRoute } from './route.js';
import '../../define/api-navigation.js';
import './ApiStyles.js';

/** @typedef {import('lit-html').TemplateResult} TemplateResult */
/** @typedef {import('@anypoint-web-components/awc').AnypointListboxElement} AnypointListbox */
/** @typedef {import('@advanced-rest-client/events').OAuth2AuthorizeEvent} OAuth2AuthorizeEvent */
/** @typedef {import('@advanced-rest-client/events').OidcAuthorizeEvent} OidcAuthorizeEvent */
/** @typedef {import('@advanced-rest-client/events').Authorization.TokenInfo} TokenInfo */
/** @typedef {import('@advanced-rest-client/events').Authorization.OAuth2Authorization} OAuth2Settings */
/** @typedef {import('@advanced-rest-client/events').Authorization.OidcTokenInfo} OidcTokenInfo */
/** @typedef {import('@advanced-rest-client/events').Authorization.OidcTokenError} OidcTokenError */
/** @typedef {import('../../src/events/NavigationEvents').ApiNavigationEvent} ApiNavigationEvent */
/** @typedef {import('../../src/events/ReportingEvents').ReportingErrorEventDetail} ReportingErrorEventDetail */
/** @typedef {import('../../').AmfStore} AmfStore */
/** @typedef {import('../../').AmfStoreDomEventsMixin} AmfStoreDomEventsMixin */
/** @typedef {import('../../').InMemAmfGraphStore} InMemAmfGraphStore */

const routes = [
  {
    name: 'api-file',
    pattern: 'file/(?<file>[^/]*)'
  },
];

/**
 * Base class for API components demo page.
 * It creates a skeleton for an API demo page.
 */
export class AmfDemoBase extends AmfHelperMixin(DemoPage) {
  get amf() {
    return super.amf;
  }

  set amf(value) {
    super.amf = value;
    this.render();
  }

  constructor() {
    super();
    this.initObservableProperties(["initialized", "loaded", 'selectedFile', 'redirectUri']);
    /** @type {AmfStore & AmfStoreDomEventsMixin} */
    this.store = new DomEventsAmfStore(window);
    this.store.listen();

    this.loaded = false;
    this.initialized = false;
    this.renderViewControls = true;
    /**
     * When set the endpoint section in navigation is opened by default.
     * @type {boolean}
     * @default false
     */
    this.endpointsOpened = true;

    /**
     * When set the documentation section in navigation is opened by default.
     * @type {boolean}
     * @default false
     */
    this.docsOpened = false;

    /**
     * When set the types section in navigation is opened by default.
     * @type {boolean}
     * @default false
     */
    this.typesOpened = false;

    /**
     * When set the security section in navigation is opened by default.
     * @type {boolean}
     * @default false
     */
    this.securityOpened = false;

    /**
     * AMF model read from the API model file downloaded after initialization.
     * @type {any}
     */
    this.amf = null;

    /**
     * When set the API Navigation element won't be rendered.
     * @type {Boolean}
     * @default false
     */
    this.noApiNavigation = false;
    /** 
     * Currently loaded file.
     * @type {string}
     */
    this.selectedFile = undefined;
    this.redirectUri = `${window.location.origin}/demo/oauth-popup.html`;
    window.addEventListener(ArcEventTypes.Authorization.OAuth2.authorize, this.oauth2authorizeHandler.bind(this));
    window.addEventListener(ArcEventTypes.Authorization.Oidc.authorize, this.oidcAuthorizeHandler.bind(this));

    window.addEventListener(EventTypes.Navigation.apiNavigate, this._navChanged.bind(this));
    window.addEventListener(EventTypes.Reporting.error, this._errorHandler.bind(this));

    document.body.classList.add('api');
    this.autoLoad();
  }

  async autoLoad() {
    await this.loadMonaco();
    this.onRoute();
    window.onpopstate = () => {
      this.onRoute();
    };
    this.initialized = true;
  }

  async loadMonaco() {
    const base = `../node_modules/monaco-editor/`;
    MonacoLoader.createEnvironment(base);
    await MonacoLoader.loadMonaco(base);
    await MonacoLoader.monacoReady();
  }

  /**
   * Called when route change
   */
  onRoute() {
    const url = new URL(window.location.href);
    const hash = url.hash.replace('#', '');
    const result = findRoute(routes, hash);
    if (!result || result.route.name !== 'api-file') {
      return;
    }
    const { file } = result.params;
    if (!file) {
      return;
    }
    this.selectedFile = file;
    this._loadFile(file);
  }

  /**
   * Sets default API selection when the view is rendered.
   */
  firstRender() {
    const url = new URL(window.location.href);
    const hash = url.hash.replace('#', '');
    if (hash && hash.includes('file/')) {
      // had the file already.
      return;
    }
    const node = /** @type any */ (document.getElementById('apiList'));
    if (!node) {
      return;
    }
    node.selected = 0;
  }

  /**
   * Handler for the API selection change
   * @param {Event} e
   */
  _apiChanged(e) {
    const node = /** @type AnypointListbox */ (e.target);
    const item = /** @type HTMLElement */ (node.selectedItem);
    const file = item.dataset.src;
    navigate('file', file);
  }

  /**
   * Handler for the API errors
   * @param {CustomEvent} e
   */
  _errorHandler(e) {
    const info = /** @type ReportingErrorEventDetail */ (e.detail);
    const { description, component='Unknown component', error } = info;
    console.error(`[${component}]: ${description}`);
    console.error(error);
  }

  /** @param {string} file */
  async _loadFile(file) {
    this.loaded = false;
    const response = await fetch(`./${file}`);
    let data = await response.json();
    if (Array.isArray(data)) {
      [data] = data;
    }
    this.amf = data;
    
    /** @type DomEventsAmfStore */ (this.store).amf = data;
    this.loaded = true;
  }

  /**
   * @param {OAuth2AuthorizeEvent} e
   */
  oauth2authorizeHandler(e) {
    e.preventDefault();
    const config = { ...e.detail };
    e.detail.result = this.authorizeOauth2(config);
  }

  /**
   * Authorize the user using provided settings.
   *
   * @param {OAuth2Settings} settings The authorization configuration.
   * @returns {Promise<TokenInfo>}
   */
  async authorizeOauth2(settings) {
    const auth = new OAuth2Authorization(settings);
    auth.checkConfig();
    return auth.authorize();
  }

  /**
   * @param {OidcAuthorizeEvent} e
   */
  oidcAuthorizeHandler(e) {
    const config = { ...e.detail };
    e.detail.result = this.authorizeOidc(config);
  }

  /**
   * Authorize the user using provided settings.
   *
   * @param {OAuth2Settings} settings The authorization configuration.
   * @returns {Promise<(OidcTokenInfo|OidcTokenError)[]>}
   */
  async authorizeOidc(settings) {
    const auth = new OidcAuthorization(settings);
    auth.checkConfig();
    return auth.authorize();
  }

  /**
   * This method to be overridden in child class to handle navigation.
   * @param {ApiNavigationEvent} e Dispatched navigation event
   */
  _navChanged(e) {
    const { domainId, domainType } = e.detail;
    // eslint-disable-next-line no-console
    console.log(`Navigation changed. Type: ${domainId}, selected: ${domainType}`);
  }

  /**
   * This method to be overridden in child class to render API options.
   * @return {TemplateResult[]} HTML template for apis dropdown options.
   */
  _apiListTemplate() {
    return [
      ['demo-api', 'Demo API'],
    ].map(([file, label]) => html`
      <anypoint-item data-src="models/${file}.json">${label} - compact model</anypoint-item>
    `);
  }

  /**
   * @return {TemplateResult|string} Template for API navigation element
   */
   _apiNavigationTemplate() {
    if (this.noApiNavigation) {
      return '';
    }
    // sort, filter
    return html`
    <api-navigation
      summary
      ?endpointsOpened="${this.endpointsOpened}"
      ?documentationsOpened="${this.docsOpened}"
      ?schemasOpened="${this.typesOpened}"
      ?securityOpened="${this.securityOpened}"
    ></api-navigation>`;
  }
  
  /**
   * Call this on the top of the `render()` method to render demo navigation
   * @return {TemplateResult} HTML template for demo header
   */
  headerTemplate() {
    const { componentName, selectedFile } = this;
    return html`
    <header>
      <a href="./index.html" class="header-link"><arc-icon icon="arrowBack"></arc-icon>Demo index</a>
      <anypoint-dropdown-menu
        aria-label="Activate to select demo API"
        aria-expanded="false"
      >
        <label slot="label">Select demo API</label>
        <anypoint-listbox 
          slot="dropdown-content" 
          id="apiList"
          .selected="${selectedFile}"
          @selectedchange="${this._apiChanged}"
          attrForSelected="data-src"
        >
          ${this._apiListTemplate()}
        </anypoint-listbox>
      </anypoint-dropdown-menu>
      ${componentName ? html`<h1 class="api-title">${componentName}</h1>` : ''}
    </header>`;
  }

  /**
   * The page render function. Usually you don't need to use it.
   * It renders the header template, main section, and the content.
   * 
   * @return {TemplateResult}
   */
  pageTemplate() {
    return html`
    ${this.headerTemplate()}
    <section role="main" class="horizontal-section-container centered main">
      ${this._apiNavigationTemplate()}
      <div class="demo-container">
        ${this.contentTemplate()}
      </div>
    </section>`;
  }
}
