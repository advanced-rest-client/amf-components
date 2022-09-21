/* eslint-disable class-methods-use-this */
import { ApiArrayShape, ApiDataNodeUnion, ApiObjectNode, ApiParameter, ApiScalarNode, ApiScalarShape, ApiShape, ApiShapeUnion } from '../helpers/api.js';
import { ns } from '../helpers/Namespace.js';

/**
 * Computes a data model for custom definition for the OAuth 2 scheme
 * According to the annotation published at 
 * https://github.com/raml-org/raml-annotations/tree/master/annotations/security-schemes
 */
export class Oauth2RamlCustomData {
  readParams(properties: {[key: string]: ApiDataNodeUnion}): ApiParameter[] {
    const result: ApiParameter[] = [];
    Object.keys(properties).forEach((key) => {
      const definition = properties[key];
      if (definition.types.includes(ns.aml.vocabularies.data.Object)) {
        const property = this.getProperty((definition as ApiObjectNode));
        result.push(property);
      } else if (definition.types.includes(ns.aml.vocabularies.data.Scalar)) {
        const property = this.getPropertyScalar((definition as ApiScalarNode));
        result.push(property);
      }
    });
    return result;
  }

  /**
   * Creates an ApiParameter for an annotation that has properties.
   * This expects the properties to be defined like RAML's type definition.
   */
  getProperty(definition: ApiObjectNode): ApiParameter {
    const { properties={}, id, name } = definition;
    const result: ApiParameter = {
      id,
      name,
      examples: [],
      payloads: [],
      types: [ns.aml.vocabularies.apiContract.Parameter],
      customDomainProperties: [],
    };
    const schema = this.readSchema(definition);
    if (schema) {
      result.schema = schema;
    }
    if (properties.required) {
      const req = properties.required as ApiScalarNode;
      result.required = req.value === 'true';
    }
    return result;
  }

  /**
   * Creates an ApiParameter for an annotation that has no properties but rather a simplified
   * notation of `propertyName: dataType`.
   */
  getPropertyScalar(definition: ApiScalarNode): ApiParameter {
    const { dataType = '', id, name } = definition;
    const result: ApiParameter = {
      id,
      name,
      examples: [],
      payloads: [],
      types: [ns.aml.vocabularies.apiContract.Parameter],
      customDomainProperties: [],
    };
    const schema = this.createSchema() as ApiScalarShape;
    schema.types = [ns.aml.vocabularies.shapes.ScalarShape];
    schema.id = id;
    schema.name = name;
    schema.dataType = this.typeToSchemaType(dataType);
    result.schema = schema;
    return result;
  }

  readSchema(property: ApiObjectNode): ApiShapeUnion | undefined {
    const { properties={}, name, id } = property;
    // const { example, examples, } = properties;
    const isArray = this.readIsSchemaArray((properties.type as ApiScalarNode), (properties.items as ApiScalarNode));
    const type = this.readSchemaType((properties.type as ApiScalarNode), (properties.items as ApiScalarNode));
    let schema: ApiShapeUnion | undefined;
    if (isArray) {
      const s = this.createSchema() as ApiArrayShape;
      s.types = [ns.aml.vocabularies.shapes.ArrayShape];
      s.id = id;
      s.name = name;
      s.items = this.createTypedSchema(type, property);
      schema = s;
    } else {
      schema = this.createTypedSchema(type, property);
    }
    return schema;
  }

  createTypedSchema(type: string, object: ApiObjectNode): ApiShapeUnion | undefined {
    switch (type) {
      case 'string':
      case 'number':
      case 'integer':
      case 'float':
      case 'double':
      case 'long':
      case 'date-only':
      case 'date-time':
      case 'time-only':
      case 'nil':
      case 'date':
      case 'boolean': return this.createScalarSchema(object, type);
      default: return undefined;
    }
  }

  createSchema(): ApiShape {
    return {
      id: '',
      types: [],
      and: [],
      name: '',
      inherits: [],
      or: [],
      values: [],
      xone: [],
      customDomainProperties: [],
    };
  }

  createScalarSchema(object: ApiObjectNode, type: string): ApiScalarShape {
    const { properties={}, name, id } = object;
    const schema = this.createSchema() as ApiScalarShape;
    schema.types = [ns.aml.vocabularies.shapes.ScalarShape];
    schema.id = id;
    schema.name = name;
    schema.dataType = this.typeToSchemaType(type);
    if (properties.format) {
      const item = properties.format as ApiScalarNode;
      schema.format = item.value;
    }
    if (properties.default) {
      const item = properties.default as ApiScalarNode;
      schema.defaultValueStr = item.value;
      // schema.defaultValue = item.value;
    }
    if (properties.description) {
      const item = (properties.description as ApiScalarNode);
      schema.description = item.value;
    }
    if (properties.displayName) {
      const item = (properties.displayName as ApiScalarNode);
      schema.displayName = item.value;
    }
    if (properties.pattern) {
      const item = (properties.pattern as ApiScalarNode);
      schema.pattern = item.value;
    }
    if (properties.maximum) {
      const item = (properties.maximum as ApiScalarNode);
      const value = Number(item.value);
      if (!Number.isNaN(value)) {
        schema.maximum = value;
      }
    }
    if (properties.minimum) {
      const item = (properties.minimum as ApiScalarNode);
      const value = Number(item.value);
      if (!Number.isNaN(value)) {
        schema.minimum = value;
      }
    }
    if (properties.multipleOf) {
      const item = (properties.multipleOf as ApiScalarNode);
      const value = Number(item.value);
      if (!Number.isNaN(value)) {
        schema.multipleOf = value;
      }
    }
    if (properties.maxLength) {
      const item = (properties.maxLength as ApiScalarNode);
      const value = Number(item.value);
      if (!Number.isNaN(value)) {
        schema.maxLength = value;
      }
    }
    if (properties.minLength) {
      const item = (properties.minLength as ApiScalarNode);
      const value = Number(item.value);
      if (!Number.isNaN(value)) {
        schema.minLength = value;
      }
    }
    return schema;
  }

  /**
   * @param object
   * @param items The definition of the `items` property that corresponds to RAML's items property of an array
   */
  readSchemaType(object: ApiScalarNode, items?: ApiScalarNode): string {
    if (object.dataType !== ns.w3.xmlSchema.string) {
      return ns.w3.xmlSchema.string;
    }
    let inputType = object.value || '';
    if (inputType.endsWith('[]')) {
      inputType = inputType.replace('[]', '');
    }
    if (inputType === 'array' && items) {
      return this.readSchemaType(items);
    }
    return inputType || 'string';
    
  }

  typeToSchemaType(type: string): string {
    switch (type) {
      case 'boolean': return ns.w3.xmlSchema.boolean;
      case 'number': return ns.w3.xmlSchema.number;
      case 'integer': return ns.w3.xmlSchema.integer;
      case 'float': return ns.w3.xmlSchema.float;
      case 'double': return ns.w3.xmlSchema.double;
      case 'long': return ns.w3.xmlSchema.long;
      case 'date-only': return ns.w3.xmlSchema.date;
      case 'date-time': return ns.w3.xmlSchema.dateTime;
      case 'time-only': return ns.w3.xmlSchema.time;
      case 'nil': return ns.w3.xmlSchema.nil;
      default: return ns.w3.xmlSchema.string;
    }
  }

  /**
   * Checks whether the custom property represents an array.
   * @param type
   * @param items The definition of the `items` property that corresponds to RAML's items property of an array
   * @returns True when the schema is an array.
   */
  readIsSchemaArray(type: ApiScalarNode, items: ApiScalarNode): boolean {
    if (!type && items) {
      return true;
    }
    if (!type) {
      return false;
    }
    const inputType = type.value || '';
    if (inputType.endsWith('[]') || inputType === 'array') {
      return true;
    }
    return false;
  }
}
