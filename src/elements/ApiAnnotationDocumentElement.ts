/* eslint-disable class-methods-use-this */
/* eslint-disable no-param-reassign */
import { html, TemplateResult, CSSResult, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { AmfNamespace, AmfShapes } from '@api-client/core/build/browser.js';
import { IApiCustomDomainProperty, IApiDomainProperty } from '@api-client/core/build/src/amf/definitions/Base.js';
import '@advanced-rest-client/icons/arc-icon.js';
import elementStyles from './styles/ApiAnnotation.js';

export const shapeValue = Symbol('shapeValue');
export const processShape = Symbol('processShape');
export const propertiesValue = Symbol('propertiesValue');
export const propertyTemplate = Symbol('propertyTemplate');
export const processVisibility = Symbol('processVisibility');
export const scalarTemplate = Symbol('scalarTemplate');
export const objectTemplate = Symbol('objectTemplate');
export const annotationWrapperTemplate = Symbol('annotationWrapperTemplate');
export const scalarValue = Symbol('scalarValue');
export const objectScalarPropertyTemplate = Symbol('objectScalarPropertyTemplate');

/**
 * An element to render annotations (also known as custom properties)
 * from AMF model.
 *
 * Annotations are part of RAML language and API console supports it.
 * The element looks for annotations in model and renders them.
 */
export default class ApiAnnotationDocumentElement extends LitElement {
  static get styles(): CSSResult[] {
    return [elementStyles];
  }

  [shapeValue]: IApiDomainProperty | undefined;

  /**
   * Serialized with `ApiSerializer` API domain model.
   * This is to be used instead of `shape`.
   */
  @property({ type: Object })
  get domainModel(): IApiDomainProperty | undefined {
    return this[shapeValue];
  }

  set domainModel(value: IApiDomainProperty | undefined) {
    const oldValue = this[shapeValue];
    if (oldValue === value) {
      return;
    }
    this[shapeValue] = value;
    this[processShape]();
  }

  [propertiesValue]: IApiCustomDomainProperty[] | undefined;

  /**
   * @returns `true` if any custom property has been found.
   */
  get hasCustomProperties(): boolean {
    const properties = this[propertiesValue];
    return Array.isArray(properties) && !!properties.length;
  }

  /**
   * List of custom properties in the shape.
   */
  @property({ type: Array })
  get customProperties(): IApiCustomDomainProperty[] | undefined {
    return this[propertiesValue];
  }


  set customProperties(value: IApiCustomDomainProperty[] | undefined) {
    const old = this[propertiesValue];
    if (old === value) {
      return;
    }
    this[propertiesValue] = value;
    this[processVisibility]();
    this.requestUpdate();
  }

  /**
   * Called when the shape property change.
   */
  [processShape](): void {
    const shape = this[shapeValue];
    this[propertiesValue] = undefined;
    if (!shape) {
      return;
    }
    const result = shape.customDomainProperties;
    if (Array.isArray(result) && result.length) {
      this[propertiesValue] = result;
    }
    this[processVisibility]();
    this.requestUpdate();
  }

  [processVisibility](): void {
    const { hasCustomProperties } = this;
    if (hasCustomProperties) {
      this.setAttribute('aria-hidden', 'false');
      this.removeAttribute('hidden');
    } else {
      this.setAttribute('aria-hidden', 'true');
      this.setAttribute('hidden', 'true');
    }
  }

  [scalarValue](scalar: AmfShapes.IApiScalarNode): string | number | boolean {
    let { value = '' } = scalar;
    if (value === 'nil') {
      value = '';
    }
    return value;
  }

  render(): TemplateResult | string {
    const { hasCustomProperties, customProperties } = this;
    if (!hasCustomProperties || !customProperties) {
      return '';
    }
    const content = customProperties.map((prop) => this[propertyTemplate](prop));
    return html`
    ${content}
    `;
  }

  /**
   * @returns The template for the custom property.
   */
  [propertyTemplate](prop: IApiCustomDomainProperty): TemplateResult | string {
    const { name, extension } = prop;
    const { types } = extension;
    if (types.includes(AmfNamespace.aml.vocabularies.data.Scalar)) {
      return this[scalarTemplate](name, extension as AmfShapes.IApiScalarNode);
    }
    if (types.includes(AmfNamespace.aml.vocabularies.data.Object)) {
      return this[objectTemplate](name, extension as AmfShapes.IApiObjectNode);
    }
    return '';
  }

  /**
   * @param name The annotation name
   * @param content The content tp render.
   * @returns The template for the custom property.
   */
  [annotationWrapperTemplate](name: string, content: TemplateResult | (TemplateResult | string)[] | string): TemplateResult {
    return html`
    <div class="custom-property">
      <arc-icon class="info-icon" icon="infoOutline"></arc-icon>
      <div class="info-value">
        <span class="name text-selectable">${name}</span>
        ${content || ''}
      </div>
    </div>
    `;
  }

  /**
   * @returns The template for the custom property.
   */
  [scalarTemplate](name: string, scalar: AmfShapes.IApiScalarNode): TemplateResult {
    const content = html`<span class="scalar-value text-selectable">${this[scalarValue](scalar)}</span>`;
    return this[annotationWrapperTemplate](name, content);
  }

  /**
   * @returns The template for the custom property.
   */
  [objectTemplate](name: string, object: AmfShapes.IApiObjectNode): TemplateResult {
    const { properties = {} } = object;
    const content = Object.keys(properties).map((key) => {
      const value = properties[key];
      const { types } = value;
      if (types.includes(AmfNamespace.aml.vocabularies.data.Scalar)) {
        return this[objectScalarPropertyTemplate](key, value);
      }
      return key;
    });
    return this[annotationWrapperTemplate](name, content);
  }

  /**
   * @returns The template for the custom property.
   */
  [objectScalarPropertyTemplate](name: string, scalar: AmfShapes.IApiScalarNode): TemplateResult {
    const value = this[scalarValue](scalar);
    return html`
    <div class="object-property">
      <span class="object-name text-selectable">${name}</span>
      <span class="object-value text-selectable">${value}</span>
    </div>
    `;
  }
}
