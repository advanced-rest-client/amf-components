import { fixture, assert, nextFrame, html, aTimeout } from '@open-wc/testing';
import sinon from 'sinon';
import { AmfLoader } from '../AmfLoader.js';
import '../../define/api-navigation-legacy.js';
import { 
  computePathName, 
  computeRenderPath, 
  queryValue, 
  queryDebouncer, 
  hasPassiveSelection,
  docsValue,
  typesValue,
  securityValue,
  endpointsValue,
  isFragmentValue,
  shiftTabPressed,
  focusedItemPrivate,
  itemClickHandler,
  flushQuery,
  rearrangeEndpoints,
  toggleSectionHandler,
  selectItem,
  selectMethodPassive,
  toggleEndpoint,
  computeEndpointPaddingLeft,
  computeOperationPaddingLeft,
} from '../../src/elements/ApiNavigationLegacyElement.js';
import { ns } from '../../src/helpers/Namespace.js';
import { NavigationEvents } from '../../src/events/NavigationEvents.js';
import { EventTypes } from '../../src/events/EventTypes.js';

/* eslint-disable no-plusplus */

/** @typedef {import('@anypoint-web-components/awc').AnypointCollapseElement} AnypointCollapseElement */
/** @typedef {import('../../src/elements/ApiNavigationLegacyElement').DocumentationItem} DocumentationItem */
/** @typedef {import('../../src/elements/ApiNavigationLegacyElement').TypeItem} TypeItem */
/** @typedef {import('../../src/elements/ApiNavigationLegacyElement').SecurityItem} SecurityItem */
/** @typedef {import('../../src/elements/ApiNavigationLegacyElement').EndpointItem} EndpointItem */
/** @typedef {import('../../src/elements/ApiNavigationLegacyElement').MethodItem} MethodItem */
/** @typedef {import('../../').ApiNavigationLegacyElement} ApiNavigationElement */
/** @typedef {import('../../').Amf.AmfDocument} AmfDocument */
/** @typedef {import('../../').Amf.EndPoint} EndPoint */

describe('ApiNavigationLegacyElement', () => {
  const loader = new AmfLoader();
  const asyncApi = 'async-api';
  const unorderedEndpoints = 'unordered-endpoints';

  /**
   * @param {AmfDocument=} amf
   * @returns {Promise<ApiNavigationElement>}
   */
  async function basicFixture(amf) {
    return fixture(html`<api-navigation-legacy .amf="${amf}"></api-navigation-legacy>`);
  }

  /**
   * @param {AmfDocument=} amf
   * @returns {Promise<ApiNavigationElement>}
   */
  async function summaryFixture(amf) {
    return fixture(html`<api-navigation-legacy summary .amf="${amf}"></api-navigation-legacy>`);
  }

  /**
   * @param {AmfDocument=} amf
   * @returns {Promise<ApiNavigationElement>}
   */
  async function preselectedFixture(amf) {
    return fixture(
      html`<api-navigation-legacy summary domainId="test1" .amf="${amf}"></api-navigation-legacy>`
    );
  }

  /**
   * @param {AmfDocument=} amf
   * @returns {Promise<ApiNavigationElement>}
   */
  async function sortedFixture(amf) {
    return fixture(
      html`<api-navigation-legacy rearrangeEndpoints .amf="${amf}"></api-navigation-legacy>`
    );
  }

 /**
   * @param {AmfDocument=} amf
   * @returns {Promise<ApiNavigationElement>}
   */
  async function endpointsOpenedFixture(amf) {
    const elm = /** @type ApiNavigationElement */ (await fixture(html`<api-navigation-legacy
      endpointsOpened
      .amf="${amf}"
    ></api-navigation-legacy>`));
    await nextFrame();
    return elm;
  }

  /**
   * @param {AmfDocument=} amf
   * @returns {Promise<ApiNavigationElement>}
   */
  async function docsOpenedFixture(amf) {
    const elm = /** @type ApiNavigationElement */ (await fixture(html`<api-navigation-legacy
      docsOpened
      .amf="${amf}"
    ></api-navigation-legacy>`));
    await nextFrame();
    return elm;
  }

  /**
   * @param {AmfDocument=} amf
   * @returns {Promise<ApiNavigationElement>}
   */
  async function typesOpenedFixture(amf) {
    const elm = /** @type ApiNavigationElement */ (await fixture(html`<api-navigation-legacy
      typesOpened
      .amf="${amf}"
    ></api-navigation-legacy>`));
    await nextFrame();
    return elm;
  }

  /**
   * @param {AmfDocument=} amf
   * @returns {Promise<ApiNavigationElement>}
   */
  async function securityOpenedFixture(amf) {
    const elm = /** @type ApiNavigationElement */ (await fixture(html`<api-navigation-legacy
      securityOpened
      .amf="${amf}"
    ></api-navigation-legacy>`));
    await nextFrame();
    return elm;
  }

  /**
   * @param {AmfDocument=} amf
   * @returns {Promise<ApiNavigationElement>}
   */
  async function modelFixture(amf) {
    const elm = /** @type ApiNavigationElement */ (await fixture(
      html`<api-navigation-legacy .amf="${amf}"></api-navigation-legacy>`
    ));
    return elm;
  }

  /**
   * @param {AmfDocument=} amf
   * @param {boolean=} operationsOpened
   * @returns {Promise<ApiNavigationElement>}
   */
  async function operationsOpenedFixture(amf, operationsOpened = true) {
    const elm = /** @type ApiNavigationElement */ (await fixture(
      html`<api-navigation-legacy .amf="${amf}" .operationsOpened="${operationsOpened}"></api-navigation-legacy>`
    ));
    return elm;
  }

  /**
   * @param {string} code 
   * @param {number} no 
   * @returns {KeyboardEvent}
   */
  function keyboardEvent(code, no) {
    const e = new KeyboardEvent('keydown', {
      detail: 0,
      bubbles: true,
      cancelable: true,
      composed: true,
      keyCode: no,
      code,
      key: code,
    });
    return e;
  }

  describe('Super basics - without model', () => {
    /** @type ApiNavigationElement */
    let element;

    before(async () => {
      element = await basicFixture();
      await nextFrame();
    });

    it('[isFragmentValue] is set', () => {
      assert.isFalse(element[isFragmentValue]);
    });

    it('summaryRendered is not false', () => {
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

    it('types is not rendered', () => {
      const panel = element.shadowRoot.querySelector('.types');
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

    it('the summary is rendered', () => {
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

  describe('Docs', () => {
    /** @type ApiNavigationElement */
    let element;
    /** @type DocumentationItem[] */
    let model;

    beforeEach(async () => {
      model = [
        {
          id: 'test1',
          label: 'test1',
          isExternal: false,
        },
        {
          id: 'test2',
          label: 'test2',
          isExternal: false,
        },
      ];
      element = await preselectedFixture();
      element[docsValue] = model;
      await element.requestUpdate();
    });

    it('computes the hasDocs', () => {
      assert.isTrue(element.hasDocs);
    });

    it('renders the documentation', () => {
      const panel = element.shadowRoot.querySelector('.documentation');
      assert.ok(panel);
    });

    it('has a selection on the preselected item', () => {
      const selector = '.documentation [data-api-id="test1"]';
      const panel = element.shadowRoot.querySelector(selector);
      assert.ok(panel);
    });

    it('changes selection when clicking on an item', () => {
      const node = /** @type NodeListOf<HTMLElement> */ (element.shadowRoot.querySelectorAll('.documentation .list-item'))[1];
      node.click();
      assert.equal(element.domainId, 'test2');
      assert.equal(element.domainType, 'documentation');
    });
  });

  describe('Types', () => {
    /** @type ApiNavigationElement */
    let element;
    /** @type TypeItem[] */
    let model;
    beforeEach(async () => {
      model = [
        {
          id: 'test1',
          label: 'test1',
        },
        {
          id: 'test2',
          label: 'test2',
        },
      ];
      element = await preselectedFixture();
      element[typesValue] = model;
      await element.requestUpdate();
    });

    it('computes the hasTypes', () => {
      assert.isTrue(element.hasTypes);
    });

    it('renders the types section', () => {
      const panel = element.shadowRoot.querySelector('section.types');
      assert.ok(panel);
    });

    it('has a selection aon a preselected item', () => {
      const selector = '.types [data-api-id="test1"]';
      const panel = element.shadowRoot.querySelector(selector);
      assert.ok(panel);
    });

    it('changes selection when clicking on an item', () => {
      const node = /** @type NodeListOf<HTMLElement> */ (element.shadowRoot.querySelectorAll('.types .list-item'))[1];
      node.click();
      assert.equal(element.domainId, 'test2');
      assert.equal(element.domainType, 'schema');
    });
  });

  describe('Security', () => {
    /** @type ApiNavigationElement */
    let element;
    /** @type SecurityItem[] */
    let model;
    beforeEach(async () => {
      model = [
        {
          id: 'test1',
          label: 'test1',
        },
        {
          id: 'test2',
          label: 'test2',
        },
      ];
      element = await preselectedFixture();
      element[securityValue] = model;
      await element.requestUpdate();
    });

    it('computes the hasSecurity', () => {
      assert.isTrue(element.hasSecurity);
    });

    it('renders the types panel', () => {
      const panel = element.shadowRoot.querySelector('section.security');
      assert.ok(panel);
    });

    it('has a selection on a preselected item', () => {
      const selector = '.security [data-api-id="test1"]';
      const panel = element.shadowRoot.querySelector(selector);
      assert.ok(panel);
    });

    it('changes selection when clicking on an item', () => {
      const node = /** @type NodeListOf<HTMLElement> */ (element.shadowRoot.querySelectorAll(
        '.security .list-item'
      ))[1];
      node.click();
      assert.equal(element.domainId, 'test2');
      assert.equal(element.domainType, 'security');
    });
  });

  describe('Endpoints', () => {
    /** @type ApiNavigationElement */
    let element;
    /** @type EndpointItem[] */
    let model;
    beforeEach(async () => {
      model = [
        {
          id: 'test1',
          label: 'test1',
          path: '',
          renderPath: false,
          indent: 0,
          methods: [
            {
              id: 'method1',
              method: 'GET',
              label: '',
            },
          ],
        },
        {
          id: 'test2',
          label: 'test2',
          path: '',
          renderPath: false,
          indent: 0,
          methods: [
            {
              id: 'method2',
              method: 'GET',
              label: '',
            },
            {
              id: 'method3',
              method: 'POST',
              label: '',
            },
          ],
        },
      ];
      element = await preselectedFixture();
      // @ts-ignore
      element[endpointsValue] = model;
      await element.requestUpdate();
    });

    it('computes the hasEndpoints', () => {
      assert.isTrue(element.hasEndpoints);
    });

    it('renders the types section', () => {
      const panel = element.shadowRoot.querySelector('section.endpoints');
      assert.ok(panel);
    });

    it('has a selection on a preselected item', () => {
      const selector = '.endpoints [data-api-id="test1"]';
      const panel = element.shadowRoot.querySelector(selector);
      assert.ok(panel);
    });

    it('toggles an operation when clicking on an endpoint', async () => {
      const node = /** @type NodeListOf<HTMLElement> */ (element.shadowRoot.querySelectorAll(
        '.endpoints .list-item.endpoint'
      ))[1];
      node.click();
      await aTimeout(0);

      const collapsable = node.nextElementSibling;
      // @ts-ignore
      assert.isTrue(collapsable.opened);
    });

    it('changes selection when clicking on the overview', () => {
      const node = /** @type NodeListOf<HTMLElement> */ (element.shadowRoot.querySelectorAll(
        '.list-item.operation[data-shape="resource"]'
      ))[1];
      node.click();
      assert.equal(element.domainId, 'test2');
      assert.equal(element.domainType, 'resource');
    });

    it('rearrangeEndpoints is not true by default', () => {
      assert.isNotTrue(element.rearrangeEndpoints);
    });
  });

  describe('Sorting endpoints', () => {
    /** @type ApiNavigationElement */
    let element;
    /** @type AmfDocument */
    let amf;

    // const pathKey = 'http://a.ml/vocabularies/apiContract#path';
    const pathKey = ns.aml.vocabularies.apiContract.path;

    // const dataSet = /** @type EndPoint[] */ ([
    //   { [pathKey]: [{ '@value': '/transactions/:txId' }], '@id': '', '@type': [] },
    //   { [pathKey]: [{ '@value': '/billing' }], '@id': '', '@type': [] },
    //   { [pathKey]: [{ '@value': '/accounts/:accountId' }], '@id': '', '@type': [] },
    //   { [pathKey]: [{ '@value': '/accounts' }], '@id': '', '@type': [] },
    //   { [pathKey]: [{ '@value': '/transactions' }], '@id': '', '@type': [] },
    // ]);

    // const expected = /** @type EndPoint[] */ ([
    //   { [pathKey]: [{ '@value': '/accounts' }], '@id': '', '@type': [] },
    //   { [pathKey]: [{ '@value': '/accounts/:accountId' }], '@id': '', '@type': [] },
    //   { [pathKey]: [{ '@value': '/billing' }], '@id': '', '@type': [] },
    //   { [pathKey]: [{ '@value': '/transactions' }], '@id': '', '@type': [] },
    //   { [pathKey]: [{ '@value': '/transactions/:txId' }], '@id': '', '@type': [] },
    // ]);

    const dataSet = /** @type any[] */ ([
      { [pathKey]: '/transactions/:txId' },
      { [pathKey]: '/billing' },
      { [pathKey]: '/accounts/:accountId' },
      { [pathKey]: '/accounts' },
      { [pathKey]: '/transactions' },
    ]);

    const expected = /** @type any[] */ ([
      { [pathKey]: '/accounts' },
      { [pathKey]: '/accounts/:accountId' },
      { [pathKey]: '/billing' },
      { [pathKey]: '/transactions' },
      { [pathKey]: '/transactions/:txId' },
    ]);

    beforeEach(async () => {
      element = await sortedFixture();
      amf = await loader.getGraph('rearrange-api');
    });

    it('should sort endpoints', () => {
      const sorted = element[rearrangeEndpoints](dataSet);
      assert.sameDeepOrderedMembers(sorted, expected);
    });

    it('should have endpoints sorted', () => {
      element.amf = amf;

      element[endpointsValue].forEach((endpoint, i) =>
        assert.equal(endpoint.path, expected[i][pathKey])
      );
    });


    it('should sort after setting rearrangeEndpoints property', async () => {
      element = await modelFixture(amf);
      await nextFrame();
      let elementEndpointPaths = element[endpointsValue].map(endpoint => endpoint.path);
      const expectedPaths = expected.map(endpoint => endpoint[pathKey]);
      assert.notSameDeepOrderedMembers(elementEndpointPaths, expectedPaths);
      element.rearrangeEndpoints = true;
      await nextFrame();
      elementEndpointPaths = element[endpointsValue].map(endpoint => endpoint.path);
      assert.sameDeepOrderedMembers(elementEndpointPaths, expectedPaths);
    });

    it('should un-sort after toggling rearrangeEndpoints property off', async () => {
      element = await modelFixture(amf);
      element.rearrangeEndpoints = true;
      await nextFrame();
      let elementEndpointPaths = element[endpointsValue].map(endpoint => endpoint.path);
      const expectedPaths = expected.map(endpoint => endpoint[pathKey]);
      assert.sameDeepOrderedMembers(elementEndpointPaths, expectedPaths);
      element.rearrangeEndpoints = false;
      await nextFrame();
      elementEndpointPaths = element[endpointsValue].map(endpoint => endpoint.path);
      assert.notSameDeepOrderedMembers(elementEndpointPaths, expectedPaths);
    });
  });

  describe('Navigation events', () => {
    /** @type ApiNavigationElement */
    let element;
    let model;
    beforeEach(async () => {
      model = {
        docs: [
          {
            id: 'test1',
            label: 'test1',
            isExternal: false,
          },
          {
            id: 'test2',
            label: 'test2',
            isExternal: false,
          },
        ],
        types: [
          {
            id: 'test3',
            label: 'test3',
          },
          {
            id: 'test4',
            label: 'test4',
          },
        ],
        security: [
          {
            id: 'test5',
            label: 'test5',
          },
          {
            id: 'test6',
            label: 'test6',
          },
        ],
        endpoints: [
          {
            id: 'test7',
            label: 'test7',
            methods: [
              {
                id: 'method8',
                method: 'GET',
              },
            ],
          },
          {
            id: 'test9',
            label: 'test9',
            methods: [
              {
                id: 'method10',
                method: 'GET',
              },
              {
                id: 'method11',
                method: 'POST',
              },
            ],
          },
        ],
      };
      element = await basicFixture();
      element[docsValue] = model.docs;
      element[typesValue] = model.types;
      element[securityValue] = model.security;
      // @ts-ignore
      element[endpointsValue] = model.endpoints;
      await element.requestUpdate();
    });

    it('updates the selection from the change event', async () => {
      const id = 'test3';
      NavigationEvents.apiNavigate(document.body, id, 'schema');
      assert.equal(element.domainId, id);
      assert.equal(element.domainType, 'schema');
      const node = element.shadowRoot.querySelector(`[data-api-id="${id}"]`);
      await nextFrame();
      assert.isTrue(node.classList.contains('selected'));
    });

    it('does not update the selection if it is the source', () => {
      const id = 'test3';
      NavigationEvents.apiNavigate(element, id, 'schema');
      assert.isUndefined(element.domainId);
    });

    it('does not dispatch the selection event', () => {
      const id = 'test3';
      const spy = sinon.spy();
      element.addEventListener(EventTypes.Navigation.apiNavigate, spy);
      NavigationEvents.apiNavigate(document.body, id, 'schema');
      assert.isFalse(spy.called);
    });

    [
      ['schema', 'test3', '.list-item'],
      ['security', 'test5', '.list-item'],
      ['documentation', 'test1', '.list-item'],
      ['resource', 'test7', '.operation'],
    ].forEach(item => {
      const [type, id, selector] = item;
      it(`dispatches the event when clicking on a ${type}`, () => {
        const s = `${selector}[data-api-id="${id}"]`;
        const spy = sinon.spy();
        element.addEventListener(EventTypes.Navigation.apiNavigate, spy);
        const node = /** @type HTMLElement */ (element.shadowRoot.querySelector(s));
        node.click();
        assert.isTrue(spy.calledOnce);
        const { detail } = spy.args[0][0];
        assert.equal(detail.domainId, id);
        assert.equal(detail.domainType, type);
        assert.isUndefined(detail.parentId);
      });
    });

    it('dispatches the event when clicking on a method', () => {
      const selector = '.operation[data-api-id="method10"]';
      const spy = sinon.spy();
      element.addEventListener(EventTypes.Navigation.apiNavigate, spy);
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector(selector));
      node.click();
      assert.isTrue(spy.calledOnce);
      const { detail } = spy.args[0][0];
      assert.equal(detail.domainId, 'method10');
      assert.equal(detail.domainType, 'operation');
      assert.equal(detail.parentId, 'test9');
    });
  });

  describe('computePathName()', () => {
    it('Computes short path', () => {
      const base = ['/root', '/root/other'];
      const current = '/root/other/path';
      const parts = ['root', 'other', 'path'];
      const indent = 3;
      const result = computePathName(current, parts, indent, base);
      assert.equal(result, '/path');
    });

    it('Computes short path for combined endpoint names', () => {
      const base = ['/root', '/root/other'];
      const current = '/root/other/path';
      const parts = ['root', 'other'];
      const indent = 1;
      const result = computePathName(current, parts, indent, base);
      assert.equal(result, '/other/path');
    });
  });

  describe('[computeEndpointPaddingLeft]()', () => {
    /** @type ApiNavigationElement */
    let element;
    beforeEach(async () => {
      element = await basicFixture();
      await nextFrame();
    });

    it('Computes default padding', () => {
      const result = element[computeEndpointPaddingLeft]();
      assert.equal(result, 16);
    });

    it('Computes value for single value padding', () => {
      element.style.setProperty('--api-navigation-list-item-padding', '5px');
      const result = element[computeEndpointPaddingLeft]();
      assert.equal(result, 5);
    });

    it('Computes value for double padding value', () => {
      element.style.setProperty(
        '--api-navigation-list-item-padding',
        '5px 10px'
      );
      const result = element[computeEndpointPaddingLeft]();
      assert.equal(result, 10);
    });

    it('Computes value for triple padding value', () => {
      element.style.setProperty(
        '--api-navigation-list-item-padding',
        '5px 10px 15px'
      );
      const result = element[computeEndpointPaddingLeft]();
      assert.equal(result, 10);
    });

    it('Computes value for full padding value', () => {
      element.style.setProperty(
        '--api-navigation-list-item-padding',
        '5px 10px 15px 20px'
      );
      const result = element[computeEndpointPaddingLeft]();
      assert.equal(result, 20);
    });
  });

  describe('[computeOperationPaddingLeft]()', () => {
    /** @type ApiNavigationElement */
    let element;

    beforeEach(async () => {
      element = await basicFixture();
      await nextFrame();
    });

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

  describe('[toggleEndpoint]()', () => {
    /** @type ApiNavigationElement */
    let element;

    beforeEach(async () => {
      element = await basicFixture();
      await nextFrame();
    });

    it('Does nothing when node with data-endpoint-id is not in the path', () => {
      const spy = sinon.spy(element, 'toggleOperations');
      const e = new MouseEvent('test');
      e.composedPath = () => [];
      element[toggleEndpoint](e);
      assert.isFalse(spy.called);
    });

    it('Ignores node that are not of a type of 1 (Element)', () => {
      const spy = sinon.spy(element, 'toggleOperations');
      const e = new MouseEvent('test');
      e.composedPath = () => [document.createTextNode('test')];
      element[toggleEndpoint](e);
      assert.isFalse(spy.called);
    });

    it('Ignores nodes without data-endpoint-id', () => {
      const spy = sinon.spy(element, 'toggleOperations');
      const e = new MouseEvent('test');
      e.composedPath = () => [document.createTextNode('span')];

      element[toggleEndpoint](e);
      assert.isFalse(spy.called);
    });

    it('calls toggleOperations()', () => {
      const spy = sinon.spy(element, 'toggleOperations');
      const node = document.createElement('span');
      node.dataset.endpointId = 'testId';
      const e = new MouseEvent('test');
      e.composedPath = () => [node];
      element[toggleEndpoint](e);
      assert.isTrue(spy.called, 'Function called');
      assert.equal(spy.args[0][0], 'testId', 'Has argument set');
    });
  });

  describe('[queryChanged]()', () => {
    let element;
    beforeEach(async () => {
      element = await summaryFixture();
    });

    it('Does nothing when [queryDebouncer] is already set', () => {
      element[queryDebouncer] = 1;
      element.query = 'test';
      assert.equal(element[queryDebouncer], 1);
    });

    it('Sets [queryDebouncer]', async () => {
      element.query = 'test';
      assert.isTrue(element[queryDebouncer]);
      await nextFrame();
    });

    it('calls the [flushQuery]() method', done => {
      element.query = 'test';
      const spy = sinon.spy(element, flushQuery);
      setTimeout(() => {
        assert.isTrue(spy.called);
        done();
      });
    });

    it('Re-sets [queryDebouncer]', done => {
      element.query = 'test';
      setTimeout(() => {
        assert.isFalse(element[queryDebouncer]);
        done();
      });
    });
  });

  describe('[toggleSectionHandler]()', () => {
    /** @type ApiNavigationElement */
    let element;
    /** @type AmfDocument */
    let amf;

    beforeEach(async () => {
      amf = await loader.getGraph('navigation-api');
      element = await basicFixture();
      element.amf = amf;
      await nextFrame();
    });

    it('does nothing when node not found in path', () => {
      const e = new MouseEvent('test');
      e.composedPath = () => [];

      element[toggleSectionHandler](e);
      // No error
    });

    it('skips elements without dataset property', () => {
      const e = new MouseEvent('test');
      e.composedPath = () => [document.createTextNode('test')];
      
      element[toggleSectionHandler](e);
    });

    it('skips elements without data-section attribute', () => {
      const node = document.createElement('span');
      const e = new MouseEvent('test');
      e.composedPath = () => [node];

      element[toggleSectionHandler](e);
    });

    it('toggles the section', () => {
      const node = document.createElement('span');
      node.dataset.section = 'endpoints';
      const e = new MouseEvent('test');
      e.composedPath = () => [node];

      element[toggleSectionHandler](e);
      assert.isTrue(element.endpointsOpened);
    });
  });

  describe('[selectMethodPassive]()', () => {
    /** @type ApiNavigationElement */
    let element;
    /** @type AmfDocument */
    let amf;

    beforeEach(async () => {
      amf = await loader.getGraph('navigation-api');
      element = await basicFixture();
      element.amf = amf;
      await nextFrame();
    });

    it('does nothing when the id is not in the DOM', () => {
      element[selectMethodPassive]('some-id');
      assert.isUndefined(element[hasPassiveSelection]);
    });

    it('adds the "passive-selected" class name to the method label', () => {
      const { id } = element[endpointsValue][0].methods[0];
      element[selectMethodPassive](id);
      const node = element.shadowRoot.querySelector('.passive-selected');
      // @ts-ignore
      assert.equal(node.dataset.apiId, id);
    });

    it('sets the [hasPassiveSelection] flag', () => {
      const { id } = element[endpointsValue][0].methods[0];
      element[selectMethodPassive](id);
      assert.isTrue(element[hasPassiveSelection]);
    });

    it('renders the toggle in the opened state', () => {
      const { id } = element[endpointsValue][0].methods[0];
      element[selectMethodPassive](id);
      const node = element.shadowRoot.querySelector('.passive-selected');
      // @ts-ignore
      assert.isTrue(node.parentElement.opened);
    });
  });

  describe('[itemClickHandler]()', () => {
    /** @type ApiNavigationElement */
    let element;
    /** @type AmfDocument */
    let amf;

    beforeEach(async () => {
      amf = await loader.getGraph('navigation-api');
      element = await summaryFixture();
      element.amf = amf;
      await nextFrame();
    });

    it('Uses currentTarget as the target', () => {
      const node = element.shadowRoot.querySelector('.list-item.summary');
      const spy = sinon.spy(element, selectItem);

      // @ts-ignore
      element[itemClickHandler]({
        currentTarget: node,
      });
      assert.isTrue(spy.called);
      assert.isTrue(spy.args[0][0] === node);
    });

    it('Uses target as the target', () => {
      const node = element.shadowRoot.querySelector('.list-item.summary');
      const spy = sinon.spy(element, selectItem);
      // @ts-ignore
      element[itemClickHandler]({
        target: node,
      });
      assert.isTrue(spy.called);
      assert.isTrue(spy.args[0][0] === node);
    });

    it('Makes adjustments for method label', () => {
      const node = element.shadowRoot.querySelector('.method-label');
      const parent = node.parentNode;
      const spy = sinon.spy(element, selectItem);
      // @ts-ignore
      element[itemClickHandler]({
        target: node,
      });
      assert.isTrue(spy.called);
      assert.isTrue(spy.args[0][0] === parent);
    });
  });

  describe('[flushQuery]()', () => {
    /** @type ApiNavigationElement */
    let element;
    /** @type AmfDocument */
    let amf;

    beforeEach(async () => {
      amf = await loader.getGraph('navigation-api');
      element = await summaryFixture();
      element.amf = amf;
      await nextFrame();
    });

    it('sets the [queryValue] as a lowercase query', () => {
      element[queryDebouncer] = true;
      element.query = 'Files';
      element[flushQuery]();
      assert.equal(element[queryValue], 'files');
    });

    it('Clear the query', () => {
      element[queryDebouncer] = true;
      element.query = '';
      element[flushQuery]();
      assert.equal(element[queryValue], '');
    });
  });

  describe('computeRenderPath()', () => {
    /** @type ApiNavigationElement */
    let element;
    /** @type AmfDocument */
    let amf;

    beforeEach(async () => {
      amf = await loader.getGraph('navigation-api');
      element = await summaryFixture();
      element.amf = amf;
      await nextFrame();
    });

    it('Returns true when both arguments are true', () => {
      const result = computeRenderPath(true, true);
      assert.isTrue(result);
    });

    it('Returns false when allowPaths is false', () => {
      const result = computeRenderPath(false, true);
      assert.isFalse(result);
    });

    it('Returns false when allowPaths is not set', () => {
      const result = computeRenderPath(undefined, true);
      assert.isFalse(result);
    });

    it('Returns false when renderPath is false', () => {
      const result = computeRenderPath(true, false);
      assert.isFalse(result);
    });

    it('Returns false when renderPath is not set', () => {
      const result = computeRenderPath(true, undefined);
      assert.isFalse(result);
    });

    it('Returns false when both undefined', () => {
      const result = computeRenderPath(false, false);
      assert.isFalse(result);
    });

    it('Paths are hidden by default', () => {
      const endpoint = loader.lookupEndpoint(amf, '/about');
      const id = endpoint['@id'];
      const node = element.shadowRoot.querySelector(
        `.endpoint[data-endpoint-id="${id}"] .path-name`
      );
      assert.notOk(node);
    });

    it('Renders paths when "allowPaths" is set', async () => {
      element.allowPaths = true;
      await nextFrame();
      const endpoint = loader.lookupEndpoint(amf, '/about');
      const id = endpoint['@id'];
      const node = element.shadowRoot.querySelector(
        `.endpoint[data-endpoint-id="${id}"] .path-name`
      );
      assert.ok(node);
    });
  });

  describe('AsyncAPI', () => {
    /** @type ApiNavigationElement */
    let element;
    /** @type AmfDocument */
    let amf;

    beforeEach(async () => {
      amf = await loader.getGraph(asyncApi);
      element = await basicFixture();
      element.amf = amf;
      await nextFrame();
    });

    it('should render channels', () => {
      assert.lengthOf(element[endpointsValue], 2);
    });

    it('should render "Channels" label', () => {
      assert.equal(
        element.shadowRoot.querySelector('.endpoints div.title-h3')
          .textContent,
        'Channels'
      );
    });
  });

  describe('Unordered endpoints', () => {
    /** @type ApiNavigationElement */
    let element;
    /** @type AmfDocument */
    let amf;

    beforeEach(async () => {
      amf = await loader.getGraph(unorderedEndpoints);
      element = await basicFixture();
      element.amf = amf;
      await nextFrame();
    });

    it('should render full path of third endpoint', () => {
      const nodes = /** @type NodeListOf<HTMLElement> */ (element.shadowRoot.querySelectorAll(
        '.list-item.endpoint .endpoint-name'
      ));
      
      assert.equal(nodes[2].innerText, '/foo/bar');
    });
  });

  describe('APIC-550', () => {
    /** @type ApiNavigationElement */
    let element;
    /** @type AmfDocument */
    let amf;

    it('should render without errors', async () => {
      amf = await loader.getGraph('APIC-550');
      element = await modelFixture(amf);
      await nextFrame();
      assert.lengthOf(element[endpointsValue], 1);
    });
  });

  describe('APIC-554', () => {
    /** @type ApiNavigationElement */
    let element;
    /** @type AmfDocument */
    let amf;

    before(async () => {
      amf = await loader.getGraph('APIC-554');
    });

    beforeEach(async () => {
      element = await modelFixture(amf);
    });

    it('should compute endpoint names correctly', () => {
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
    /** @type ApiNavigationElement */
    let element;
    /** @type AmfDocument */
    let amf;

    before(async () => {
      amf = await loader.getGraph('APIC-554-ii');
    });

    beforeEach(async () => {
      element = await modelFixture(amf);
    });

    it('should compute endpoint names correctly', () => {
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
    /** @type ApiNavigationElement */
    let element;
    /** @type AmfDocument */
    let amf;

    before(async () => {
      amf = await loader.getGraph('SE-19215');
    });

    beforeEach(async () => {
      element = await modelFixture(amf);
    });

    it('should compute endpoint names correctly', () => {
      const labels = ['/omaha/transactionscall1', '/transactions/call2'];
      assert.deepEqual(
        element[endpointsValue].map(e => e.label),
        labels
      );
    });
  });

  describe('operationsOpened', () => {
    /** @type ApiNavigationElement */
    let element;
    /** @type AmfDocument */
    let amf;

    before(async () => {
      amf = await loader.getGraph('navigation-api');
    });

    beforeEach(async () => {
      element = await operationsOpenedFixture(amf, true);
      await aTimeout(0);
    });

    it('should expand all operations when operationsOpened', () => {
      const operations = element.shadowRoot.querySelectorAll('.list-item.endpoint');
      assert.equal(operations.length, 32);

      let openedOperations = 0;
      operations.forEach(e => {
        if (e.getAttribute('data-endpoint-opened') === '') {
          openedOperations++;
        }
      });
      assert.equal(openedOperations, 32);
    });
  });

  describe('GH-27', () => {
    /** @type ApiNavigationElement */
    let element;
    /** @type AmfDocument */
    let amf;

    before(async () => {
      amf = await loader.getGraph('navigation-api');
    });

    beforeEach(async () => {
      element = await modelFixture(amf);
      await aTimeout(0);
    });

    it('selected operation should expand endpoint', async () => {
      const operation = /** @type HTMLElement */ (element.shadowRoot.querySelector('.list-item.operation[data-shape="operation"]'));
      element.domainId = operation.dataset.apiId;
      element.domainType = 'operation';
      await nextFrame();
      assert.equal(operation.classList.contains('selected'), true);
      assert.notEqual(operation.parentElement.getAttribute('data-endpoint-opened'), null);
    });
  });

  describe('noOverview', () => {
    /** @type ApiNavigationElement */
    let element;
    /** @type AmfDocument */
    let amf;

    before(async () => {
      amf = await loader.getGraph('simple-api');
    });

    beforeEach(async () => {
      element = await modelFixture(amf);
    });

    it('should set noOverview to false by default', () => {
      assert.isFalse(element.noOverview)
    });

    it('should render endpoints overview by default', () => {
      const endpoints = element.shadowRoot.querySelectorAll(
        '.list-item.operation[data-shape="resource"]'
      );
      assert.equal(endpoints.length, 3);
    });

    it('should render endpoints name by default', () => {
      const endpoints = element.shadowRoot.querySelectorAll(
        '.endpoint-name'
      );
      assert.equal(endpoints.length, 3);
    });

    it('should set noOverview to true', async () => {
      element.noOverview = true;
      await aTimeout(0);

      assert.isTrue(element.noOverview)
    });

    it('should not render endpoints overview when noOverview', async () => {
      element.noOverview = true;
      await aTimeout(0);

      const endpoints = element.shadowRoot.querySelectorAll(
        '.list-item.operation[data-shape="resource"]'
      );
      assert.equal(endpoints.length, 0);
    });

    it('should render clickable endpoints name when noOverview', async () => {
      element.noOverview = true;
      await aTimeout(0);

      const endpoints = element.shadowRoot.querySelectorAll(
        '.endpoint-name-overview'
      );
      assert.equal(endpoints.length, 3);
    });

    it('should select endpoint when clicking its name', async () => {
      element.noOverview = true;
      await aTimeout(0);

      const endpointName = /** @type HTMLElement */ (element.shadowRoot.querySelector('.endpoint-name-overview'));
      endpointName.click();
      await aTimeout(0);

      const endpoint = element.shadowRoot.querySelector(`.endpoint[data-endpoint-id="${endpointName.dataset.apiId}"]`);
      assert.equal(endpoint.className, "list-item endpoint selected");
    });

    describe('menu keyboard navigation', () => {
      it('should focus on endpoint path detail first', async () => {
        element.noOverview = true;
        element.endpointsOpened = true;
        await aTimeout(5);
        element.dispatchEvent(new Event('focus', { bubbles: false }));
        await nextFrame();
        // Key press down
        element.dispatchEvent(keyboardEvent('ArrowDown', 40));
        await nextFrame();
        const node = element.shadowRoot.querySelector('div[data-endpoint-path="/one"] .path-details');
        assert.equal(
          element.focusedItem,
          node,
          'element.focusedItem is last item'
        );
      });

      it('should focus on endpoint toggle arrow second', async () => {
        element.noOverview = true;
        element.endpointsOpened = true;
        await aTimeout(5);
        element.dispatchEvent(new Event('focus', { bubbles: false }));
        await nextFrame();
        // Key press down
        element.dispatchEvent(keyboardEvent('ArrowDown', 40));
        element.dispatchEvent(keyboardEvent('ArrowDown', 40));
        await nextFrame();
        const node = element.shadowRoot.querySelector('div[data-endpoint-path="/one"] anypoint-icon-button');
        assert.equal(
          element.focusedItem,
          node,
          'element.focusedItem is last item'
        );
      });
    });
  });

  describe('renderFullPaths', () => {
    /** @type ApiNavigationElement */
    let element;
    /** @type AmfDocument */
    let amf;

    beforeEach(async () => {
      amf = await loader.getGraph('navigation-api');
      element = await basicFixture();
      element.amf = amf;
      await nextFrame();
    });

    it('renders full paths when renderFullPaths is set', async () => {
      element.renderFullPaths = true;
      element.endpointsOpened = true;
      await aTimeout(50);
      const renderedPath = element.shadowRoot.querySelectorAll('.list-item.endpoint')[2].textContent.split('\n').join('').trim();
      assert.equal(renderedPath, '/files/{fileId}/copy');
    });

    it('does not indent any endpoint', async () => {
      element.renderFullPaths = true;
      element.endpointsOpened = true;
      await aTimeout(50);
      element[endpointsValue].forEach(endpoint => assert.equal(endpoint.indent, 0));
    });
  });

  describe('a11y', () => {
    /** @type ApiNavigationElement */
    let element;
    beforeEach(async () => {
      const amf = await loader.getGraph('navigation-api');
      element = await summaryFixture();
      element.amf = amf;
      element.domainId = 'summary';
      await nextFrame();
    });

    it('performs a11y tests', async () => {
      await assert.isAccessible(element);
    });
  });

  describe('default opened state', () => {
    /** @type AmfDocument */
    let amf;
    before(async () => {
      amf = await loader.getGraph('navigation-api');
    });

    it('opens endpoints when initialized', async () => {
      const element = await endpointsOpenedFixture(amf);
      const node = /** @type AnypointCollapseElement */ (element.shadowRoot.querySelector(
        '.endpoints > anypoint-collapse'
      ));
      assert.isTrue(node.opened);
    });

    it('opens documentation when initialized', async () => {
      const element = await docsOpenedFixture(amf);
      const node = /** @type AnypointCollapseElement */ (element.shadowRoot.querySelector(
        '.documentation > anypoint-collapse'
      ));
      assert.isTrue(node.opened);
    });

    it('opens types when initialized', async () => {
      const element = await typesOpenedFixture(amf);
      const node = /** @type AnypointCollapseElement */ (element.shadowRoot.querySelector('.types > anypoint-collapse'));
      assert.isTrue(node.opened);
    });

    it('opens security when initialized', async () => {
      const element = await securityOpenedFixture(amf);
      const node = /** @type AnypointCollapseElement */ (element.shadowRoot.querySelector(
        '.security > anypoint-collapse'
      ));
      assert.isTrue(node.opened);
    });
  });

  describe('a11y', () => {
    /** @type AmfDocument */
    let amf;

    before(async () => {
      amf = await loader.getGraph('simple-api');
    });

    describe('menu keyboard tests', () => {
      /** @type ApiNavigationElement */
      let element;
      beforeEach(async () => {
        element = await modelFixture(amf);
      });

      it('first item gets focus when menu is focused', async () => {
        element.dispatchEvent(new Event('focus', { bubbles: false }));
        await aTimeout(0);
        const node = element.shadowRoot.querySelector(
          '.endpoints .section-title'
        );
        assert.equal(
          element.focusedItem,
          node,
          'element.focusedItem is first item'
        );
      });

      it('selected item gets focus when menubar is focused', async () => {
        element.endpointsOpened = true;
        await aTimeout(0);
        const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('.list-item.operation'));
        node.click();
        window.focus();
        await aTimeout(0);
        element.dispatchEvent(new Event('focus', { bubbles: false }));
        assert.equal(
          element.focusedItem,
          node,
          'element.focusedItem is first item'
        );
      });

      it('focused on previous item', async () => {
        element.endpointsOpened = true;
        await aTimeout(0);
        element.dispatchEvent(new Event('focus', { bubbles: false }));
        await aTimeout(0);
        // Key press up
        element.dispatchEvent(keyboardEvent('ArrowUp', 38));
        await aTimeout(0);
        const node = element.shadowRoot.querySelectorAll(
          '.endpoints > anypoint-collapse .list-item.endpoint'
        )[2];
        assert.equal(
          element.focusedItem,
          node,
          'element.focusedItem is last item'
        );
      });

      it('focused on next item', async () => {
        element.dispatchEvent(new Event('focus', { bubbles: false }));
        await aTimeout(0);
        // Key press down
        element.dispatchEvent(keyboardEvent('ArrowDown', 40));
        await aTimeout(0);
        const node = element.shadowRoot.querySelector(
          '.endpoints > .section-title'
        );
        assert.equal(
          element.focusedItem,
          node,
          'element.focusedItem is last item'
        );
      });

      it('focused on next item', async () => {
        element.dispatchEvent(new Event('focus', { bubbles: false }));
        await aTimeout(0);
        // Key press down
        element.dispatchEvent(keyboardEvent('ArrowDown', 40));
        await aTimeout(0);
        const node = element.shadowRoot.querySelector(
          '.endpoints > .section-title'
        );
        assert.equal(
          element.focusedItem,
          node,
          'element.focusedItem is last item'
        );
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
        element.dispatchEvent(keyboardEvent('ArrowUp', 38));
        // down
        element.dispatchEvent(keyboardEvent('ArrowDown', 40));
        // esc
        element.dispatchEvent(keyboardEvent('Escape', 27));
        await aTimeout(0);
        assert.equal(keyCounter, 0);
      });

      it('selects operation item with space bar', () => {
        const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('.list-item.operation'));
        node.dispatchEvent(keyboardEvent('Space', 32));
        assert.equal(element.domainId, node.dataset.apiId);
      });

      it('selects operation item with enter', () => {
        const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('.list-item.operation'));
        node.dispatchEvent(keyboardEvent('Enter', 13));
        assert.equal(element.domainId, node.dataset.apiId);
      });

      it('toggles endpoints with space bar', () => {
        const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('.section-title'));
        node.dispatchEvent(keyboardEvent('Space', 32));
        assert.isTrue(element.endpointsOpened);
      });

      it('toggles endpoint with space bar', async() => {
        const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('.list-item.endpoint'));
        node.dispatchEvent(keyboardEvent('Space', 32));
        await aTimeout(0);
        // @ts-ignore
        assert.isTrue(node.nextElementSibling.opened);
      });

      it('shift+tab removes focus', async () => {
        element.dispatchEvent(new Event('focus', { bubbles: false }));
        // Wait for async focus
        await aTimeout(0);
        // Key press 'Tab'
        const e = new KeyboardEvent('keydown', {
          detail: 0,
          bubbles: true,
          cancelable: true,
          composed: true,
          keyCode: 9,
          code: 'Tab',
          key: 'Tab',
          shiftKey: true,
        });
        element.dispatchEvent(e);
        assert.equal(element.getAttribute('tabindex'), '-1');
        assert.isTrue(element[shiftTabPressed]);
        assert.equal(element[focusedItemPrivate], null);
        await aTimeout(1);
        assert.isFalse(element[shiftTabPressed]);
        assert.equal(element.getAttribute('tabindex'), '0');
      });
    });
  });
});
