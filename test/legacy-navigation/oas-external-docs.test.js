import { fixture, assert, html } from '@open-wc/testing';
import { AmfLoader } from '../AmfLoader.js';
import '../../define/api-navigation-legacy.js';
import {
  docsValue,
} from '../../src/elements/ApiNavigationLegacyElement.js';

/** @typedef {import('../../').ApiNavigationLegacyElement} ApiNavigationElement */
/** @typedef {import('../../').Amf.AmfDocument} AmfDocument */

describe('ApiNavigationLegacyElement', () => {
  describe('OAS external documentation computations', () => {
    const loader = new AmfLoader();

    /**
     * @param {AmfDocument=} amf
     * @returns {Promise<ApiNavigationElement>}
     */
    async function basicFixture(amf) {
      return fixture(html`<api-navigation-legacy .amf="${amf}"></api-navigation-legacy>`);
    }

    describe('Data computations', () => {
      /** @type ApiNavigationElement */
      let element;
      /** @type AmfDocument */
      let amf;

      before(async () => {
        amf = await loader.getGraph('ext-docs');
      });

      beforeEach(async () => {
        element = await basicFixture(amf);
      });

      it('has [docsValue]', () => {
        assert.lengthOf(element[docsValue], 1, 'has 1 docs items');
        assert.isTrue(element.hasDocs, 'hasDocs is set');
      });

      it('computes URL value', () => {
        const [doc] = element[docsValue];
        assert.equal(doc.url, 'https://example.com');
      });

      it('computes isExternal value', () => {
        const [doc] = element[docsValue];
        assert.isTrue(doc.isExternal);
      });
    });

    describe('View rendering', () => {
      /** @type ApiNavigationElement */
      let element;
      /** @type AmfDocument */
      let amf;

      before(async () => {
        amf = await loader.getGraph('ext-docs');
      });

      beforeEach(async () => {
        element = await basicFixture(amf);
      });

      it('renders list item with anchor', () => {
        const node = element.shadowRoot.querySelector('a.list-item');
        assert.ok(node, 'node is rendered');
      });

      it('opens anchor in a new tab', () => {
        const node = element.shadowRoot.querySelector('a.list-item');
        assert.equal(node.getAttribute('target'), '_blank');
      });

      it('has external URL', () => {
        const node = element.shadowRoot.querySelector('a.list-item');
        assert.equal(node.getAttribute('href'), 'https://example.com');
      });
    });

    describe('Invalid URL', () => {
      /** @type ApiNavigationElement */
      let element;
      /** @type AmfDocument */
      let amf;

      before(async () => {
        amf = await loader.getGraph('APIC-449');
      });

      beforeEach(async () => {
        element = await basicFixture(amf);
      });

      it('URL default to about:blank when invalid', () => {
        const node = element.shadowRoot.querySelector('a.list-item');
        assert.equal(node.getAttribute('href'), 'about:blank');
      });
    });
  });
});
