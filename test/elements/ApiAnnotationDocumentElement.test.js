import { fixture, assert, nextFrame, html } from '@open-wc/testing';
import { AmfLoader } from '../AmfLoader.js';
import '../../define/api-annotation-document.js';
import { DomEventsAmfStore } from '../../src/store/DomEventsAmfStore.js';

/** @typedef {import('../../').ApiAnnotationDocumentElement} ApiAnnotationDocumentElement */
/** @typedef {import('../../src/helpers/amf').AmfDocument} AmfDocument */
/** @typedef {import('../../src/helpers/api').ApiCustomDomainProperty} ApiCustomDomainProperty */

describe('ApiAnnotationDocumentElement', () => {
  const loader = new AmfLoader();
  const store = new DomEventsAmfStore(window);
  store.listen();
  const apiFile = 'annotated-api';
  /**
   * @param {ApiCustomDomainProperty[]=} properties
   * @returns {Promise<ApiAnnotationDocumentElement>}
   */
  async function basicFixture(properties) {
    return fixture(html`<api-annotation-document .customProperties="${properties}"></api-annotation-document>`);
  }

  describe('a11y', () => {
    /** @type ApiAnnotationDocumentElement */
    let element;
    /** @type AmfDocument */
    let model;
    before(async () => {
      model = await loader.getGraph(apiFile);
      store.amf = model;
    });

    beforeEach(async () => {
      const shape = loader.getShape(model, 'ComplexAnnotations');
      element = await basicFixture(shape.customDomainProperties);
      await nextFrame();
    });

    it('is accessible', async () => {
      await assert.isAccessible(element);
    });
  });

  describe('Compact model', () => {
    describe('Model computations', () => {
      /** @type AmfDocument */
      let model;
      before(async () => {
        model = await loader.getGraph(apiFile);
        store.amf = model;
      });

      /** @type ApiAnnotationDocumentElement */
      let element;
      beforeEach(async () => {
        element = await basicFixture();
      });

      it('computes hasCustomProperties when no annotations', () => {
        const shape = loader.getShape(model, 'NoAnnotations');
        element.customProperties = shape.customDomainProperties;
        assert.isFalse(element.hasCustomProperties);
      });

      it('computes hasCustomProperties when has the annotations', () => {
        const shape = loader.getShape(model, 'ComboType');
        element.customProperties = shape.customDomainProperties;
        assert.isTrue(element.hasCustomProperties);
      });

      it('computes the list of annotations', () => {
        const shape = loader.getShape(model, 'ComboType');
        element.customProperties = shape.customDomainProperties;
        assert.typeOf(element.customProperties, 'array');
        assert.lengthOf(element.customProperties, 3);
      });

      it('renders a nil annotation', async () => {
        const shape = loader.getShape(model, 'notRequiredRepeatable');
        element.customProperties = shape.customDomainProperties;
        await nextFrame();
        const node = element.shadowRoot.querySelectorAll('.custom-property')[0];
        assert.ok(node, 'Annotation container is rendered');
        const label = /** @type HTMLElement */ (node.querySelector('.name'));
        assert.ok(label, 'Annotation label is rendered');
        const labelValue = label.innerText.toLowerCase();
        assert.equal(labelValue, 'annotationtest');
      });

      // APIMF-1710
      it('does not render a value for a nil annotation', async () => {
        const shape = loader.getShape(model, 'notRequiredRepeatable');
        element.customProperties = shape.customDomainProperties;
        await nextFrame();
        const node = element.shadowRoot.querySelector('.custom-property');
        assert.ok(node, 'Annotation container is rendered');
        const value = node.querySelector('.scalar-value');
        assert.isEmpty(value.textContent.trim(), 'Annotation value is not rendered');
      });

      it('renders a scalar annotation', async () => {
        const shape = loader.getShape(model, 'ErrorResource');
        element.customProperties = shape.customDomainProperties;
        await nextFrame();
        const node = element.shadowRoot.querySelector('.custom-property');
        assert.ok(node, 'Annotation container is rendered');
        const label = /** @type HTMLElement */ (node.querySelector('.name'));
        assert.ok(label, 'Annotation label is rendered');
        const labelValue = label.innerText.toLowerCase();
        assert.equal(labelValue, 'deprecated');
        const value = node.querySelector('.scalar-value');
        assert.ok(value, 'Annotation value is rendered');
        const scalarList = node.querySelectorAll('.scalar-value');
        assert.equal(scalarList.length, 1, 'Scalar value is rendered');
      });

      it('renders a complex annotation', async () => {
        const shape = loader.getShape(model, 'ComplexAnnotations');
        element.customProperties = shape.customDomainProperties;
        await nextFrame();
        const node = element.shadowRoot.querySelector('.custom-property');
        assert.ok(node, 'Annotation container is rendered');
        const label = /** @type HTMLElement */ (node.querySelector('.name'));
        assert.ok(label, 'Annotation label is rendered');
        const labelValue = label.innerText.toLowerCase();
        assert.equal(labelValue, 'clearancelevel');
        const objectNodes = node.querySelectorAll('.object-property');
        assert.equal(objectNodes.length, 2, 'has all properties rendered');
      });
    });
  });
});
