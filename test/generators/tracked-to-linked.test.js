import { assert } from '@open-wc/testing';
import { ApiSchemaGenerator } from '../../src/schema/ApiSchemaGenerator.js';
import { AmfLoader } from '../AmfLoader.js';

/** @typedef {import('../../').Amf.AmfDocument} AmfDocument */
/** @typedef {import('../../').Api.ApiAnyShape} ApiAnyShape */

describe('Tracked examples', () => {
  const loader = new AmfLoader();
  const jsonMime = 'application/json';
  const xmlMime = 'application/xml';

  /** @type AmfDocument */
  let model;

  before(async () => {
    model = await loader.getGraph('tracked-to-linked');
  });

  it('basic formatting and type name', () => {
    const payload = loader.getPayloads(model, '/employees', 'get')[0];
    
    const anyShape = /** @type ApiAnyShape */ (payload.schema);
    const result = ApiSchemaGenerator.asExample(anyShape, jsonMime, {
      renderExamples: true,
      renderOptional: true,
    });
    
    assert.equal(
      result.value,
      '-\n  id: 1\n  name: John\n-\n  id: 2\n  name: Sam',
      "Example's raw is set"
    );

    const parsed = JSON.parse(result.renderValue);
    
    assert.typeOf(parsed, 'array', 'represents an array');
    assert.lengthOf(parsed, 2, 'has 2 items');
    
    const [e1, e2] = parsed;
    assert.equal(e1.id, 1, 'has the example1.id');
    assert.equal(e1.name, 'John', 'has the example1.name');
    assert.equal(e2.id, 2, 'has the example2.id');
    assert.equal(e2.name, 'Sam', 'has the example2.name');
  });

  it('generates example for POST', () => {
    const payload = loader.getPayloads(model, '/employees', 'post')[0];
    
    const anyShape = /** @type ApiAnyShape */ (payload.schema);
    const result = ApiSchemaGenerator.asExample(anyShape, jsonMime, {
      renderExamples: true,
      renderOptional: true,
    });
    
    assert.equal(
      result.value,
      'id: 1\nname: "John"',
      "Example's raw is set"
    );

    const parsed = JSON.parse(result.renderValue);
    
    assert.deepEqual(parsed, 
      {
        "id": 1,
        "name": "John"
      }
    );
  });

  it('generates example for DELETE', () => {
    const payload = loader.getPayloads(model, '/employees', 'delete')[0];
    
    const anyShape = /** @type ApiAnyShape */ (payload.schema);
    const result = ApiSchemaGenerator.asExample(anyShape, jsonMime, {
      renderExamples: true,
      renderOptional: true,
    });
    
    assert.equal(
      result.value,
      'id: 1\nname: "John"',
      "Example's raw is set"
    );

    const parsed = JSON.parse(result.renderValue);
    
    assert.deepEqual(parsed, 
      {
        "id": 1,
        "name": "John"
      }
    );
  });

  it('generates example for HEAD', () => {
    const payload = loader.getPayloads(model, '/employees', 'head')[0];
    
    const anyShape = /** @type ApiAnyShape */ (payload.schema);
    const result = ApiSchemaGenerator.asExample(anyShape, xmlMime, {
      renderExamples: true,
      renderOptional: true,
    });
    
    assert.equal(
      result.value,
      'id: 1\nname: "John"',
      "Example's raw is set"
    );
    assert.equal(
      result.renderValue, 
      '<Employee>\n  <id>1</id>\n  <name>John</name>\n</Employee>',
    );
  });
});
