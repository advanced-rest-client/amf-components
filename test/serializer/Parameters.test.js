import { assert } from '@open-wc/testing';
import { AmfLoader } from '../AmfLoader.js';
import { AmfSerializer } from '../../index.js';

/** @typedef {import('../../src/helpers/amf').ScalarShape} ScalarShape */
/** @typedef {import('../../src/helpers/api').ApiScalarNode} ApiScalarNode */

describe('AmfSerializer', () => {
  const loader = new AmfLoader();

  describe('RAML parameters', () => {
    describe('parameter()', () => {
      let api;
      /** @type AmfSerializer */
      let serializer;
      before(async () => {
        api = await loader.getGraph('amf-helper-api');
        serializer = new AmfSerializer();
        serializer.amf = api;
      });
  
      it('has the name and the paramName', () => {
        const op = loader.lookupOperation(api, '/parameters', 'get');
        const ex = serializer._computeExpects(op);
        const headers = loader.readHeaders(ex);
        const result = serializer.parameter(headers[0]); // Accept
        assert.equal(result.name, 'Accept', 'has the name');
        assert.equal(result.paramName, 'Accept', 'has the paramName');
      });
  
      it('has the description', () => {
        const op = loader.lookupOperation(api, '/parameters', 'get');
        const ex = serializer._computeExpects(op);
        const headers = loader.readHeaders(ex);
        const result = serializer.parameter(headers[0]); // Accept
        assert.equal(result.description, 'Selects the response\'s media type, when supported.', 'has the name');
      });
  
      it('has the required', () => {
        const op = loader.lookupOperation(api, '/parameters', 'get');
        const ex = serializer._computeExpects(op);
        const headers = loader.readHeaders(ex);
        const header = headers[1]; // x-required
        const result = serializer.parameter(header);
        assert.isTrue(result.required);
      });
  
      it('has the binding', () => {
        const op = loader.lookupOperation(api, '/parameters', 'get');
        const ex = serializer._computeExpects(op);
        const headers = loader.readHeaders(ex);
        const header = headers[1]; // x-required
        const result = serializer.parameter(header);
        assert.equal(result.binding, 'header');
      });
  
      it('has the example', () => {
        const op = loader.lookupOperation(api, '/parameters', 'get');
        const ex = serializer._computeExpects(op);
        const headers = loader.readHeaders(ex);
        const header = headers[3]; // If-Modified-Since
        const result = serializer.parameter(header);
        // the example is passed to the schema.
        assert.deepEqual(result.examples, []);
      });
  
      it('has the examples', () => {
        const op = loader.lookupOperation(api, '/parameters', 'get');
        const ex = serializer._computeExpects(op);
        const qp = loader.readQueryParameters(ex);
        const param = qp[3]; // combo
        const result = serializer.parameter(param);
        // the example is passed to the schema.
        assert.deepEqual(result.examples, []);
      });
    });
  });

  describe('OAS parameters', () => {
    let api;
    /** @type AmfSerializer */
    let serializer;
    before(async () => {
      api = await loader.getGraph('petstore');
      serializer = new AmfSerializer();
      serializer.amf = api;
    });

    it('has the OAS properties', () => {
      const op = loader.lookupOperation(api, '/pet/{petId}', 'post');
      const ex = serializer._computeExpects(op);
      const params = loader.readQueryParameters(ex);
      const param = params.find(p => serializer._getValue(p, serializer.ns.aml.vocabularies.apiContract.paramName) === 'name');
      const result = serializer.parameter(param);
      assert.isFalse(result.required, 'is not required');
      assert.isTrue(result.deprecated, 'is deprecated');
      assert.isTrue(result.allowEmptyValue, 'is allowEmptyValue');
      assert.isTrue(result.explode, 'is explode');
      assert.isTrue(result.allowReserved, 'is allowReserved');
      assert.equal(result.style, 'form', 'has style');
    });

    it('has the content property', () => {
      const op = loader.lookupOperation(api, '/pet/{petId}', 'post');
      const ex = serializer._computeExpects(op);
      const params = loader.readQueryParameters(ex);
      const param = params.find(p => serializer._getValue(p, serializer.ns.aml.vocabularies.apiContract.paramName) === 'filter');
      const result = serializer.parameter(param);
      const [p] = result.payloads;
      assert.include(p.types, serializer.ns.aml.vocabularies.apiContract.Payload, 'has the type');
      assert.deepEqual(p.customDomainProperties, [], 'has empty customDomainProperties');
      assert.deepEqual(p.examples, [], 'has empty examples');
      assert.equal(p.mediaType, 'application/json', 'has mediaType');
      assert.typeOf(p.schema, 'object', 'has schema');
    });

    it('has the examples property', () => {
      // it seems that AMF moves examples from parameter into the schema.
      // This copies examples from the schema to the top level parameter so we can test it.
      // Possibly this happens during the resolution phase.
      const op = loader.lookupOperation(api, '/pet/findByStatus', 'get');
      const ex = serializer._computeExpects(op);
      const params = loader.readQueryParameters(ex);
      const param = params.find(p => serializer._getValue(p, serializer.ns.aml.vocabularies.apiContract.paramName) === 'status');
      const schema = /** @type ScalarShape */ (param[serializer._getAmfKey(serializer.ns.aml.vocabularies.shapes.schema)][0]);
      const key = serializer._getAmfKey(serializer.ns.aml.vocabularies.apiContract.examples);
      const info = schema[key];
      param[key] = info;
      const result = serializer.parameter(param);
      const { examples } = result;
      assert.typeOf(examples, 'array', 'has examples');
      assert.lengthOf(examples, 1, 'has  a single example');
      const [example] = examples;
      assert.equal(example.id, info[0]['@id'], 'has the id');
      assert.include(example.types, serializer.ns.aml.vocabularies.apiContract.Example, 'has the type');
      assert.deepEqual(example.customDomainProperties, [], 'has empty customDomainProperties');
      assert.isTrue(example.strict, 'has strict');
      assert.equal(example.value, 'pending', 'has the value');
      const { structuredValue } = example;
      assert.typeOf(structuredValue, 'object', 'has the structuredValue');
      assert.equal(structuredValue.name, 'scalar_1', 'has the name');
      const typed = /** @type ApiScalarNode */ (structuredValue);
      assert.equal(typed.value, 'pending', 'has the value');
      assert.equal(typed.dataType, serializer.ns.w3.xmlSchema.string, 'has the dataType');
    });
  });
});
