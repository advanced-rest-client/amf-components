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
  describe('Documentation fragment', () => {
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
      const amf = await loader.getGraph('documentation-fragment');
      store.amf = amf;
    });

    /** @type ApiNavigationElement */
    let element;
    beforeEach(async () => {
      element = await dataFixture();
    });

    it('collects the documentation information', () => {
      const result = element[documentationsValue];
      assert.lengthOf(result, 1);
      assert.typeOf(result[0].id, 'string');
      assert.equal(result[0].title, 'About');
    });

    it('opens the Documentation', () => {
      assert.isTrue(element.documentationsOpened);
    });

    it('documentMeta has the isFragment property', () => {
      assert.isTrue(element.documentMeta.isFragment);
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
      assert.deepEqual(element[schemasValue], []);
    });

    it('does not set security', () => {
      assert.deepEqual(element[securityValue], []);
    });

    it('does not set endpoints', () => {
      assert.deepEqual(element[endpointsValue], []);
    });
  });
});
