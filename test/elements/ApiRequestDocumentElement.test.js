import { fixture, assert, nextFrame, html, aTimeout } from '@open-wc/testing';
import { AmfLoader } from '../AmfLoader.js';
import { DomEventsAmfStore } from '../../src/store/DomEventsAmfStore.js';
import '../../define/api-request-document.js';

/** @typedef {import('../../').ApiRequestDocumentElement} ApiRequestDocumentElement */
/** @typedef {import('../../src/helpers/amf').AmfDocument} AmfDocument */
/** @typedef {import('../../src/helpers/amf').DomainElement} DomainElement */
/** @typedef {import('../../src/helpers/api').ApiRequest} ApiRequest */

describe('ApiRequestDocumentElement', () => {
  const loader = new AmfLoader();
  const store = new DomEventsAmfStore(window);
  store.listen();

  /**
   * @param {ApiRequest=} shape
   * @param {string=} mimeType
   * @returns {Promise<ApiRequestDocumentElement>}
   */
  async function basicFixture(shape, mimeType) {
    const element = await fixture(html`<api-request-document 
      .queryDebouncerTimeout="${0}" 
      .request="${shape}"
      .mimeType="${mimeType}"
    ></api-request-document>`);
    await aTimeout(1);
    return /** @type ApiRequestDocumentElement */ (element);
  }
  
  describe('request headers', () => {
    /** @type AmfDocument */
    let model;
    before(async () => {
      model = await loader.getGraph();
      store.amf = model;
    });

    it('renders the request headers', async () => {
      const data = loader.getRequest(model, '/people', 'get');
      const element = await basicFixture(data);

      assert.isTrue(element.hasHeaders, 'hasHeaders is true');

      const section = element.shadowRoot.querySelector('.params-section [data-ctrl-property="headersOpened"]');
      assert.ok(section, 'the section is rendered');

      const params = element.shadowRoot.querySelectorAll('api-parameter-document[data-name="header"]');
      assert.lengthOf(params, 2, 'has all parameters document');
    });

    it('ignores headers section when no headers', async () => {
      const data = loader.getRequest(model, '/messages', 'get');
      const element = await basicFixture(data);

      assert.isFalse(element.hasHeaders, 'hasHeaders is true');

      const section = element.shadowRoot.querySelector('.params-section [data-ctrl-property="headersOpened"]');
      assert.notOk(section, 'the section is not rendered');
    });
  });

  describe('payload rendering', () => {
    /** @type AmfDocument */
    let model;
    before(async () => {
      model = await loader.getGraph();
      store.amf = model;
    });

    it('renders the payload schema', async () => {
      const data = loader.getRequest(model, '/people', 'post');
      const element = await basicFixture(data);

      const node = element.shadowRoot.querySelector('api-payload-document');
      assert.ok(node, 'has the payload document');
    });

    it('ignores the payload when not defined', async () => {
      const data = loader.getRequest(model, '/people', 'get');
      const element = await basicFixture(data);

      const node = element.shadowRoot.querySelector('api-payload-document');
      assert.notOk(node);
    });
  });

  describe('request media type selector', () => {
    /** @type AmfDocument */
    let model;
    before(async () => {
      model = await loader.getGraph();
      store.amf = model;
    });

    it('renders the request media type selector', async () => {
      const data = loader.getRequest(model, '/people', 'put');
      const element = await basicFixture(data);

      const section = element.shadowRoot.querySelector('.params-section[data-controlled-by="payloadOpened"]');
      const selector = section.querySelector('.media-type-selector');
      assert.ok(selector, 'has the payload document');

      const buttons = selector.querySelectorAll('anypoint-radio-button');
      assert.lengthOf(buttons, 2, 'has 2 media types to select');
    });

    it('ignores the media type when not defined', async () => {
      const data = loader.getRequest(model, '/orgs/{orgId}', 'put');
      const element = await basicFixture(data);

      const section = element.shadowRoot.querySelector('.params-section[data-controlled-by="payloadOpened"]');
      const selector = section.querySelector('.media-type-selector');
      assert.notOk(selector, 'has the payload document');
    });

    it('selecting a mime type changes the payload', async () => {
      const data = loader.getRequest(model, '/people', 'put');
      const element = await basicFixture(data);

      const section = element.shadowRoot.querySelector('.params-section[data-controlled-by="payloadOpened"]');
      const selector = section.querySelector('.media-type-selector');

      const buttons = selector.querySelectorAll('anypoint-radio-button');

      buttons[1].click();

      await nextFrame();

      assert.equal(element.mimeType, 'application/xml', 'media type is changed');
    });
  });

  describe('APIC-463: request media type selector', () => {
    /** @type AmfDocument */
    let model;
    before(async () => {
      model = await loader.getGraph('APIC-463');
      store.amf = model;
    });

    it('renders the request media type selector', async () => {
      const data = loader.getRequest(model, '/test', 'post');
      const element = await basicFixture(data);

      const section = element.shadowRoot.querySelector('.params-section[data-controlled-by="payloadOpened"]');
      const selector = section.querySelector('.media-type-selector');
      assert.ok(selector, 'has the payload document');

      const buttons = selector.querySelectorAll('anypoint-radio-button');
      assert.lengthOf(buttons, 2, 'has 2 media types to select');
      assert.equal(buttons[0].textContent.trim(), 'binary/octet-stream');
      assert.equal(buttons[1].textContent.trim(), 'multipart/form-data');
    });
  });

  describe('APIC-561: anyOf', () => {
    /** @type AmfDocument */
    let model;
    before(async () => {
      model = await loader.getGraph('anyOf');
      store.amf = model;
    });

    it('renders the documentation for anyOf type', async () => {
      const data = loader.getRequest(model, 'test', 'publish');
      const element = await basicFixture(data);
      const doc = element.shadowRoot.querySelector('api-payload-document');
      assert.ok(doc);
    });
  });
});
