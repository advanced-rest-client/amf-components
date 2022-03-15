import { fixture, assert, nextFrame, html } from '@open-wc/testing';
import { AmfLoader } from '../AmfLoader.js';
import '../../define/api-navigation-legacy.js';
import {
  docsValue,
  typesValue,
  securityValue,
  endpointsValue,
  isFragmentValue,
} from '../../src/elements/ApiNavigationLegacyElement.js';

/** @typedef {import('../../').ApiNavigationLegacyElement} ApiNavigationElement */
/** @typedef {import('../../').Amf.AmfDocument} AmfDocument */

describe('ApiNavigationLegacyElement', () => {
  describe('Documentation fragment', () => {
    const loader = new AmfLoader();

    /**
     * @param {AmfDocument=} amf
     * @returns {Promise<ApiNavigationElement>}
     */
    async function basicFixture(amf) {
      return fixture(html`<api-navigation-legacy .amf="${amf}"></api-navigation-legacy>`);
    }

    /** @type ApiNavigationElement */
    let element;

    beforeEach(async () => {
      const amf = await loader.getGraph('documentation-fragment');
      element = await basicFixture(amf);
    });

    it('collects the documentation information', () => {
      const result = element[docsValue];
      assert.lengthOf(result, 1);
      assert.typeOf(result[0].id, 'string');
      assert.equal(result[0].label, 'About');
    });

    it('opens the Documentation', () => {
      assert.isTrue(element.docsOpened);
    });

    it('sets the [isFragmentValue]', () => {
      assert.isTrue(element[isFragmentValue]);
    });

    it('sets the summaryRendered', () => {
      assert.isFalse(element.summaryRendered);
    });

    it('does not render the summary', async () => {
      await nextFrame();
      const panel = element.shadowRoot.querySelector('.summary');
      assert.notOk(panel);
    });

    it('does not set types', () => {
      assert.isUndefined(element[typesValue]);
    });

    it('does not set security', () => {
      assert.isUndefined(element[securityValue]);
    });

    it('does not set endpoints', () => {
      assert.isUndefined(element[endpointsValue]);
    });
  });
});
