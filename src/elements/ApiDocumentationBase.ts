/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable lit-a11y/click-events-have-key-events */
/* eslint-disable class-methods-use-this */
import { LitElement, html, TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import { IApiCustomDomainProperty } from '@api-client/core/build/src/amf/definitions/Base.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { EventsTargetMixin } from '@anypoint-web-components/awc';
import { ApiExampleGenerator, AmfShapes, ApiDefinitions } from '@api-client/core/build/browser.js';
import '@anypoint-web-components/awc/dist/define/anypoint-button.js';
import '@anypoint-web-components/awc/dist/define/anypoint-collapse.js';
import '@advanced-rest-client/icons/arc-icon.js';
import '@advanced-rest-client/highlight/arc-marked.js';
import { EventTypes } from '../events/EventTypes.js';
import '../../define/api-annotation-document.js';
import { SchemaExample } from '../types.js';

export const sectionToggleClickHandler = Symbol('sectionToggleClickHandler');
export const processDebounce = Symbol('queryDebounce');
export const debounceValue = Symbol('debounceValue');
export const domainIdValue = Symbol('domainIdValue');
export const clickHandler = Symbol('clickHandler');
export const descriptionTemplate = Symbol('descriptionTemplate');
export const sectionToggleTemplate = Symbol('sectionToggleTemplate');
export const paramsSectionTemplate = Symbol('paramsSectionTemplate');
export const schemaItemTemplate = Symbol('schemaItemTemplate');
export const customDomainPropertiesTemplate = Symbol('customDomainPropertiesTemplate');
export const examplesTemplate = Symbol('examplesTemplate');
export const exampleTemplate = Symbol('exampleTemplate');
export const examplesValue = Symbol('examplesValue');
export const evaluateExamples = Symbol('evaluateExamples');
export const evaluateExample = Symbol('evaluateExample');
export const graphChangeHandler = Symbol('graphChangeHandler');

/**
 * A base class for the documentation components with common templates and functions.
 */
export class ApiDocumentationBase extends EventsTargetMixin(LitElement) {
  [domainIdValue]?: string;

  /** 
   * The domain id of the object to render.
   * @attribute
   */
  @property({ type: String, reflect: true }) get domainId(): string | undefined {
    return this[domainIdValue];
  }

  set domainId(value: string | undefined) {
    const old = this[domainIdValue];
    if (old === value) {
      return;
    }
    this[domainIdValue] = value;
    this.requestUpdate('domainId', old);
    if (value) {
      this[processDebounce]();
    }
  }

  /** 
   * Enables Anypoint platform styles.
   * @attribute
   */
  @property({ type: Boolean, reflect: true }) anypoint?: boolean;

  /** 
   * The timeout after which the `queryGraph()` function is called 
   * in the debouncer.
   */
  protected queryDebouncerTimeout?: number;

  [examplesValue]?: SchemaExample[];

  [debounceValue]?: any;

  constructor() {
    super();
    this.queryDebouncerTimeout = 1;
    this[graphChangeHandler] = this[graphChangeHandler].bind(this);
  }

  connectedCallback(): void {
    super.connectedCallback();
    if (this.domainId) {
      this[processDebounce]();
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this[debounceValue]) {
      clearTimeout(this[debounceValue]);
      this[debounceValue] = undefined;
    }
  }

  _attachListeners(node: EventTarget): void {
    node.addEventListener(EventTypes.Store.graphChange, this[graphChangeHandler]);
    super._attachListeners(node);
  }


  _detachListeners(node: EventTarget): void {
    node.removeEventListener(EventTypes.Store.graphChange, this[graphChangeHandler]);
    super._detachListeners(node);
  }

  /**
   * Handler for the event dispatched by the store when the graph model change.
   */
  [graphChangeHandler](): void {
    this[processDebounce]();
  }

  /**
   * Calls the `queryGraph()` function in a debouncer.
   */
  [processDebounce](): void {
    if (this[debounceValue]) {
      clearTimeout(this[debounceValue]);
    }
    this[debounceValue] = setTimeout(() => {
      this[debounceValue] = undefined;
      this.processGraph();
    }, this.queryDebouncerTimeout);
  }

  /**
   * The main function to use to process the AMF model.
   * To be implemented by the child classes.
   */
  processGraph(): void | Promise<void> {
    // ...
  }

  /**
   * At current state there's no way to tell where to navigate when relative
   * link is clicked. To prevent 404 anchors this prevents any relative link click.
   */
  [clickHandler](e: Event): void {
    const node = (e.target as HTMLElement);
    if (node.localName !== 'a') {
      return;
    }
    // target.href is always absolute, need attribute value to test for
    // relative links.
    const href = node.getAttribute('href');
    if (!href) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    const ch0 = href[0];
    if (['.', '/'].indexOf(ch0) !== -1) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  /**
   * A handler for the section toggle button click.
   */
  [sectionToggleClickHandler](e: Event): void {
    const button = (e.currentTarget as HTMLElement);
    const prop = button.dataset.ctrlProperty;
    if (!prop) {
      return;
    }
    (this as any)[prop] = !(this as any)[prop];
  }

  /**
   * @param examples The list of examples to evaluate
   * @param mediaType The media type to use with examples processing.
   */
  [evaluateExamples](examples: AmfShapes.IApiDataExample[], mediaType: string): SchemaExample[] {
    return examples.map((example) => this[evaluateExample](example, mediaType))
  }

  /**
   * @param example The example to evaluate
   * @param mediaType The media type to use with examples processing.
   */
  [evaluateExample](example: AmfShapes.IApiDataExample, mediaType: string): SchemaExample {
    let value;
    if (mediaType) {
      const generator = new ApiExampleGenerator();
      value = generator.read(example, mediaType);
    } else {
      value = example.value || '';
    }
    const { name, displayName } = example;
    const label = displayName || name;
    const result: SchemaExample = {
      ...example,
      renderValue: value,
    };
    if (label && !label.startsWith('example_')) {
      result.label = label;
    }
    return result;
  }

  /**
   * @returns The template for the section toggle button
   */
  [sectionToggleTemplate](ctrlProperty: string): TemplateResult | string {
    const label = (this as any)[ctrlProperty] ? 'Hide' : 'Show';
    return html`
    <anypoint-button class="section-toggle" ?anypoint="${this.anypoint}">
      ${label} <arc-icon icon="keyboardArrowDown" class="toggle-icon"></arc-icon>
    </anypoint-button>
    `;
  }

  /**
   * @param label The section label.
   * @param openedProperty The name of the element property to be toggled when interacting with the toggle button.
   * @param content The content to render.
   * @returns The template for a toggle section with a content.
   */
  [paramsSectionTemplate](label: string, openedProperty: string, content: TemplateResult | (TemplateResult | string)[]): TemplateResult {
    const opened = (this as any)[openedProperty];
    const classes = {
      'params-title': true,
      opened,
    };
    return html`
    <div class="params-section" data-controlled-by="${openedProperty}">
      <div 
        class="${classMap(classes)}"
        data-ctrl-property="${openedProperty}" 
        @click="${this[sectionToggleClickHandler]}"
      >
        <span class="label">${label}</span>
        ${this[sectionToggleTemplate](openedProperty)}
      </div>
      <anypoint-collapse .opened="${opened}">
        ${content}
      </anypoint-collapse>
    </div>
    `;
  }

  /**
   * @param model The parameter to render.
   * @param dataName Optional data-name for this parameter
   * @returns The template for the schema item document
   */
  [schemaItemTemplate](model: ApiDefinitions.IApiParameter, dataName?: string): TemplateResult {
    return html`
    <api-parameter-document 
      .parameter="${model}" 
      class="property-item"
      data-name="${ifDefined(dataName)}"
      ?anypoint="${this.anypoint}"
    ></api-parameter-document>
    `;
  }

  /**
   * @param description The description to render.
   * @returns The template for the markdown description.
   */
  [descriptionTemplate](description?: string): TemplateResult | string {
    if (!description) {
      return '';
    }
    return html`
    <div class="api-description">
      <arc-marked 
        .markdown="${description}" 
        sanitize
        @click="${this[clickHandler]}"
      >
        <div slot="markdown-html" class="markdown-body text-selectable"></div>
      </arc-marked>
    </div>`;
  }

  /**
   * @returns The template for the custom domain properties
   */
  [customDomainPropertiesTemplate](customDomainProperties: IApiCustomDomainProperty[] = []): TemplateResult | string {
    if (!customDomainProperties.length) {
      return '';
    }
    return html`
    <api-annotation-document
      .customProperties="${customDomainProperties}"
    ></api-annotation-document>
    `;
  }

  /**
   * @returns The template for the examples section.
   */
  [examplesTemplate](): TemplateResult | string {
    const examples = this[examplesValue];
    if (!Array.isArray(examples)) {
      return '';
    }
    const filtered = examples.filter((item) => !!item.renderValue);
    if (!filtered.length) {
      return '';
    }
    return html`
    <div class="examples">
    ${filtered.map((item) => this[exampleTemplate](item))}
    </div>
    `;
  }

  /**
   * @returns The template for a single example
   */
  [exampleTemplate](item: SchemaExample): TemplateResult | string {
    const { description, renderValue, label } = item;
    return html`
    <details class="schema-example">
      <summary>Example${label ? `: ${label}` : ''}</summary>
      <div class="example-content">
        ${description ? html`<div class="example-description text-selectable">${description}</div>` : ''}
        <pre class="code-value text-selectable"><code>${renderValue}</code></pre>
      </div>
    </details>
    `;
  }
}
