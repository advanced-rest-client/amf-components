import { assert, fixture, html, aTimeout } from '@open-wc/testing';
import { AmfLoader } from '../AmfLoader.js';
import { DomEventsAmfStore } from '../../src/store/DomEventsAmfStore.js';
import * as InputCache from '../../src/lib/InputCache.js';
import '../../define/api-request-editor.js';


/** @typedef {import('../../src/helpers/amf').AmfDocument} AmfDocument */
/** @typedef {import('../..').ApiRequestEditorElement} ApiRequestEditorElement */

describe('ApiRequestEditorElement', () => {
  describe('SE-12957', () => {
    const store = new DomEventsAmfStore(window);
    store.listen();
    const apiFile = 'SE-12957';

    /*
     * This issue is about rendering URI parameters in the operation parameters,
     * as URI parameters can appear in the Server, Endpoint, and Operation model.
     */

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

    it('renders the input for the URI parameter', async () => {
      const method = loader.lookupOperation(amf, '/api/v1/alarm/{scada-object-key}', 'get');
      const methodId = method['@id'];
      const editor = await modelFixture(methodId);
      const input = editor.shadowRoot.querySelector('[name="scada-object-key"]');
      assert.ok(input);
    });

    // 
    // accidentally I discovered that the `dateTime` input is not rendering correctly
    // after updating the cached values.
    // 

    it('renders the dateTime query parameter', async () => {
      const method = loader.lookupOperation(amf, '/api/v1/alarm/{scada-object-key}', 'get');
      const methodId = method['@id'];
      const editor = await modelFixture(methodId);
      const input = editor.shadowRoot.querySelector('[name="time-on"]');
      assert.ok(input);
    });

    it('sets the proper value on the dateTime parameter', async () => {
      const method = loader.lookupOperation(amf, '/api/v1/alarm/{scada-object-key}', 'get');
      const methodId = method['@id'];
      const editor = await modelFixture(methodId);
      const input = /** @type HTMLInputElement */ (editor.shadowRoot.querySelector('[name="time-on"]'));
      // this is valid value but the <input> filed ignores this format.
      InputCache.set(editor, input.dataset.domainId, '2021-09-27T14:55:33.688Z', false);
      await editor.requestUpdate();
      assert.equal(input.value, '2021-09-27T14:55:33.688');
    });
  });
});
