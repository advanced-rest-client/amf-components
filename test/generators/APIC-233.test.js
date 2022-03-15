import { assert } from '@open-wc/testing';
import { ApiExampleGenerator } from '../../src/schema/ApiExampleGenerator.js';
import { AmfLoader } from '../AmfLoader.js';

/** @typedef {import('../../').Amf.AmfDocument} AmfDocument */
/** @typedef {import('../../').Api.ApiAnyShape} ApiAnyShape */

describe('APIC-233', () => {
  const loader = new AmfLoader();
  const jsonMime = 'application/json';
  const apiFile = 'APIC-233';

  /** @type ApiExampleGenerator */
  let reader;
  /** @type AmfDocument */
  let model;

  before(async () => {
    model = await loader.getGraph(apiFile);
    reader = new ApiExampleGenerator();
  });

  it('renders examples for arabic letters', () => {
    const payload = loader.getResponsePayloads(model, '/stuff', 'get', '200')[0];
    const anyShape = /** @type ApiAnyShape */ (payload.schema);
    
    const result = reader.read(anyShape.examples[0], jsonMime);
    const body = JSON.parse(result);
    assert.typeOf(body, 'object', 'has the result');
    assert.deepEqual(body, {
      "الحالة": "حسنا",
      "message": "Shop in الممل"
    });
  });
});
