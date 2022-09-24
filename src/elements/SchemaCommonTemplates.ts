/* eslint-disable default-param-last */
import { html, TemplateResult } from "lit";
import { classMap } from "lit/directives/class-map";
import { ifDefined } from "lit/directives/if-defined";
import { AmfShapes, AmfNamespace } from '@api-client/core/build/browser.js';
import '../../define/api-annotation-document.js';

/**
 * @param label The label to render.
 * @param title The value of the title attribute
 * @param css The list of class names to add
 * @returns The template for a pill visualization object
 */
export function pillTemplate(label: string, title: string, css: string[] = []): TemplateResult {
  const classes: Record<string, boolean> = {
    'param-pill': true,
    'pill': true,
    // 'text-selectable': true,
  };
  css.forEach((item) => {
    classes[item] = true
  });
  return html`
  <span class="${classMap(classes)}" title="${title}">
    ${label}
  </span>`;
}

/**
 * @param pills The pills to render
 */
function pillsLine(pills: TemplateResult[]): TemplateResult | string {
  if (!pills.length) {
    return '';
  }
  return html`
  <div class="param-pills">
    ${pills}
  </div>
  `;
}

/**
 * @param pills The pills to render
 * @param items The table properties to render.
 */
function pillsAndTable(pills: TemplateResult[], items: TemplateResult[]): TemplateResult {
  return html`
    ${pillsLine(pills)}
    ${items.length ? html`<div class="param-properties">${items}</div>` : ''}
  `;
}

function enumValuesTemplate(values: AmfShapes.IApiDataNodeUnion[]): TemplateResult {
  return html`
  <div class="schema-property-item">
  <div class="schema-property-label">Enum:</div>
    <ul class="enum-items">
      ${values.map((item) => html`<li class="code-value inline text-selectable">${(item as AmfShapes.IApiScalarNode).value}</li>`)}
    </ul>
  </div>
  `;
}

/**
 * @param name The name of the parameter
 * @param required Whether the parameter is required
 * @param deprecated Whether the parameter is deprecated
 * @param paramName When set it renders the parameter name. Should be used when `name` is a `display name`.
 * @returns The template for the property name value. 
 */
export function paramNameTemplate(name?: string, required = false, deprecated = false, paramName?: string): TemplateResult {
  const label = String(name || '');
  const classes = {
    'param-name': true,
    required,
    deprecated,
  };
  return html`
  <div class="${classMap(classes)}">
    <span class="param-label text-selectable">${label}</span>
  </div>
  ${paramName ? html`<span class="param-name-secondary text-selectable" title="Schema property name">${paramName}</span>` : ''}
  `;
}

/**
 * @param type The parameter type label to render.
 * @returns The template for the parameter data type. 
 */
export function typeValueTemplate(type?: string): TemplateResult | string {
  if (!type) {
    return '';
  }
  return html`
  <div class="param-type text-selectable">${type}</div>
  `;
}

/**
 * @param description The description to render.
 * @return The template for the markdown description
 */
export function descriptionValueTemplate(description: string): TemplateResult | string {
  if (!description) {
    return '';
  }
  return html`
  <div class="api-description">
    <arc-marked .markdown="${description}" sanitize>
      <div slot="markdown-html" class="markdown-body text-selectable"></div>
    </arc-marked>
  </div>
  `;
}

/**
 * @param label The label to render
 * @param value The value to render
 * @param name Optional data-name attribute value.
 */
export function tablePropertyTemplate(label: string, value: string, name?: string): TemplateResult {
  return html`
  <div class="schema-property-item text-selectable" data-name="${ifDefined(name)}">
    <div class="schema-property-label">${label}:</div>
    <div class="schema-property-value code-value inline">${value}</div>
  </div>
  `;
}

export function detailSectionTemplate(items: TemplateResult[]): TemplateResult {
  return html`
  <details class="property-details">
    <summary><span class="label">Details</span></summary>
    <div class="details-content">
      ${items}
    </div>
  </details>
  `;
}

/**
 * @param noDetail When true it always render all properties, without the detail element.
 * @returns The template for the details of the scalar schema
 */
export function scalarDetailsTemplate(schema: AmfShapes.IApiScalarShape, noDetail?: boolean): TemplateResult | string {
  const { examples = [], values = [], defaultValueStr, format, maxLength, maximum, minLength, minimum, multipleOf, pattern, readOnly, writeOnly, deprecated, customDomainProperties } = schema;
  const result: TemplateResult[] = [];
  const pills = [];
  if (defaultValueStr) {
    result.push(tablePropertyTemplate('Default value', defaultValueStr));
  }
  if (format) {
    result.push(tablePropertyTemplate('Format', format));
  }
  if (pattern) {
    result.push(tablePropertyTemplate('Pattern', pattern));
  }
  if (typeof minimum === 'number') {
    result.push(tablePropertyTemplate('Minimum', String(minimum)));
  }
  if (typeof maximum === 'number') {
    result.push(tablePropertyTemplate('Maximum', String(maximum)));
  }
  if (typeof minLength === 'number') {
    result.push(tablePropertyTemplate('Minimum length', String(minLength)));
  }
  if (typeof maxLength === 'number') {
    result.push(tablePropertyTemplate('Maximum length', String(maxLength)));
  }
  if (typeof multipleOf === 'number') {
    result.push(tablePropertyTemplate('Multiple of', String(multipleOf)));
  }
  if (readOnly) {
    pills.push(pillTemplate('Read only', 'This property is read only.'));
  }
  if (writeOnly) {
    pills.push(pillTemplate('Write only', 'This property is write only.'));
  }
  if (deprecated) {
    pills.push(pillTemplate('Deprecated', 'This property is marked as deprecated.', ['warning']));
  }
  if (values.length) {
    result[result.length] = enumValuesTemplate(values);
  }
  if (examples.length) {
    result[result.length] = html`
    <div class="schema-property-item">
      <div class="schema-property-label example">Examples:</div>
      <ul class="example-items">
        ${examples.map((item) => html`<li class="text-selectable">${item.value}</li>`)}
      </ul>
    </div>
    `;
  }
  if (Array.isArray(customDomainProperties) && customDomainProperties.length) {
    result[result.length] = html`<api-annotation-document .customProperties="${customDomainProperties}"></api-annotation-document>`;
  }
  if (noDetail && result.length) {
    return pillsAndTable(pills, result);
    // return html`${result}`;
  }
  if (result.length && result.length < 3) {
    return pillsAndTable(pills, result);
    // return html`${result}`;
  }
  if (result.length) {
    return html`
    ${pillsLine(pills)}
    ${detailSectionTemplate(result)}
    `;
    // return detailSectionTemplate(result);
  }
  return pillsLine(pills);
}

/**
 * @returns The template for the details of the Node schema
 */
function nodeDetailsTemplate(schema: AmfShapes.IApiNodeShape): TemplateResult|string {
  const { maxProperties, minProperties, readOnly, writeOnly, deprecated, customDomainProperties } = schema;
  const result = [];
  const pills = [];
  if (typeof minProperties === 'number') {
    result.push(tablePropertyTemplate('Minimum properties', String(minProperties)));
  }
  if (typeof maxProperties === 'number') {
    result.push(tablePropertyTemplate('Maximum properties', String(maxProperties)));
  }
  if (readOnly) {
    pills.push(pillTemplate('Read only', 'This property is read only.'));
  }
  if (writeOnly) {
    pills.push(pillTemplate('Write only', 'This property is write only.'));
  }
  if (deprecated) {
    pills.push(pillTemplate('Deprecated', 'This property is marked as deprecated.', ['warning']));
  }
  // if (examples.length) {
  //   result[result.length] = html`
  //   <div class="schema-property-item">
  //     <div class="schema-property-label example">Examples:</div>
  //     <ul class="example-items">
  //       ${examples.map((item) => html`<li>${item.value}</li>`)}
  //     </ul>
  //   </div>
  //   `;
  // }
  if (Array.isArray(customDomainProperties) && customDomainProperties.length) {
    result[result.length] = html`<api-annotation-document .customProperties="${customDomainProperties}"></api-annotation-document>`;
  }
  if (result.length && result.length < 3) {
    return pillsAndTable(pills, result);
    // return html`${result}`;
  }
  if (result.length) {
    return html`
    ${pillsLine(pills)}
    ${detailSectionTemplate(result)}
    `;
    // return detailSectionTemplate(result);
  }
  return pillsLine(pills);
}

/**
 * @returns The template for the details of the Array schema
 */
function arrayDetailsTemplate(schema: AmfShapes.IApiArrayShape): TemplateResult|string {
  const { readOnly, writeOnly, uniqueItems, defaultValueStr, deprecated, customDomainProperties, items } = schema;
  const result = [];
  const pills = [];
  if (defaultValueStr) {
    result.push(tablePropertyTemplate('Default value', defaultValueStr));
  } else if (items && items.defaultValueStr) {
    result.push(tablePropertyTemplate('Default value', items.defaultValueStr));
  }
  if (uniqueItems) {
    result.push(tablePropertyTemplate('Unique items', 'true'));
  }
  if (items && items.types && items.types.includes(AmfNamespace.aml.vocabularies.shapes.ScalarShape)) {
    const scalar: AmfShapes.IApiScalarShape = schema;
    if (scalar.format) {
      result.push(tablePropertyTemplate('Format', scalar.format));
    }
    if (scalar.pattern) {
      result.push(tablePropertyTemplate('Pattern', scalar.pattern));
    }
    if (typeof scalar.minimum === 'number') {
      result.push(tablePropertyTemplate('Minimum', String(scalar.minimum)));
    }
    if (typeof scalar.maximum === 'number') {
      result.push(tablePropertyTemplate('Maximum', String(scalar.maximum)));
    }
    if (typeof scalar.minLength === 'number') {
      result.push(tablePropertyTemplate('Minimum length', String(scalar.minLength)));
    }
    if (typeof scalar.maxLength === 'number') {
      result.push(tablePropertyTemplate('Maximum length', String(scalar.maxLength)));
    }
  }

  if (readOnly || (items && items.readOnly)) {
    pills.push(pillTemplate('Read only', 'This property is read only.'));
  }
  if (writeOnly || (items && items.writeOnly)) {
    pills.push(pillTemplate('Write only', 'This property is write only.'));
  }
  if (deprecated || (items && items.deprecated)) {
    pills.push(pillTemplate('Deprecated', 'This property is marked as deprecated.', ['warning']));
  }
  // if (examples.length) {
  //   result[result.length] = html`
  //   <div class="schema-property-item">
  //     <div class="schema-property-label example">Examples:</div>
  //     <ul class="example-items">
  //       ${examples.map((item) => html`<li>${item.value}</li>`)}
  //     </ul>
  //   </div>
  //   `;
  // }
  if (items && items.values.length) {
    result[result.length] = enumValuesTemplate(items.values);
  }
  if (Array.isArray(customDomainProperties) && customDomainProperties.length) {
    result[result.length] = html`<api-annotation-document .customProperties="${customDomainProperties}"></api-annotation-document>`;
  }
  if (result.length && result.length < 3) {
    return pillsAndTable(pills, result);
    // return html`${result}`;
  }
  if (result.length) {
    return html`
    ${pillsLine(pills)}
    ${detailSectionTemplate(result)}
    `;
    // return detailSectionTemplate(result);
  }
  return pillsLine(pills);
}

/**
 * @returns The template for the recursive shape.
 */
function recursiveDetailsTemplate(schema: AmfShapes.IApiRecursiveShape): TemplateResult | string {
  const { readOnly, writeOnly, defaultValueStr, deprecated, customDomainProperties, } = schema;
  const result = [];
  const pills = [];
  pills.push(pillTemplate('Recursive', 'This property is is recursive.', ['warning']));
  if (defaultValueStr) {
    result.push(tablePropertyTemplate('Default value', defaultValueStr));
  }
  if (readOnly) {
    pills.push(pillTemplate('Read only', 'This property is read only.'));
  }
  if (writeOnly) {
    pills.push(pillTemplate('Write only', 'This property is write only.'));
  }
  if (deprecated) {
    pills.push(pillTemplate('Deprecated', 'This property is marked as deprecated.', ['warning']));
  }

  if (Array.isArray(customDomainProperties) && customDomainProperties.length) {
    result[result.length] = html`<api-annotation-document .customProperties="${customDomainProperties}"></api-annotation-document>`;
  }
  if (result.length && result.length < 3) {
    return pillsAndTable(pills, result);
    // return html`${result}`;
  }
  if (result.length) {
    return html`
    ${pillsLine(pills)}
    ${detailSectionTemplate(result)}
    `;
    // return detailSectionTemplate(result);
  }
  return pillsLine(pills);
}

/**
 * @returns The template for the details of the Union schema
 */
export function unionDetailsTemplate(schema: AmfShapes.IApiUnionShape): TemplateResult | string {
  const { readOnly, writeOnly, defaultValueStr, deprecated, customDomainProperties } = schema;
  const result = [];
  const pills = [];
  if (defaultValueStr) {
    result.push(tablePropertyTemplate('Default value', defaultValueStr));
  }
  if (readOnly) {
    pills.push(pillTemplate('Read only', 'This property is read only.'));
  }
  if (writeOnly) {
    pills.push(pillTemplate('Write only', 'This property is write only.'));
  }
  if (deprecated) {
    pills.push(pillTemplate('Deprecated', 'This property is marked as deprecated.', ['warning']));
  }
  // if (examples.length) {
  //   result[result.length] = html`
  //   <div class="schema-property-item">
  //     <div class="schema-property-label example">Examples:</div>
  //     <ul class="example-items">
  //       ${examples.map((item) => html`<li>${item.value}</li>`)}
  //     </ul>
  //   </div>
  //   `;
  // }
  if (Array.isArray(customDomainProperties) && customDomainProperties.length) {
    result[result.length] = html`<api-annotation-document .customProperties="${customDomainProperties}"></api-annotation-document>`;
  }
  if (result.length && result.length < 3) {
    return pillsAndTable(pills, result);
    // return html`${result}`;
  }
  if (result.length) {
    return html`
    ${pillsLine(pills)}
    ${detailSectionTemplate(result)}
    `;
    // return detailSectionTemplate(result);
  }
  return pillsLine(pills);
}

/**
 * @param noDetail When true it always render all properties, without the detail element.
 * @returns The template for the details of the File schema
 */
export function fileDetailsTemplate(schema: AmfShapes.IApiFileShape, noDetail?: boolean): TemplateResult | string {
  const { customDomainProperties = [], values = [], defaultValueStr, format, maxLength, maximum, minLength, minimum, multipleOf, pattern, readOnly, writeOnly, fileTypes, deprecated } = schema;
  const result = [];
  const pills = [];
  if (defaultValueStr) {
    result.push(tablePropertyTemplate('Default value', defaultValueStr));
  }
  if (fileTypes && fileTypes.length) {
    result.push(tablePropertyTemplate('File types', fileTypes.join(', ')));
  }
  if (readOnly) {
    pills.push(pillTemplate('Read only', 'This property is read only.'));
  }
  if (writeOnly) {
    pills.push(pillTemplate('Write only', 'This property is write only.'));
  }
  if (deprecated) {
    pills.push(pillTemplate('Deprecated', 'This property is marked as deprecated.', ['warning']));
  }
  if (format) {
    result.push(tablePropertyTemplate('Format', format));
  }
  if (pattern) {
    result.push(tablePropertyTemplate('Name pattern', pattern));
  }
  if (typeof minimum === 'number') {
    result.push(tablePropertyTemplate('Minimum size', String(minimum)));
  }
  if (typeof maximum === 'number') {
    result.push(tablePropertyTemplate('Maximum size', String(maximum)));
  }
  if (typeof minLength === 'number') {
    result.push(tablePropertyTemplate('Minimum length', String(minLength)));
  }
  if (typeof maxLength === 'number') {
    result.push(tablePropertyTemplate('Maximum length', String(maxLength)));
  }
  if (typeof multipleOf === 'number') {
    result.push(tablePropertyTemplate('Multiple of', String(multipleOf)));
  }
  if (values.length) {
    result[result.length] = enumValuesTemplate(values);
  }
  // if (examples.length) {
  //   result[result.length] = html`
  //   <div class="schema-property-item">
  //     <div class="schema-property-label example">Examples:</div>
  //     <ul class="example-items">
  //       ${examples.map((item) => html`<li>${item.value}</li>`)}
  //     </ul>
  //   </div>
  //   `;
  // }
  if (Array.isArray(customDomainProperties) && customDomainProperties.length) {
    result[result.length] = html`<api-annotation-document .customProperties="${customDomainProperties}"></api-annotation-document>`;
  }
  if (noDetail && result.length) {
    return pillsAndTable(pills, result);
  }
  if (result.length && result.length < 3) {
    return pillsAndTable(pills, result);
  }
  if (result.length) {
    return html`
    ${pillsLine(pills)}
    ${detailSectionTemplate(result)}
    `;
    // return detailSectionTemplate(result);
  }
  return pillsLine(pills);
}

/**
 * @param schema The schema definition.
 * @returns The template for the property details.
 */
export function detailsTemplate(schema?: AmfShapes.IShapeUnion): TemplateResult | string {
  if (!schema) {
    return '';
  }
  const { types } = schema;
  if (types.includes(AmfNamespace.aml.vocabularies.shapes.ScalarShape)) {
    return scalarDetailsTemplate((schema as AmfShapes.IApiScalarShape));
  }
  if (types.includes(AmfNamespace.w3.shacl.NodeShape)) {
    return nodeDetailsTemplate((schema as AmfShapes.IApiNodeShape));
  }
  if (types.includes(AmfNamespace.aml.vocabularies.shapes.ArrayShape)) {
    return arrayDetailsTemplate((schema as AmfShapes.IApiArrayShape));
  }
  if (types.includes(AmfNamespace.aml.vocabularies.shapes.UnionShape)) {
    return unionDetailsTemplate((schema as AmfShapes.IApiUnionShape));
  }
  if (types.includes(AmfNamespace.aml.vocabularies.shapes.FileShape)) {
    return fileDetailsTemplate((schema as AmfShapes.IApiFileShape));
  }
  if (types.includes(AmfNamespace.aml.vocabularies.shapes.RecursiveShape)) {
    return recursiveDetailsTemplate((schema as AmfShapes.IApiRecursiveShape));
  }
  return ''
}
