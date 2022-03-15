import { fixture, assert, html, aTimeout } from '@open-wc/testing';
import sinon from 'sinon';
import { AmfLoader } from '../AmfLoader.js';
import { DomEventsAmfStore } from '../../src/store/DomEventsAmfStore.js';
import '../../define/api-request-editor.js';

/** @typedef {import('../../src/helpers/amf').AmfDocument} AmfDocument */
/** @typedef {import('../..').ApiRequestEditorElement} ApiRequestEditorElement */

describe('ApiRequestEditorElement', () => {
  describe('SE-12042', () => {
    const store = new DomEventsAmfStore(window);
    store.listen();

    /**
     * @param {AmfDocument} amf
     * @param {string} domainId
     * @returns {Promise<ApiRequestEditorElement>}
     */
    async function modelFixture(amf, domainId) {
      const element = /** @type ApiRequestEditorElement */ (await fixture(html`
      <api-request-editor
        .domainId="${domainId}"
        applyAuthorization
      ></api-request-editor>`));
      await aTimeout(2);
      return element;
    }

    const apiFile = 'SE-12042';
    describe('http method computation', () => {
      /** @type AmfLoader */
      let loader;
      /** @type AmfDocument */
      let amf;
      before(async () => {
        loader = new AmfLoader();
        amf = await loader.getGraph(apiFile);
        store.amf = amf;
      });

      it('sets headers from the authorization method', async () => {
        const method = loader.lookupOperation(amf, '/check/api-status', 'get');
        const element = await modelFixture(amf, method['@id']);
        await aTimeout(10);
        const spy = sinon.spy();
        element.addEventListener('api-request', spy);
        element.execute();
        const { detail } = spy.args[0][0];
        const { headers } = detail;
        assert.equal(headers,
          'Client-Id: 283a6722121141feb7a929793d5c\nClient-Secret: 1421b7a929793d51fe283a67221c');
      });

      it('sets query parameter from the authorization method', async () => {
        const method = loader.lookupOperation(amf, '/check/api-status', 'get');
        const element = await modelFixture(amf, method['@id']);
        await aTimeout(0);
        const spy = sinon.spy();
        element.addEventListener('api-request', spy);
        element.execute();
        const { detail } = spy.args[0][0];
        const { url } = detail;

        assert.include(url,
          'api-status?testParam=x-test-value');
      });
    });
  });
});
