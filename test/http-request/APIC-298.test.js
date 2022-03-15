import { fixture, assert, html, aTimeout } from '@open-wc/testing';
import { AmfLoader } from '../AmfLoader.js';
import { DomEventsAmfStore } from '../../src/store/DomEventsAmfStore.js';
import '../../define/api-request-editor.js';

/** @typedef {import('../../src/helpers/amf').AmfDocument} AmfDocument */
/** @typedef {import('../..').ApiRequestEditorElement} ApiRequestEditorElement */

describe('ApiRequestEditorElement', () => {
  describe('APIC-298', () => {
    const store = new DomEventsAmfStore(window);
    store.listen();
    const apiFile = 'APIC-298';

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

    let methodId;

    /** @type AmfLoader */
    let loader;
    /** @type AmfDocument */
    let amf;
    before(async () => {
      loader = new AmfLoader();
      amf = await loader.getGraph(apiFile);
      store.amf = amf;
    });

    /** @type ApiRequestEditorElement */
    let element;
    beforeEach(async () => {
      const method = loader.lookupOperation(amf,  '/prescreens/{id}', 'get');
      methodId = method['@id'];
      element = await modelFixture(methodId);
    });

    it('computes pth uri parameters', () => {
      const params = element.parametersValue;
      assert.lengthOf(params, 1, 'pathModel has no elements');
      const [param] = params;
      assert.equal(param.binding, 'path', 'has a path item only');
    });

    it('has OAS property name', () => {
      const params = element.parametersValue;
      const [param] = params;
      assert.equal(param.parameter.paramName, 'id');
    });
  });
});
