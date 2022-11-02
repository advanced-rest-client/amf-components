/* eslint-disable no-plusplus */
/* eslint-disable class-methods-use-this */
import { html, TemplateResult, CSSResult } from 'lit';
import { property } from 'lit/decorators.js';
import { AmfNamespace, ApiSchemaGenerator, AmfShapes } from '@api-client/core/build/browser.js';
import { AnypointRadioGroupElement } from '@anypoint-web-components/awc';
import { classMap } from "lit/directives/class-map";
import { MarkdownStyles } from '@advanced-rest-client/highlight';
import '@advanced-rest-client/highlight/arc-marked.js';
import '@anypoint-web-components/awc/dist/define/anypoint-radio-button.js';
import '@anypoint-web-components/awc/dist/define/anypoint-radio-group.js';
import { chevronRight } from '@advanced-rest-client/icons';
import commonStyles from './styles/Common.js';
import elementStyles from './styles/ApiSchema.js';
import schemaStyles from './styles/SchemaCommon.js';
import { readPropertyTypeLabel, isScalarUnion, isScalarType } from '../lib/Utils.js';
import { 
  detailsTemplate, 
  paramNameTemplate, 
  typeValueTemplate, 
  fileDetailsTemplate,
  scalarDetailsTemplate,
  unionDetailsTemplate,
  pillTemplate,
} from './SchemaCommonTemplates.js';
import { 
  ApiDocumentationBase,
  descriptionTemplate,
  customDomainPropertiesTemplate,
  evaluateExamples,
  examplesTemplate,
  examplesValue,
} from './ApiDocumentationBase.js';
import { Events } from '../events/Events.js';
import { SchemaExample } from '../types.js';

export const mimeTypeValue = Symbol('mimeTypeValue');
export const querySchema = Symbol('querySchema');
export const schemaValue = Symbol('schemaValue');
export const expandedValue = Symbol('expandedValue');
export const selectedUnionsValue = Symbol('unionsValue');
export const processSchema = Symbol('processSchema');
export const titleTemplate = Symbol('titleTemplate');
export const expandHandler = Symbol('expandHandler');
export const expandKeydownHandler = Symbol('expandKeydownHandler');
export const anyOfSelectedHandler = Symbol('anyOfSelectedHandler');
export const schemaContentTemplate = Symbol('schemaContentTemplate');
export const scalarShapeTemplate = Symbol('scalarSchemaTemplate');
export const nodeShapeTemplate = Symbol('nodeShapeTemplate');
export const unionShapeTemplate = Symbol('unionShapeTemplate');
export const fileShapeTemplate = Symbol('fileShapeTemplate');
export const schemaShapeTemplate = Symbol('schemaShapeTemplate');
export const arrayShapeTemplate = Symbol('arrayShapeTemplate');
export const tupleShapeTemplate = Symbol('tupleShapeTemplate');
export const anyShapeTemplate = Symbol('anyShapeTemplate');
export const shapePropertyTemplate = Symbol('shapePropertyTemplate');
export const shapePropertyWithoutRangeTemplate = Symbol('shapePropertyWithoutRangeTemplate');
export const anyOfUnionTemplate = Symbol('anyOfUnionTemplate');
export const anyOfOptionsTemplate = Symbol('anyOfOptionsTemplate');
export const propertyDescriptionTemplate = Symbol('propertyDescriptionTemplate');
export const propertyDescriptionEditor = Symbol('propertyDescriptionEditor');
// export const checkSchemaPropertyUpdate = Symbol('checkSchemaPropertyUpdate');
export const propertyDecoratorTemplate = Symbol('propertyDecoratorTemplate');
export const toggleExpandedProperty = Symbol('toggleExpandedProperty');
export const andUnionItemTemplate = Symbol('andUnionItemTemplate');
export const orderUnion = Symbol('orderUnion');
export const inheritanceNameTemplate = Symbol('inheritanceNameTemplate');
export const nilShapeTemplate = Symbol('nilShapeTemplate');

const complexTypes = [
  AmfNamespace.w3.shacl.NodeShape,
  AmfNamespace.aml.vocabularies.shapes.UnionShape,
  AmfNamespace.aml.vocabularies.shapes.ArrayShape,
  AmfNamespace.aml.vocabularies.shapes.TupleShape,
  AmfNamespace.aml.vocabularies.shapes.AnyShape,
];

export default class ApiSchemaDocumentElement extends ApiDocumentationBase {
  static get styles(): CSSResult[] {
    return [commonStyles, schemaStyles, elementStyles, MarkdownStyles];
  }

  [mimeTypeValue]?: string;

  /** 
   * The mime type to use to render the examples.
   * @attribute
   */
  @property({ type: String, reflect: true })
  get mimeType(): string | undefined {
    return this[mimeTypeValue];
  }

  set mimeType(value: string | undefined) {
    const old = this[mimeTypeValue];
    if (old === value) {
      return;
    }
    this[mimeTypeValue] = value;
    this.requestUpdate('mimeType', old);
    setTimeout(() => {
      this[processSchema]();
      this.requestUpdate();
    });
  }

  [schemaValue]?: AmfShapes.IShapeUnion;

  get schema(): AmfShapes.IShapeUnion | undefined {
    return this[schemaValue];
  }

  set schema(value: AmfShapes.IShapeUnion | undefined) {
    const old = this[schemaValue];
    if (old === value) {
      return;
    }
    this[schemaValue] = value;
    this.processGraph();
  }

  /** 
   * Generates examples from the schema properties for the given mime type 
   * when examples are not defined in the schema.
   * @attribute
   */
  @property({ type: Boolean, reflect: true }) forceExamples?: boolean;

  /** 
   * When set it allows to manipulate the properties.
   * This is to be used with a combination with the `edit` property.
   * @attribute
   */
  @property({ type: Boolean, reflect: true }) editProperties?: boolean;

  /** 
   * When set it renders the title with lower emphasis and adding `schema` prefix.
   * @attribute
   */
  @property({ type: Boolean, reflect: true }) schemaTitle?: boolean;

  /** 
   * When set it does not render read only items.
   * Read only property is a feature of OAS.
   * @attribute
   */
  @property({ type: Boolean, reflect: true }) noReadOnly?: boolean;

  [expandedValue]: string[];

  [selectedUnionsValue]: Record<string, string>;

  [propertyDescriptionEditor]?: string;

  constructor() {
    super();
    this[expandedValue] = [];
    this[selectedUnionsValue] = {};
  }

  async processGraph(): Promise<void> {
    this[expandedValue] = [];
    this[selectedUnionsValue] = {};
    await this[querySchema]();
    this[processSchema]();
    this.requestUpdate();
    await this.updateComplete;
  }

  /**
   * Queries the store for the schema data, when needed.
   */
  async [querySchema](): Promise<void> {
    const { domainId } = this;
    if (!domainId) {
      // this[schemaValue] = undefined;
      return;
    }
    if (this[schemaValue] && this[schemaValue].id === domainId) {
      // in case the schema model was provided via the property setter.
      return;
    }
    try {
      const info = await Events.Type.get(this, domainId);
      this[schemaValue] = info;
    } catch (e) {
      const ex = e as Error;
      Events.Telemetry.exception(this, ex.message, false);
      Events.Reporting.error(this, ex, `Unable to query for API schema data: ${ex.message}`, this.localName);
    }
  }

  /**
   * The logic to perform after schema is ready.
   * This processes examples for the schema.
   */
  [processSchema](): void {
    const type = this[schemaValue];
    if (!type) {
      this[examplesValue] = undefined;
      return;
    }
    if (isScalarType(type.types)) {
      // we don't want to render examples for a scalar types.
      this[examplesValue] = undefined;
      return;
    }
    const anyShape = type as AmfShapes.IApiAnyShape;
    const { examples=[] } = anyShape;
    let examplesCopy = [...examples];
    if (Array.isArray(type.inherits) && type.inherits.length) {
      type.inherits.forEach((item) => {
        const anyParent = item as AmfShapes.IApiAnyShape;
        if (Array.isArray(anyParent.examples) && anyParent.examples.length) {
          examplesCopy = examplesCopy.concat([...anyParent.examples]);
        }
      });
    }
    if (Array.isArray(examplesCopy) && examplesCopy.length) {
      examplesCopy = examplesCopy.filter((i) => !!i.value || !!i.structuredValue);
    }
    if (Array.isArray(examplesCopy) && examplesCopy.length) {
      const { mimeType='' } = this;
      this[examplesValue] = this[evaluateExamples](examplesCopy, mimeType);
    } else {
      const { mimeType, forceExamples } = this;
      this[examplesValue] = undefined;
      if (mimeType && forceExamples) {
        const selectedUnions: string[] = [];
        const all = this[selectedUnionsValue];
        Object.keys(all).forEach((id) => {
          if (!selectedUnions.includes(all[id])) {
            selectedUnions.push(all[id]);
          }
        });
        const result = ApiSchemaGenerator.asExample(type, mimeType, {
          selectedUnions,
          renderExamples: true,
          renderOptional: true,
        });
        if (result) {
          this[examplesValue] = [result as SchemaExample];
        }
      }
    }
  }

  // /**
  //  * Checks the current schema whether it contains a property with the given id
  //  * and if so it updates its value.
  //  * @param {ApiShapeUnion} schema
  //  * @param {string} id
  //  * @param {any} updated
  //  */
  // [checkSchemaPropertyUpdate](schema: AmfShapes.IShapeUnion, id: string, updated): void {
  //   if (!schema) {
  //     return;
  //   }
  //   const { types } = schema;
  //   if (types.includes(AmfNamespace.w3.shacl.NodeShape)) {
  //     const type = /** @type ApiNodeShape */ (schema);
  //     const { properties } = type;
  //     for (let i = 0, len = properties.length; i < len; i++) {
  //       const property = properties[i];
  //       if (property.id === id) {
  //         properties[i] = updated;
  //         this.requestUpdate();
  //         return;
  //       }
  //       if (property.range && property.range.id === id) {
  //         property.range = updated;
  //         this.requestUpdate();
  //         return;
  //       }
  //     }
  //     return;
  //   }
  //   if (types.includes(AmfNamespace.aml.vocabularies.shapes.UnionShape)) {
  //     const type = /** @type ApiUnionShape */ (schema);
  //     const { anyOf, or, and } = type;
  //     if (Array.isArray(anyOf) && anyOf.length) {
  //       anyOf.forEach((item) => this[checkSchemaPropertyUpdate](item, id, updated));
  //     }
  //     if (Array.isArray(or) && or.length) {
  //       or.forEach((item) => this[checkSchemaPropertyUpdate](item, id, updated));
  //     }
  //     if (Array.isArray(and) && and.length) {
  //       and.forEach((item) => this[checkSchemaPropertyUpdate](item, id, updated));
  //     }
  //     return;
  //   }
  //   if (types.includes(AmfNamespace.aml.vocabularies.shapes.ArrayShape) || types.includes(ns.aml.vocabularies.shapes.MatrixShape)) {
  //     const type = /** @type ApiArrayShape */ (schema);
  //     if (type.items) {
  //       this[checkSchemaPropertyUpdate](type.items, id, updated)
  //     }
  //   }
  // }

  [expandHandler](e: Event): void {
    const button = e.currentTarget as HTMLElement;
    const { id } = button.dataset;
    this[toggleExpandedProperty](id as string);
  }

  [expandKeydownHandler](e: KeyboardEvent): void {
    if (e.code !== 'Space') {
      return;
    }
    e.preventDefault();
    const button = e.currentTarget as HTMLElement;
    const { id } = button.dataset;
    this[toggleExpandedProperty](id as string);
  }

  /**
   * Toggles an "expanded" state for a property children.
   * @param id Parent property id that has children to toggle visibility of.
   */
  [toggleExpandedProperty](id: string): void {
    const list = this[expandedValue];
    const index = list.indexOf(id);
    if (index === -1) {
      list.push(id);
    } else {
      list.splice(index, 1);
    }
    this.requestUpdate();
  }

  [anyOfSelectedHandler](e: Event): void {
    const node = e.target as AnypointRadioGroupElement;
    const { selected, dataset } = node;
    const { schema } = dataset;
    if (!schema) {
      return;
    }
    this[selectedUnionsValue][schema] = selected as string;
    this[processSchema]();
    this.requestUpdate();
  }

  /**
   * Orders union items so the first is the one that has properties defined inline.
   */
  [orderUnion](shapes: AmfShapes.IShapeUnion[]): AmfShapes.IShapeUnion[] {
    return [...shapes].sort((a, b) => {
      const aHasName = !!a.name && !a.name.startsWith('item');
      const bHasName = !!b.name && !b.name.startsWith('item');
      if (aHasName === bHasName) {
        return 0;
      }
      return aHasName ? 1 : -1;
    });
  }

  render(): TemplateResult {
    const schema = this[schemaValue];
    if (!schema) {
      return html``;
    }
    return html`
    ${this[titleTemplate](schema)}
    ${this[descriptionTemplate](schema.description)}
    ${this[customDomainPropertiesTemplate](schema.customDomainProperties)}
    ${this[examplesTemplate]()}
    ${this[schemaContentTemplate](schema)}
    `;
  }

  /**
   * @returns The template for the schema title.
   */
  [titleTemplate](schema: AmfShapes.IShapeUnion): TemplateResult | string {
    const { name, displayName } = schema;
    const label = displayName || name || '';
    if (['schema', 'default'].includes(label)) {
      return '';
    }
    const typeName = name && label !== name && name !== 'schema' ? name : undefined;
    const { schemaTitle } = this;
    const headerCss = {
      'schema-title': true,
      'low-emphasis': !!schemaTitle,
    };
    const prefix = schemaTitle ? 'Schema: ' : '';
    return html`
    <div class="schema-header">
      <div class="${classMap(headerCss)}">
        <span class="label text-selectable">${prefix}${label}</span>
        ${typeName ? html`<span class="type-name text-selectable" title="Schema name">(${typeName})</span>` : ''}
      </div>
    </div>
    `;
  }

  /**
   * @param schema The shape to render.
   * @returns The template for the schema properties depending on the type
   */
  [schemaContentTemplate](schema: AmfShapes.IShapeUnion): TemplateResult | string {
    const { noReadOnly } = this;
    if (schema.readOnly && noReadOnly) {
      return '';
    }
    const { types } = schema;
    if (types.includes(AmfNamespace.aml.vocabularies.shapes.ScalarShape)) {
      return this[scalarShapeTemplate](schema as AmfShapes.IApiScalarShape);
    }
    if (types.includes(AmfNamespace.w3.shacl.NodeShape)) {
      return this[nodeShapeTemplate](schema as AmfShapes.IApiNodeShape);
    }
    if (types.includes(AmfNamespace.aml.vocabularies.shapes.UnionShape)) {
      return this[unionShapeTemplate](schema as AmfShapes.IApiUnionShape);
    }
    if (types.includes(AmfNamespace.aml.vocabularies.shapes.FileShape)) {
      return this[fileShapeTemplate](schema as AmfShapes.IApiFileShape);
    }
    if (types.includes(AmfNamespace.aml.vocabularies.shapes.SchemaShape)) {
      return this[schemaShapeTemplate](schema as AmfShapes.IApiSchemaShape);
    }
    if (types.includes(AmfNamespace.aml.vocabularies.shapes.TupleShape)) {
      return this[tupleShapeTemplate](schema as AmfShapes.IApiTupleShape);
    }
    if (types.includes(AmfNamespace.aml.vocabularies.shapes.ArrayShape) || types.includes(AmfNamespace.aml.vocabularies.shapes.MatrixShape)) {
      return this[arrayShapeTemplate](schema as AmfShapes.IApiArrayShape);
    }
    if (types.includes(AmfNamespace.aml.vocabularies.shapes.NilShape)) {
      return this[nilShapeTemplate](schema as AmfShapes.IApiShape);
    }
    return this[anyShapeTemplate](schema as AmfShapes.IApiAnyShape);
  }

  /**
   * @returns The template for the scalar shape.
   */
  [scalarShapeTemplate](schema: AmfShapes.IApiScalarShape): TemplateResult | string {
    if (schema.readOnly && this.noReadOnly) {
      return '';
    }
    const type = typeValueTemplate(readPropertyTypeLabel(schema));
    return html`
    <div class="scalar-property">
      ${type}
      ${scalarDetailsTemplate(schema, true)}
    </div>
    `;
    // return scalarDetailsTemplate(schema, true);
  }

  /**
   * @returns The template for the node shape.
   */
  [nodeShapeTemplate](schema: AmfShapes.IApiNodeShape): TemplateResult | string {
    const { properties, inherits, readOnly } = schema;
    if (readOnly && this.noReadOnly) {
      return '';
    }
    let items = [...(properties || [])];
    if (Array.isArray(inherits) && inherits.length) {
      inherits.forEach((item) => {
        if (item.types.includes(AmfNamespace.w3.shacl.NodeShape)) {
          const typed = item as AmfShapes.IApiNodeShape;
          items = items.concat([...(typed.properties || [])]);
        }
      });
    }
    if (!items.length) {
      return html`
        <div class="empty-info">Properties are not defined for this schema.</div>
      `;
    }
    return html`
    <div class="params-section">
      ${items.map((item) => this[shapePropertyTemplate](item))}
    </div>
    `;
  }

  // /**
  //  * @param {AmfShapes.IShapeUnion[]} parents
  //  * @returns {TemplateResult[]|undefined}
  //  */
  // [inheritedTemplate](parents) {
  //   if (!Array.isArray(parents) || !parents.length) {
  //     return undefined;
  //   }
  //   const parts = [];
  //   parents.forEach((item) => {
  //     const tpl = this[schemaContentTemplate](item);
  //     if (tpl) {
  //       parts.push(tpl);
  //     }
  //   });
  //   if (!parts.length) {
  //     return undefined;
  //   }
  //   return parts;
  // }

  /**
   * @returns The template for the union shape.
   */
  [unionShapeTemplate](schema: AmfShapes.IApiUnionShape): TemplateResult | string {
    const unionTemplate = unionDetailsTemplate(schema);
    const allScalar = isScalarUnion(schema);
    if (allScalar) {
      return unionTemplate;
    }
    const { anyOf, or, and, xone } = schema;
    if (Array.isArray(anyOf) && anyOf.length) {
      const schemaContent = this[anyOfUnionTemplate](schema.id, anyOf);
      return html`
      ${unionTemplate}
      ${schemaContent}
      `;
    }
    if (Array.isArray(xone) && xone.length) {
      const schemaContent = this[anyOfUnionTemplate](schema.id, xone);
      return html`
      ${unionTemplate}
      ${schemaContent}
      `;
    }
    if (Array.isArray(or) && or.length) {
      const schemaContent = this[anyOfUnionTemplate](schema.id, or);
      return html`
      ${unionTemplate}
      ${schemaContent}
      `;
    }
    if (Array.isArray(and) && and.length) {
      const items = this[orderUnion](and).map((item) => this[andUnionItemTemplate](item));
      return html`
      <div class="combined-union">
        ${items}
      </div>
      `;
    }
    return unionTemplate;
  }

  [andUnionItemTemplate](shape: AmfShapes.IShapeUnion): TemplateResult {
    return html`
    <div class="and-union-member">
      ${this[inheritanceNameTemplate](shape)}
      ${this[schemaContentTemplate](shape)}
    </div>
    `;
  }

  /**
   * @returns The template for the "and" union item's title, if inherited from another type.
   */
  [inheritanceNameTemplate](shape: AmfShapes.IShapeUnion): TemplateResult | string {
    const { name='' } = shape;
    const hasName = !!name && !name.startsWith('item');
    if (hasName) {
      return html`<p class="inheritance-label text-selectable">Properties inherited from <b>${name}</b>.</p>`;
    }
    return '';
    // return html`<p class="inheritance-label">Properties defined inline.</p>`;
  }

  /**
   * @returns The template for the `any of` union.
   */
  [anyOfUnionTemplate](schemaId: string, items: AmfShapes.IShapeUnion[]): TemplateResult | string {
    const allSelected = this[selectedUnionsValue];
    let selected = allSelected[schemaId];
    let renderedItem: AmfShapes.IShapeUnion | undefined;
    if (selected) {
      renderedItem = items.find((item) => item.id === selected);
    } else {
      [renderedItem] = items;
      selected = renderedItem.id;
    }
    if (!renderedItem) {
      return '';
    }
    const options = items.map((item) => {
      const label = readPropertyTypeLabel(item) as string;
      // let label = item.name || item.displayName;
      // if (!label && item.types.includes(ns.aml.vocabularies.shapes.ScalarShape)) {
      //   const { dataType } = /** @type ApiScalarShape */ (item);
      //   label = `${schemaToType(dataType)} (#${index + 1})`;
      // }
      // if (!label) {
      //   label = `Option #${index + 1}`;
      // }
      return {
        label,
        id: item.id,
      }
    });
    return html`
    <div class="union-container">
      ${this[anyOfOptionsTemplate](schemaId, options, selected)}
      ${this[schemaContentTemplate](renderedItem)}
    </div>
    `;
  }

  /**
   * @param schemaId The parent schema id value
   * @param options The options to render.
   * @returns The template for the union any of selector.
   */
  [anyOfOptionsTemplate](schemaId: string, options: ({ id: string, label: string })[], selected: string): TemplateResult {
    return html`
    <div class="union-options">
      <label>Any (one or more) of the following schemas</label>
      <anypoint-radio-group 
        @selected="${this[anyOfSelectedHandler]}" 
        attrForSelected="data-value" 
        .selected="${selected}"
        data-schema="${schemaId}"
      >
        ${options.map((item) => 
          html`<anypoint-radio-button class="union-toggle" name="unionValue" data-value="${item.id}" data-member="${item.label}">${item.label}</anypoint-radio-button>`)}
      </anypoint-radio-group>
    </div>
    `;
  }

  /**
   * @returns The template for the file shape.
   */
  [fileShapeTemplate](schema: AmfShapes.IApiFileShape): TemplateResult | string {
    if (schema.readOnly && this.noReadOnly) {
      return '';
    }
    let noDetail = false;
    if (schema === this[schemaValue]) {
      noDetail = true;
    }
    return fileDetailsTemplate(schema, noDetail);
  }

  /**
   * @returns The template for the schema shape.
   */
  [schemaShapeTemplate](schema: AmfShapes.IApiSchemaShape): TemplateResult | string {
    const { raw, readOnly } = schema;
    if (readOnly && this.noReadOnly) {
      return '';
    }
    if (!raw) {
      return html`
      <div class="empty-info">Schema is not defined for this message.</div>
      `;
    }
    return html`
    <div class="schema-content">
    <pre class="code-value text-selectable"><code>${raw}</code></pre>
    </div>
    `;
  }

  /**
   * @returns The template for the array shape.
   */
  [arrayShapeTemplate](schema: AmfShapes.IApiArrayShape): TemplateResult | string {
    const { items, readOnly } = schema;
    if (readOnly && this.noReadOnly) {
      return '';
    }
    if (!items) {
      return html`<div class="empty-info">Items are not defined for this array.</div>`;
    }
    let labelTemplate;
    if (schema === this[schemaValue]) {
      const label = readPropertyTypeLabel(schema, true);
      labelTemplate = html`
      <div class="schema-property-item">
        <div class="schema-property-label text-selectable">${label}</div>
      </div>
      `;
    }
    if (items.types.includes(AmfNamespace.aml.vocabularies.shapes.ScalarShape)) {
      return this[scalarShapeTemplate](schema);
    }
    return html`
    <div class="params-section">
      ${labelTemplate||''}
      ${this[schemaContentTemplate](items)}
    </div>
    `;
  }

  /**
   * @returns The template for the tuple shape.
   */
  [tupleShapeTemplate](schema: AmfShapes.IApiTupleShape): TemplateResult | string {
    const { items, readOnly } = schema;
    if (readOnly && this.noReadOnly) {
      return '';
    }
    if (!items) {
      return html`<div class="empty-info text-selectable">Items are not defined for this array.</div>`;
    }
    return html`
    <div class="params-section">
      ${items.map((item) => this[schemaContentTemplate](item))}
    </div>
    `;
  }

  /**
   * @returns The template for the Any shape.
   */
  [anyShapeTemplate](schema: AmfShapes.IApiAnyShape): TemplateResult | string {
    const { and=[], or=[], readOnly, xone=[] } = schema;
    if (readOnly && this.noReadOnly) {
      return '';
    }
    if (and.length || or.length || xone.length) {
      return this[unionShapeTemplate](schema as AmfShapes.IApiUnionShape);
    }
    return html`<p class="any-info text-selectable">Any schema is accepted as the value here.</p>`;
  }

  /**
   * @returns The template for the Any shape.
   */
  [nilShapeTemplate](schema: AmfShapes.IApiShape): TemplateResult | string {
    if (schema.readOnly && this.noReadOnly) {
      return '';
    }
    return html`<p class="nil-info text-selectable">The value of this property is <b>nil</b>.</p>`;
  }

  /**
   * @returns The template for the schema property item.
   */
  [shapePropertyTemplate](schema: AmfShapes.IApiPropertyShape): TemplateResult | string {
    const { range, minCount=0, readOnly } = schema;
    if (readOnly && this.noReadOnly) {
      return '';
    }
    if (!range) {
      return this[shapePropertyWithoutRangeTemplate](schema);
    }
    const { displayName, deprecated } = range;
    if (range.readOnly && this.noReadOnly) {
      return '';
    }
    const required = minCount > 0;
    const type = readPropertyTypeLabel(range);
    const label = displayName || schema.name || range.name;
    const paramLabel = displayName ? schema.name || range.name : undefined;
    const [domainType] = range.types;
    let isComplex = complexTypes.includes(domainType);
    if (isComplex) {
      if (range.types.includes(AmfNamespace.aml.vocabularies.shapes.TupleShape)) {
        const { items=[] } = range as AmfShapes.IApiTupleShape;
        isComplex = complexTypes.includes(items[0].types[0]);
      } else if (range.types.includes(AmfNamespace.aml.vocabularies.shapes.ArrayShape)) {
        const { items } = range as AmfShapes.IApiArrayShape;
        if (items) {
          isComplex = complexTypes.includes(items.types[0]);
        }
      } else if (range.types.includes(AmfNamespace.aml.vocabularies.shapes.UnionShape)) {
        isComplex = !isScalarUnion(range as AmfShapes.IApiUnionShape);
      }
    }
    const allExpanded = this[expandedValue];
    const expanded = isComplex && allExpanded.includes(schema.id);
    const containerClasses = {
      'property-container': true,
      complex: isComplex,
      expanded,
    };
    return html`
    <div class="${classMap(containerClasses)}" data-name="${schema.name || range.name || ''}">
      <div class="property-border"></div>
      <div class="property-value">
        <div class="property-headline">
          ${this[propertyDecoratorTemplate](isComplex, expanded, schema.id)}
          ${paramNameTemplate(label, required, deprecated, paramLabel)}
          <span class="headline-separator"></span>
          ${typeValueTemplate(type)}
          ${required ? pillTemplate('Required', 'This property is required.') : ''}
        </div>
        <div class="description-column">
          ${this[propertyDescriptionTemplate](schema)}
        </div>
        <div class="details-column">
          ${detailsTemplate(range)}
        </div>
      </div>
    </div>
    ${expanded ? html`
    <div class="shape-children">
      <div class="property-border"></div>
      ${this[schemaContentTemplate](range)}
    </div>
    ` : ''}
    `;
  }

  /**
   * @returns THe template for the line decorator in front of the property name.
   */
  [propertyDecoratorTemplate](isComplex: boolean, expanded: boolean, schemaId: string): TemplateResult {
    const toggleIcon = isComplex ? html`
    <span class="object-toggle-icon ${expanded ? 'opened' : ''}">${chevronRight}</span>
    ` : '';
    const decoratorClasses = {
      'property-decorator': true,
      scalar: !isComplex,
      object: !!isComplex,
    };
    const toggleHandler = isComplex ? this[expandHandler] : undefined;
    const keydownHandler = isComplex ? this[expandKeydownHandler] : undefined;
    const tabIndex = isComplex ? '0' : '-1';
    return html`
    <div 
      class="${classMap(decoratorClasses)}" 
      data-id="${schemaId}" 
      @click="${toggleHandler}"
      @keydown="${keydownHandler}"
      tabindex="${tabIndex}"
    ><hr/>${toggleIcon}</div>
    `;
  }

  /**
   * @returns The template for the schema property item that has no range information.
   */
  [shapePropertyWithoutRangeTemplate](schema: AmfShapes.IApiPropertyShape): TemplateResult {
    const { minCount = 0, name, displayName, deprecated } = schema;
    const label = name || displayName || 'Unnamed property';
    const required = minCount > 0;
    return html`
    <div class="property-container">
      <div class="name-column">
        ${paramNameTemplate(label, required, deprecated)}
        <div class="param-type text-selectable">
          Unknown type
        </div>
      </div>
      <div class="description-column">
        ${this[propertyDescriptionTemplate](schema)}
      </div>
    </div>
    `;
  }

  [propertyDescriptionTemplate](schema: AmfShapes.IApiPropertyShape): TemplateResult | string {
    const { range, description } = schema;
    if (!range || description) {
      return this[descriptionTemplate](description);
    }
    return this[descriptionTemplate](range.description);
  }
}
