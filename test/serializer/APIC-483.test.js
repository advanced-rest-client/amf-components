import { assert } from '@open-wc/testing';
import { AmfLoader } from '../AmfLoader.js';
import { AmfSerializer, ns } from '../../index.js';

/** @typedef {import('../../src/helpers/amf').Server} Server */
/** @typedef {import('../../src/helpers/api').ApiArrayShape} ApiArrayShape */
/** @typedef {import('../../src/helpers/api').ApiNodeShape} ApiNodeShape */
/** @typedef {import('../../src/helpers/api').ApiUnionShape} ApiUnionShape */
/** @typedef {import('../../src/helpers/api').ApiScalarShape} ApiScalarShape */
/** @typedef {import('../../src/helpers/api').ApiScalarNode} ApiScalarNode */
/** @typedef {import('../../src/helpers/api').ApiFileShape} ApiFileShape */
/** @typedef {import('../../src/helpers/api').ApiRecursiveShape} ApiRecursiveShape */
/** @typedef {import('../../src/helpers/api').ApiCustomDomainProperty} ApiCustomDomainProperty */
/** @typedef {import('../../src/helpers/api').ApiSchemaShape} ApiSchemaShape */
/** @typedef {import('../../src/helpers/api').ApiTupleShape} ApiTupleShape */

describe('AmfSerializer', () => {
  describe('APIC-483', () => {
    const fileName = 'APIC-483';
    const loader = new AmfLoader();
    
    let api;
    /** @type AmfSerializer */
    let serializer;
    before(async () => {
      api = await loader.getGraph(fileName);
      serializer = new AmfSerializer();
      serializer.amf = api;
    });

    it('serializes a TupleShape', () => {
      const expects = loader.lookupExpects(api, '/banks', 'post');
      const payload = expects[loader._getAmfKey(loader.ns.aml.vocabularies.apiContract.payload)][0];
      const shape = payload[serializer._getAmfKey(serializer.ns.aml.vocabularies.shapes.schema)][0];
      const result = /** @type ApiNodeShape */ (serializer.unknownShape(shape));
      const { examples, properties } = result;

      // serializer recognizes that the this example is referenced to a payload and not to a type.
      assert.lengthOf(examples, 0, 'has the examples');
      assert.lengthOf(properties, 1, 'has the properties');
      const array = /** @type ApiTupleShape  */ (properties[0].range);
      const { types, items } = array;
      assert.include(types, ns.aml.vocabularies.shapes.TupleShape, 'range has the TupleShape');
      assert.lengthOf(items, 1, 'range has the items');
    });
  });
});
