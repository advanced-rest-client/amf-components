/* eslint-disable class-methods-use-this */
import { EventTypes as ArcEventTypes } from '@advanced-rest-client/events';
import { OAuth2Authorization, OidcAuthorization } from '@api-client/core/build/browser.js';
import { ReactiveMixin } from './mixins/ReactiveMixin.js';
import { RenderableMixin } from './mixins/RenderableMixin.js';

/** @typedef {import('@advanced-rest-client/events').OAuth2AuthorizeEvent} OAuth2AuthorizeEvent */
/** @typedef {import('@advanced-rest-client/events').OidcAuthorizeEvent} OidcAuthorizeEvent */
/** @typedef {import('@advanced-rest-client/events').Authorization.TokenInfo} TokenInfo */
/** @typedef {import('@advanced-rest-client/events').Authorization.OAuth2Authorization} OAuth2Settings */
/** @typedef {import('@advanced-rest-client/events').Authorization.OidcTokenInfo} OidcTokenInfo */
/** @typedef {import('@advanced-rest-client/events').Authorization.OidcTokenError} OidcTokenError */

/**
 * A base class for pages build outside the LitElement. It uses `lit-html` 
 * as the template renderer.
 * 
 * The implementation (extending this class) should override the `appTemplate()`
 * function that returns the `TemplateResult` from the `lit-html` library.
 * 
 * To reflect the changed state call the `render()` function. The function schedules
 * a micro task (through `requestAnimationFrame`) to call the render function on the template.
 * 
 * More useful option is to use the `initObservableProperties()` function that accepts a list 
 * of properties set on the base class that once set triggers the render function. The setter checks
 * whether the a value actually changed. It works well for primitives but it won't work as expected
 * for complex types.
 */
export class ApplicationPage extends RenderableMixin(ReactiveMixin(EventTarget)) {
  constructor() {
    super();
    this.initObservableProperties('isMobile');
    /** 
     * True when the app should render mobile friendly view.
     */
    this.isMobile = false;
    this.redirectUri = `${window.location.origin}/demo/oauth-popup.html`;
    window.addEventListener(ArcEventTypes.Authorization.OAuth2.authorize, this.oauth2authorizeHandler.bind(this));
    window.addEventListener(ArcEventTypes.Authorization.Oidc.authorize, this.oidcAuthorizeHandler.bind(this));
    this.initMediaQueries();
  }

  /**
   * Initializes media queries and observers.
   */
  initMediaQueries() {
    const mql = window.matchMedia('(max-width: 600px)');
    this.isMobile = mql.matches;
    mql.addEventListener('change', (e) => {
      this.isMobile = e.matches;
    });
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
}
