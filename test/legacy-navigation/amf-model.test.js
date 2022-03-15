import { fixture, assert, nextFrame, aTimeout, html } from '@open-wc/testing';
import { AmfLoader } from '../AmfLoader.js';
import '../../define/api-navigation-legacy.js';
import { 
  collectData, 
  docsValue,
  typesValue,
  securityValue,
  endpointsValue,
} from '../../src/elements/ApiNavigationLegacyElement.js';
import { NavigationEvents } from '../../src/events/NavigationEvents.js';

/* eslint-disable no-plusplus */
/* eslint-disable prefer-destructuring */

/** @typedef {import('../../').ApiNavigationLegacyElement} ApiNavigationElement */
/** @typedef {import('../../').Amf.AmfDocument} AmfDocument */

describe('ApiNavigationLegacyElement', () => {
  const loader = new AmfLoader();

  /**
   * @param {AmfDocument=} amf
   * @returns {Promise<ApiNavigationElement>}
   */
  async function basicFixture(amf) {
    return fixture(html`<api-navigation-legacy .amf="${amf}"></api-navigation-legacy>`);
  }

  describe('AMF Computations', () => {
    /** @type ApiNavigationElement */
    let element;

    beforeEach(async () => {
      const amf = await loader.getGraph('navigation-api');
      element = await basicFixture();
      element.amf = amf;
      await nextFrame();
    });

    it('Collects documentation information', () => {
      const result = element[docsValue];
      assert.equal(result.length, 2);
      assert.typeOf(result[0].id, 'string');
      assert.typeOf(result[0].label, 'string');
      assert.equal(result[0].label, 'How to begin');
      assert.typeOf(result[0].isExternal, 'boolean');
      assert.isUndefined(result[0].url);
    });

    it('Collects types information', () => {
      const result = element[typesValue];
      assert.equal(result.length, 10);
      assert.typeOf(result[0].id, 'string');
      assert.typeOf(result[0].label, 'string');
    });

    it('Collects security information', () => {
      const result = element[securityValue];
      assert.equal(result.length, 2);
      assert.typeOf(result[0].id, 'string');
      assert.typeOf(result[0].label, 'string');
    });

    it('Collects endpoints information', () => {
      const result = element[endpointsValue];
      assert.equal(result.length, 32);
      assert.typeOf(result[0].id, 'string');
      assert.typeOf(result[0].label, 'string');
      assert.typeOf(result[0].methods, 'array');
      assert.typeOf(result[0].renderPath, 'boolean');
    });

    it('Collects methods information', () => {
      const result = element[endpointsValue];
      const { methods } = result[0];
      assert.equal(methods.length, 2);
      assert.typeOf(methods[0].id, 'string');
      assert.typeOf(methods[0].label, 'string');
      assert.typeOf(methods[0].method, 'string');
    });

    it('Collects types from a library', () => {
      const result = element[typesValue];
      assert.lengthOf(result, 10);
      assert.equal(result[9].label, 'Type from library');
    });

    it('Types does not include inline declarations', () => {
      const result = element[typesValue];
      for (let i = 0, len = result.length; i < len; i++) {
        assert.equal(result[i].label.indexOf('amf_inline_type'), -1);
      }
    });

    it('renderPath is set on endpoints', () => {
      const result = element[endpointsValue];
      let endpoint = result[0];
      assert.isTrue(endpoint.renderPath);
      endpoint = result[2];
      assert.isFalse(endpoint.renderPath);
    });

    it('Sets missing name as truncated path', () => {
      const result = element[endpointsValue];
      const endpoint = result[2];
      assert.equal(endpoint.label, '/copy');
    });
  });

  describe('APIC-349: AMF cache pipeline', () => {
    describe('When model contains URI IDs', () => {
      /** @type ApiNavigationElement */
      let element;

      beforeEach(async () => {
        const amf = await loader.getGraph('APIC-349-cache-resolution');
        element = await basicFixture();
        element.amf = amf;
        await nextFrame();
      });

      it('Collects documentation information', () => {
        const result = element[docsValue];
        assert.equal(result.length, 4);
        assert.typeOf(result[0].id, 'string');
        assert.typeOf(result[0].label, 'string');
        assert.typeOf(result[0].isExternal, 'boolean');
        assert.isUndefined(result[0].url);
      });

      it('Collects types information', () => {
        const result = element[typesValue];
        assert.equal(result.length, 9);
        assert.typeOf(result[0].id, 'string');
        assert.typeOf(result[0].label, 'string');
      });

      it('Collects endpoints information', () => {
        const result = element[endpointsValue];
        assert.equal(result.length, 5);
        assert.typeOf(result[0].id, 'string');
        assert.typeOf(result[0].label, 'string');
        assert.typeOf(result[0].methods, 'array');
        assert.typeOf(result[0].renderPath, 'boolean');
      });

      it('Collects methods information', () => {
        const result = element[endpointsValue];
        const { methods } = result[0];
        assert.equal(methods.length, 1);
        assert.typeOf(methods[0].id, 'string');
        assert.typeOf(methods[0].method, 'string');
      });
    });
  });

  describe('data-endpoint-* attributes', () => {
    describe('navigation-api', () => {
      /** @type ApiNavigationElement */
      let element;
      /** @type AmfDocument */
      let amf;

      beforeEach(async () => {
        amf = await loader.getGraph('navigation-api');
        element = await basicFixture(amf);
      });

      it('Each endpoint item has data-endpoint-path attribute', () => {
        const nodes = /** @type NodeListOf<HTMLElement> */ (element.shadowRoot.querySelectorAll(
          '.list-item.endpoint'
        ));
        assert.isAbove(nodes.length, 1);
        for (let i = 0, len = nodes.length; i < len; i++) {
          assert.typeOf(nodes[i].dataset.endpointPath, 'string');
          assert.equal(nodes[i].dataset.endpointPath[0], '/');
        }
      });

      it('Each endpoint item has data-endpoint-id attribute', () => {
        const nodes = /** @type NodeListOf<HTMLElement> */ (element.shadowRoot.querySelectorAll(
          '.list-item.endpoint'
        ));
        assert.isAbove(nodes.length, 1);
        for (let i = 0, len = nodes.length; i < len; i++) {
          assert.typeOf(nodes[i].dataset.endpointId, 'string');
          assert.isAbove(nodes[i].dataset.endpointId.length, 0);
        }
      });
    });

    describe('APIC-435', () => {
      /** @type ApiNavigationElement */
      let element;

      beforeEach(async () => {
        const amf = await loader.getGraph('APIC-435');
        element = await basicFixture();
        element.amf = amf;
        await nextFrame();
      });

      it('Collects documentation information', () => {
        const result = element[docsValue];
        assert.equal(result.length, 4);

        assert.typeOf(result[0].id, 'string');
        assert.equal(result[0].label, 'Test Console and Mocking Service');
        assert.isTrue(result[0].isExternal);
        assert.equal(result[0].url, 'http://');

        assert.typeOf(result[1].id, 'string');
        assert.equal(result[1].label, 'Legal');
        assert.isTrue(result[1].isExternal);
        assert.equal(result[1].url, 'http://');

        assert.typeOf(result[2].id, 'string');
        assert.equal(result[2].label, 'Another title');
        assert.isTrue(result[2].isExternal);
        assert.equal(result[2].url, 'http://');

        assert.typeOf(result[3].id, 'string');
        assert.equal(result[3].label, 'Fragment doc title');
        assert.isTrue(result[3].isExternal);
        assert.equal(result[3].url, 'http://');
      });
    });

    describe('documentation information', () => {
      /** @type ApiNavigationElement */
      let element;

      beforeEach(async () => {
        const amf = await loader.getGraph('ext-docs');
        element = await basicFixture();
        element.amf = amf;
        await nextFrame();
      });

      it('collects documentation information', () => {
        const result = element[docsValue];
        assert.equal(result.length, 1);

        assert.typeOf(result[0].id, 'string');
        assert.equal(result[0].label, 'Docs');
        assert.isTrue(result[0].isExternal);
        assert.equal(result[0].url, 'https://example.com');
      });
    });
  });

  describe('[collectData]()', () => {
    /** @type ApiNavigationElement */
    let element;
    /** @type AmfDocument */
    let amf;

    beforeEach(async () => {
      amf = await loader.getGraph('navigation-api');
      element = await basicFixture(amf);
    });

    it('returns empty model when no argument', () => {
      const result = element[collectData](undefined);
      assert.typeOf(result, 'object');
      assert.lengthOf(result.endpoints, 0);
    });

    it('returns endpoints array', () => {
      const result = element[collectData](amf);
      assert.isAbove(result.endpoints.length, 1);
    });

    it('deletes _typeIds', () => {
      const result = element[collectData](amf);
      assert.isUndefined(result._typeIds);
    });

    it('deletes _basePaths', () => {
      const result = element[collectData](amf);
      assert.isUndefined(result._basePaths);
    });
  });

  describe('__amfChanged()', () => {
    /** @type ApiNavigationElement */
    let element;
    /** @type AmfDocument */
    let amf;

    beforeEach(async () => {
      amf = await loader.getGraph('navigation-api');
      element = await basicFixture(amf);
    });

    it('Does nothing when no model', () => {
      element.__amfChanged(undefined);
      // no error
    });

    it('Sets endpoints property', () => {
      element.amf = amf;
      assert.isAbove(element[endpointsValue].length, 1);
    });
  });

  describe('Passive selection', () => {
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

    it('selects an operation', () => {
      const op = loader.lookupOperation(amf, '/files', 'post');
      NavigationEvents.apiNavigate(document.body, op['@id'], 'operation', undefined, true);
      const node = element.shadowRoot.querySelector('.passive-selected');
      assert.ok(node);
    });

    it('opens the collapse', () => {
      const op = loader.lookupOperation(amf, '/files', 'post');
      NavigationEvents.apiNavigate(document.body, op['@id'], 'operation', undefined, true);
      const endpoint = loader.lookupEndpoint(amf, '/files');
      const id = endpoint['@id'];
      const node = element.shadowRoot.querySelector(`.endpoint[data-endpoint-id="${id}"]`);
      // @ts-ignore
      assert.isTrue(node.nextElementSibling.opened);
    });
  });

  describe('Changing model', () => {
    /** @type AmfDocument */
    let compactAmf;
    /** @type AmfDocument */
    let amf;
    before(async () => {
      amf = await loader.getGraph('navigation-api');
      compactAmf = await loader.getGraph('navigation-api');
    });

    /** @type ApiNavigationElement */
    let element;
    beforeEach(async () => {
      element = await basicFixture(amf);
    });

    it('closes methods collapse when changing model', async () => {
      const collapseNode = element.shadowRoot.querySelector('.operation-collapse');
      const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('.list-item.endpoint'));
      node.click();
      await aTimeout(0);
      await aTimeout(0);

      assert.equal(node.getAttribute('data-endpoint-opened'), "");
      assert.equal(collapseNode.getAttribute('data-endpoint-opened'), "");
      // @ts-ignore
      assert.isTrue(collapseNode.opened);

      /* eslint-disable-next-line require-atomic-updates */
      element.amf = compactAmf;
      await nextFrame();

      assert.isNull(node.getAttribute('data-endpoint-opened'));
      assert.isNull(collapseNode.getAttribute('data-endpoint-opened'));
      // @ts-ignore
      assert.isFalse(collapseNode.opened);
    });
  });
});
