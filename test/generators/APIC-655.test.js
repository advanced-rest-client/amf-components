import { assert } from '@open-wc/testing';
import { ApiSchemaGenerator } from '../../src/schema/ApiSchemaGenerator.js';
import { AmfLoader } from '../AmfLoader.js';

/** @typedef {import('../../').Amf.AmfDocument} AmfDocument */
/** @typedef {import('../../').Api.ApiAnyShape} ApiAnyShape */

describe('APIC-655', () => {
  const loader = new AmfLoader();
  const xmlMime = 'application/xml';
  const apiFile = 'APIC-655';

  /** @type AmfDocument */
  let model;

  before(async () => {
    model = await loader.getGraph(apiFile);
  });

  it('generate XML tags correctly for payloads examples', () => {
    const payload = loader.getPayloads(model, '/delivery', 'post')[0];
    
    const anyShape = /** @type ApiAnyShape */ (payload.schema);
    const result = ApiSchemaGenerator.asExample(anyShape, xmlMime, {
      renderExamples: true,
      renderOptional: true,
    });
    
    assert.equal(result.renderValue,
      '<Delivery>\n' +
      '  <orderId>732482783718</orderId>\n' +
      '  <lineItems>\n' +
      '    <lineItemId>9738187235</lineItemId>\n' +
      '    <qty>10</qty>\n' +
      '  </lineItems>\n' +
      '  <lineItems>\n' +
      '    <lineItemId>9832837238</lineItemId>\n' +
      '    <qty>70</qty>\n' +
      '  </lineItems>\n' +
      '</Delivery>'
    );
  });
});
