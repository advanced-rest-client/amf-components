import { assert } from '@open-wc/testing';
import { ApiSchemaGenerator } from '../../src/schema/ApiSchemaGenerator.js';
import { AmfLoader } from '../AmfLoader.js';

/** @typedef {import('../../').Amf.AmfDocument} AmfDocument */
/** @typedef {import('../../').Api.ApiAnyShape} ApiAnyShape */

describe('APIC-188', () => {
  const loader = new AmfLoader();
  const jsonMime = 'application/json';
  const apiFile = 'APIC-188';

  /** @type AmfDocument */
  let model;

  before(async () => {
    model = await loader.getGraph(apiFile);
  });

  it(`computes a false example`, () => {
    const payload = loader.getPayloads(model, '/record', 'post')[0];
    const anyShape = /** @type ApiAnyShape */ (payload.schema);
    const result = ApiSchemaGenerator.asExample(anyShape, jsonMime, {
      renderExamples: true,
      renderOptional: true,
    });

    const data = JSON.parse(String(result.renderValue));
    assert.isFalse(data.allOrNone);
    assert.typeOf(data.records, 'array');
  });
});
