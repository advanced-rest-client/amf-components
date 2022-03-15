import { assert } from '@open-wc/testing';
import { ApiSchemaGenerator } from '../../src/schema/ApiSchemaGenerator.js';
import { AmfLoader } from '../AmfLoader.js';

/** @typedef {import('../../').Amf.AmfDocument} AmfDocument */
/** @typedef {import('../../').Api.ApiAnyShape} ApiAnyShape */

describe('APIC-391', () => {
  const loader = new AmfLoader();
  const xmlMime = 'application/xml';
  const apiFile = 'APIC-391';

  /** @type AmfDocument */
  let model;

  before(async () => {
    model = await loader.getGraph(apiFile);
  });

  it('generate XML tags correctly for payloads examples', () => {
    const payload = loader.getPayloads(model, '/shipment-requests', 'post')[0];
    
    const anyShape = /** @type ApiAnyShape */ (payload.schema);
    const result = ApiSchemaGenerator.asExample(anyShape, xmlMime, {
      renderExamples: true,
      renderOptional: true,
    });
    
    assert.equal(result.renderValue,
      '<unknown-type>\n' +
      '  <address>250 HIDEOUT LN</address>\n' +
      '  <comments>Orgin comments entered here.</comments>\n' +
      '  <references>\n' +
      '    <referenceType>Delivery Note</referenceType>\n' +
      '    <referenceValue>7328</referenceValue>\n' +
      '  </references>\n' +
      '</unknown-type>',
    );

  });
});
