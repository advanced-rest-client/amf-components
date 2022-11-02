/* eslint-disable class-methods-use-this */
import { AmfNamespace, ApiDefinitions, AmfShapes } from '@api-client/core/build/browser.js';
import { OperationParameter } from '../types.js';

/**
 * A library to create a list of ApiParameters from a query string value.
 */
export class QueryParameterProcessor {
  /**
   * @param schema
   * @param binding The parameter binding.
   * @param source Optional parameter source.
   */
  collectOperationParameters(schema: AmfShapes.IShapeUnion, binding: string, source?: string): OperationParameter[] {
    let result: OperationParameter[] = [];
    if (!schema) {
      return result;
    }
    const { types } = schema;
    if (types.includes(AmfNamespace.aml.vocabularies.shapes.ScalarShape)) {
      result.push(this.scalarShapeOperationParameter((schema as AmfShapes.IApiScalarShape), binding, source));
    } else if (types.includes(AmfNamespace.w3.shacl.NodeShape)) {
      const params = this.nodeShapeOperationParameter((schema as AmfShapes.IApiNodeShape), binding, source);
      result = result.concat(params);
    } else if (types.includes(AmfNamespace.aml.vocabularies.shapes.ArrayShape)) {
      const arrResult = this.arrayShapeOperationParameter((schema as AmfShapes.IApiArrayShape), binding, source);
      if (Array.isArray(arrResult)) {
        result = result.concat(arrResult);
      } else if (arrResult) {
        result.push(arrResult);
      }
    } else if (types.includes(AmfNamespace.aml.vocabularies.shapes.UnionShape)) {
      const params = this.unionShapeOperationParameter((schema as AmfShapes.IApiUnionShape), binding, source);
      if (params) {
        result = result.concat(params);
      }
    }
    return result;
  }

  /**
   * @param shape
   * @param binding The parameter binding.
   * @param source Optional parameter source.
   */
  scalarShapeOperationParameter(shape: AmfShapes.IApiScalarShape, binding: string, source?: string): OperationParameter {
    const { id, name } = shape;
    const constructed: ApiDefinitions.IApiParameter = {
      id,
      binding,
      schema: shape,
      name,
      examples: [],
      payloads: [],
      types: [AmfNamespace.aml.vocabularies.apiContract.Parameter],
      required: false,
      customDomainProperties: [],
    };
    return {
      binding,
      paramId: id,
      parameter: constructed,
      source: source || '',
      schemaId: id,
      schema: shape,
    };
  }

  /**
   * @param shape
   * @param binding The parameter binding.
   * @param source Optional parameter source.
   */
  nodeShapeOperationParameter(shape: AmfShapes.IApiNodeShape, binding: string, source?: string): OperationParameter[] {
    const result: OperationParameter[] = [];
    const { properties=[] } = shape;
    if (!properties.length) {
      return result;
    }
    properties.forEach((prop) => {
      result.push(this.parameterOperationParameter(prop, binding, source));
    });
    return result;
  }

  /**
   * @param property The property to build the parameter for.
   * @param binding The parameter binding.
   * @param source Optional parameter source.
   */
  parameterOperationParameter(property: AmfShapes.IApiPropertyShape, binding: string, source?: string): OperationParameter {
    const { id, range, name, minCount=0 } = property;
    const constructed: ApiDefinitions.IApiParameter = {
      id,
      binding,
      schema: range,
      name,
      examples: [],
      payloads: [],
      types: [AmfNamespace.aml.vocabularies.apiContract.Parameter],
      required: minCount > 0,
      customDomainProperties: [],
    };
    return {
      binding,
      paramId: id,
      parameter: constructed,
      source: source || '',
      schemaId: property.id,
      schema: range,
    };
  }

  /**
   * @param shape
   * @param binding The parameter binding.
   * @param source Optional parameter source.
   */
  arrayShapeOperationParameter(shape: AmfShapes.IApiArrayShape, binding: string, source?: string): OperationParameter|OperationParameter[] {
    const target = shape.items || shape;
    if (target.types.includes(AmfNamespace.w3.shacl.NodeShape)) {
      const typed = (shape.items as AmfShapes.IApiNodeShape);
      return this.collectOperationParameters(typed, binding, source);
    }
    const { id, name,  } = target;
    const constructed: ApiDefinitions.IApiParameter = {
      id,
      binding,
      schema: shape,
      name,
      examples: [],
      payloads: [],
      types: [AmfNamespace.aml.vocabularies.apiContract.Parameter],
      required: false,
      customDomainProperties: [],
    };
    return {
      binding,
      paramId: id,
      parameter: constructed,
      source: source || '',
      schemaId: id,
      schema: shape,
    };
  }

  /**
   * @param shape
   * @param binding The parameter binding.
   * @param source Optional parameter source.
   */
  unionShapeOperationParameter(shape: AmfShapes.IApiUnionShape, binding: string, source?: string): OperationParameter[]|undefined {
    const { anyOf=[], or=[], and=[], xone=[] } = shape;
    if (and.length) {
      let result: OperationParameter[] = [];
      and.forEach((item) => {
        const itemResult = this.collectOperationParameters(item, binding, source);
        if (itemResult) {
          result = result.concat(itemResult);
        }
      });
      return result;
    }
    const info = anyOf[0] || or[0] || xone[0];
    if (!info) {
      return undefined;
    }
    return this.collectOperationParameters(info, binding, source);
  }
}
