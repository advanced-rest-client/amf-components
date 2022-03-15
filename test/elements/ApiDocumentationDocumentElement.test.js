import { fixture, assert, html, aTimeout, nextFrame } from '@open-wc/testing';
import sinon from 'sinon';
import { AmfLoader } from '../AmfLoader.js';
import { DomEventsAmfStore } from '../../src/store/DomEventsAmfStore.js';
import '../../define/api-documentation-document.js';

/** @typedef {import('../../').ApiDocumentationDocumentElement} ApiDocumentationDocumentElement */
/** @typedef {import('../../src/helpers/amf').AmfDocument} AmfDocument */
/** @typedef {import('../../src/helpers/api').ApiDocumentation} ApiDocumentation */

describe('ApiDocumentationDocumentElement', () => {
  const loader = new AmfLoader();
  const store = new DomEventsAmfStore(window);
  store.listen();
  const apiFile = 'documented-api';

  /**
   * @param {ApiDocumentation} model
   * @returns {Promise<ApiDocumentationDocumentElement>}
   */
  async function graphFixture(model) {
    const element = await fixture(html`
    <api-documentation-document
      .queryDebouncerTimeout="${0}"
      .documentation="${model}"
      ></api-documentation-document>`);
    return /** @type ApiDocumentationDocumentElement */ (element);
  }

  /**
   * @param {string} domainId
   * @returns {Promise<ApiDocumentationDocumentElement>}
   */
  async function domainIdFixture(domainId) {
    const element = await fixture(html`
    <api-documentation-document
      .queryDebouncerTimeout="${0}"
      .domainId="${domainId}"
    ></api-documentation-document>`);
    // there's a debouncer set for the domainId change
    await aTimeout(2);
    await nextFrame();
    return /** @type ApiDocumentationDocumentElement */ (element);
  }

  describe('Compact model', () => {
    describe('Initialization', () => {
      /** @type AmfDocument */
      let model;
      before(async () => {
        model = await loader.getGraph(apiFile);
        store.amf = model;
      });

      it('initializes the component with the domainId', async () => {
        const docs = loader.getDocumentation(model, 'Test docs');
        const element = await domainIdFixture(docs.id);
        await nextFrame();
        const title = element.shadowRoot.querySelector('.documentation-header');
        assert.ok(title, 'has the documentation title');
        const description = element.shadowRoot.querySelector('.api-description');
        assert.ok(description, 'has the description');
      });

      it('initializes the component with the graph model', async () => {
        const docs = loader.getDocumentation(model, 'Test docs');
        const element = await graphFixture(docs);
        const title = element.shadowRoot.querySelector('.documentation-header');
        assert.ok(title, 'has the documentation title');
        const description = element.shadowRoot.querySelector('.api-description');
        assert.ok(description, 'has the description');
      });
    });

    describe('Basics', () => {
      /** @type ApiDocumentationDocumentElement */
      let element;
      /** @type AmfDocument */
      let model;
      /** @type ApiDocumentation */
      let docs;

      before(async () => {
        model = await loader.getGraph(apiFile);
        store.amf = model;
        docs = loader.getDocumentation(model, 'Test docs');
      });

      beforeEach(async () => {
        element = await graphFixture(docs);
      });

      it('has the #model', () => {
        assert.typeOf(element.documentation, 'object');
      });

      it('renders the title', () => {
        const title = element.shadowRoot.querySelector('.documentation-title .label');
        assert.ok(title, 'has the label node');
        assert.equal(title.textContent.trim(), 'Test docs', 'has the title value');
      });

      it('passes the markdown to the "arc-marked" element', () => {
        const node = element.shadowRoot.querySelector('arc-marked');
        assert.typeOf(node.markdown, 'string');
      });
    });

    describe('Navigation', () => {
      /** @type ApiDocumentationDocumentElement */
      let element;
      /** @type AmfDocument */
      let model;
      /** @type ApiDocumentation */
      let docs;
      /** @type NodeListOf<HTMLAnchorElement> */
      let anchors;

      before(async () => {
        model = await loader.getGraph(apiFile);
        store.amf = model;
        docs = loader.getDocumentation(model, 'Read this!');
      });

      beforeEach(async () => {
        element = await graphFixture(docs);
        anchors = element.shadowRoot.querySelectorAll('a');
      });

      it('cancels navigation to a relative path', () => {
        const node = anchors[0];
        const spy = sinon.spy();
        element.addEventListener('click', spy);
        node.click();
        assert.isFalse(spy.called);
      });

      it('allows absolute paths', () => {
        const node = anchors[1];
        let called = false;
        element.addEventListener('click', (e) => {
          called = true;
          e.preventDefault();
        });
        node.click();
        assert.isTrue(called);
      });

      it('allows mailto: paths', () => {
        const node = anchors[2];
        let called = false;
        element.addEventListener('click', (e) => {
          called = true;
          e.preventDefault();
        });
        node.click();
        assert.isTrue(called);
      });

      it('ignores other clicks', () => {
        const spy = sinon.spy();
        element.addEventListener('click', spy);
        const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('.markdown-body'));
        node.click();
        assert.isTrue(spy.called);
      });
    });
  });

});
