import { assert } from "@open-wc/testing";
import { AmfLoader } from "../AmfLoader.js";
import { AmfSerializer } from "../../index.js";

/** @typedef {import('../../src/helpers/api').ApiScalarNode} ApiScalarNode */
/** @typedef {import('../../src/helpers/api').ApiObjectNode} ApiObjectNode */

describe("AmfSerializer", () => {
  const loader = new AmfLoader();

  describe("Annotations", () => {
    let api;
    /** @type AmfSerializer */
    let serializer;
    before(async () => {
      api = await loader.getGraph('amf-helper-api');
      serializer = new AmfSerializer();
      serializer.amf = api;
    });

    it("ObjectNode annotations", () => {
      const shape = loader.lookupOperation(api, "/about", "get");
      const result = serializer.operation(shape);
      assert.typeOf(result, "object", "returns an object");
      const { customDomainProperties } = result;
      assert.typeOf(customDomainProperties, 'array', 'has the customDomainProperties');
      assert.lengthOf(customDomainProperties, 1, 'has a single annotation');
      const [annotation] = customDomainProperties;
      assert.equal(annotation.name, 'clearanceLevel', 'has the extensionName');
      assert.typeOf(annotation.extension, 'object', 'has the extension');
      const { properties } = /** @type ApiObjectNode */ (annotation.extension);
      assert.typeOf(properties, 'object', 'has properties');
      const { level, signature } = properties;
      assert.typeOf(level, 'object', 'has the level property');
      assert.typeOf(signature, 'object', 'has the level property');
    });

    it("ScalarShape annotations", () => {
      const shape = loader.lookupOperation(api, "/files", "post");
      const result = serializer.operation(shape);
      assert.typeOf(result, "object", "returns an object");
      const { customDomainProperties } = result;
      assert.typeOf(customDomainProperties, 'array', 'has the customDomainProperties');
      assert.lengthOf(customDomainProperties, 1, 'has a single annotation');
      const [annotation] = customDomainProperties;
      assert.equal(annotation.name, 'deprecated', 'has the extensionName');
      assert.typeOf(annotation.extension, 'object', 'has the extension');

      const { value, dataType, } = /** @type ApiScalarNode */ (annotation.extension);
      assert.equal(dataType, 'http://www.w3.org/2001/XMLSchema#string', 'has the dataType');
      assert.equal(value, 'This operation is deprecated and will be removed.', 'has the value');
    });
  });
});
