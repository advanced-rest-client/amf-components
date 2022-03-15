/* eslint-disable prefer-destructuring */
/* eslint-disable no-param-reassign */
import { fixture, assert, nextFrame, html, aTimeout, oneEvent } from '@open-wc/testing';
import sinon from 'sinon';
import { AmfLoader } from '../AmfLoader.js';
import { DomEventsAmfStore } from '../../src/store/DomEventsAmfStore.js';
import '../../define/api-server-selector.js';
import {
  updateServerSelection,
  serverListTemplate,
  customItems,
} from '../../src/elements/ApiServerSelectorElement.js';

/** @typedef {import('../../src/helpers/amf').AmfDocument} AmfDocument */
/** @typedef {import('../../').SelectionType} SelectionType */
/** @typedef {import('../../').ApiServerSelectorElement} ApiServerSelectorElement */

describe('ApiServerSelectorElement', () => {
  const loader = new AmfLoader();
  const store = new DomEventsAmfStore(window);
  store.listen();

  /**
   * @returns {Promise<ApiServerSelectorElement>} 
   */
  async function basicFixture() {
    const element = /** @type ApiServerSelectorElement */ (await fixture(html`<api-server-selector .queryDebouncerTimeout="${0}"></api-server-selector>`));
    await aTimeout(2);
    return element;
  }

  /**
   * @returns {Promise<ApiServerSelectorElement>} 
   */
  async function allowCustomFixture() {
    const element = /** @type ApiServerSelectorElement */ (await fixture(html`<api-server-selector allowCustom .queryDebouncerTimeout="${0}"></api-server-selector>`));
    await aTimeout(2);
    return element;
  }

  /**
   * @returns {Promise<ApiServerSelectorElement>} 
   */
  async function customInputFixture() {
    const element = /** @type ApiServerSelectorElement */ (await fixture(html`<api-server-selector
      allowCustom
      type="custom"
      .queryDebouncerTimeout="${0}"
    ></api-server-selector>`));
    await aTimeout(2);
    return element;
  }

  /**
   * @returns {Promise<ApiServerSelectorElement>} 
   */
  async function extraOptionsFixture() {
    const element = /** @type ApiServerSelectorElement */ (await fixture(html`
      <api-server-selector .queryDebouncerTimeout="${0}">
        <anypoint-item slot="custom-base-uri" value="http://customServer.com">
          http://customServer.com
        </anypoint-item>
        <anypoint-item slot="custom-base-uri" data-value="http://customServer2.com">
          http://customServer2.com
        </anypoint-item>
    </api-server-selector>`));
    await aTimeout(2);
    return element;
  }

  /**
   * @returns {Promise<ApiServerSelectorElement>} 
   */
  async function slotChangeFixture() {
    const element = /** @type ApiServerSelectorElement */ (await fixture(html`
      <api-server-selector .queryDebouncerTimeout="${0}">
        <anypoint-item slot="custom-base-uri" value="http://customServer.com">
          http://customServer.com
        </anypoint-item>
        <anypoint-item slot="custom-base-uri" data-value="http://customServer2.com">
          http://customServer2.com
        </anypoint-item>
        <anypoint-item data-value="http://customServer3.com">
          http://customServer3.com
        </anypoint-item>
    </api-server-selector>`));
    await aTimeout(2);
    return element;
  }

  /**
   * @returns {Promise<ApiServerSelectorElement>} 
   */
  async function baseUriFixture() {
    const element = /** @type ApiServerSelectorElement */ (await fixture(html`<api-server-selector .queryDebouncerTimeout="${0}" allowCustom baseUri="https://www.google.com"></api-server-selector>`));
    await aTimeout(2);
    return element;
  }

  /**
   * @returns {Promise<ApiServerSelectorElement>} 
   */
  async function anypointFixture() {
    const element = /** @type ApiServerSelectorElement */ (await fixture(html`<api-server-selector
      allowCustom
      anypoint
      .queryDebouncerTimeout="${0}"
      ></api-server-selector>`));
    await aTimeout(2);
    return element;
  }

  /**
   * @returns {Promise<ApiServerSelectorElement>} 
   */
  async function outlinedFixture() {
    const element = /** @type ApiServerSelectorElement */ (await fixture(html`<api-server-selector
      allowCustom
      outlined
      .queryDebouncerTimeout="${0}"
      >
    </api-server-selector>`));
    await aTimeout(2);
    return element;
  }

  /**
   * @returns {Promise<ApiServerSelectorElement>} 
   */
  async function autoSelectFixture() {
    const element = /** @type ApiServerSelectorElement */ (await fixture(html`
      <api-server-selector autoSelect .queryDebouncerTimeout="${0}"></api-server-selector>
    `));
    await aTimeout(2);
    return element;
  }

  /**
   * @returns {Promise<ApiServerSelectorElement>} 
   */
  async function unselectableFixture() {
    const element = /** @type ApiServerSelectorElement */ (await fixture(html`
      <api-server-selector .queryDebouncerTimeout="${0}">
      <anypoint-item slot="custom-base-uri">
        srv 1
      </anypoint-item>
      <anypoint-item slot="custom-base-uri" data-value="http://srv.com">
        srv 2
      </anypoint-item>
      </api-server-selector>
    `));
    await aTimeout(2);
    return element;
  }

  /**
   * @returns {Promise<ApiServerSelectorElement>} 
   */
  async function extraOptionsCustomFixture() {
    const element = /** @type ApiServerSelectorElement */ (await fixture(html`
      <api-server-selector allowCustom .queryDebouncerTimeout="${0}">
        <anypoint-item slot="custom-base-uri" value="http://customServer.com">
          http://customServer.com
        </anypoint-item>
        <anypoint-item slot="custom-base-uri" data-value="http://customServer2.com">
          http://customServer2.com
        </anypoint-item>
    </api-server-selector>`));
    await aTimeout(2);
    return element;
  }

  /**
   * @returns {Promise<ApiServerSelectorElement>} 
   */
  async function autoSelectFixtureWithSlots() {
    const element = /** @type ApiServerSelectorElement */ (await fixture(html`
      <api-server-selector allowCustom autoSelect .queryDebouncerTimeout="${0}">
        <anypoint-item slot="custom-base-uri" data-value="http://customServer.com">
          http://customServer.com
        </anypoint-item>
        <anypoint-item slot="custom-base-uri" value="http://customServer2.com">
          http://customServer2.com
        </anypoint-item>
    </api-server-selector>`));
    await aTimeout(2);
    return element;
  }

  /**
   * @param {string=} domainId
   * @param {SelectionType=} domainType
   * @returns {Promise<ApiServerSelectorElement>} 
   */
  async function domainIdFixture(domainId, domainType) {
    const element = /** @type ApiServerSelectorElement */ (await fixture(html`
      <api-server-selector .queryDebouncerTimeout="${0}" .domainId="${domainId}" .domainType="${domainType}">
    </api-server-selector>`));
    await aTimeout(2);
    return element;
  }

  /**
   * @param {string=} domainId
   * @param {SelectionType=} domainType
   * @param {any=} value
   * @returns {Promise<ApiServerSelectorElement>} 
   */
  async function domainIdFixtureWithValue(domainId, domainType, value) {
    const element = /** @type ApiServerSelectorElement */ (await fixture(html`
      <api-server-selector .queryDebouncerTimeout="${0}"
        .domainId="${domainId}"
        .domainType="${domainType}"
        .value="${value}"
      >
    </api-server-selector>`));
    await aTimeout(2);
    return element;
  }

  describe('basic usage', () => {
    it('renders empty dropdown', async () => {
      const element = await basicFixture();
      const node = element.shadowRoot.querySelector('.api-server-dropdown');
      assert.exists(node, 'dropdown exists');
      const items = node.querySelectorAll('anypoint-items');
      assert.lengthOf(items, 0, 'has no list items');
    });

    it('does not render custom input', async () => {
      const element = await basicFixture();
      const node = element.shadowRoot.querySelector('.uri-input');
      assert.notExists(node);
    });

    it('does not render custom value when allowCustom is not set', async () => {
      const element = await basicFixture();
      element.value = 'https://custom';
      await nextFrame();
      const node = element.shadowRoot.querySelector('.uri-input');
      assert.notExists(node);
    });

    it('does not render custom value when selection is made', async () => {
      const element = await extraOptionsFixture();
      element.value = 'http://customServer.com';
      await nextFrame();
      const node = element.shadowRoot.querySelector('.uri-input');
      assert.notExists(node);
    });

    it('renders custom uri input', async () => {
      const element = await customInputFixture();
      const node = element.shadowRoot.querySelector('.uri-input');
      assert.exists(node);
    });

    it('custom uri input has empty value', async () => {
      const element = await customInputFixture();
      const node = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('.uri-input'));
      assert.equal(node.value, '');
    });

    it('renders empty slot', async () => {
      const element = await basicFixture();
      const slot = element.shadowRoot.querySelector('slot');
      assert.exists(slot);
      assert.lengthOf(slot.assignedElements(), 0)
    });

    it('does not render `Custom URI` option by default', async () => {
      const element = await basicFixture();
      assert.notExists(element.shadowRoot.querySelector('.custom-option'));
    });

    it('sets baseUri and renders as Custom', async () => {
      const element = await baseUriFixture();
      await nextFrame();
      element.allowCustom = false;
      assert.equal(element.value, 'https://www.google.com');
      assert.equal(element.type, 'custom');
      assert.equal(element.baseUri, 'https://www.google.com');
    });

    it('resets value when no server', async () => {
      const element = await basicFixture();
      await nextFrame();

      element[updateServerSelection](undefined)
      await nextFrame();
      assert.equal(element.value, '');
      assert.equal(element.type, 'server');
    });
  });

  describe('#allowCustom', () => {
    it('renders `Custom URI` option', async () => {
      const element = await allowCustomFixture();
      assert.exists(element.shadowRoot.querySelector('.custom-option'));
    });

    it('dispatched change event when the value changes', async () => {
      const element = await allowCustomFixture();
      const spy = sinon.spy();
      element.addEventListener('apiserverchanged', spy);
      element.value = 'https://example.com';
      element.type = 'custom';
      await nextFrame();
      assert.isTrue(spy.called, 'event is dispatched');
      const { detail } = spy.args[0][0];
      assert.deepEqual(detail, {
        value: 'https://example.com',
        type: 'custom',
      })
    });

    it('selects a custom uri', async () => {
      const element = await allowCustomFixture();
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('[data-value="custom"]'));
      node.click();
      assert.equal(element.value, '');
      assert.equal(element.type, 'custom');
    });

    it('removed the input when close is clicked', async () => {
      const element = await customInputFixture();
      element.value = 'test';
      await nextFrame();
      const node = element.shadowRoot.querySelector('anypoint-icon-button');
      node.click();
      await nextFrame();
      assert.equal(element.value, '', 'value is reset');
      assert.equal(element.type, 'server', 'type is reset');
      assert.notExists(element.shadowRoot.querySelector('.uri-input'), 'input is removed');
    });

    it('resets when disabling the value', async () => {
      const element = await customInputFixture();
      element.allowCustom = false;
      assert.equal(element.type, 'server');
    });
  })

  describe('#baseUri', () => {
    let element;

    beforeEach(async () => {
      element = await baseUriFixture();
    });

    it('has baseUri as value', () => {
      assert.equal(element.value, 'https://www.google.com');
    })

    it('returns baseUri as value after setting the value', () => {
      element.value = 'test uri';
      assert.equal(element.value, 'https://www.google.com');
    })

    it('updates when new baseUri is set', () => {
      element.baseUri = 'https://www.google.com/v1';
      assert.equal(element.value, 'https://www.google.com/v1');
      assert.equal(element.baseUri, 'https://www.google.com/v1');
      assert.equal(element.type, 'custom');
    })
  });

  describe('slotted items', () => {
    it('has two assigned nodes to the slot', async () => {
      const element = await extraOptionsFixture();
      const slot = /** @type HTMLSlotElement */ (element.shadowRoot.querySelector('slot[name="custom-base-uri"]'));
      const nodes = slot.assignedElements();
      assert.lengthOf(nodes, 2);
    });

    it('has a total of 2 servers', async () => {
      const element = await extraOptionsFixture();
      assert.equal(element.serversCount, 2)
    });

    it('renders 2 servers', async () => {
      const element = await slotChangeFixture();
      assert.equal(element.serversCount, 2);
    })

    it('dispatches serverscountchanged event when a slot is added', async () => {
      const element = await slotChangeFixture();
      const toBeSlotted = element.children[2];
      const spy = sinon.spy();
      element.addEventListener('serverscountchanged', spy);
      toBeSlotted.setAttribute('slot', 'custom-base-uri');
      await nextFrame();

      assert.isTrue(spy.called, 'event is dispatched');
      const { detail } = spy.args[0][0];
      assert.deepEqual(detail, {
        value: 3
      });
    })

    it('renders 3 servers after the update', async () => {
      const element = await slotChangeFixture();
      const toBeSlotted = element.children[2];
      toBeSlotted.setAttribute('slot', 'custom-base-uri');
      await nextFrame();
      assert.equal(element.serversCount, 3);
    })
  });

  describe('#opened', () => {
    let element;
    beforeEach(async () => {
      element = await extraOptionsFixture();
    });

    it('opened is false by default', async () => {
      assert.isFalse(element.opened);
    });

    it('sets #opened to true when drop down is opened', async () => {
      const node = element.shadowRoot.querySelector('anypoint-dropdown-menu');
      node.opened = true;
      await nextFrame();

      assert.isTrue(element.opened);
    });

    it('opens the dropdown when the property is set', async () => {
      element.opened = true;
      await nextFrame();
      const node = element.shadowRoot.querySelector('anypoint-dropdown-menu');
      assert.isTrue(node.opened);
    });

    it('closes the dropdown when the property is set', async () => {
      element.opened = true;
      await nextFrame();
      element.opened = false;
      await nextFrame();
      const node = element.shadowRoot.querySelector('anypoint-dropdown-menu');
      assert.isFalse(node.opened);
    });

    it('sets fitPositionTarget', async () => {
      element.opened = true;
      await nextFrame();
      element.opened = false;
      await nextFrame();
      const node = element.shadowRoot.querySelector('anypoint-dropdown-menu');
      assert.isTrue(node.fitPositionTarget);
    });
  });

  async function changeSelection(element, { selected, type }) {
    element.domainId = selected;
    element.domainType = type;
    await aTimeout(2)
  }

  describe('[serverListTemplate]()', () => {
    /** @type AmfDocument */
    let model;
    /** @type ApiServerSelectorElement */
    let element;
    
    before(async () => {
      model = await loader.getGraph('servers-api');
      store.amf = model;
    });

    beforeEach(async () => {
      element = await basicFixture();
    });

    it('returns empty array when servers is null', () => {
      element.servers = null;
      assert.lengthOf(element[serverListTemplate](), 0);
    });

    it('returns list of servers for the document', () => {
      assert.lengthOf(element[serverListTemplate](), 4);
    });

    it('returns list of servers for an endpoint', async () => {
      const endpoint = loader.lookupEndpoint(model, '/ping');
      const endpointId = endpoint['@id'];
      const detail = {
        selected: endpointId,
        type: 'resource',
      };
      await changeSelection(element, detail);
      await nextFrame();
      assert.lengthOf(element[serverListTemplate](), 1);
    });

    it('returns list of servers for a method', async () => {
      const endpoint = loader.lookupEndpoint(model, '/ping');
      const method = loader.lookupOperation(model, '/ping', 'get');
      const endpointId = endpoint['@id'];
      const methodId = method['@id'];
      const detail = {
        selected: methodId,
        type: 'operation',
        endpointId,
      };
      await changeSelection(element, detail);
      assert.lengthOf(element[serverListTemplate](), 2);
    });
  });

  describe('[selectionChangeHandler]', () => {
    /** @type AmfDocument */
    let model;
    
    before(async () => {
      model = await loader.getGraph('servers-api');
      store.amf = model;
    });

    it('selects a server', async () => {
      const element = await basicFixture();

      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('[data-value="https://{customerId}.saas-app.com:{port}/v2"]'));
      node.click();
      await nextFrame();

      assert.equal(element.value, 'https://{customerId}.saas-app.com:{port}/v2');
      assert.equal(element.type, 'server');
    });

    it('selects custom URI', async () => {
      const element = await allowCustomFixture();

      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('[data-value="custom"]'));
      node.click();

      assert.equal(element.value, '');
      assert.equal(element.type, 'custom');
    });
  });

  describe('apiserverscount event', () => {
    before(async () => {
      store.amf = undefined;
    });

    describe('initialization', () => {
      /** @type ApiServerSelectorElement */
      let element;
      let event;

      beforeEach(async () => {
        element = document.createElement('api-server-selector');
        document.body.appendChild(element);
        event = await oneEvent(element, 'serverscountchanged');
      });

      afterEach(() => {
        document.body.removeChild(element);
      });

      it('should render 0 servers', () => {
        assert.equal(element.serversCount, 0);
      });

      it('should have triggered event', () => {
        assert.deepEqual(event.detail, {
          value: 0
        });
      });
    });

    describe('allowCustom change', () => {
      /** @type ApiServerSelectorElement */
      let element;
      let event;

      beforeEach(async () => {
        element = await basicFixture();
        const handler = (e) => {
          event = e;
        }
        element.addEventListener('serverscountchanged', handler);
        element.allowCustom = true;
        await nextFrame();
      });

      it('should have triggered event', () => {
        assert.deepEqual(event.detail, {
          value: 1
        });
      })
    });
  });

  describe('anypoint property', () => {
    /** @type AmfDocument */
    let model;
    /** @type ApiServerSelectorElement */
    let element;
    
    before(async () => {
      model = await loader.getGraph('servers-api');
      store.amf = model;
    });

    beforeEach(async () => {
      element = await anypointFixture();
    });

    it('sets the anypoint property on the dropdown', () => {
      assert.isTrue(element.anypoint);
    });

    it('sets the anypoint property on the custom item', () => {
      const item = element.shadowRoot.querySelector('anypoint-item');
      assert.isTrue(item.hasAttribute('anypoint'));
    });

    it('sets the anypoint property on the server items', async () => {
      // class="custom-option"
      const nodes = element.shadowRoot.querySelectorAll('anypoint-item');
      const items = Array.from(nodes).filter((node) => node.getAttribute('value') !== 'custom');
      assert.isAbove(items.length, 0);
      for (let i = 0; i < items.length; i++) {
        assert.isTrue(items[i].hasAttribute('anypoint'));
      }
    });

    it('sets the anypoint property on the custom input', async () => {
      element.type = 'custom';
      element.value = 'https://example.com';
      await nextFrame();
      const item = element.shadowRoot.querySelector('anypoint-input');
      assert.isTrue(item.hasAttribute('anypoint'));
    });
  });

  describe('outlined theme', () => {
    /** @type ApiServerSelectorElement */
    let element;

    beforeEach(async () => {
      element = await outlinedFixture();
    });

    it('sets outlined on the dropdown', () => {
      assert.isTrue(element.outlined);
    });

    it('sets outlined on the custom input', async () => {
      element.type = 'custom';
      element.value = 'https://example.com';
      await nextFrame();
      const item = element.shadowRoot.querySelector('anypoint-input');
      assert.isTrue(item.hasAttribute('outlined'));
    });
  });

  describe('slot elements', () => {
    /** @type AmfDocument */
    let model;
    /** @type ApiServerSelectorElement */
    let element;
    
    before(async () => {
      model = await loader.getGraph('servers-api');
      store.amf = model;
    });

    beforeEach(async () => {
      element = await extraOptionsFixture();
    });

    it('selects slot value', async () => {
      element.value = 'http://customServer2.com';
      await nextFrame();
      assert.equal(element.value, 'http://customServer2.com');
    });
  });

  describe('auto selection', () => {
    /** @type AmfDocument */
    let model;
    
    before(async () => {
      model = await loader.getGraph('servers-api');
      store.amf = model;
    });

    it('selects a default server for the API model', async () => {
      const element = await autoSelectFixture();
      assert.equal(element.value, 'https://{customerId}.saas-app.com:{port}/v2');
    });

    it('selects when changing selection to an endpoint', async () => {
      const element = await autoSelectFixture();
      const endpoint = loader.lookupEndpoint(model, '/ping');
      const endpointId = endpoint['@id'];
      const detail = {
        selected: endpointId,
        type: 'resource',
      };
      await changeSelection(element, detail);
      await nextFrame();
      assert.equal(element.value, 'https://endpoint.example.com');
    });

    it('selects when changing selection to a method', async () => {
      const element = await autoSelectFixture();
      const endpoint = loader.lookupEndpoint(model, '/ping');
      const method = loader.lookupOperation(model, '/ping', 'get');
      const endpointId = endpoint['@id'];
      const methodId = method['@id'];
      const detail = {
        selected: methodId,
        type: 'operation',
        endpointId,
      };
      await changeSelection(element, detail);
      await nextFrame();
      assert.equal(element.value, 'https://echo.example.com');
    });

    it('keeps selection when possible', async () => {
      const element = await autoSelectFixture();
      const endpoint1 = loader.lookupEndpoint(model, '/default');
      const method1 = loader.lookupOperation(model, '/default', 'get');
      const endpoint2 = loader.lookupEndpoint(model, '/duplicated');
      const method2 = loader.lookupOperation(model, '/duplicated', 'get');

      const detail = {
        selected: method1['@id'],
        type: 'operation',
        endpointId: endpoint1['@id'],
      };
      await changeSelection(element, detail);
      await nextFrame();
      element.value = 'http://beta.api.openweathermap.org/data/2.5/';
      await nextFrame();
      const detail2 = {
        selected: method2['@id'],
        type: 'operation',
        endpointId: endpoint2['@id'],
      };
      await changeSelection(element, detail2);
      await nextFrame();
      assert.equal(element.value, 'http://beta.api.openweathermap.org/data/2.5/');
    });
  });

  describe('no servers in model', () => {
    /** @type AmfDocument */
    let model;
    
    before(async () => {
      model = await loader.getGraph('no-servers-api');
      store.amf = model;
    });

    it('selects first slot element if there are no model servers', async () => {
      const element = await autoSelectFixtureWithSlots();
      assert.equal(element.value, 'http://customServer.com');
      assert.equal(element.type, 'extra');
    });

    it('dispatches slot selection event if there are no model servers', async () => {
      let detail;
      // @ts-ignore
      window.addEventListener('apiserverchanged', (e) => { detail = e.detail; });
      await autoSelectFixtureWithSlots();
      assert.isDefined(detail, 'has the event');
      // @ts-ignore
      assert.equal(detail.value, 'http://customServer.com');
      // @ts-ignore
      assert.equal(detail.type, 'extra');
    });
  });

  describe('items without a value', () => {
    /** @type AmfDocument */
    let model;
    /** @type ApiServerSelectorElement */
    let element;
    
    before(async () => {
      model = await loader.getGraph('servers-api');
      store.amf = model;
    });

    beforeEach(async () => {
      element = await unselectableFixture();
    });

    it('do not select element that has no value', () => {
      // first item has no value
      const node = element.querySelector('anypoint-item');
      node.click();

      assert.equal(element.value, '');
    });
  });

  describe('#serverValues', () => {
    const serverValues = [
      'https://{customerId}.saas-app.com:{port}/v2',
      'https://{region}.api.cognitive.microsoft.com',
      'https://api.openweathermap.org/data/2.5/',
      'http://beta.api.openweathermap.org/data/2.5/'
    ];
    const customValues = [
      'http://customServer.com',
      'http://customServer2.com'
    ];

    /** @type AmfDocument */
    let model;
    
    before(async () => {
      model = await loader.getGraph('servers-api');
    });

    it('returns values from servers', async () => {
      store.amf = model;
      const element = await basicFixture();
      const result = element.serverValues;
      assert.deepEqual(result, serverValues);
    });

    it('returns values from custom servers', async () => {
      store.amf = undefined;
      const element = await extraOptionsFixture();
      const result = element.serverValues;
      assert.deepEqual(result, customValues);
    });

    it('returns values from servers and custom servers', async () => {
      store.amf = model;
      const element = await extraOptionsFixture();
      const result = element.serverValues;
      assert.deepEqual(result, serverValues.concat(customValues));
    });
  });

  describe('#isValueCustom', () => {
    /** @type AmfDocument */
    let model;
    
    before(async () => {
      model = await loader.getGraph('servers-api');
      store.amf = model;
    });

    it('returns false when no value', async () => {
      const element = await basicFixture();
      const result = element.isValueCustom;
      assert.isFalse(result);
    });

    it('returns false when value is on the servers list', async () => {
      const element = await basicFixture();
      element.value = 'https://{customerId}.saas-app.com:{port}/v2';
      const result = element.isValueCustom;
      assert.isFalse(result);
    });

    it('returns false when value is on the custom servers list', async () => {
      const element = await extraOptionsFixture();
      element.value = 'http://customServer.com';
      const result = element.isValueCustom;
      assert.isFalse(result);
    });

    it('returns true when on either of lists', async () => {
      const element = await extraOptionsFixture();
      element.value = 'http://mostCustomServer.com';
      const result = element.isValueCustom;
      assert.isTrue(result);
    });
  });

  describe('#[customItems]', () => {
    const customValues = [
      'http://customServer.com',
      'http://customServer2.com'
    ];

    /** @type AmfDocument */
    let model;
    
    before(async () => {
      model = await loader.getGraph('servers-api');
      store.amf = model;
    });

    it('is empty array by default', async () => {
      const element = await basicFixture();
      const result = element[customItems];
      assert.deepEqual(result, []);
    });

    it('adds custom items to the list', async () => {
      const element = await slotChangeFixture();
      const result = element[customItems];
      assert.deepEqual(result, customValues);
    });

    it('updates a list when a child is removed', async () => {
      const element = await slotChangeFixture();
      const item = element.querySelector('anypoint-item');
      element.removeChild(item);
      await nextFrame();
      const result = element[customItems];
      assert.deepEqual(result, [customValues[1]]);
    });

    it('sets empty array when no items', async () => {
      const element = await slotChangeFixture();
      const items = element.querySelectorAll('anypoint-item');
      Array.from(items).forEach((item) => element.removeChild(item));
      await nextFrame();
      const result = element[customItems];
      assert.deepEqual(result, []);
    });
  });

  describe('#value setter', () => {
    const serverValues = [
      'https://{customerId}.saas-app.com:{port}/v2',
      'https://{region}.api.cognitive.microsoft.com',
      'https://api.openweathermap.org/data/2.5/',
      'http://beta.api.openweathermap.org/data/2.5/'
    ];
    const customValues = [
      'http://customServer.com',
      'http://customServer2.com'
    ];

    /** @type AmfDocument */
    let model;
    
    before(async () => {
      model = await loader.getGraph('servers-api');
      store.amf = model;
    });

    it('selects value from rendered servers', async () => {
      const element = await basicFixture();
      element.value = serverValues[1];
      await nextFrame();
      const node = element.shadowRoot.querySelector('anypoint-listbox');
      assert.equal(node.selected, serverValues[1]);
    });

    it('selects value from rendered custom servers', async () => {
      const element = await extraOptionsFixture();
      element.value = customValues[1];
      await nextFrame();
      const node = element.shadowRoot.querySelector('anypoint-listbox');
      assert.equal(node.selected, customValues[1]);
    });

    it('opens the custom editor when value is custom', async () => {
      const element = await extraOptionsCustomFixture();
      element.value = 'super-custom';
      element.type = 'custom';
      await nextFrame();
      assert.isTrue(element.isCustom);
    });
  });

  describe('domainId & domainType', () => {
    /** @type ApiServerSelectorElement */
    let element;
    let method;
    let methodId;

    /** @type AmfDocument */
    let model;
    
    before(async () => {
      model = await loader.getGraph('servers-api');
      store.amf = model;
    });

    beforeEach(async () => {
      element = await basicFixture();
      method = loader.lookupOperation(model, '/ping', 'get');
      methodId = method['@id'];
    });

    it('should load method servers on init', async () => {
      element = await domainIdFixture(methodId, 'operation');
      assert.equal(element.servers.length, 2)
    });

    it('should load root servers on init with invalid domainId', async () => {
      element = await domainIdFixture('', 'operation');
      assert.equal(element.servers.length, 4)
    });

    it('should load root servers on init with invalid domainType', async () => {
      // @ts-ignore
      element = await domainIdFixture(methodId, '');
      assert.equal(element.servers.length, 4)
    });

    it('should change to new endpoint\'s servers after navigation', async () => {
      element = await domainIdFixture(methodId, 'operation');
      const endpoint = loader.lookupEndpoint(model, '/ping');
      const id = endpoint['@id'];
      const detail = {
        selected: id,
        type: 'resource'
      };
      await changeSelection(element, detail);
      await nextFrame();
      assert.lengthOf(element.servers, 1);
    });

    it('should change to new method\'s servers after navigation', async () => {
      element = await domainIdFixture(methodId, 'operation');
      const nextMethod = loader.lookupOperation(model, '/files', 'get');
      const id = nextMethod['@id'];
      const detail = {
        selected: id,
        type: 'operation'
      };
      await changeSelection(element, detail);
      await nextFrame();
      assert.lengthOf(element.servers, 1);
    });

    it('starts with a selected server value that is not the first one available', async () => {
      element = await domainIdFixtureWithValue(methodId, 'operation', 'https://echo2.example.com');
      assert.equal(element.value, 'https://echo2.example.com');
    });
  });

  describe('onapiserverchange', () => {
    /** @type ApiServerSelectorElement */
    let element;
    beforeEach(async () => {
      element = await allowCustomFixture();
    });

    it('has no initial value', () => {
      assert.equal(element.onapiserverchange, null);
    });

    it('sets an event listener', () => {
      const fn = () => {};
      element.onapiserverchange = fn;
      assert.isTrue(element.onapiserverchange === fn);
    });

    it('calls the callback function', async () => {
      let called = false;
      const fn = () => { called = true; };
      element.onapiserverchange = fn;
      element.value = 'https://example.com';
      await nextFrame();
      assert.isTrue(called);
    });

    it('clears the callback function', () => {
      let called = false;
      const fn = () => { called = true; };
      element.onapiserverchange = fn;
      element.onapiserverchange = null;
      element.value = 'https://example.com';
      assert.isFalse(called);
    });

    it('unregisters old function', async () => {
      let called1 = false;
      let called2 = false;
      const fn1 = () => { called1 = true; };
      const fn2 = () => { called2 = true; };
      element.onapiserverchange = fn1;
      element.onapiserverchange = fn2;
      element.value = 'https://example.com';
      await nextFrame();
      assert.isFalse(called1);
      assert.isTrue(called2);
    });
  });

  describe('onserverscountchange', () => {
    /** @type ApiServerSelectorElement */
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('has no initial value', () => {
      assert.equal(element.onserverscountchange, null);
    });

    it('sets an event listener', () => {
      const fn = () => {};
      element.onserverscountchange = fn;
      assert.isTrue(element.onserverscountchange === fn);
    });

    it('calls the callback function', async () => {
      let called = false;
      const fn = () => { called = true; };
      element.onserverscountchange = fn;
      element.allowCustom = true;
      await nextFrame();
      assert.isTrue(called);
    });

    it('clears the callback function', () => {
      let called = false;
      const fn = () => { called = true; };
      element.onserverscountchange = fn;
      element.onserverscountchange = null;
      element.allowCustom = true;
      assert.isFalse(called);
    });

    it('unregisters old function', () => {
      let called1 = false;
      let called2 = false;
      const fn1 = () => { called1 = true; };
      const fn2 = () => { called2 = true; };
      element.onserverscountchange = fn1;
      element.onserverscountchange = fn2;
      element.allowCustom = true;
      assert.isFalse(called1);
      assert.isTrue(called2);
    });
  });

  describe('a11y', () => {
    /** @type AmfDocument */
    let model;
        
    before(async () => {
      model = await loader.getGraph('servers-api');
      store.amf = model;
    });

    it('is accessible when no selection', async () => {
      const element = await basicFixture();
      await assert.isAccessible(element);
    });

    it('is accessible with selection', async () => {
      const element = await autoSelectFixture();
      await assert.isAccessible(element);
    });

    it('is accessible with custom input', async () => {
      const element = await customInputFixture();
      await assert.isAccessible(element);
    });

    it('is accessible with light children', async () => {
      const element = await extraOptionsFixture();
      await assert.isAccessible(element);
    });
  });
});
