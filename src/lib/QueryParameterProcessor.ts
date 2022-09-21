/* eslint-disable class-methods-use-this */
import { ApiArrayShape, ApiNodeShape, ApiParameter, ApiPropertyShape, ApiScalarShape, ApiShapeUnion, ApiUnionShape } from '../helpers/api.js';
import { ns } from '../helpers/Namespace.js';
import { OperationParameter } from '../types.js';

/** @typedef {import('../helpers/api').ApiNodeShape} ApiNodeShape */
/** @typedef {import('../helpers/api').ApiArrayShape} ApiArrayShape */
/** @typedef {import('../helpers/api').ApiShapeUnion} ApiShapeUnion */
/** @typedef {import('../helpers/api').ApiUnionShape} ApiUnionShape */
/** @typedef {import('../helpers/api').ApiScalarShape} ApiScalarShape */
/** @typedef {import('../helpers/api').ApiParameter} ApiParameter */
/** @typedef {import('../helpers/api').ApiPropertyShape} ApiPropertyShape */
/** @typedef {import('../types').OperationParameter} OperationParameter */

/**
 * A library to create a list of ApiParameters from a query string value.
 */
export class QueryParameterProcessor {
  /**
   * @param schema
   * @param binding The parameter binding.
   * @param source Optional parameter source.
   */
  collectOperationParameters(schema: ApiShapeUnion, binding: string, source?: string): OperationParameter[] {
    let result: OperationParameter[] = [];
    if (!schema) {
      return result;
    }
    const { types } = schema;
    if (types.includes(ns.aml.vocabularies.shapes.ScalarShape)) {
      result.push(this.scalarShapeOperationParameter((schema as ApiScalarShape), binding, source));
    } else if (types.includes(ns.w3.shacl.NodeShape)) {
      const params = this.nodeShapeOperationParameter((schema as ApiNodeShape), binding, source);
      result = result.concat(params);
    } else if (types.includes(ns.aml.vocabularies.shapes.ArrayShape)) {
      const arrResult = this.arrayShapeOperationParameter((schema as ApiArrayShape), binding, source);
      if (Array.isArray(arrResult)) {
        result = result.concat(arrResult);
      } else if (arrResult) {
        result.push(arrResult);
      }
    } else if (types.includes(ns.aml.vocabularies.shapes.UnionShape)) {
      const params = this.unionShapeOperationParameter((schema as ApiUnionShape), binding, source);
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
  scalarShapeOperationParameter(shape: ApiScalarShape, binding: string, source?: string): OperationParameter {
    const { id, name } = shape;
    const constructed: ApiParameter = {
      id,
      binding,
      schema: shape,
      name,
      examples: [],
      payloads: [],
      types: [ns.aml.vocabularies.apiContract.Parameter],
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
  nodeShapeOperationParameter(shape: ApiNodeShape, binding: string, source?: string): OperationParameter[] {
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
  parameterOperationParameter(property: ApiPropertyShape, binding: string, source?: string): OperationParameter {
    const { id, range, name, minCount=0 } = property;
    const constructed: ApiParameter = {
      id,
      binding,
      schema: range,
      name,
      examples: [],
      payloads: [],
      types: [ns.aml.vocabularies.apiContract.Parameter],
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
  arrayShapeOperationParameter(shape: ApiArrayShape, binding: string, source?: string): OperationParameter|OperationParameter[] {
    const target = shape.items || shape;
    if (target.types.includes(ns.w3.shacl.NodeShape)) {
      const typed = (shape.items as ApiNodeShape);
      return this.collectOperationParameters(typed, binding, source);
    }
    const { id, name,  } = target;
    const constructed: ApiParameter = {
      id,
      binding,
      schema: shape,
      name,
      examples: [],
      payloads: [],
      types: [ns.aml.vocabularies.apiContract.Parameter],
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
  unionShapeOperationParameter(shape: ApiUnionShape, binding: string, source?: string): OperationParameter[]|undefined {
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
