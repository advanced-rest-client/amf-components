import { assert } from '@open-wc/testing';
import { ApiSchemaGenerator } from '../../src/schema/ApiSchemaGenerator.js';
import { AmfLoader } from '../AmfLoader.js';

/** @typedef {import('../../').Amf.AmfDocument} AmfDocument */
/** @typedef {import('../../').Api.ApiAnyShape} ApiAnyShape */

describe('RAML examples', () => {
  const loader = new AmfLoader();
  const jsonMime = 'application/json';
  const xmlMime = 'application/xml';
  const apiFile = 'example-generator-api';
  /** @type AmfDocument */
  let model;

  before(async () => {
    model = await loader.getGraph(apiFile);
  });

  it('generates JSON example for a payload', () => {
    const payload = loader.getPayloads(model, '/employees', 'post')[1];
    const anyShape = /** @type ApiAnyShape */ (payload.schema);
    const result = ApiSchemaGenerator.asExample(anyShape, jsonMime, {
      renderExamples: true,
      renderOptional: true,
    });
    const { mediaType, value, renderValue } = result;
    assert.equal(mediaType, jsonMime, 'mediaType is set');
    assert.include(value, 'firstName: Other Pawel', 'value has the raw value');
    assert.include(renderValue, '"firstName": "Other Pawel",', 'renderValue has the example value');
  });

  it('generates XML example for a payload', () => {
    const payload = loader.getPayloads(model, '/employees', 'post')[1];
    const anyShape = /** @type ApiAnyShape */ (payload.schema);
    const result = ApiSchemaGenerator.asExample(anyShape, xmlMime, {
      renderExamples: true,
      renderOptional: true,
    });
    const { mediaType, value, renderValue } = result;
    assert.equal(mediaType, xmlMime, 'mediaType is set');
    assert.include(value, 'firstName: Other Pawel', 'value has the raw value');
    assert.include(renderValue, '<firstName>Other Pawel</firstName>', 'renderValue has the example value');
  });
});
