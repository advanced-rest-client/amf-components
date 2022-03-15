import { fixture, assert, html, aTimeout, nextFrame } from '@open-wc/testing';
import { requestValues } from '../../src/elements/ApiResourceDocumentElement.js';
import { AmfLoader } from '../AmfLoader.js';
import { loadMonaco } from '../MonacoSetup.js';
import { DomEventsAmfStore } from '../../src/store/DomEventsAmfStore.js';
import '../../define/api-resource-document.js';

/** @typedef {import('../../').ApiResourceDocumentElement} ApiResourceDocumentElement */
/** @typedef {import('../../src/helpers/amf').AmfDocument} AmfDocument */
/** @typedef {import('../../src/helpers/amf').DomainElement} DomainElement */
/** @typedef {import('../../src/helpers/amf').Response} Response */

describe('ApiResourceDocumentElement', () => {
  const loader = new AmfLoader();
  const store = new DomEventsAmfStore(window);
  store.listen();

  before(async () => loadMonaco());

  /**
   * @param {string=} domainId
   * @param {string=} operationId
   * @returns {Promise<ApiResourceDocumentElement>}
   */
  async function basicFixture(domainId, operationId) {
    const element = await fixture(html`<api-resource-document 
      .queryDebouncerTimeout="${0}" 
      .domainId="${domainId}"
      .operationId="${operationId}"
    ></api-resource-document>`);
    await aTimeout(5);
    return /** @type ApiResourceDocumentElement */ (element);
  }

  /**
   * @param {string=} domainId
   * @returns {Promise<ApiResourceDocumentElement>}
   */
  async function asyncFixture(domainId) {
    const element = await fixture(html`<api-resource-document 
      .queryDebouncerTimeout="${0}"
      .domainId="${domainId}"
      asyncApi
    ></api-resource-document>`);
    await aTimeout(5);
    return /** @type ApiResourceDocumentElement */ (element);
  }

  /**
   * @param {string=} domainId
   * @returns {Promise<ApiResourceDocumentElement>}
   */
  async function tryItPanelFixture(domainId) {
    const element = await fixture(html`<api-resource-document 
      .queryDebouncerTimeout="${0}"
      .domainId="${domainId}"
      tryItPanel
    ></api-resource-document>`);
    await aTimeout(5);
    return /** @type ApiResourceDocumentElement */ (element);
  }

  /** @type AmfDocument */
  let demoModel;
  /** @type AmfDocument */
  let asyncModel;
  /** @type AmfDocument */
  let petStoreModel;
  before(async () => {
    demoModel = await loader.getGraph();
    asyncModel = await loader.getGraph('async-api');
    petStoreModel = await loader.getGraph('Petstore-v2');
  });

  describe('graph processing', () => {
    before(() => {
      store.amf = demoModel;
    });

    it('sets the endpoint value', async () => {
      const data = loader.lookupEndpoint(demoModel, '/messages');
      const element = await basicFixture(data['@id']);

      const { endpoint } = element;
      assert.typeOf(endpoint, 'object', 'has the endpoint');
      assert.equal(endpoint.path, '/messages', 'has the endpoint model');
    });

    it('sets the endpointUri value', async () => {
      const data = loader.lookupEndpoint(demoModel, '/messages');
      const element = await basicFixture(data['@id']);

      const { endpointUri } = element;
      assert.equal(endpointUri, 'http://{instance}.domain.com/messages');
    });

    it('sets the servers value', async () => {
      const data = loader.lookupEndpoint(demoModel, '/messages');
      const element = await basicFixture(data['@id']);

      const { servers } = element;
      assert.typeOf(servers, 'array', 'has the servers array');
      assert.lengthOf(servers, 1, 'has a single server');
      const [srv] = servers;
      assert.equal(srv.url, 'http://{instance}.domain.com/', 'has the server model');
    });

    // this is unreliable...
    it.skip('scrolls to the selected operation when initializing', async () => {
      const data = loader.lookupEndpoint(demoModel, '/people');
      const op = loader.getOperation(demoModel, '/people', 'put');
      await basicFixture(data['@id'], op.id);
      assert.equal(window.scrollY, 0, 'initial scroll is 0');
      await aTimeout(400);
      assert.notEqual(window.scrollY, 0, 'the window is scrolled')
    });
  });

  describe('title are rendering', () => {
    it('renders the endpoint name, when defined', async () => {
      store.amf = demoModel;
      const data = loader.lookupEndpoint(demoModel, '/people');
      const element = await basicFixture(data['@id']);
      const header = element.shadowRoot.querySelector('.endpoint-header');
      const label = header.querySelector('.label');
      assert.equal(label.textContent.trim(), 'People');
    });

    it('renders the endpoint path, when name not defined', async () => {
      store.amf = demoModel;
      const data = loader.lookupEndpoint(demoModel, '/orgs/{orgId}');
      const element = await basicFixture(data['@id']);
      const header = element.shadowRoot.querySelector('.endpoint-header');
      const label = header.querySelector('.label');
      assert.equal(label.textContent.trim(), '/orgs/{orgId}');
    });

    it('renders the endpoint sub-title for sync API', async () => {
      store.amf = demoModel;
      const data = loader.lookupEndpoint(demoModel, '/orgs/{orgId}');
      const element = await basicFixture(data['@id']);
      const header = element.shadowRoot.querySelector('.endpoint-header');
      const label = header.querySelector('.sub-header');
      assert.equal(label.textContent.trim(), 'API endpoint');
    });

    it('renders the endpoint sub-title for async API', async () => {
      store.amf = asyncModel;
      const data = loader.lookupEndpoint(asyncModel, 'hello');
      const element = await asyncFixture(data['@id']);
      const header = element.shadowRoot.querySelector('.endpoint-header');
      const label = header.querySelector('.sub-header');
      assert.equal(label.textContent.trim(), 'API channel');
    });
  });

  describe('URL rendering', () => {
    it('renders the endpoint uri for a synchronous API', async () => {
      store.amf = petStoreModel;
      const data = loader.lookupEndpoint(petStoreModel, '/pets');
      const element = await basicFixture(data['@id']);
      const value = element.shadowRoot.querySelector('.endpoint-url .url-value');
      assert.equal(value.textContent.trim(), 'http://petstore.swagger.io/api/pets');
    });

    it('renders the channel uri for an async API', async () => {
      store.amf = asyncModel;
      const data = loader.lookupEndpoint(asyncModel, 'goodbye');
      const element = await basicFixture(data['@id']);
      const value = element.shadowRoot.querySelector('.endpoint-url .url-value');
      assert.equal(value.textContent.trim(), 'amqp://broker.mycompany.com/goodbye');
    });
  });

  //
  // These tests are skipped because AMF apparently removes this information from 
  // a valid model.
  // 
  describe.skip('Extensions rendering', () => {
    before(() => {
      store.amf = demoModel;
    });

    it('renders resource type extension', async () => {
      const data = loader.lookupEndpoint(demoModel, '/people/{personId}');
      const element = await basicFixture(data['@id']);
      const value = element.shadowRoot.querySelector('.extensions');
      assert.equal(value.textContent.trim(), 'Implements ResourceNotFound.');
    });

    it('renders traits extension', async () => {
      const data = loader.lookupEndpoint(demoModel, '/orgs/{orgId}');
      const element = await basicFixture(data['@id']);
      const value = element.shadowRoot.querySelector('.extensions');
      assert.equal(value.textContent.trim(), 'Mixes in RateLimited.');
    });

    it('renders both the traits and the response type extension', async () => {
      const data = loader.lookupEndpoint(demoModel, '/people');
      const element = await basicFixture(data['@id']);
      const value = element.shadowRoot.querySelector('.extensions');
      assert.equal(value.textContent.trim(), 'Implements RequestErrorResponse. Mixes in RateLimited.');
    });
  });

  describe('Description rendering', () => {
    before(() => {
      store.amf = demoModel;
    });

    it('renders the description', async () => {
      const data = loader.lookupEndpoint(demoModel, '/people/{personId}');
      const element = await basicFixture(data['@id']);
      const desc = element.shadowRoot.querySelector('.api-description');
      assert.ok(desc, 'has the description');
      const marked = desc.querySelector('arc-marked');
      assert.equal(marked.markdown, 'The endpoint to access information about the person');
    });

    it('renders traits extension', async () => {
      const data = loader.lookupEndpoint(demoModel, '/people');
      const element = await basicFixture(data['@id']);
      const desc = element.shadowRoot.querySelector('.api-description');
      assert.notOk(desc, 'has no description');
    });
  });

  describe('renders operations', () => {
    before(() => {
      store.amf = demoModel;
    });

    it('renders all operations in the endpoint', async () => {
      const data = loader.lookupEndpoint(demoModel, '/people');
      const element = await basicFixture(data['@id']);
      const elements = element.shadowRoot.querySelectorAll('api-operation-document');
      assert.lengthOf(elements, 4);
    });

    it('sets a minimum properties', async () => {
      const data = loader.lookupEndpoint(demoModel, '/messages');
      const element = await basicFixture(data['@id']);
      const op = element.shadowRoot.querySelector('api-operation-document');
      assert.typeOf(op.domainId, 'string', 'domainId is set');
      assert.typeOf(op.operation, 'object', 'operation is set');
      assert.typeOf(op.dataset.domainId, 'string', 'domainId is set')
      assert.isTrue(op.responsesOpened, 'responsesOpened is set')
      assert.isTrue(op.renderSecurity, 'renderSecurity is set')
    });

    it('sets the baseUri', async () => {
      const data = loader.lookupEndpoint(demoModel, '/messages');
      const element = await basicFixture(data['@id']);
      element.baseUri = 'https://api.domain.com';
      await nextFrame();
      const op = element.shadowRoot.querySelector('api-operation-document');
      assert.equal(op.baseUri, 'https://api.domain.com');
    });

    it('sets the tryItButton', async () => {
      const data = loader.lookupEndpoint(demoModel, '/messages');
      const element = await basicFixture(data['@id']);
      element.tryItButton = true;
      await nextFrame();
      const op = element.shadowRoot.querySelector('api-operation-document');
      assert.isTrue(op.tryItButton);
    });

    it('always sets tryItButton to false when tryItPanel is set', async () => {
      const data = loader.lookupEndpoint(demoModel, '/messages');
      const element = await basicFixture(data['@id']);
      element.tryItButton = true;
      element.tryItPanel = true;
      await nextFrame();
      const op = element.shadowRoot.querySelector('api-operation-document');
      assert.notOk(op.tryItButton);
    });

    it('sets the asyncApi', async () => {
      const data = loader.lookupEndpoint(demoModel, '/messages');
      const element = await basicFixture(data['@id']);
      element.asyncApi = true;
      await nextFrame();
      const op = element.shadowRoot.querySelector('api-operation-document');
      assert.isTrue(op.asyncApi);
    });
  });

  describe('Rendering HTTP editors', () => {
    before(() => {
      store.amf = demoModel;
    });

    it('renders HTTP request editors for all operations', async () => {
      const data = loader.lookupEndpoint(demoModel, '/people');
      const element = await tryItPanelFixture(data['@id']);
      const elements = element.shadowRoot.querySelectorAll('api-request');
      assert.lengthOf(elements, 4);
    });

    it('collects request panel values for the code snippets', async () => {
      const data = loader.lookupEndpoint(demoModel, '/people');
      const element = await tryItPanelFixture(data['@id']);
      await aTimeout(201);
      const values = element[requestValues];
      assert.typeOf(values, 'object', 'has the [requestValues] property');
      assert.lengthOf(Object.keys(values), 4, 'has values for each request');
    });

    it('renders the code snippets', async () => {
      const data = loader.lookupEndpoint(demoModel, '/people');
      const element = await tryItPanelFixture(data['@id']);
      await aTimeout(201);
      const elements = element.shadowRoot.querySelectorAll('http-code-snippets');
      assert.lengthOf(elements, 4);
    });

    it('sets the initial request values on the code snippets', async () => {
      const data = loader.lookupEndpoint(demoModel, '/people');
      const element = await tryItPanelFixture(data['@id']);
      await aTimeout(201);
      const editor = element.shadowRoot.querySelector('api-request');
      const { domainId } = editor;
      const values = element[requestValues][domainId];
      assert.typeOf(values, 'object', 'has values for a request editor');
      const snippets = editor.parentElement.querySelector('http-code-snippets');
      assert.equal(snippets.url, values.url, 'snippets.url is set');
      assert.equal(snippets.method, values.method, 'snippets.method is set');
      assert.equal(snippets.headers, values.headers, 'snippets.headers is set');
      assert.equal(snippets.payload, values.payload, 'snippets.payload is set');
    });
  });
});
