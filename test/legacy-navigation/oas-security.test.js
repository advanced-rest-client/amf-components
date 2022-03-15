import { fixture, assert, html } from '@open-wc/testing';
import { AmfLoader } from '../AmfLoader.js';
import '../../define/api-navigation-legacy.js';
import {
  securityValue,
} from '../../src/elements/ApiNavigationLegacyElement.js';

/** @typedef {import('../../').ApiNavigationLegacyElement} ApiNavigationElement */
/** @typedef {import('../../').Amf.AmfDocument} AmfDocument */

describe('ApiNavigationLegacyElement', () => {
  describe('OAS security computations', () => {
    const loader = new AmfLoader();

    /**
     * @param {AmfDocument=} amf
     * @returns {Promise<ApiNavigationElement>}
     */
    async function basicFixture(amf) {
      return fixture(html`<api-navigation-legacy .amf="${amf}"></api-navigation-legacy>`);
    }

    describe('API Keys', () => {
      /** @type ApiNavigationElement */
      let element;
      /** @type AmfDocument */
      let amf;

      before(async () => {
        amf = await loader.getGraph('api-keys');
      });

      beforeEach(async () => {
        element = await basicFixture(amf);
      });

      it('computes names in the [securityValue] model', () => {
        assert.lengthOf(element[securityValue], 4, 'has all security items');
        assert.equal(element[securityValue][0].label, 'clientQuery - Api Key', 'has name for clientQuery');
        assert.equal(element[securityValue][1].label, 'clientSecret - Api Key', 'has name for clientSecret');
        assert.equal(element[securityValue][2].label, 'clientCookie - Api Key', 'has name for clientCookie');
        assert.equal(element[securityValue][3].label, 'clientMulti - Api Key', 'has name for clientMulti');
      });

      it('renders security items', () => {
        const nodes = element.shadowRoot.querySelectorAll('.security .list-item');
        assert.lengthOf(nodes, 4, 'has all security items');
        assert.equal(nodes[0].textContent.trim(), 'clientQuery - Api Key', 'has name for clientQuery');
        assert.equal(nodes[1].textContent.trim(), 'clientSecret - Api Key', 'has name for clientSecret');
        assert.equal(nodes[2].textContent.trim(), 'clientCookie - Api Key', 'has name for clientCookie');
        assert.equal(nodes[3].textContent.trim(), 'clientMulti - Api Key', 'has name for clientMulti');
      });
    });

    describe('Bearer token', () => {
      /** @type ApiNavigationElement */
      let element;
      /** @type AmfDocument */
      let amf;

      before(async () => {
        amf = await loader.getGraph('oas-bearer');
      });

      beforeEach(async () => {
        element = await basicFixture(amf);
      });

      it('computes names in the [securityValue] model', () => {
        assert.lengthOf(element[securityValue], 2, 'has all security items');
        assert.equal(element[securityValue][0].label, 'bearerAuth - HTTP', 'has name for bearerAuth');
        assert.equal(element[securityValue][1].label, 'basicAuth - HTTP', 'has name for basicAuth');
      });

      it('renders security items', () => {
        const nodes = element.shadowRoot.querySelectorAll('.security .list-item');
        assert.lengthOf(nodes, 2, 'has all security items');
        assert.equal(nodes[0].textContent.trim(), 'bearerAuth - HTTP', 'has name for bearerAuth');
        assert.equal(nodes[1].textContent.trim(), 'basicAuth - HTTP', 'has name for basicAuth');
      });
    });

    describe('OAuth 2', () => {
      /** @type ApiNavigationElement */
      let element;
      /** @type AmfDocument */
      let amf;

      before(async () => {
        amf = await loader.getGraph('oauth-flows');
      });

      beforeEach(async () => {
        element = await basicFixture(amf);
      });

      it('computes names in the [securityValue] model', () => {
        assert.lengthOf(element[securityValue], 1, 'has all security items');
        assert.equal(element[securityValue][0].label, 'oAuthSample - OAuth 2.0', 'has name for oAuthSample');
      });

      it('renders security items', () => {
        const nodes = element.shadowRoot.querySelectorAll('.security .list-item');
        assert.lengthOf(nodes, 1, 'has all security items');
        assert.equal(nodes[0].textContent.trim(), 'oAuthSample - OAuth 2.0', 'has name for oAuthSample');
      });
    });

    describe('OAS combo', () => {
      /** @type ApiNavigationElement */
      let element;
      /** @type AmfDocument */
      let amf;

      before(async () => {
        amf = await loader.getGraph('oas-demo');
      });

      beforeEach(async () => {
        element = await basicFixture(amf);
      });

      it('computes names in the [securityValue] model', () => {
        assert.lengthOf(element[securityValue], 6, 'has all security items');
        assert.equal(element[securityValue][0].label, 'ApiKeyAuth - Api Key', 'has name for ApiKeyAuth');
        assert.equal(element[securityValue][1].label, 'OpenID - OpenID Connect', 'has name for OpenID');
        assert.equal(element[securityValue][2].label, 'OAuth2 - OAuth 2.0', 'has name for OAuth2');
        assert.equal(element[securityValue][3].label, 'BasicAuth - HTTP', 'has name for BasicAuth');
        assert.equal(element[securityValue][4].label, 'BearerAuth - HTTP', 'has name for BearerAuth');
        assert.equal(element[securityValue][5].label, 'ApiKeyQuery - Api Key', 'has name for ApiKeyQuery');
      });

      it('renders security items', () => {
        const nodes = element.shadowRoot.querySelectorAll('.security .list-item');
        assert.lengthOf(nodes, 6, 'has all security items');
        assert.equal(nodes[0].textContent.trim(), 'ApiKeyAuth - Api Key', 'has name for ApiKeyAuth');
        assert.equal(nodes[1].textContent.trim(), 'OpenID - OpenID Connect', 'has name for OpenID');
        assert.equal(nodes[2].textContent.trim(), 'OAuth2 - OAuth 2.0', 'has name for OAuth2');
        assert.equal(nodes[3].textContent.trim(), 'BasicAuth - HTTP', 'has name for BasicAuth');
        assert.equal(nodes[4].textContent.trim(), 'BearerAuth - HTTP', 'has name for BearerAuth');
        assert.equal(nodes[5].textContent.trim(), 'ApiKeyQuery - Api Key', 'has name for ApiKeyQuery');
      });
    });
  });
});
