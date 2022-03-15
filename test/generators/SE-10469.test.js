import { assert } from '@open-wc/testing';
import { ApiSchemaGenerator } from '../../src/schema/ApiSchemaGenerator.js';
import { AmfLoader } from '../AmfLoader.js';

/** @typedef {import('../../').Amf.AmfDocument} AmfDocument */
/** @typedef {import('../../').Api.ApiAnyShape} ApiAnyShape */

describe('SE-10469', () => {
  const loader = new AmfLoader();
  const jsonMime = 'application/json';
  const apiFile = 'SE-10469';

  /** @type AmfDocument */
  let model;

  before(async () => {
    model = await loader.getGraph(apiFile);
  });

  it('generates example from JSON schema', () => {
    const payload = loader.getPayloads(model, '/purina/b2b/supplier/purchaseOrder', 'post')[0];
    const anyShape = /** @type ApiAnyShape */ (payload.schema);
    const result = ApiSchemaGenerator.asExample(anyShape, jsonMime, {
      renderExamples: true,
      renderOptional: true,
    });
    assert.typeOf(result, 'object', 'generates the example');
    assert.typeOf(result.renderValue, 'string', 'has the value');
    
    const data = JSON.parse(result.renderValue);
    assert.typeOf(data, 'object', 'generates an object');
    assert.typeOf(data.purchaseOrder, 'object', 'has the purchaseOrder property');
    assert.equal(data.purchaseOrder.actionCode, '', 'has the purchaseOrder.actionCode');
    assert.equal(data.purchaseOrder.typeCode, '', 'has the purchaseOrder.typeCode');
    assert.typeOf(data.purchaseOrder.purchaseOrderHeader, 'object', 'has the purchaseOrder.purchaseOrderHeader');
  });
});
