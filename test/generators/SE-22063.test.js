import { assert } from '@open-wc/testing';
import { ApiSchemaGenerator } from '../../src/schema/ApiSchemaGenerator.js';
import { AmfLoader } from '../AmfLoader.js';

/** @typedef {import('../../').Amf.AmfDocument} AmfDocument */
/** @typedef {import('../../').Api.ApiAnyShape} ApiAnyShape */

describe('SE-22063', () => {
  const loader = new AmfLoader();
  const xmlMime = 'application/xml';
  const apiFile = 'SE-22063';

  /** @type AmfDocument */
  let model;

  before(async () => {
    model = await loader.getGraph(apiFile);
  });

  it('generates xml example using xml name and xml wrap', () => {
    const payload = loader.getPayloads(model, '/demo', 'post')[0];
    
    const anyShape = /** @type ApiAnyShape */ (payload.schema);
    const result = ApiSchemaGenerator.asExample(anyShape, xmlMime, {
      renderExamples: true,
      renderOptional: true,
    });

    assert.typeOf(result, 'object', 'generates the example');
    assert.typeOf(result.renderValue, 'string', 'has the value');

    assert.equal(
      result.renderValue,
      '<StockBalance>\n' +
      '  <type>site</type>\n' +
      '  <item>\n' +
      '    <StockLine>\n' +
      '      <ssccNumber>P19227</ssccNumber>\n' +
      '      <materialReference>CL54B</materialReference>\n' +
      '      <variantId>R0029</variantId>\n' +
      '      <batch>BA02931</batch>\n' +
      '      <quantity>1</quantity>\n' +
      '    </StockLine>\n' +
      '  </item>\n' +
      '</StockBalance>'
    );
  });
});
