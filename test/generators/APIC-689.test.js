import { assert } from '@open-wc/testing';
import { ApiSchemaValues } from '../../src/schema/ApiSchemaValues.js';
import { AmfLoader } from '../AmfLoader.js';

/** @typedef {import('../../').Amf.AmfDocument} AmfDocument */
/** @typedef {import('../../').Api.ApiScalarShape} ApiScalarShape */

describe('ApiSchemaValues', () => {
  describe('APIC-689', () => {
    const apiFile = 'APIC-689';
    const loader = new AmfLoader();

    /** @type AmfDocument */
    let model;

    before(async () => {
      model = await loader.getGraph(apiFile);
    });

    it('does not set URL query param for an optional enum', async () => {
      const param = loader.getParameter(model, '/test', 'get', 'param1');
      const result = ApiSchemaValues.readInputValue(param, /** @type ApiScalarShape */ (param.schema), { requiredOnly: true });
      assert.isUndefined(result, 'has the empty default value (from schema type)');
    });

    it('returns the first enum value', async () => {
      const param = loader.getParameter(model, '/test', 'post', 'param1');
      const result = ApiSchemaValues.readInputValue(param, /** @type ApiScalarShape */ (param.schema), { requiredOnly: true });
      assert.equal(result, 'A', 'has the first enum type');
    });
  });
});
