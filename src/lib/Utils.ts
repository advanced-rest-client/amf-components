import { AmfNamespace, ApiDefinitions, AmfShapes, Headers } from '@api-client/core/build/browser.js';
import sanitizer from 'dompurify';
/**
 * Stops an event and cancels it.
 * @param e The event to stop
 */
export function cancelEvent(e: Event): void {
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
}

/**
 * @param types Shape's types
 */
export function isScalarType(types: string[] = []): boolean {
  const { shapes } = AmfNamespace.aml.vocabularies;
  return types.includes(shapes.ScalarShape) ||
    types.includes(shapes.NilShape) ||
    types.includes(shapes.FileShape);
}

/**
 * @param value The value from the graph model to use to read the value from
 */
export function schemaToType(value: string): string {
  const typed = String(value);
  let index = typed.lastIndexOf('#');
  if (index === -1) {
    index = typed.lastIndexOf('/');
  }
  let v = typed.substr(index + 1);
  if (v) {
    v = `${v[0].toUpperCase()}${v.substr(1)}`
  }
  return v;
}

/**
 * Reads the label for a data type for a shape union.
 * @param schema
 * @param isArray Used internally
 * @returns Computed label for a shape.
 */
export function readPropertyTypeLabel(schema: AmfShapes.IShapeUnion, isArray = false): string | undefined {
  if (!schema) {
    return undefined;
  }
  const { types } = schema;
  if (types.includes(AmfNamespace.aml.vocabularies.shapes.NilShape)) {
    return 'Nil';
  }
  if (types.includes(AmfNamespace.aml.vocabularies.shapes.ScalarShape)) {
    const scalar = schema as AmfShapes.IApiScalarShape;
    return schemaToType(scalar.dataType || '');
  }
  if (types.includes(AmfNamespace.aml.vocabularies.shapes.TupleShape)) {
    const array = schema as AmfShapes.IApiTupleShape;
    if (!array.items || !array.items.length) {
      return undefined;
    }
    const label = readPropertyTypeLabel(array.items[0], true);
    return `List of ${label}`;
  }
  if (types.includes(AmfNamespace.aml.vocabularies.shapes.ArrayShape)) {
    const array = schema as AmfShapes.IApiArrayShape;
    if (!array.items) {
      return undefined;
    }
    let label = readPropertyTypeLabel(array.items, true);
    if (label === 'items' && !isScalarType(array.items.types)) {
      label = 'objects';
    }
    return `List of ${label}`;
  }
  if (types.includes(AmfNamespace.w3.shacl.NodeShape)) {
    let { name } = schema as AmfShapes.IApiNodeShape;
    const { properties } = schema as AmfShapes.IApiNodeShape;
    if (isArray && properties && properties.length === 1) {
      const potentialScalar = properties[0].range as AmfShapes.IApiScalarShape;
      if (potentialScalar.types.includes(AmfNamespace.aml.vocabularies.shapes.ScalarShape)) {
        return schemaToType(potentialScalar.dataType || '');
      }
    }
    if (name === 'type') {
      // AMF seems to put `type` value into a property that is declared inline (?).
      name = undefined;
    }
    return name || 'Object';
  }
  if (types.includes(AmfNamespace.aml.vocabularies.shapes.UnionShape)) {
    const union = schema as AmfShapes.IApiUnionShape;
    const items = union.anyOf.map(i => readPropertyTypeLabel(i));
    return items.join(' or ');
  }
  if (types.includes(AmfNamespace.aml.vocabularies.shapes.FileShape)) {
    return 'File';
  }
  return schema.name || 'Unknown';
}

/**
 * @param shapes
 * @returns true when all of passed shapes are scalar.
 */
function isAllScalar(shapes: AmfShapes.IShapeUnion[] = []): boolean {
  return !shapes.some(i => !isScalarType(i.types));
}

/**
 * @param shape
 * @returns true when the passed union type consists of scalar values only. Nil counts as scalar.
 */
export function isScalarUnion(shape: AmfShapes.IApiUnionShape): boolean {
  const { anyOf = [], or = [], and = [], xone = [] } = shape;
  if (anyOf.length) {
    return isAllScalar(anyOf);
  }
  if (or.length) {
    return isAllScalar(or);
  }
  if (and.length) {
    return isAllScalar(and);
  }
  if (xone.length) {
    return isAllScalar(xone);
  }
  return true;
}

export function sanitizeHTML(HTML: string): string {
  const result = sanitizer.sanitize(HTML, {
    ADD_ATTR: ['target', 'href'],
    ALLOWED_TAGS: ['a'],
    USE_PROFILES: { html: true },
  });

  if (typeof result === 'string') {
    return result;
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return result.toString();
}

export function joinTraitNames(traits: ApiDefinitions.IApiParametrizedDeclaration[]): string {
  const names = traits.map(trait => trait.name).filter(i => !!i);
  let value = '';
  if (names.length === 2) {
    value = names.join(' and ');
  } else if (value.length > 2) {
    const last = names.pop();
    value = names.join(', ');
    value += `, and ${last}`;
  } else {
    value = names.join(', ');
  }
  return value;
}

export function generateHeaders(params: Record<string, unknown>): string {
  if (typeof params !== 'object') {
    return '';
  }
  const lines = Object.keys(params).map((name) => {
    let value = params[name];
    if (value === undefined) {
      value = '';
    } else if (Array.isArray(value)) {
      value = value.join(',');
    } else {
      value = String(value);
    }
    let result = `${name}: `;
    value = (value as string).split('\n').join(' ');
    result += value;
    return result;
  });
  return lines.join('\n');
}

/**
 * Ensures the headers have content type header.
 * @param headers The generated headers string
 * @param mime The expected by the selected payload media type. If not set then it does nothing.
 */
export function ensureContentType(headers: string, mime?: string): string {
  if (!mime) {
    return headers;
  }
  const parsed = new Headers(headers);
  const current = parsed.get('content-type');
  if (!current && mime) {
    parsed.set('content-type', mime);
  }
  return parsed.toString();
}

/**
 * @param parameter
 * @param schema
 * @returns The name to use in the input.
 */
export function readLabelValue(parameter: ApiDefinitions.IApiParameter, schema: AmfShapes.IShapeUnion): string {
  let label = parameter.paramName || schema.displayName || parameter.name || schema.name || '';
  const { required } = parameter;
  if (required) {
    label += '*';
  }
  return label;
}
