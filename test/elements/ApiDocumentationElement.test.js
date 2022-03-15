import { fixture, assert, html, aTimeout, nextFrame } from '@open-wc/testing';
import { ServerEvents } from '../../src/events/ServerEvents.js';
import { AmfLoader } from '../AmfLoader.js';
import { loadMonaco } from '../MonacoSetup.js';
import { NavigationEvents } from '../../src/events/NavigationEvents.js';
import { DomEventsAmfStore } from '../../src/store/DomEventsAmfStore.js';
import '../../define/api-documentation.js';

/** @typedef {import('../../').ApiDocumentationElement} ApiDocumentationElement */
/** @typedef {import('../../src/helpers/amf').AmfDocument} AmfDocument */
/** @typedef {import('../../src/helpers/amf').DomainElement} DomainElement */
/** @typedef {import('../../src/helpers/amf').Response} Response */
/** @typedef {import('../../src/types').SelectionType} SelectionType */


describe('ApiDocumentationElement', () => {
  const loader = new AmfLoader();
  const store = new DomEventsAmfStore(window);
  store.listen();

  before(async () => loadMonaco());

  /**
   * @param {string=} domainId
   * @param {SelectionType=} domainType
   * @returns {Promise<ApiDocumentationElement>}
   */
  async function basicFixture(domainId, domainType) {
    const element = await fixture(html`<api-documentation 
      .queryDebouncerTimeout="${0}" 
      .domainId="${domainId}"
      .domainType="${domainType}"
    ></api-documentation>`);
    await aTimeout(0);
    return /** @type ApiDocumentationElement */ (element);
  }

  /**
   * @param {string=} domainId
   * @param {string=} operationId
   * @returns {Promise<ApiDocumentationElement>}
   */
  async function operationFixture(domainId, operationId) {
    const element = await fixture(html`<api-documentation 
      .queryDebouncerTimeout="${0}" 
      domainType="operation"
      .domainId="${domainId}"
      .operationId="${operationId}"
    ></api-documentation>`);
    await aTimeout(0);
    return /** @type ApiDocumentationElement */ (element);
  }

  /**
   * @param {string=} domainId
   * @param {SelectionType=} domainType
   * @returns {Promise<ApiDocumentationElement>}
   */
  async function tryitPanelFixture(domainId, domainType) {
    const element = await fixture(html`<api-documentation 
      .queryDebouncerTimeout="${0}" 
      .domainId="${domainId}"
      .domainType="${domainType}"
      tryItPanel
    ></api-documentation>`);
    await aTimeout(0);
    return /** @type ApiDocumentationElement */ (element);
  }

  /**
   * @param {string=} domainId
   * @param {string=} operationId
   * @returns {Promise<ApiDocumentationElement>}
   */
  async function customServersFixture(domainId, operationId) {
    const element = await fixture(html`<api-documentation 
      .queryDebouncerTimeout="${0}" 
      .domainId="${domainId}"
      .operationId="${operationId}"
      domainType="operation"
    >
      <anypoint-item slot="custom-base-uri" data-value="http://customServer.com">
        Server 1 - http://customServer.com
      </anypoint-item>
      <anypoint-item slot="custom-base-uri" data-value="http://customServer.com/{version}">
        Server 2 - http://customServer.com/{version}
      </anypoint-item>
    </api-documentation>`);
    await aTimeout(0);
    return /** @type ApiDocumentationElement */ (element);
  }

  /**
   * @param {string=} domainId
   * @param {SelectionType=} domainType
   * @returns {Promise<ApiDocumentationElement>}
   */
  async function navigationFixture(domainId, domainType) {
    const element = await fixture(html`<api-documentation 
      .queryDebouncerTimeout="${0}" 
      .domainId="${domainId}"
      .domainType="${domainType}"
      handleNavigationEvents
    ></api-documentation>`);
    await aTimeout(0);
    return /** @type ApiDocumentationElement */ (element);
  }

  describe('Compact model', () => {
    /** @type AmfDocument */
    let demoModel;
    /** @type AmfDocument */
    let multiServerModel;
    /** @type AmfDocument */
    let libraryFragmentModel;
    /** @type AmfDocument */
    let securityFragmentModel;
    /** @type AmfDocument */
    let documentationFragmentModel;
    /** @type AmfDocument */
    let typeFragmentModel;
    /** @type AmfDocument */
    let appianApiModel;
    before(async () => {
      demoModel = await loader.getGraph('demo-api');
      multiServerModel = await loader.getGraph('multi-server');
      libraryFragmentModel = await loader.getGraph('lib-fragment');
      securityFragmentModel = await loader.getGraph('oauth2-fragment');
      documentationFragmentModel = await loader.getGraph('documentation-fragment');
      typeFragmentModel = await loader.getGraph('type-fragment');
      appianApiModel = await loader.getGraph('appian-api');
    });

    describe('components rendering', () => {
      it('renders the api-summary element', async () => {
        store.amf = demoModel;
        const element = await basicFixture('summary', 'summary');
        const node = element.shadowRoot.querySelector('api-summary');
        assert.ok(node);
      });

      it('renders the api-resource-document element', async () => {
        store.amf = demoModel;
        const endpoint = loader.getEndpoint(demoModel, '/people')
        const element = await basicFixture(endpoint.id, 'resource');
        const node = element.shadowRoot.querySelector('api-resource-document');
        assert.ok(node);
      });

      it('renders the api-resource-document element for an operation', async () => {
        store.amf = demoModel;
        const endpoint = loader.getEndpoint(demoModel, '/people');
        const element = await operationFixture(endpoint.id, endpoint.operations[0].id);
        const node = element.shadowRoot.querySelector('api-resource-document');
        assert.ok(node);
      });

      it('renders the api-schema-document element', async () => {
        store.amf = demoModel;
        const shape = loader.getShape(demoModel, 'ErrorResource');
        const element = await basicFixture(shape.id, 'schema');
        const node = element.shadowRoot.querySelector('api-schema-document');
        assert.ok(node);
      });

      it('renders the api-security-document element', async () => {
        store.amf = demoModel;
        const security = loader.getSecurity(demoModel, 'digest');
        const element = await basicFixture(security.id, 'security');
        const node = element.shadowRoot.querySelector('api-security-document');
        assert.ok(node);
      });

      it('renders the api-documentation-document element', async () => {
        store.amf = demoModel;
        const doc = loader.getDocumentation(demoModel, 'Test doc');
        const element = await basicFixture(doc.id, 'documentation');
        const node = element.shadowRoot.querySelector('api-documentation-document');
        assert.ok(node);
      });

      it('renders the try it panel', async () => {
        store.amf = demoModel;
        const endpoint = loader.getEndpoint(demoModel, '/people')
        const element = await tryitPanelFixture(endpoint.id, 'resource');
        await aTimeout(1);
        
        const node = element.shadowRoot.querySelector('api-resource-document');
        assert.isTrue(node.tryItPanel, 'sets the tryItPanel');

        const editor = node.shadowRoot.querySelector('api-request');
        assert.ok(editor, 'renders the editor');
      });
    });

    describe('changing the selection', () => {
      it('changes to a resource', async () => {
        store.amf = demoModel;
        const element = await basicFixture('summary', 'summary');
        const endpoint = loader.getEndpoint(demoModel, '/people')
        element.domainId = endpoint.id;
        element.domainType = 'resource';
        await aTimeout(1);
        const summary = element.shadowRoot.querySelector('api-summary');
        assert.notOk(summary, 'the previous selection is not rendered');
        const node = element.shadowRoot.querySelector('api-resource-document');
        assert.ok(node, 'renders the resource');
      });

      it('changes to an operation', async () => {
        store.amf = demoModel;
        const element = await basicFixture('summary', 'summary');
        const endpoint = loader.getEndpoint(demoModel, '/people')
        element.domainId = endpoint.id;
        element.operationId = endpoint.operations[0].id;
        element.domainType = 'operation';
        await aTimeout(1);
        const summary = element.shadowRoot.querySelector('api-summary');
        assert.notOk(summary, 'the previous selection is not rendered');
        const node = element.shadowRoot.querySelector('api-resource-document');
        assert.ok(node, 'renders the resource');
      });

      it('changes to a schema', async () => {
        store.amf = demoModel;
        const element = await basicFixture('summary', 'summary');
        const shape = loader.getShape(demoModel, 'ErrorResource');
        element.domainId = shape.id;
        element.domainType = 'schema';
        await aTimeout(1);
        const summary = element.shadowRoot.querySelector('api-summary');
        assert.notOk(summary, 'the previous selection is not rendered');
        const node = element.shadowRoot.querySelector('api-schema-document');
        assert.ok(node, 'renders the schema');
      });

      it('changes to a document', async () => {
        store.amf = demoModel;
        const element = await basicFixture('summary', 'summary');
        const doc = loader.getDocumentation(demoModel, 'Test doc');
        element.domainId = doc.id;
        element.domainType = 'documentation';
        await aTimeout(1);
        const summary = element.shadowRoot.querySelector('api-summary');
        assert.notOk(summary, 'the previous selection is not rendered');
        const node = element.shadowRoot.querySelector('api-documentation-document');
        assert.ok(node, 'renders the schema');
      });

      it('changes to a security', async () => {
        store.amf = demoModel;
        const element = await basicFixture('summary', 'summary');
        const security = loader.getSecurity(demoModel, 'digest');
        element.domainId = security.id;
        element.domainType = 'security';
        await aTimeout(1);
        const summary = element.shadowRoot.querySelector('api-summary');
        assert.notOk(summary, 'the previous selection is not rendered');
        const node = element.shadowRoot.querySelector('api-security-document');
        assert.ok(node, 'renders the schema');
      });
    });

    describe('property passing', () => {
      it('passes all properties to the summary element', async () => {
        store.amf = demoModel;
        const element = await basicFixture('summary', 'summary');
        element.baseUri = 'https://base.com/';
        element.anypoint = true;
        await nextFrame();
        const summary = element.shadowRoot.querySelector('api-summary');
        assert.equal(summary.baseUri, element.baseUri, 'passes the baseUri');
        assert.isTrue(summary.anypoint, 'passes the anypoint');
      });

      it('passes all properties to the security element', async () => {
        store.amf = demoModel;
        const security = loader.getSecurity(demoModel, 'digest');
        const element = await basicFixture(security.id, 'security');
        element.anypoint = true;
        await nextFrame();
        const node = element.shadowRoot.querySelector('api-security-document');
        assert.equal(node.domainId, security.id, 'passes the security domainModel');
        assert.isTrue(node.anypoint, 'passes the anypoint');
      });

      it('passes all properties to the schema element', async () => {
        store.amf = demoModel;
        const shape = loader.getShape(demoModel, 'Unionable');
        const element = await basicFixture(shape.id, 'schema');
        element.anypoint = true;
        await nextFrame();
        const node = element.shadowRoot.querySelector('api-schema-document');
        assert.equal(node.domainId, shape.id, 'passes the schema domainModel');
        assert.isTrue(node.anypoint, 'passes the anypoint');
      });

      it('passes all properties to the documentation element', async () => {
        store.amf = demoModel;
        const doc = loader.getDocumentation(demoModel, 'Test doc');
        const element = await basicFixture(doc.id, 'documentation');
        element.anypoint = true;
        await nextFrame();
        const node = element.shadowRoot.querySelector('api-documentation-document');
        assert.equal(node.domainId, doc.id, 'passes the schema domainModel');
        assert.isTrue(node.anypoint, 'passes the anypoint');
      });

      it('passes properties to the resource element', async () => {
        store.amf = demoModel;
        const endpoint = loader.getEndpoint(demoModel, '/people')
        const element = await basicFixture(endpoint.id, 'resource');
        element.anypoint = true;
        element.redirectUri = 'https://rdr.api.com/';
        element.baseUri = 'https://base.com/';
        element.httpUrlEditor = true;
        element.tryItButton = true;
        await nextFrame();
        const node = element.shadowRoot.querySelector('api-resource-document');
        assert.equal(node.domainId, endpoint.id, 'passes the domainId');
        assert.isUndefined(node.operationId, 'does not set the operationId');
        assert.isTrue(node.anypoint, 'passes the anypoint');
        assert.equal(node.redirectUri, element.redirectUri, 'passes the redirectUri');
        assert.equal(node.baseUri, element.baseUri, 'passes the baseUri');
        assert.isTrue(node.httpUrlEditor, 'passes the httpUrlEditor');
        assert.isTrue(node.httpNoServerSelector, 'sets the httpNoServerSelector');
        assert.isTrue(node.tryItButton, 'sets the tryItButton');
      });

      it('passes properties to the resource element when an operation', async () => {
        store.amf = demoModel;
        const endpoint = loader.getEndpoint(demoModel, '/people');
        const [operation] = endpoint.operations;
        const element = await operationFixture(endpoint.id, operation.id);
        await nextFrame();
        const node = element.shadowRoot.querySelector('api-resource-document');
        assert.equal(node.operationId, operation.id, 'sets the operationId');
      });
    });

    describe('multi server API', () => {
      it('has the selector in the DOM', async () => {
        store.amf = multiServerModel;
        const endpoint = loader.getEndpoint(multiServerModel, '/default');
        const element = await operationFixture(endpoint.id, endpoint.operations[0].id);
        // Server's debouncer
        await aTimeout(2);

        const selector = element.shadowRoot.querySelector('api-server-selector');
        assert.ok(selector, 'has the selector');
        assert.isFalse(selector.hidden, 'the selector is not hidden');
      });

      it('does not render the selector when noServerSelector is set', async () => {
        store.amf = multiServerModel;
        const endpoint = loader.getEndpoint(multiServerModel, '/default');
        const element = await operationFixture(endpoint.id, endpoint.operations[0].id);
        // Server's debouncer
        await aTimeout(2);
        element.noServerSelector = true;
        await nextFrame();

        const selector = element.shadowRoot.querySelector('api-server-selector');
        assert.notOk(selector, 'has no selector');
      });

      it('passes the data to the selector', async () => {
        store.amf = multiServerModel;
        const endpoint = loader.getEndpoint(multiServerModel, '/default');
        const element = await basicFixture(endpoint.id, 'resource');
        // Server's debouncer
        await aTimeout(2);

        const selector = element.shadowRoot.querySelector('api-server-selector');
        assert.equal(selector.domainId, endpoint.id, 'sets the domainId property');
        assert.equal(selector.domainType, 'resource', 'sets the domainType property');
      });

      it('sets the serversCount property', async () => {
        store.amf = multiServerModel;
        const endpoint = loader.getEndpoint(multiServerModel, '/default');
        const element = await customServersFixture(endpoint.id, endpoint.operations[0].id);
        // Server's debouncer
        await aTimeout(2);

        assert.equal(element.serversCount, 6, 'has all servers');
      });

      it('sets the serverValue and serverType properties with the first available server', async () => {
        store.amf = demoModel;
        const endpoint = loader.getEndpoint(demoModel, '/people');
        const element = await customServersFixture(endpoint.id, endpoint.operations[0].id);
        // Server's debouncer
        await aTimeout(2);

        assert.equal(element.serverValue, 'http://{instance}.domain.com/');
        assert.equal(element.serverType, 'server');
      });

      it('passes the selected server information to the components', async () => {
        store.amf = demoModel;
        const endpoint = loader.getEndpoint(demoModel, '/people');
        const element = await customServersFixture(endpoint.id, endpoint.operations[0].id);
        // Server's debouncer
        await aTimeout(2);
        
        const selector = element.shadowRoot.querySelector('api-server-selector');
        assert.equal(selector.value, 'http://{instance}.domain.com/');
        assert.equal(selector.type, 'server');

        const resource = element.shadowRoot.querySelector('api-resource-document');
        assert.equal(resource.serverValue, 'http://{instance}.domain.com/');
        assert.equal(resource.serverType, 'server');
      });

      it('does not change the baseUri property', async () => {
        store.amf = demoModel;
        const endpoint = loader.getEndpoint(demoModel, '/people');
        const element = await customServersFixture(endpoint.id, endpoint.operations[0].id);
        // Server's debouncer
        await aTimeout(2);

        assert.isUndefined(element.baseUri);
      });

      it('hides the server selector when has less than 2 servers', async () => {
        store.amf = demoModel;
        const endpoint = loader.getEndpoint(demoModel, '/people');
        const element = await operationFixture(endpoint.id, endpoint.operations[0].id);
        // Server's debouncer
        await aTimeout(2);

        assert.equal(element.serversCount, 1, 'has a single server');

        const selector = element.shadowRoot.querySelector('api-server-selector');
        assert.isTrue(selector.hidden, 'the selector is hidden');
      });

      it('renders the server selector when has allowCustomBaseUri', async () => {
        store.amf = demoModel;
        const endpoint = loader.getEndpoint(demoModel, '/people');
        const element = await operationFixture(endpoint.id, endpoint.operations[0].id);
        // Server's debouncer
        await aTimeout(2);
        
        element.allowCustomBaseUri = true;
        await nextFrame();

        const selector = element.shadowRoot.querySelector('api-server-selector');
        assert.isFalse(selector.hidden, 'the selector is not hidden');
      });

      it('selects an extra server from the server event', async () => {
        store.amf = multiServerModel;
        const endpoint = loader.getEndpoint(multiServerModel, '/default');
        const element = await customServersFixture(endpoint.id, endpoint.operations[0].id);
        // Server's debouncer
        await aTimeout(2);

        const selector = element.shadowRoot.querySelector('api-server-selector');
        const url = 'http://customServer.com';
        ServerEvents.serverChange(selector, url, 'extra');
        await nextFrame();
        
        assert.equal(element.serverValue, 'http://customServer.com');
        assert.equal(element.serverType, 'extra');
      });

      it('selects a custom server from the server event', async () => {
        store.amf = multiServerModel;
        const endpoint = loader.getEndpoint(multiServerModel, '/default');
        const element = await customServersFixture(endpoint.id, endpoint.operations[0].id);
        // Server's debouncer
        await aTimeout(2);

        const selector = element.shadowRoot.querySelector('api-server-selector');
        const url = 'https://www.google.com';
        ServerEvents.serverChange(selector, url, 'custom');
        await nextFrame();
        
        assert.equal(element.serverValue, 'https://www.google.com');
        assert.equal(element.serverType, 'custom');
      });

      it('hides the selector wien navigating to another graph type', async () => {
        store.amf = multiServerModel;
        const endpoint = loader.getEndpoint(multiServerModel, '/default');
        const element = await customServersFixture(endpoint.id, endpoint.operations[0].id);
        // Server's debouncer
        await aTimeout(2);

        const shape = loader.getShape(multiServerModel, 'Pets');
        element.domainId = shape.id;
        element.domainType = 'schema';
        await nextFrame();

        const selector = element.shadowRoot.querySelector('api-server-selector');
        assert.isTrue(selector.hidden);
      });
    });

    describe('API library processing', () => {
      it('renders a type from a library', async () => {
        store.amf = libraryFragmentModel;
        const type = loader.getShape(libraryFragmentModel, 'myType');
        const element = await basicFixture(type.id, 'schema');
        element.anypoint = true;
        await nextFrame();

        const node = element.shadowRoot.querySelector('api-schema-document');
        assert.ok(node, 'schema is rendered');
        assert.equal(node.domainId, type.id, 'domainId is set');
        assert.isTrue(node.anypoint, 'anypoint is set');
        
        const mimeSelector = element.shadowRoot.querySelector('.media-type-selector');
        assert.notOk(mimeSelector, 'has no media type selector')
      });

      it('renders a security from a library', async () => {
        store.amf = libraryFragmentModel;
        const security = loader.getSecurity(libraryFragmentModel, 'OAuth1');
        const element = await basicFixture(security.id, 'security');
        element.anypoint = true;
        await nextFrame();

        const node = element.shadowRoot.querySelector('api-security-document');
        assert.ok(node, 'security is rendered');
        assert.equal(node.domainId, security.id, 'domainId is set');
        assert.isTrue(node.anypoint, 'anypoint is set');
      });
    });

    describe('Security fragment processing', () => {
      it('renders a security from a fragment', async () => {
        store.amf = securityFragmentModel;
        const element = await basicFixture();
        await aTimeout(2);
        const security = loader.lookupEncodes(securityFragmentModel);
        const node = element.shadowRoot.querySelector('api-security-document');
        assert.ok(node, 'security is rendered');
        
        assert.equal(node.securityScheme.id, security['@id'], 'domainId is set');
      });
    });

    describe('Documentation fragment processing', () => {
      it('renders a documentation from a fragment', async () => {
        store.amf = documentationFragmentModel;
        const element = await basicFixture();
        const docs = loader.lookupEncodes(documentationFragmentModel);

        const node = element.shadowRoot.querySelector('api-documentation-document');
        assert.ok(node, 'the documentation is rendered');
        assert.equal(node.domainId, docs['@id'], 'domainId is set');
      });
    });

    describe('Type fragment processing', () => {
      it('renders a type from a fragment', async () => {
        store.amf = typeFragmentModel;
        const element = await basicFixture();
        const schema = loader.lookupEncodes(typeFragmentModel);

        const node = element.shadowRoot.querySelector('api-schema-document');
        assert.equal(node.domainId, schema['@id'], 'domainId is set');
      });
    });

    describe('APIC-711: Rendering of a library', () => {
      /** @type ApiDocumentationElement */
      let element;
      /** @type AmfDocument */
      let libraryAmf;

      before(async () => {
        libraryAmf = await loader.getGraph('APIC-711');
      });

      it('should reset the state when switching to a library', async () => {
        store.amf = demoModel;
        element = await basicFixture('summary', 'summary');
        store.amf = libraryAmf;
        await aTimeout(2);
        assert.equal(element.documentMeta.isLibrary, true);
      });
    });

    describe('APIC-390: API library processing', () => {
      /** @type AmfDocument */
      let model;

      beforeEach(async () => {
        model = await loader.getGraph('APIC-390');
        store.amf = model;
      });

      it('renders SiteId type defined in library', async () => {
        const shape = loader.getShape(model, 'SiteId');
        const element = await basicFixture(shape.id, 'schema');
        const node = element.shadowRoot.querySelector('api-schema-document');

        assert.ok(node, 'the schema is rendered');
        assert.equal(node.domainId, shape.id, 'schema model is set');
      });

      it('renders Language type defined in uses node in library', async () => {
        const shape = loader.getShape(model, 'LocaleCode');
        const element = await basicFixture(shape.id, 'schema');
        const node = element.shadowRoot.querySelector('api-schema-document');

        assert.ok(node, 'the schema is rendered');
        assert.equal(node.domainId, shape.id, 'schema model is set');
      });
    });

    describe('navigation events', () => {
      before(async () => {
        store.amf = demoModel;
      });

      it('changes selection when event occurs', async () => {
        const element = await navigationFixture();
        assert.isTrue(element.handleNavigationEvents, 'getter returns the value');

        const ep = loader.getEndpoint(demoModel, '/people');
        NavigationEvents.apiNavigate(document.body, ep.id, 'operation', ep.operations[0].id);
        await nextFrame();
        
        const node = element.shadowRoot.querySelector('api-resource-document');
        assert.ok(node, 'the operation is rendered');
      });
  
      it('ignores the passive navigation', async () => {
        const element = await navigationFixture();

        const ep = loader.getEndpoint(demoModel, '/people');
        NavigationEvents.apiNavigate(document.body, ep.id, 'operation', ep.operations[0].id, true);
        await nextFrame();

        const node = element.shadowRoot.querySelector('api-resource-document');
        assert.notOk(node, 'the resource is not rendered');
      });
  
      it('removes the listener when changing state', async () => {
        const element = await navigationFixture();
        element.handleNavigationEvents = false;

        const ep = loader.getEndpoint(demoModel, '/people');
        NavigationEvents.apiNavigate(document.body, ep.id, 'operation', ep.operations[0].id);
        await nextFrame();
        
        const node = element.shadowRoot.querySelector('api-resource-document');
        assert.notOk(node, 'the resource is not rendered');
      });
    });

    //
    // The docs render the media selector for the schema only when the API 
    // has accepted mime types defined on it. The selector is rendered when the API
    // has at least 2 accepted mime types defined. Otherwise it takes the only option or none
    // and passes it to the schema document.
    //
    describe('shape media type selector', () => {
      it('renders the schema media type selector', async () => {
        store.amf = demoModel;
        const shape = loader.getShape(demoModel, 'ErrorResource');
        const element = await basicFixture(shape.id, 'schema');
        const node = element.shadowRoot.querySelector('.media-type-selector');
        assert.ok(node, 'has the media type selector')
      });

      it('does not render the selector when no enough mime types for the API', async () => {
        store.amf = appianApiModel;
        const shape = loader.getShape(appianApiModel, 'ProcessModel');
        const element = await basicFixture(shape.id, 'schema');
        const node = element.shadowRoot.querySelector('.media-type-selector');
        assert.notOk(node, 'has no media type selector')
      });

      it('renders all API accept options', async () => {
        store.amf = demoModel;
        const shape = loader.getShape(demoModel, 'ErrorResource');
        const element = await basicFixture(shape.id, 'schema');
        const selector = element.shadowRoot.querySelector('.media-type-selector');
        const buttons = selector.querySelectorAll('anypoint-radio-button');
        assert.lengthOf(buttons, 2, 'has two media type options');

        assert.equal(buttons[0].textContent.trim(), 'application/json');
        assert.equal(buttons[1].textContent.trim(), 'application/xml');
      });

      it('changes the selection of the schema media type', async () => {
        store.amf = demoModel;
        const shape = loader.getShape(demoModel, 'ErrorResource');
        const element = await basicFixture(shape.id, 'schema');
        const selector = element.shadowRoot.querySelector('.media-type-selector');
        const buttons = selector.querySelectorAll('anypoint-radio-button');
        buttons[1].click();
        assert.equal(element.schemaMimeType, 'application/xml', 'sets the schemaMimeType');
        await nextFrame();

        const node = element.shadowRoot.querySelector('api-schema-document');
        assert.equal(node.mimeType, 'application/xml', 'passes the mime type selection to the element');
      });

      it('cleans up the schema mime type when AMF change', async () => {
        store.amf = demoModel;
        const shape = loader.getShape(demoModel, 'ErrorResource');
        const element = await basicFixture(shape.id, 'schema');
        const selector = element.shadowRoot.querySelector('.media-type-selector');
        const buttons = selector.querySelectorAll('anypoint-radio-button');
        buttons[1].click();
        assert.equal(element.schemaMimeType, 'application/xml', 'sets the schemaMimeType');
        
        store.amf = libraryFragmentModel;
        await aTimeout(2);
        assert.isUndefined(element.schemaMimeType);
      });
    });
  });
});
