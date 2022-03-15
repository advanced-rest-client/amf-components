import { fixture, assert, nextFrame, html, aTimeout, oneEvent } from '@open-wc/testing';
import sinon from 'sinon';
import { AmfLoader } from '../AmfLoader.js';
import { DomEventsAmfStore } from '../../src/store/DomEventsAmfStore.js';
import { EventTypes } from '../../src/events/EventTypes.js';
import { 
  openedEndpointsValue,
  documentMetaValue,
  queryApi,
  sourceEndpointsValue,
  endpointsValue,
  queryEndpoints,
  documentationsValue,
  queryDocumentations,
  schemasValue,
  querySchemas,
  securityValue,
  querySecurity,
  shiftTabPressedValue,
  focusedItemValue,
  computeEndpointPaddingLeft,
  computeOperationPaddingValue,
  computeOperationPaddingLeft,
  itemsValue,
} from '../../src/elements/ApiNavigationElement.js';
import '../../define/api-navigation.js';

/** @typedef {import('../../').ApiNavigationElement} ApiNavigationElement */
/** @typedef {import('../../src/helpers/amf').AmfDocument} AmfDocument */
/** @typedef {import('../../src/types').NavigationLayout} NavigationLayout */
/** @typedef {import('@anypoint-web-components/awc').AnypointCollapseElement} AnypointCollapseElement */

describe('ApiNavigationElement', () => {
  const loader = new AmfLoader();
  const store = new DomEventsAmfStore(window);
  store.listen();

  /**
   * @returns {Promise<ApiNavigationElement>}
   */
  async function basicFixture() {
    const element = await fixture(html`<api-navigation></api-navigation>`);
    await aTimeout(1);
    return /** @type ApiNavigationElement */ (element);
  }

  /**
   * @returns {Promise<ApiNavigationElement>}
   */
  async function summaryFixture() {
    const element = await fixture(html`<api-navigation summary></api-navigation>`);
    await aTimeout(1);
    return /** @type ApiNavigationElement */ (element);
  }

  /**
   * @param {string} domainId
   * @returns {Promise<ApiNavigationElement>}
   */
  async function preselectedFixture(domainId) {
    const element = await fixture(
      html`<api-navigation summary .domainId="${domainId}"></api-navigation>`
    );
    await aTimeout(1);
    return /** @type ApiNavigationElement */ (element);
  }

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

  /**
   * @returns {Promise<ApiNavigationElement>}
   */
  async function noSortingFixture() {
    const elm = /** @type ApiNavigationElement */ (await fixture(html`
      <api-navigation 
        endpointsOpened
        documentationsOpened
        schemasOpened
        securityOpened></api-navigation>
    `));
    await oneEvent(elm, 'graphload');
    await nextFrame();
    return elm;
  }

  /**
   * @returns {Promise<ApiNavigationElement>}
   */
  async function manualFixture() {
    return fixture(html`<api-navigation manualQuery></api-navigation>`);
  }

  /**
   * @param {NavigationLayout} layout
   * @returns {Promise<ApiNavigationElement>}
   */
  async function layoutFixture(layout) {
    const elm = /** @type ApiNavigationElement */ (await fixture(html`<api-navigation 
      endpointsOpened
      documentationsOpened
      schemasOpened
      securityOpened
      layout="${layout}"></api-navigation>`));
    await oneEvent(elm, 'graphload');
    await nextFrame();
    return elm;
  }

  describe('Super basics - without model', () => {
    /** @type ApiNavigationElement */
    let element;

    before(async () => {
      element = await basicFixture();
      await nextFrame();
    });

    it('summaryRendered is false without an API', () => {
      assert.isFalse(element.summaryRendered);
    });

    it('summary is not rendered', () => {
      const panel = element.shadowRoot.querySelector('.summary');
      assert.notOk(panel);
    });

    it('documentation is not rendered', () => {
      const panel = element.shadowRoot.querySelector('.documentation');
      assert.notOk(panel);
    });

    it('schemas is not rendered', () => {
      const panel = element.shadowRoot.querySelector('.schemas');
      assert.notOk(panel);
    });

    it('security is not rendered', () => {
      const panel = element.shadowRoot.querySelector('.security');
      assert.notOk(panel);
    });

    it('endpoints is not rendered', () => {
      const panel = element.shadowRoot.querySelector('.endpoints');
      assert.notOk(panel);
    });
  });

  describe('Summary', () => {
    /** @type ApiNavigationElement */
    let element;
    beforeEach(async () => {
      element = await summaryFixture();
      await nextFrame();
    });

    it('the summary entry is rendered', () => {
      const panel = element.shadowRoot.querySelector('.summary');
      assert.ok(panel);
    });

    it('changes selection when clicking on summary', () => {
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('.list-item.summary'));
      node.click();
      assert.equal(element.domainId, 'summary');
      assert.equal(element.domainType, 'summary');
    });
  });

  describe('[computeEndpointPaddingLeft]()', () => {
    let element = /** @type ApiNavigationElement */ (null);
    beforeEach(async () => { element = await basicFixture() });

    it('returns the default padding', () => {
      const result = element[computeEndpointPaddingLeft]();
      assert.equal(result, 16);
    });

    it('returns value for a single value padding', () => {
      element.style.setProperty('--api-navigation-list-item-padding', '5px');
      const result = element[computeEndpointPaddingLeft]();
      assert.equal(result, 5);
    });

    it('returns value for a double padding value', () => {
      element.style.setProperty(
        '--api-navigation-list-item-padding',
        '5px 10px'
      );
      const result = element[computeEndpointPaddingLeft]();
      assert.equal(result, 10);
    });

    it('returns value for a triple padding value', () => {
      element.style.setProperty(
        '--api-navigation-list-item-padding',
        '5px 10px 15px'
      );
      const result = element[computeEndpointPaddingLeft]();
      assert.equal(result, 10);
    });

    it('returns value for a full padding value', () => {
      element.style.setProperty(
        '--api-navigation-list-item-padding',
        '5px 10px 15px 20px'
      );
      const result = element[computeEndpointPaddingLeft]();
      assert.equal(result, 20);
    });
  });

  describe('[computeOperationPaddingValue]()', () => {
    let element = /** @type ApiNavigationElement */ (null);
    beforeEach(async () => { element = await basicFixture() });

    it('returns value when "indent" not set', () => {
      element.indentSize = 0;
      const result = element[computeOperationPaddingValue](0);
      assert.equal(result, '56px');
    });

    it('returns value when "indentSize" not set', () => {
      element.indentSize = 0;
      const result = element[computeOperationPaddingValue](1);
      assert.equal(result, '56px');
    });

    it('returns value when indent size is set', () => {
      element.indentSize = 12;
      const result = element[computeOperationPaddingValue](2);
      assert.equal(result, '80px');
    });
  });

  describe('[computeOperationPaddingLeft]()', () => {
    let element = /** @type ApiNavigationElement */ (null);
    beforeEach(async () => { element = await basicFixture() });

    it('Computes default padding', () => {
      const result = element[computeOperationPaddingLeft]();
      assert.equal(result, 24);
    });

    it('Computes padding from css property', () => {
      element.style.setProperty(
        '--api-navigation-operation-item-padding-left',
        '5px'
      );
      const result = element[computeOperationPaddingLeft]();
      assert.equal(result, 5);
    });
  });

  describe('queryGraph()', () => {
    let element = /** @type ApiNavigationElement */ (null);
    beforeEach(async () => { element = await manualFixture() });

    it('sets the [queryingValue] property', async () => {
      const p = element.queryGraph();
      assert.isTrue(element.querying);
      await p;
    });

    it('clears the [itemsValue] property', async () => {
      element[itemsValue] = [];
      const p = element.queryGraph();
      assert.isUndefined(element[itemsValue]);
      await p;
    });

    it('sets the [abortControllerValue] property', async () => {
      const p = element.queryGraph();
      assert.ok(element.abortController);
      await p;
    });
    
    it('clears the [abortControllerValue] property after the query', async () => {
      await element.queryGraph();
      assert.isUndefined(element.abortController);
    });
    
    it('clears the [queryingValue] property after the query', async () => {
      await element.queryGraph();
      assert.isFalse(element.querying);
    });
    
    it('clears the [openedEndpointsValue] property after the query', async () => {
      element[openedEndpointsValue] = ['test'];
      await element.queryGraph();
      assert.deepEqual(element[openedEndpointsValue], []);
    });
  });

  describe('API model', () => {
    /** @type AmfDocument */
    let demoModel;
    /** @type AmfDocument */
    let extDocsModel;
    /** @type AmfDocument */
    let rearrangeModel;
    /** @type AmfDocument */
    let streetlightsModel;
    /** @type AmfDocument */
    let asyncModel;

    before(async () => {
      demoModel = await loader.getGraph();
      extDocsModel = await loader.getGraph('ext-docs');
      rearrangeModel = await loader.getGraph('rearrange-api');
      streetlightsModel = await loader.getGraph('streetlights2');
      asyncModel = await loader.getGraph('async-api');
    });

    describe('Docs', () => {
      it('computes the #hasDocs', async () => {
        store.amf = demoModel;
        const element = await summaryFixture();
        assert.isTrue(element.hasDocs);
      });
  
      it('renders the documentation', async () => {
        store.amf = demoModel;
        const element = await summaryFixture();
        const panel = element.shadowRoot.querySelector('.documentation');
        assert.ok(panel);
      });
  
      it('has a selection on the preselected item', async () => {
        store.amf = demoModel;
        const doc = loader.getDocumentation(demoModel, 'Test doc');
        const element = await preselectedFixture(doc.id);
        const selector = `[data-graph-shape="documentation"][data-graph-id="${doc.id}"]`;
        const panel = element.shadowRoot.querySelector(selector);
        assert.ok(panel);
      });
  
      it('changes selection when clicking on an item', async () => {
        store.amf = demoModel;
        const element = await summaryFixture();
        const node = /** @type NodeListOf<HTMLElement> */ (element.shadowRoot.querySelectorAll('[data-graph-shape="documentation"]'))[0];
        node.click();
        const doc = loader.getDocumentation(demoModel, 'Test doc');
        assert.equal(element.domainId, doc.id);
        assert.equal(element.domainType, 'documentation');
      });

      it('renders the external link', async () => {
        store.amf = extDocsModel;
        const element = await summaryFixture();
        const link = /** @type HTMLAnchorElement */ (element.shadowRoot.querySelector('a.documentation'));
        assert.ok(link, 'has the link');
        assert.equal(link.href, 'https://example.com/', 'has the URL');
        assert.equal(link.textContent.trim(), 'Docs', 'has the label');
      });
    });

    describe('Section data rendering', () => {
      let element = /** @type ApiNavigationElement */ (null);
      before(async () => { 
        store.amf = demoModel;
        element = await dataFixture();
      });

      it('has the summary', () => {
        const node = element.shadowRoot.querySelector('.summary');
        assert.ok(node);
      });
  
      it('has the endpoints', () => {
        const panel = element.shadowRoot.querySelector('.endpoints');
        assert.ok(panel);
      });

      it('endpoints are opened', () => {
        const panel = /** @type AnypointCollapseElement */ (element.shadowRoot.querySelector('.endpoints anypoint-collapse'));
        assert.isTrue(panel.opened);
      });

      it('renders endpoints list', () => {
        const items = element.shadowRoot.querySelectorAll('.endpoints .list-item.endpoint');
        // note, when the demo-api change the list of endpoints, update this value.
        assert.lengthOf(items, 72);
      });

      it('has endpoints title for a web API', () => {
        const titleElm = element.shadowRoot.querySelector('.endpoints .title-h3');
        const content = titleElm.textContent.trim();
        assert.equal(content, 'Endpoints');
      });

      it('has the operations toggle button', () => {
        const item = element.shadowRoot.querySelector('.endpoint[data-path="/arrayBody"] .toggle-button.endpoint');
        assert.ok(item);
      });

      it('has no operations toggle button when no operations', () => {
        const item = element.shadowRoot.querySelector('.endpoint[data-path="/orgs"] .toggle-button.endpoint');
        assert.notOk(item, 'has no toggle button');
        const mock = element.shadowRoot.querySelector('.endpoint[data-path="/orgs"] .endpoint-toggle-mock');
        assert.ok(mock, 'has the mock container');
      });

      it('operations are not rendered', () => {
        const item = element.shadowRoot.querySelector('.endpoints .list-item.endpoint');
        const collapse = /** @type AnypointCollapseElement */ (item.nextElementSibling);
        assert.isFalse(collapse.opened);
      });

      it('has the documentations', () => {
        const panel = element.shadowRoot.querySelector('.documentation');
        assert.ok(panel);
      });

      it('opens the documentations section', () => {
        const panel = /** @type AnypointCollapseElement */ (element.shadowRoot.querySelector('.documentation anypoint-collapse'));
        assert.isTrue(panel.opened);
      });

      it('has the documentation items', () => {
        const items = element.shadowRoot.querySelectorAll('.documentation .list-item');
        assert.lengthOf(items, 1);
      });

      it('has the schemas', () => {
        const panel = element.shadowRoot.querySelector('.schemas');
        assert.ok(panel);
      });
      
      it('opens the schemas section', () => {
        const panel = /** @type AnypointCollapseElement */ (element.shadowRoot.querySelector('.schemas anypoint-collapse'));
        assert.isTrue(panel.opened);
      });

      it('has the schemas items', () => {
        const items = element.shadowRoot.querySelectorAll('.schemas .list-item');
        // note, when the demo-api change the list of schemas, update this value.
        assert.lengthOf(items, 42);
      });

      it('has the security', () => {
        const panel = element.shadowRoot.querySelector('.security');
        assert.ok(panel);
      });

      it('opens the security section', () => {
        const panel = /** @type AnypointCollapseElement */ (element.shadowRoot.querySelector('.security anypoint-collapse'));
        assert.isTrue(panel.opened);
      });

      it('has the security items', () => {
        const items = element.shadowRoot.querySelectorAll('.security .list-item');
        // note, when the demo-api change the list of security schemes, update this value.
        assert.lengthOf(items, 23);
      });
    });

    describe('Toggling list items', () => {
      let element = /** @type ApiNavigationElement */ (null);
      beforeEach(async () => {
        store.amf = demoModel;
        element = await dataFixture();
      });

      it('toggles operations list', async () => {
        const button = /** @type HTMLElement */ (element.shadowRoot.querySelector('.endpoint[data-path="/arrayBody"] .toggle-button.endpoint'));
        button.click();
        await nextFrame();
        assert.deepEqual(element[openedEndpointsValue], [button.dataset.graphId], 'adds endpoint item to [openedEndpointsValue]');
        const collapse = /** @type AnypointCollapseElement */ (button.parentElement.nextElementSibling);
        assert.isTrue(collapse.opened, 'the children collapse is opened');
      });

      it('toggles back operations list', async () => {
        const button = /** @type HTMLElement */ (element.shadowRoot.querySelector('.endpoint[data-path="/arrayBody"] .toggle-button.endpoint'));
        button.click();
        await nextFrame();
        button.click();
        await nextFrame();
        assert.deepEqual(element[openedEndpointsValue], [], 'removes the endpoint from [openedEndpointsValue]');
        const collapse = /** @type AnypointCollapseElement */ (button.parentElement.nextElementSibling);
        assert.isFalse(collapse.opened, 'the children collapse is closed');
      });

      it('does not select an item when toggling operations', async () => {
        const button = /** @type HTMLElement */ (element.shadowRoot.querySelector('.endpoint[data-path="/arrayBody"] .toggle-button.endpoint'));
        button.click();
        await nextFrame();
        assert.isUndefined(element.domainId);
      });

      it('toggles endpoints section', async () => {
        const title = /** @type HTMLElement */ (element.shadowRoot.querySelector('.endpoints .section-title'));
        title.click();
        await nextFrame();
        // it is initially opened
        assert.isFalse(element.endpointsOpened, 'endpointsOpened is updated');
        const collapse = /** @type AnypointCollapseElement */ (title.nextElementSibling);
        assert.isFalse(collapse.opened, 'collapse is closed')
      });

      it('toggles documentations section', async () => {
        const title = /** @type HTMLElement */ (element.shadowRoot.querySelector('.documentation .section-title'));
        title.click();
        await nextFrame();
        // it is initially opened
        assert.isFalse(element.documentationsOpened, 'documentationsOpened is updated');
        const collapse = /** @type AnypointCollapseElement */ (title.nextElementSibling);
        assert.isFalse(collapse.opened, 'collapse is closed')
      });

      it('toggles schemas section', async () => {
        const title = /** @type HTMLElement */ (element.shadowRoot.querySelector('.schemas .section-title'));
        title.click();
        await nextFrame();
        // it is initially opened
        assert.isFalse(element.schemasOpened, 'schemasOpened is updated');
        const collapse = /** @type AnypointCollapseElement */ (title.nextElementSibling);
        assert.isFalse(collapse.opened, 'collapse is closed')
      });

      it('toggles security section', async () => {
        const title = /** @type HTMLElement */ (element.shadowRoot.querySelector('.security .section-title'));
        title.click();
        await nextFrame();
        // it is initially opened
        assert.isFalse(element.securityOpened, 'securityOpened is updated');
        const collapse = /** @type AnypointCollapseElement */ (title.nextElementSibling);
        assert.isFalse(collapse.opened, 'collapse is closed')
      });
    });

    describe('Selecting items', () => {
      let element = /** @type ApiNavigationElement */ (null);
      beforeEach(async () => { 
        store.amf = demoModel;
        element = await dataFixture() 
      });

      it('selects the summary', async () => {
        const item = /** @type HTMLElement */ (element.shadowRoot.querySelector('.list-item.summary'));
        item.click();
        await nextFrame();
        assert.equal(element.domainId, 'summary', 'domainId is set');
        assert.equal(element.domainType, 'summary', 'domainType is set');
        assert.isTrue(element.selectedItem === item, 'selectedItem is set');
        assert.isTrue(item.classList.contains('selected'), 'the list item has the selected class');
      });

      it('selects an endpoint', async () => {
        const item = /** @type HTMLElement */ (element.shadowRoot.querySelector('.endpoint[data-path="/people"]'));
        item.click();
        await nextFrame();
        assert.equal(element.domainId, item.dataset.graphId, 'domainId is set');
        assert.equal(element.domainType, 'resource', 'domainType is set');
        assert.isTrue(element.selectedItem === item, 'selectedItem is set');
        assert.isTrue(item.classList.contains('selected'), 'the list item has the selected class');
      });

      it('selects an operation', async () => {
        const endpoint = /** @type HTMLElement */ (element.shadowRoot.querySelector('.endpoint[data-path="/people"]'));
        const collapse = /** @type AnypointCollapseElement */ (endpoint.nextElementSibling);
        const item = /** @type HTMLElement */ (collapse.querySelector('.list-item.operation'));
        item.click();
        await nextFrame();
        assert.equal(element.domainId, item.dataset.graphId, 'domainId is set');
        assert.equal(element.domainType, 'operation', 'domainType is set');
        assert.isTrue(element.selectedItem === item, 'selectedItem is set');
        assert.isTrue(item.classList.contains('selected'), 'the list item has the selected class');
      });

      it('selects a documentation', async () => {
        const item = /** @type HTMLElement */ (element.shadowRoot.querySelector('.documentation anypoint-collapse .list-item'));
        item.click();
        await nextFrame();
        assert.equal(element.domainId, item.dataset.graphId, 'domainId is set');
        assert.equal(element.domainType, 'documentation', 'domainType is set');
        assert.isTrue(element.selectedItem === item, 'selectedItem is set');
        assert.isTrue(item.classList.contains('selected'), 'the list item has the selected class');
      });

      it('selects a schema', async () => {
        const item = /** @type HTMLElement */ (element.shadowRoot.querySelector('.schemas anypoint-collapse .list-item'));
        item.click();
        await nextFrame();
        assert.equal(element.domainId, item.dataset.graphId, 'domainId is set');
        assert.equal(element.domainType, 'schema', 'domainType is set');
        assert.isTrue(element.selectedItem === item, 'selectedItem is set');
        assert.isTrue(item.classList.contains('selected'), 'the list item has the selected class');
      });

      it('selects a security', async () => {
        const item = /** @type HTMLElement */ (element.shadowRoot.querySelector('.security anypoint-collapse .list-item'));
        item.click();
        await nextFrame();
        assert.equal(element.domainId, item.dataset.graphId, 'domainId is set');
        assert.equal(element.domainType, 'security', 'domainType is set');
        assert.isTrue(element.selectedItem === item, 'selectedItem is set');
        assert.isTrue(item.classList.contains('selected'), 'the list item has the selected class');
      });

      it('deselects previously selected item', async () => {
        const security = /** @type HTMLElement */ (element.shadowRoot.querySelector('.security anypoint-collapse .list-item'));
        security.click();
        await nextFrame();
        const schema = /** @type HTMLElement */ (element.shadowRoot.querySelector('.schemas anypoint-collapse .list-item'));
        schema.click();
        await nextFrame();
        assert.isFalse(security.classList.contains('selected'));
      });
    });

    describe('select()', () => {
      let element = /** @type ApiNavigationElement */ (null);
      beforeEach(async () => { 
        store.amf = demoModel;
        element = await dataFixture() 
      });

      it('selects an item via the "select()" method', async () => {
        const security = /** @type HTMLElement */ (element.shadowRoot.querySelector('.security anypoint-collapse .list-item'));
        const { graphId } = security.dataset;
        element.select(graphId);
        await nextFrame();
        assert.equal(element.domainId, graphId, 'domainId is set');
        assert.isTrue(security.classList.contains('selected'), 'the list item has the selected class');
      });

      it('ignores selection when no argument', async () => {
        element.select(undefined);
        await nextFrame();
        assert.equal(element.domainId, undefined);
      });

      it('ignores selection when no menu item', async () => {
        element.select('some');
        await nextFrame();
        assert.equal(element.domainId, undefined);
      });
    });

    describe('Filtering', () => {
      let element = /** @type ApiNavigationElement */ (null);
      beforeEach(async () => { 
        store.amf = demoModel;
        element = await dataFixture() 
      });

      it('queries endpoints', async () => {
        element.query = '/orgs';
        await nextFrame();
        const items = element.shadowRoot.querySelectorAll('.list-item.endpoint');
        assert.lengthOf(items, 3, 'has only endpoints with /orgs path');
      });

      it('queries operations', async () => {
        element.query = 'remove a person';
        await nextFrame();
        const items = element.shadowRoot.querySelectorAll('.list-item.endpoint');
        assert.lengthOf(items, 1, 'has only the /people/{personId} endpoint');
        const collapse = items[0].nextElementSibling;
        const ops = collapse.querySelectorAll('.list-item.operation');
        assert.lengthOf(ops, 1, 'has only the DELETE operation');
      });

      it('queries documentation', async () => {
        element.query = 'Test';
        await nextFrame();
        const items = element.shadowRoot.querySelectorAll('.list-item.documentation');
        assert.lengthOf(items, 1, 'has the only documentation');
      });

      it('queries schemas', async () => {
        element.query = 'error';
        await nextFrame();
        const items = element.shadowRoot.querySelectorAll('.list-item.schema');
        assert.lengthOf(items, 1, 'has only the ErrorResource schema');
      });

      it('queries security', async () => {
        element.query = 'oAuth';
        await nextFrame();
        const items = element.shadowRoot.querySelectorAll('.list-item.security');
        assert.lengthOf(items, 14, 'has only the OAuth2.0 security');
      });

      it('Filters from the search input (search event)', async () => {
        const input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('.filter-wrapper input'));
        input.value = 'oAuth';
        input.dispatchEvent(new Event('search'));
        await nextFrame();
        const items = element.shadowRoot.querySelectorAll('.list-item.security');
        assert.lengthOf(items, 14, 'has only the OAuth2.0 security');
      });

      it('Filters from the search input (change event)', async () => {
        const input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('.filter-wrapper input'));
        input.value = 'oAuth';
        input.dispatchEvent(new Event('change'));
        await nextFrame();
        const items = element.shadowRoot.querySelectorAll('.list-item.security');
        assert.lengthOf(items, 14, 'has only the OAuth2.0 security');
      });

      it('clears the filtered results when removing the input value', async () => {
        const input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('.filter-wrapper input'));
        input.value = 'oAuth';
        input.dispatchEvent(new Event('change'));
        await nextFrame();
        input.value = '';
        input.dispatchEvent(new Event('change'));
        await nextFrame();
        const items = element.shadowRoot.querySelectorAll('.list-item.security');
        assert.lengthOf(items, 23, 'has all security');
      });
    });

    describe('querying API data', () => {
      let element = /** @type ApiNavigationElement */ (null);
      beforeEach(async () => { 
        store.amf = demoModel;
        element = await noSortingFixture(); 
      });

      it('sets the documentMeta', async () => {
        element[documentMetaValue] = undefined;
        const ctrl = new AbortController();
        await element[queryApi](ctrl.signal);
        assert.typeOf(element.documentMeta, 'object');
      });

      it('ignores setting values when signal aborted', async () => {
        element[documentMetaValue] = undefined;
        const ctrl = new AbortController();
        const p = element[queryApi](ctrl.signal);
        ctrl.abort();
        await p;
        assert.isUndefined(element.documentMeta);
      });

      it('dispatches error event when query error', async () => {
        element.addEventListener(EventTypes.Api.documentMeta, 
          /**
           * @param {CustomEvent} e 
           */
          function f(e) {
            element.removeEventListener(EventTypes.Api.documentMeta, f);
            e.stopPropagation();
            e.preventDefault();
            e.detail.result = Promise.reject(new Error('test'));
          });
        const spy = sinon.spy();
        element.addEventListener(EventTypes.Reporting.error, spy);
        const ctrl = new AbortController();
        await element[queryApi](ctrl.signal);
        assert.isTrue(spy.called);
      });
    });

    describe('querying endpoints data', () => {
      let element = /** @type ApiNavigationElement */ (null);
      beforeEach(async () => { 
        store.amf = demoModel;
        element = await noSortingFixture(); 
      });

      it('sets the [sourceEndpointsValue]', async () => {
        element[sourceEndpointsValue] = undefined;
        const ctrl = new AbortController();
        await element[queryEndpoints](ctrl.signal);
        assert.typeOf(element[sourceEndpointsValue], 'array');
      });

      it('ignores setting values when signal aborted', async () => {
        element[sourceEndpointsValue] = undefined;
        const ctrl = new AbortController();
        const p = element[queryEndpoints](ctrl.signal);
        ctrl.abort();
        await p;
        assert.isUndefined(element[sourceEndpointsValue]);
      });

      it('ignores setting values when signal aborted (pre-execution)', async () => {
        element[sourceEndpointsValue] = undefined;
        const ctrl = new AbortController();
        ctrl.abort();
        await element[queryEndpoints](ctrl.signal);
        assert.isUndefined(element[sourceEndpointsValue]);
      });

      it('dispatches error event when query error', async () => {
        element.addEventListener(EventTypes.Endpoint.list, 
          /**
           * @param {CustomEvent} e 
           */
          function f(e) {
            element.removeEventListener(EventTypes.Endpoint.list, f);
            e.stopPropagation();
            e.preventDefault();
            e.detail.result = Promise.reject(new Error('test'));
          });
        const spy = sinon.spy();
        element.addEventListener(EventTypes.Reporting.error, spy);
        const ctrl = new AbortController();
        await element[queryEndpoints](ctrl.signal);
        assert.isTrue(spy.called);
      });
    });

    describe('querying the documentation data', () => {
      let element = /** @type ApiNavigationElement */ (null);
      beforeEach(async () => { 
        store.amf = demoModel;
        element = await noSortingFixture(); 
      });

      it('sets the [documentationsValue]', async () => {
        element[documentationsValue] = undefined;
        const ctrl = new AbortController();
        await element[queryDocumentations](ctrl.signal);
        assert.typeOf(element[documentationsValue], 'array');
      });

      it('ignores setting values when signal aborted', async () => {
        element[documentationsValue] = undefined;
        const ctrl = new AbortController();
        const p = element[queryDocumentations](ctrl.signal);
        ctrl.abort();
        await p;
        assert.isUndefined(element[documentationsValue]);
      });

      it('ignores setting values when signal aborted (pre-execution)', async () => {
        element[documentationsValue] = undefined;
        const ctrl = new AbortController();
        ctrl.abort();
        await element[queryDocumentations](ctrl.signal);
        assert.isUndefined(element[documentationsValue]);
      });

      it('dispatches error event when query error', async () => {
        element.addEventListener(EventTypes.Documentation.list, 
          /**
           * @param {CustomEvent} e 
           */
          function f(e) {
            element.removeEventListener(EventTypes.Documentation.list, f);
            e.stopPropagation();
            e.preventDefault();
            e.detail.result = Promise.reject(new Error('test'));
          });
        const spy = sinon.spy();
        element.addEventListener(EventTypes.Reporting.error, spy);
        const ctrl = new AbortController();
        await element[queryDocumentations](ctrl.signal);
        assert.isTrue(spy.called);
      });
    });

    describe('querying the schema data', () => {
      let element = /** @type ApiNavigationElement */ (null);
      beforeEach(async () => { 
        store.amf = demoModel;
        element = await noSortingFixture(); 
      });

      it('sets the [schemasValue]', async () => {
        element[schemasValue] = undefined;
        const ctrl = new AbortController();
        await element[querySchemas](ctrl.signal);
        assert.typeOf(element[schemasValue], 'array');
      });

      it('ignores setting values when signal aborted', async () => {
        element[schemasValue] = undefined;
        const ctrl = new AbortController();
        const p = element[querySchemas](ctrl.signal);
        ctrl.abort();
        await p;
        assert.isUndefined(element[schemasValue]);
      });

      it('ignores setting values when signal aborted (pre-execution)', async () => {
        element[schemasValue] = undefined;
        const ctrl = new AbortController();
        ctrl.abort();
        await element[querySchemas](ctrl.signal);
        assert.isUndefined(element[schemasValue]);
      });

      it('dispatches error event when query error', async () => {
        element.addEventListener(EventTypes.Type.list, 
          /**
           * @param {CustomEvent} e 
           */
          function f(e) {
            element.removeEventListener(EventTypes.Type.list, f);
            e.stopPropagation();
            e.preventDefault();
            e.detail.result = Promise.reject(new Error('test'));
          });
        const spy = sinon.spy();
        element.addEventListener(EventTypes.Reporting.error, spy);
        const ctrl = new AbortController();
        await element[querySchemas](ctrl.signal);
        assert.isTrue(spy.called);
      });
    });

    describe('querying the security data', () => {
      let element = /** @type ApiNavigationElement */ (null);
      beforeEach(async () => { 
        store.amf = demoModel;
        element = await noSortingFixture(); 
      });

      it('sets the [securityValue]', async () => {
        element[securityValue] = undefined;
        const ctrl = new AbortController();
        await element[querySecurity](ctrl.signal);
        assert.typeOf(element[securityValue], 'array');
      });

      it('ignores setting values when signal aborted', async () => {
        element[securityValue] = undefined;
        const ctrl = new AbortController();
        const p = element[querySecurity](ctrl.signal);
        ctrl.abort();
        await p;
        assert.isUndefined(element[securityValue]);
      });

      it('ignores setting values when signal aborted (pre-execution)', async () => {
        element[securityValue] = undefined;
        const ctrl = new AbortController();
        ctrl.abort();
        await element[querySecurity](ctrl.signal);
        assert.isUndefined(element[securityValue]);
      });

      it('dispatches error event when query error', async () => {
        element.addEventListener(EventTypes.Security.list, 
          /**
           * @param {CustomEvent} e 
           */
          function f(e) {
            element.removeEventListener(EventTypes.Security.list, f);
            e.stopPropagation();
            e.preventDefault();
            e.detail.result = Promise.reject(new Error('test'));
          });
        const spy = sinon.spy();
        element.addEventListener(EventTypes.Reporting.error, spy);
        const ctrl = new AbortController();
        await element[querySecurity](ctrl.signal);
        assert.isTrue(spy.called);
      });
    });

    describe('keyboard navigation', () => {
      let element = /** @type ApiNavigationElement */ (null);
      beforeEach(async () => { 
        store.amf = demoModel;
        element = await dataFixture();
      });

      it('focuses on the summary when menu is focused', async () => {
        element.focus();
        await nextFrame()
        const node = element.shadowRoot.querySelector('.summary .list-item');
        assert.equal(element.focusedItem, node, 'element.focusedItem is the summary');
      });

      it('focuses on the endpoints when menu is focused and no summary', async () => {
        element.summary = false;
        await nextFrame()
        element.focus();
        await nextFrame()
        const node = element.shadowRoot.querySelector('.endpoints .section-title');
        assert.equal(element.focusedItem, node, 'element.focusedItem is first item');
      });

      it('selected item gets focus when menu is focused', async () => {
        const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('.list-item.operation'));
        node.click();
        window.focus();
        await nextFrame();
        element.focus();
        assert.equal(element.focusedItem, node, 'element.focusedItem is first item');
      });

      it('focuses on the previous item on up keydown', async () => {
        element.focus();
        await nextFrame();
        // Key press up
        element.dispatchEvent(new KeyboardEvent('keydown', {
          bubbles: true,
          cancelable: true,
          keyCode: 38,
          key: 'ArrowUp',
          code: 'ArrowUp',
        }));
        await nextFrame();
        const security = element.shadowRoot.querySelectorAll('.security .list-item.security');
        const node = security[security.length - 1];
        assert.equal(element.focusedItem, node, 'element.focusedItem is last item');
      });

      it('focuses on the next item on down keydown', async () => {
        element.focus();
        await nextFrame();
        // Key press down
        element.dispatchEvent(new KeyboardEvent('keydown', {
          bubbles: true,
          cancelable: true,
          keyCode: 40,
          key: 'ArrowDown',
          code: 'ArrowDown',
        }));
        await nextFrame();
        const node = element.shadowRoot.querySelector('.endpoints > .section-title');
        assert.equal(element.focusedItem, node, 'element.focusedItem is last item');
      });

      it('keyboard events should not bubble', async () => {
        let keyCounter = 0;
        element.parentElement.addEventListener('keydown', event => {
          if (event.key === 'Escape') {
            keyCounter++;
          }
          if (event.key === 'ArrowUp') {
            keyCounter++;
          }
          if (event.key === 'ArrowDown') {
            keyCounter++;
          }
        });
        // up
        element.dispatchEvent(new KeyboardEvent('keydown', {
          bubbles: true,
          cancelable: true,
          keyCode: 40,
          key: 'ArrowDown',
          code: 'ArrowDown',
        }));
        // down
        element.dispatchEvent(new KeyboardEvent('keydown', {
          bubbles: true,
          cancelable: true,
          keyCode: 38,
          key: 'ArrowUp',
          code: 'ArrowUp',
        }));
        // esc
        element.dispatchEvent(new KeyboardEvent('keydown', {
          bubbles: true,
          cancelable: true,
          keyCode: 27,
          key: 'Escape',
          code: 'Escape',
        }));
        await nextFrame();
        assert.equal(keyCounter, 0);
      });

      it('selects an operation item with the space bar', () => {
        const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('.list-item.operation'));
        node.dispatchEvent(new KeyboardEvent('keydown', {
          bubbles: true,
          cancelable: true,
          composed: true,
          keyCode: 32,
          key: ' ',
          code: 'Space',
        }));
        assert.equal(element.domainId, node.dataset.graphId);
      });

      it('selects an operation item with the Enter', () => {
        const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('.list-item.operation'));
        node.dispatchEvent(new KeyboardEvent('keydown', {
          bubbles: true,
          cancelable: true,
          composed: true,
          keyCode: 13,
          key: 'Enter',
          code: 'Enter',
        }));
        assert.equal(element.domainId, node.dataset.graphId);
      });

      it('selects an endpoint with space bar', async() => {
        const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('.list-item.endpoint'));
        node.dispatchEvent(new KeyboardEvent('keydown', {
          bubbles: true,
          cancelable: true,
          composed: true,
          keyCode: 32,
          key: ' ',
          code: 'Space',
        }));
        assert.equal(element.domainId, node.dataset.graphId);
      });

      it('opens an endpoint when arrow right', async() => {
        const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('.list-item.endpoint'));
        node.dispatchEvent(new KeyboardEvent('keydown', {
          bubbles: true,
          cancelable: true,
          composed: true,
          keyCode: 39,
          key: 'ArrowRight',
          code: 'ArrowRight',
        }));
        await nextFrame();
        const collapse = /** @type AnypointCollapseElement */ (node.nextElementSibling);
        assert.isTrue(collapse.opened);
      });

      it('closes an endpoint when arrow left', async() => {
        const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('.list-item.endpoint'));
        node.dispatchEvent(new KeyboardEvent('keydown', {
          bubbles: true,
          cancelable: true,
          composed: true,
          keyCode: 39,
          key: 'ArrowRight',
          code: 'ArrowRight',
        }));
        await nextFrame();
        node.dispatchEvent(new KeyboardEvent('keydown', {
          bubbles: true,
          cancelable: true,
          composed: true,
          keyCode: 37,
          key: 'ArrowLeft',
          code: 'ArrowLeft',
        }));
        await nextFrame();
        const collapse = /** @type AnypointCollapseElement */ (node.nextElementSibling);
        assert.isFalse(collapse.opened);
      });

      it('toggles a section with space bar', async() => {
        const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('.endpoints .section-title'));
        node.dispatchEvent(new KeyboardEvent('keydown', {
          bubbles: true,
          cancelable: true,
          composed: true,
          keyCode: 32,
          key: ' ',
          code: 'Space',
        }));
        await nextFrame();
        const collapse = /** @type AnypointCollapseElement */ (node.nextElementSibling);
        // initially opened
        assert.isFalse(collapse.opened);
      });

      it('removes focus on shift+tab', async () => {
        element.focus();
        await nextFrame();
        // Key press 'Tab'
        element.dispatchEvent(new KeyboardEvent('keydown', {
          bubbles: true,
          cancelable: true,
          composed: true,
          keyCode: 9,
          key: 'Tab',
          code: 'Tab',
          shiftKey: true,
        }));
        assert.equal(element.getAttribute('tabindex'), '-1');
        assert.isTrue(element[shiftTabPressedValue]);
        assert.equal(element[focusedItemValue], null);
        await aTimeout(1);
        assert.isFalse(element[shiftTabPressedValue]);
        assert.equal(element.getAttribute('tabindex'), '0');
      });
    });

    describe('expandAll()', () => {
      let element = /** @type ApiNavigationElement */ (null);
      beforeEach(async () => { 
        store.amf = demoModel;
        element = await dataFixture();
      });

      it('sets all sections opened', () => {
        element.expandAll();
        assert.isTrue(element.endpointsOpened, 'endpointsOpened is set');
        assert.isTrue(element.schemasOpened, 'schemasOpened is set');
        assert.isTrue(element.securityOpened, 'securityOpened is set');
        assert.isTrue(element.documentationsOpened, 'documentationsOpened is set');
      });

      it('calls expandAllEndpoints()', () => {
        const spy = sinon.spy(element, 'expandAllEndpoints');
        element.expandAll();
        assert.isTrue(spy.called);
      });
    });

    describe('collapseAll()', () => {
      let element = /** @type ApiNavigationElement */ (null);
      beforeEach(async () => { 
        store.amf = demoModel;
        element = await dataFixture();
      });

      it('sets all sections opened', () => {
        element.collapseAll();
        assert.isFalse(element.endpointsOpened, 'endpointsOpened is set');
        assert.isFalse(element.schemasOpened, 'schemasOpened is set');
        assert.isFalse(element.securityOpened, 'securityOpened is set');
        assert.isFalse(element.documentationsOpened, 'documentationsOpened is set');
      });

      it('calls collapseAllEndpoints()', () => {
        const spy = sinon.spy(element, 'collapseAllEndpoints');
        element.collapseAll();
        assert.isTrue(spy.called);
      });
    });

    describe('expandAllEndpoints()', () => {
      let element = /** @type ApiNavigationElement */ (null);
      beforeEach(async () => { 
        store.amf = demoModel;
        element = await dataFixture();
      });

      it('sets endpointsOpened', () => {
        element.expandAllEndpoints();
        assert.isTrue(element.endpointsOpened);
      });

      it('sets the [openedEndpointsValue]', () => {
        element.expandAllEndpoints();
        assert.lengthOf(element[openedEndpointsValue], 72);
      });

      it('requests template update', () => {
        const spy = sinon.spy(element, 'requestUpdate');
        element.expandAllEndpoints();
        assert.isTrue(spy.called);
      });
    });

    describe('collapseAllEndpoints()', () => {
      let element = /** @type ApiNavigationElement */ (null);
      beforeEach(async () => { 
        store.amf = demoModel;
        element = await dataFixture();
      });

      it('re-sets the [openedEndpointsValue]', () => {
        element[openedEndpointsValue] = ['test'];
        element.collapseAllEndpoints();
        assert.deepEqual(element[openedEndpointsValue], []);
      });

      it('requests template update', () => {
        const spy = sinon.spy(element, 'requestUpdate');
        element.collapseAllEndpoints();
        assert.isTrue(spy.called);
      });
    });

    describe('Navigation layout', () => {
      describe('natural-sort', () => {
        before(async () => { 
          store.amf = rearrangeModel;
        });

        const orderedPaths = [
          '/accounts',
          '/accounts/:accountId',
          '/billing',
          '/transactions',
          '/transactions/:txId',
        ];

        const apiPaths = [
          '/transactions/:txId',
          '/billing',
          '/accounts/:accountId',
          '/accounts',
          '/transactions',
        ];

        it('sorts the endpoints', async () => {
          const element = await layoutFixture('natural-sort'); 
          assert.typeOf(element[endpointsValue], 'array', 'has the [endpointsValue]');
          const sorted = element[endpointsValue].map(i => i.path);
          assert.deepEqual(sorted, orderedPaths);
        });

        it('sorts after changing to "natural-sort"', async () => {
          const element = await layoutFixture('off');
          const notSorted = element[endpointsValue].map(i => i.path);
          assert.deepEqual(notSorted, apiPaths);
          element.layout = 'natural-sort';
          const sorted = element[endpointsValue].map(i => i.path);
          assert.deepEqual(sorted, orderedPaths);
        });

        it('applies API sort from "natural-sort"', async () => {
          const element = await layoutFixture('natural-sort'); 
          element.layout = 'off';
          const notSorted = element[endpointsValue].map(i => i.path);
          assert.deepEqual(notSorted, apiPaths);
        });
      });

      describe('natural', () => {
        before(async () => { 
          store.amf = demoModel;
        });

        it('has the same order and unordered endpoints', async () => {
          const element = await layoutFixture('off');
          const notSorted = element[endpointsValue].map(i => i.path);
          element.layout = 'natural';
          const sorted = element[endpointsValue].map(i => i.path);
          assert.deepEqual(sorted, notSorted);
        });

        it('indents child endpoints only', async () => {
          const element = await layoutFixture('natural');
          const endpoints = element[endpointsValue];
          const topLevel = endpoints.find(i => i.path === '/test-parameters/{feature}');
          assert.equal(topLevel.indent, 0, 'top level has indent 0');
          const secondLevel = endpoints.find(i => i.path === '/test-parameters/{feature}/{typeFeature}');
          assert.equal(secondLevel.indent, 2, 'second level has indent 2');
          assert.equal(secondLevel.label, '/{typeFeature}', 'second level has truncated name');
        });
      });

      describe('tree', () => {
        before(async () => { 
          store.amf = streetlightsModel;
        });

        const ordered = [
          'smartylighting/streetlights/1/0',
          'smartylighting/streetlights/1/0/action/{streetlightId}',
          'smartylighting/streetlights/1/0/action/{streetlightId}/dim',
          'smartylighting/streetlights/1/0/action/{streetlightId}/turn/off',
          'smartylighting/streetlights/1/0/action/{streetlightId}/turn/on',
          'smartylighting/streetlights/1/0/event/{streetlightId}/lighting/measured'
        ];

        it('orders the endpoints', async () => {
          const element = await layoutFixture('tree');
          const sorted = element[endpointsValue].map(i => i.path);
          assert.deepEqual(sorted, ordered);
        });

        it('creates a tree structure with abstract common ancestors', async () => {
          const element = await layoutFixture('tree');
          const [e1, e2, e3] = element[endpointsValue];
          assert.isUndefined(e1.id, 'the top-level endpoint has no id');
          assert.equal(e1.indent, 0, 'the top-level endpoint has indent = 0');
          assert.isUndefined(e2.id, 'the second-level endpoint has no id');
          assert.equal(e2.indent, 1, 'the second-level endpoint has indent = 1');
          assert.typeOf(e3.id, 'string', 'the third-level endpoint has the id');
          assert.equal(e3.indent, 2, 'the third-level endpoint has indent = 2');
        });

        it('does not dispatch the navigation item when clicking on an abstract item', async () => {
          const element = await layoutFixture('tree');
          const selector = '[data-path="smartylighting/streetlights/1/0/action/{streetlightId}"]';
          const node = /** @type HTMLElement */ (element.shadowRoot.querySelector(selector));
          const spy = sinon.spy();
          element.addEventListener(EventTypes.Navigation.apiNavigate, spy);
          node.click();
          assert.isFalse(spy.called);
        });

        it('dispatches the navigation item when clicking on an endpoint item', async () => {
          const element = await layoutFixture('tree');
          const selector = '[data-path="smartylighting/streetlights/1/0/action/{streetlightId}/dim"]';
          const node = /** @type HTMLElement */ (element.shadowRoot.querySelector(selector));
          const spy = sinon.spy();
          element.addEventListener(EventTypes.Navigation.apiNavigate, spy);
          node.click();
          assert.isTrue(spy.calledOnce);
        });
      });
    });

    describe('Async API rendering', () => {
      let element = /** @type ApiNavigationElement */ (null);
      beforeEach(async () => { 
        store.amf = asyncModel;
        element = await dataFixture();
      });

      it('renders all channels', () => {
        const channels = element[endpointsValue];
        assert.typeOf(channels, 'array', 'has the array of channels');
        assert.lengthOf(channels, 2, 'has all channels');
      });

      it('should render "Channels" label', () => {
        assert.equal(
          element.shadowRoot.querySelector('[data-section="endpoints"] .title-h3').textContent.trim(),
          'Channels'
        );
      });
    });

    describe('APIC-550', () => {
      /** @type AmfDocument */
      let model;

      before(async () => {
        model = await loader.getGraph('APIC-550');
        store.amf = model;
      });

      it('renders without errors', async () => {
        const element = await dataFixture();
        assert.lengthOf(element[endpointsValue], 2);
      });
    });

    describe('APIC-554', () => {
      /** @type AmfDocument */
      let model;

      before(async () => {
        model = await loader.getGraph('APIC-554');
        store.amf = model;
      });

      it('computes endpoint names correctly', async () => {
        const element = await layoutFixture('natural');
        const labels = [
          '/customer/{customerId}/chromeos',
          '/deviceId',
          '/customerId',
        ];
        assert.deepEqual(
          element[endpointsValue].map(e => e.label),
          labels
        );
      });
    });

    describe('APIC-554-ii', () => {
      /** @type AmfDocument */
      let model;

      before(async () => {
        model = await loader.getGraph('APIC-554-ii');
        store.amf = model;
      });

      it('computes endpoint names correctly', async () => {
        const element = await layoutFixture('natural');
        const labels = [
          '/customers/{customer}/chromeos/deviceId',
          '/customer/{customer}/chromeos/deviceId',
        ];
        assert.deepEqual(
          element[endpointsValue].map(e => e.label),
          labels
        );
      });
    });

    describe('SE-19215', () => {
      /** @type AmfDocument */
      let model;

      before(async () => {
        model = await loader.getGraph('SE-19215');
        store.amf = model;
      });

      it('computes endpoint names correctly', async () => {
        const element = await layoutFixture('natural');
        const labels = [
          '/omaha/transactionscall1', 
          '/transactions/call2'
        ];
        assert.deepEqual(
          element[endpointsValue].map(e => e.label),
          labels
        );
      });
    });

    describe('GH-27', () => {
      /** @type AmfDocument */
      let model;

      before(async () => {
        model = await loader.getGraph('navigation-api');
        store.amf = model;
      });

      it('expand endpoint when selecting an operation', async () => {
        const element = await layoutFixture('natural');
        const selector = `[data-graph-shape="operation"]`;
        const operation = /** @type HTMLElement */ (element.shadowRoot.querySelector(selector));
        element.domainId = operation.dataset.graphId;
        await nextFrame();
        assert.equal(operation.classList.contains('selected'), true);
        assert.equal(operation.parentElement.hasAttribute('opened'), true);
      });
    });

    describe('a11y', () => {
      before(async () => {
        store.amf = demoModel;
      });
  
      it('performs a11y tests', async () => {
        const element = await layoutFixture('natural');
        element.domainId = 'summary';
        await nextFrame();
        await assert.isAccessible(element);
      });
    });
  });
});
