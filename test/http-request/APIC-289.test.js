import { fixture, assert, html, aTimeout } from '@open-wc/testing';
import { AmfLoader } from '../AmfLoader.js';
import { DomEventsAmfStore } from '../../src/store/DomEventsAmfStore.js';
import '../../define/api-request-editor.js';

/** @typedef {import('../../src/helpers/amf').AmfDocument} AmfDocument */
/** @typedef {import('../..').ApiRequestEditorElement} ApiRequestEditorElement */

describe('ApiRequestEditorElement', () => {
  describe('APIC-289', () => {
    const store = new DomEventsAmfStore(window);
    store.listen();

    /**
     * @param {string} selected
     * @returns {Promise<ApiRequestEditorElement>}
     */
    async function modelFixture(selected) {
      const element = /** @type ApiRequestEditorElement */ (await fixture(html`<api-request-editor
        .domainId="${selected}"></api-request-editor>`));
      await aTimeout(2);
      return element;
    }

    const apiFile = 'APIC-289';
    /** @type AmfLoader */
    let loader;
    /** @type AmfDocument */
    let amf;
    before(async () => {
      loader = new AmfLoader();
      amf = await loader.getGraph(apiFile);
      store.amf = amf;
    });

    it('generates query parameters model', async () => {
      const method = loader.lookupOperation(amf, '/organization', 'get');
      const element = await modelFixture(method['@id']);
      await aTimeout(0);
      await aTimeout(0);
      const model = element.parametersValue;
      assert.lengthOf(model, 1);
    });

    it('has OAS name on a parameter', async () => {
      const method = loader.lookupOperation(amf, '/organization', 'get');
      const element = await modelFixture(method['@id']);
      await aTimeout(0);
      await aTimeout(0);
      const model = element.parametersValue.find(p => p.parameter.name === 'foo_bar');
      assert.equal(model.parameter.paramName, 'foo');
    });

    it('render parameter name with the input', async () => {
      const method = loader.lookupOperation(amf, '/organization', 'get');
      const element = await modelFixture(method['@id']);
      await aTimeout(0);
      await aTimeout(0);
      const node = element.shadowRoot.querySelector('.form-input label');
      assert.equal(node.textContent.trim(), 'foo*');
    });
  });
});
