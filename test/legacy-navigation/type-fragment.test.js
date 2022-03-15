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

describe('ApiNavigationElement', () => {
  describe('Type fragment', () => {
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
      const amf = await loader.getGraph('type-fragment');
      element = await basicFixture();
      element.amf = amf;
      await nextFrame();
    });

    it('Documentation is undefined', () => {
      assert.isUndefined(element[docsValue]);
    });

    it('Types is computed', () => {
      const result = element[typesValue];
      assert.lengthOf(result, 1);
      assert.typeOf(result[0].id, 'string');
      assert.equal(result[0].label, 'A person resource');
    });

    it('Security is undefined', () => {
      assert.isUndefined(element[securityValue]);
    });

    it('Endpoints is undefined', () => {
      assert.isUndefined(element[endpointsValue]);
    });

    it('Types is opened', () => {
      assert.isTrue(element.typesOpened);
    });

    it('[isFragmentValue] is set', () => {
      assert.isTrue(element[isFragmentValue]);
    });

    it('summaryRendered is false', () => {
      assert.isFalse(element.summaryRendered);
    });

    it('summary is not rendered', async () => {
      await nextFrame();
      const panel = element.shadowRoot.querySelector('.summary');
      assert.notOk(panel);
    });
  });
});
