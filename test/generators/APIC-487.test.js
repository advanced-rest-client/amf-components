import { assert } from '@open-wc/testing';
import { ApiSchemaGenerator } from '../../src/schema/ApiSchemaGenerator.js';
import { AmfLoader } from '../AmfLoader.js';

/** @typedef {import('../../').Amf.AmfDocument} AmfDocument */
/** @typedef {import('../../').Api.ApiAnyShape} ApiAnyShape */

describe('APIC-487', () => {
  const loader = new AmfLoader();
  const xmlMime = 'application/xml';
  const apiFile = 'APIC-487';

  /** @type AmfDocument */
  let model;

  before(async () => {
    model = await loader.getGraph(apiFile);
  });

  it('returns an example when not XML wrapped', () => {
    const payload = loader.getResponsePayloads(model, '/test1', 'get', '200')[0];
    const anyShape = /** @type ApiAnyShape */ (payload.schema);
    const result = ApiSchemaGenerator.asExample(anyShape, xmlMime, {
      renderExamples: true,
    });
    
    assert.typeOf(result, 'object', 'generates the example');
    const expectedExample =
      '<Person>\n  <addresses>\n    <street></street>\n    <city></city>\n  </addresses>\n</Person>';
    assert.equal(result.renderValue, expectedExample);
  });

  it('returns an example when XML wrapped', () => {
    const payload = loader.getResponsePayloads(model, '/test2', 'post', '200')[0];
    const anyShape = /** @type ApiAnyShape */ (payload.schema);
    const result = ApiSchemaGenerator.asExample(anyShape, xmlMime, {
      renderExamples: true,
    });
    
    assert.typeOf(result, 'object', 'generates the example');
    const expectedExample =
      '<WrappedPerson>\n  <addresses>\n    <Address>\n      <street></street>\n      <city></city>\n    </Address>\n  </addresses>\n</WrappedPerson>';
    // this RAML has no name defined for a wrapped property so it inherits the name from the parent.
    assert.equal(result.renderValue, expectedExample);
  });
});
