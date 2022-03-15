import { assert, fixture, html, aTimeout } from '@open-wc/testing';
import { AmfLoader } from '../AmfLoader.js';
import { DomEventsAmfStore } from '../../src/store/DomEventsAmfStore.js';
import '../../define/api-request-editor.js';

/** @typedef {import('../../src/helpers/amf').AmfDocument} AmfDocument */
/** @typedef {import('../..').ApiRequestEditorElement} ApiRequestEditorElement */

describe('ApiRequestEditorElement', () => {
  describe('APIC-689', () => {
    const store = new DomEventsAmfStore(window);
    store.listen();
    const apiFile = 'APIC-689';

    /**
     * @param {string} domainId
     * @returns {Promise<ApiRequestEditorElement>}
     */
    async function modelFixture(domainId) {
      const element = /** @type ApiRequestEditorElement */ (await fixture(html`<api-request-editor
        .domainId="${domainId}"></api-request-editor>`));
      await aTimeout(2);
      return element;
    }

    /** @type AmfLoader */
    let loader;
    /** @type AmfDocument */
    let amf;

    before(async () => {
      loader = new AmfLoader();
      amf = await loader.getGraph(apiFile);
      store.amf = amf;
    });

    it('does not set URL query param for an optional enum', async () => {
      const method = loader.lookupOperation(amf, '/test', 'get');
      const methodId = method['@id'];
      const editor = await modelFixture(methodId);
      const values = editor.serialize();
      assert.equal(values.url, '/test', 'param value is not set');
    });

    it('sets URL query param for a required enum', async () => {
      const method = loader.lookupOperation(amf, '/test', 'post');
      const methodId = method['@id'];
      const editor = await modelFixture(methodId);
      const values = editor.serialize();
      assert.equal(values.url, '/test?param1=A', 'param value is set');
    });
  });
});
