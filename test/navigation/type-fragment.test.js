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

describe('ApiNavigationLegacyElement', () => {
  describe('Type fragment', () => {
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
      const amf = await loader.getGraph('type-fragment');
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

    it('the schemas is computed', () => {
      const result = element[schemasValue];
      assert.lengthOf(result, 1);
      assert.typeOf(result[0].id, 'string');
      assert.equal(result[0].displayName, 'A person resource');
    });

    it('the security is empty', () => {
      assert.deepEqual(element[securityValue], []);
    });

    it('the endpoints is empty', () => {
      assert.deepEqual(element[endpointsValue], []);
    });

    it('Types is opened', () => {
      assert.isTrue(element.schemasOpened);
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
