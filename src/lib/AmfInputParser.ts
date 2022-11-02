/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-continue */
/* eslint-disable no-param-reassign */
/* eslint-disable class-methods-use-this */
import { ApiSchemaValues, AmfNamespace, ApiDefinitions, AmfShapes } from '@api-client/core/build/browser.js';

export interface ParametersSerializationReport {
  valid: boolean;
  invalid: string[];
  header: Record<string, any>;
  query: Record<string, any>;
  path: Record<string, any>;
  cookie: Record<string, any>;
}

export type BindingType = Pick<ParametersSerializationReport, 'header' | 'query' | 'path' | 'cookie'>;

/**
 * A utility class with helper functions to process user input according on AMF schema.
 */
export class AmfInputParser {
  /**
   * Generates a report with the request data compiled from the operation input parameters (except for the body)
   * and gathered values.
   * 
   * Note, all parameter values are cast to String as all target locations of these parameters are string values
   * (headers, query parameters, path parameters). The exception here are arrays which are preserved (but with string values).
   * 
   * All optional parameters that have no value or have invalid value ar ignored.
   * 
   * @param parameters The input parameters for the operation
   * @param values The collected values for all parameters.
   * @param nillable The list of parameter ids that are marked as nil values.
   * @param defaultNil The nil value to insert when the parameter is in the nillable list.
   */
  static reportRequestInputs(parameters: ApiDefinitions.IApiParameter[], values: Map<string, any>, nillable: string[]=[], defaultNil: any=null): ParametersSerializationReport {
    const report: ParametersSerializationReport = {
      valid: true,
      invalid: [],
      header: {},
      query: {},
      path: {},
      cookie: {},
    };

    parameters.forEach((param) => {
      const { id, required, schema, binding = '', name, paramName } = param;
      const parameterName = paramName || name;
      if (!parameterName) {
        return;
      }
      if (!report[binding as keyof ParametersSerializationReport]) {
        // for custom shapes
        report[binding as keyof BindingType] = {};
      }
      if (nillable.includes(id)) {
        report[binding as keyof BindingType][parameterName] = defaultNil;
        return;
      }
      let value = values.get(id);
      const jsType = typeof value;
      if (jsType === 'undefined' && !required) {
        return;
      }
      if (jsType === 'undefined') {
        if (schema && schema.types.includes(AmfNamespace.aml.vocabularies.shapes.ScalarShape)) {
          value = ApiSchemaValues.readInputValue(param, schema as AmfShapes.IApiScalarShape);
        }
      }
      if (!schema) {
        // without schema we treat it as "any". It generates string values.
        if (Array.isArray(value)) {
          // this is a huge assumption here.
          // Todo: this should be done recursively.
          report[binding as keyof BindingType][parameterName] = value.map(i => i === undefined ? i : String(i));
        } else {
          const isScalar = jsType !== 'undefined' && jsType !== 'object' && value !== null;
          report[binding as keyof BindingType][parameterName] = isScalar ? String(value) : value;
        }
      } else {
        const valid = AmfInputParser.addReportItem(report[binding as keyof BindingType], parameterName, schema, value, required);
        if (!valid) {
          report.valid = false;
          report.invalid.push(id);
        }
      }
    });

    return report;
  }

  /**
   * @param reportGroup
   * @param name
   * @param schema
   * @param value
   * @param required Whether the parameter is required.
   * @returns `true` when the parameter is valid and `false` otherwise.
   */
  static addReportItem(reportGroup: Record<string, any>, name: string, schema: AmfShapes.IShapeUnion, value: any, required?: boolean): boolean {
    const { types } = schema;
    if (types.includes(AmfNamespace.aml.vocabularies.shapes.ScalarShape)) {
      return AmfInputParser.addReportScalarItem(reportGroup, name, value, (schema as AmfShapes.IApiScalarShape), required);
    }
    if (types.includes(AmfNamespace.aml.vocabularies.shapes.ArrayShape) || types.includes(AmfNamespace.aml.vocabularies.shapes.MatrixShape)) {
      return AmfInputParser.addReportArrayItem(reportGroup, name, value, (schema as AmfShapes.IApiArrayShape), required);
    }
    if (types.includes(AmfNamespace.aml.vocabularies.shapes.UnionShape)) {
      return AmfInputParser.addReportUnionItem(reportGroup, name, value, (schema as AmfShapes.IApiUnionShape), required);
    }
    // ignored parameters are valid (from the form POV).
    return true;
  }

  /**
   * @param required Whether the parameter is required.
   * @returns `true` when the parameter is valid and `false` otherwise.
   */
  static addReportScalarItem(reportGroup: Record<string, any>, name: string, value: any, schema: AmfShapes.IApiScalarShape, required?: boolean): boolean {
    const type = typeof value;
    const isScalar = type !== 'undefined' && type !== 'object' && value !== null;
    reportGroup[name] = isScalar ? ApiSchemaValues.parseScalarInput(value, schema) : value;
    return !required || !!required && reportGroup[name] !== undefined;
  }

  /**
   * @param reportGroup
   * @param name
   * @param value
   * @param schema
   * @param required Whether the parameter is required.
   * @returns `true` when the parameter is valid and `false` otherwise.
   */
  static addReportArrayItem(reportGroup: Record<string, any>, name: string, value: any, schema: AmfShapes.IApiArrayShape, required?: boolean): boolean {
    if (!Array.isArray(reportGroup[name])) {
      reportGroup[name] = [];
    }
    if (!Array.isArray(value)) {
      // the value should be an array.
      return !required;
    }
    const { items } = schema;
    value.forEach((item) => {
      if (item === undefined) {
        // the UI generates a default input for array items. We now ignore all 
        // items that are undefined. This means the item was added but the user never provided any
        // value.
        return;
      }
      const type = typeof item;
      const isScalar = type !== 'undefined' && type !== 'object' && value !== null;
      if (isScalar) {
        const result = items ? ApiSchemaValues.parseUserInput(item, items) : String(item);
        if (result !== undefined) {
          reportGroup[name].push(result);
        }
      } else {
        reportGroup[name].push(item);
      }
    });
    return !required || !!required && !!reportGroup[name].length;
  }

  /**
   * @param reportGroup
   * @param name
   * @param value
   * @param schema
   * @param required Whether the parameter is required.
   * @returns `true` when the parameter is valid and `false` otherwise.
   */
  static addReportUnionItem(reportGroup: Record<string, any>, name: string, value: any, schema: AmfShapes.IApiUnionShape, required?: boolean): boolean {
    const { anyOf } = schema;
    if (!anyOf || !anyOf.length) {
      return !required;
    }
    const nil = anyOf.find(shape => shape.types.includes(AmfNamespace.aml.vocabularies.shapes.NilShape));
    if (nil && anyOf.length === 2) {
      // this item is not marked as nil (or we wouldn't get to this line) so use the only schema left.
      const scalar = anyOf.find(shape => shape !== nil);
      return AmfInputParser.addReportScalarItem(reportGroup, name, value, scalar as AmfShapes.IApiScalarShape);
    }
    // we are iterating over each schema in the union. Ignoring non-scalar schemas it parses user input
    // for each schema and if the result is set (non-undefined) then this value is used.
    for (let i = 0, len = anyOf.length; i < len; i += 1) {
      const option = anyOf[i];
      if (!option.types.includes(AmfNamespace.aml.vocabularies.shapes.ScalarShape)) {
        continue;
      }
      const result = ApiSchemaValues.parseUserInput(value, option);
      if (result !== undefined) {
        reportGroup[name] = result;
        return true;
      }
    }
    return !required;
  }
}
