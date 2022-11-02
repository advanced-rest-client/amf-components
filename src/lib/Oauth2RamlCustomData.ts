/* eslint-disable class-methods-use-this */
import { AmfNamespace, ApiDefinitions, AmfShapes } from '@api-client/core/build/browser.js';

/**
 * Computes a data model for custom definition for the OAuth 2 scheme
 * According to the annotation published at 
 * https://github.com/raml-org/raml-annotations/tree/master/annotations/security-schemes
 */
export class Oauth2RamlCustomData {
  readParams(properties: {[key: string]: AmfShapes.IApiDataNodeUnion}): ApiDefinitions.IApiParameter[] {
    const result: ApiDefinitions.IApiParameter[] = [];
    Object.keys(properties).forEach((key) => {
      const definition = properties[key];
      if (definition.types.includes(AmfNamespace.aml.vocabularies.data.Object)) {
        const property = this.getProperty((definition as AmfShapes.IApiObjectNode));
        result.push(property);
      } else if (definition.types.includes(AmfNamespace.aml.vocabularies.data.Scalar)) {
        const property = this.getPropertyScalar((definition as AmfShapes.IApiScalarNode));
        result.push(property);
      }
    });
    return result;
  }

  /**
   * Creates an ApiDefinitions.IApiParameter for an annotation that has properties.
   * This expects the properties to be defined like RAML's type definition.
   */
  getProperty(definition: AmfShapes.IApiObjectNode): ApiDefinitions.IApiParameter {
    const { properties={}, id, name } = definition;
    const result: ApiDefinitions.IApiParameter = {
      id,
      name,
      examples: [],
      payloads: [],
      types: [AmfNamespace.aml.vocabularies.apiContract.Parameter],
      customDomainProperties: [],
    };
    const schema = this.readSchema(definition);
    if (schema) {
      result.schema = schema;
    }
    if (properties.required) {
      const req = properties.required as AmfShapes.IApiScalarNode;
      result.required = req.value === 'true';
    }
    return result;
  }

  /**
   * Creates an ApiDefinitions.IApiParameter for an annotation that has no properties but rather a simplified
   * notation of `propertyName: dataType`.
   */
  getPropertyScalar(definition: AmfShapes.IApiScalarNode): ApiDefinitions.IApiParameter {
    const { dataType = '', id, name } = definition;
    const result: ApiDefinitions.IApiParameter = {
      id,
      name,
      examples: [],
      payloads: [],
      types: [AmfNamespace.aml.vocabularies.apiContract.Parameter],
      customDomainProperties: [],
    };
    const schema = this.createSchema() as AmfShapes.IApiScalarShape;
    schema.types = [AmfNamespace.aml.vocabularies.shapes.ScalarShape];
    schema.id = id;
    schema.name = name;
    schema.dataType = this.typeToSchemaType(dataType);
    result.schema = schema;
    return result;
  }

  readSchema(property: AmfShapes.IApiObjectNode): AmfShapes.IShapeUnion | undefined {
    const { properties={}, name, id } = property;
    // const { example, examples, } = properties;
    const isArray = this.readIsSchemaArray((properties.type as AmfShapes.IApiScalarNode), (properties.items as AmfShapes.IApiScalarNode));
    const type = this.readSchemaType((properties.type as AmfShapes.IApiScalarNode), (properties.items as AmfShapes.IApiScalarNode));
    let schema: AmfShapes.IShapeUnion | undefined;
    if (isArray) {
      const s = this.createSchema() as AmfShapes.IApiArrayShape;
      s.types = [AmfNamespace.aml.vocabularies.shapes.ArrayShape];
      s.id = id;
      s.name = name;
      s.items = this.createTypedSchema(type, property);
      schema = s;
    } else {
      schema = this.createTypedSchema(type, property);
    }
    return schema;
  }

  createTypedSchema(type: string, object: AmfShapes.IApiObjectNode): AmfShapes.IShapeUnion | undefined {
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

  createSchema(): AmfShapes.IApiShape {
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

  createScalarSchema(object: AmfShapes.IApiObjectNode, type: string): AmfShapes.IApiScalarShape {
    const { properties={}, name, id } = object;
    const schema = this.createSchema() as AmfShapes.IApiScalarShape;
    schema.types = [AmfNamespace.aml.vocabularies.shapes.ScalarShape];
    schema.id = id;
    schema.name = name;
    schema.dataType = this.typeToSchemaType(type);
    if (properties.format) {
      const item = properties.format as AmfShapes.IApiScalarNode;
      schema.format = item.value;
    }
    if (properties.default) {
      const item = properties.default as AmfShapes.IApiScalarNode;
      schema.defaultValueStr = item.value;
      // schema.defaultValue = item.value;
    }
    if (properties.description) {
      const item = (properties.description as AmfShapes.IApiScalarNode);
      schema.description = item.value;
    }
    if (properties.displayName) {
      const item = (properties.displayName as AmfShapes.IApiScalarNode);
      schema.displayName = item.value;
    }
    if (properties.pattern) {
      const item = (properties.pattern as AmfShapes.IApiScalarNode);
      schema.pattern = item.value;
    }
    if (properties.maximum) {
      const item = (properties.maximum as AmfShapes.IApiScalarNode);
      const value = Number(item.value);
      if (!Number.isNaN(value)) {
        schema.maximum = value;
      }
    }
    if (properties.minimum) {
      const item = (properties.minimum as AmfShapes.IApiScalarNode);
      const value = Number(item.value);
      if (!Number.isNaN(value)) {
        schema.minimum = value;
      }
    }
    if (properties.multipleOf) {
      const item = (properties.multipleOf as AmfShapes.IApiScalarNode);
      const value = Number(item.value);
      if (!Number.isNaN(value)) {
        schema.multipleOf = value;
      }
    }
    if (properties.maxLength) {
      const item = (properties.maxLength as AmfShapes.IApiScalarNode);
      const value = Number(item.value);
      if (!Number.isNaN(value)) {
        schema.maxLength = value;
      }
    }
    if (properties.minLength) {
      const item = (properties.minLength as AmfShapes.IApiScalarNode);
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
  readSchemaType(object: AmfShapes.IApiScalarNode, items?: AmfShapes.IApiScalarNode): string {
    if (object.dataType !== AmfNamespace.w3.xmlSchema.string) {
      return AmfNamespace.w3.xmlSchema.string;
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
      case 'boolean': return AmfNamespace.w3.xmlSchema.boolean;
      case 'number': return AmfNamespace.w3.xmlSchema.number;
      case 'integer': return AmfNamespace.w3.xmlSchema.integer;
      case 'float': return AmfNamespace.w3.xmlSchema.float;
      case 'double': return AmfNamespace.w3.xmlSchema.double;
      case 'long': return AmfNamespace.w3.xmlSchema.long;
      case 'date-only': return AmfNamespace.w3.xmlSchema.date;
      case 'date-time': return AmfNamespace.w3.xmlSchema.dateTime;
      case 'time-only': return AmfNamespace.w3.xmlSchema.time;
      case 'nil': return AmfNamespace.w3.xmlSchema.nil;
      default: return AmfNamespace.w3.xmlSchema.string;
    }
  }

  /**
   * Checks whether the custom property represents an array.
   * @param type
   * @param items The definition of the `items` property that corresponds to RAML's items property of an array
   * @returns True when the schema is an array.
   */
  readIsSchemaArray(type: AmfShapes.IApiScalarNode, items: AmfShapes.IApiScalarNode): boolean {
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
