import { fixture, assert, nextFrame, html, oneEvent } from '@open-wc/testing';
import { AmfLoader } from '../AmfLoader.js';
import {
  documentationsValue,
  schemasValue,
  securityValue,
  endpointsValue,
} from '../../src/elements/ApiNavigationElement.js';
import { DomEventsAmfStore } from '../../src/store/DomEventsAmfStore.js';
import '../../define/api-navigation.js';

/** @typedef {import('../../').ApiNavigationElement} ApiNavigationElement */
/** @typedef {import('../../').Amf.AmfDocument} AmfDocument */

describe('ApiNavigationElement', () => {
  describe('Security fragment', () => {
    const loader = new AmfLoader();
    const store = new DomEventsAmfStore(window);
    store.listen();

    /**
     * @returns {Promise<ApiNavigationElement>}
     */
    async function dataFixture() {
      const elm = /** @type ApiNavigationElement */ (await fixture(html`
        <api-navigation 
          summary 
          layout="tree"
          filter
          endpointsOpened
          documentationsOpened
          schemasOpened
          securityOpened></api-navigation>
      `));
      await oneEvent(elm, 'graphload');
      await nextFrame();
      return elm;
    }

    before(async () => {
      const amf = await loader.getGraph('oauth2-fragment');
      store.amf = amf;
    });

    /** @type ApiNavigationElement */
    let element;
    beforeEach(async () => {
      element = await dataFixture();
    });

    it('the documentation is empty', () => {
      assert.isUndefined(element[documentationsValue]);
    });

    it('the schemas is empty', () => {
      assert.deepEqual(element[schemasValue], []);
    });

    it('the security is computed', () => {
      const result = element[securityValue];
      assert.lengthOf(result, 1);
      assert.typeOf(result[0].id, 'string');
      assert.equal(result[0].displayName, 'MyOauth');
    });

    it('the endpoints is empty', () => {
      assert.deepEqual(element[endpointsValue], []);
    });

    it('Security is opened', () => {
      assert.isTrue(element.securityOpened);
    });

    it('documentMeta has the isFragment property', () => {
      assert.isTrue(element.documentMeta.isFragment);
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
