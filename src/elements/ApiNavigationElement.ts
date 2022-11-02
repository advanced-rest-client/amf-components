/* eslint-disable lit-a11y/click-events-have-key-events */
/* eslint-disable prefer-destructuring */
import { html, TemplateResult, CSSResult, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { ApiDefinitions } from '@api-client/core/build/browser.js';
import { AnypointCollapseElement, EventsTargetMixin } from '@anypoint-web-components/awc';
import { styleMap } from 'lit/directives/style-map.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { HttpStyles } from '@advanced-rest-client/base/api.js';
import '@anypoint-web-components/awc/dist/define/anypoint-icon-button.js';
import '@anypoint-web-components/awc/dist/define/anypoint-collapse.js';
import '@advanced-rest-client/icons/arc-icon.js';
import navStyles from './styles/NavStyles.js';
import { ApiSorting } from '../lib/navigation-layout/ApiSorting.js';
import { EndpointsTree } from '../lib/navigation-layout/EndpointsTree.js';
import { NaturalTree } from '../lib/navigation-layout/NaturalTree.js';
import { EventTypes } from '../events/EventTypes.js';
import { Events } from '../events/Events.js';
import { cancelEvent } from '../lib/Utils.js'
import { ApiEndpointsTreeItem, ApiEndPointWithOperationsListItem, DocumentMeta, NavigationLayout, SelectionType, SelectableMenuItem, EndpointItem, EditableMenuItem, SchemaAddType, OperationItem, DocumentationItem, NodeShapeItem, SecurityItem } from '../types.js';

export const queryingValue = Symbol('queryingValue');
export const abortControllerValue = Symbol('abortControllerValue');
export const domainIdValue = Symbol('domainIdValue');
export const domainTypeValue = Symbol('domainTypeValue');
export const endpointsExpandedValue = Symbol('endpointsExpandedValue');
export const documentationsValue = Symbol('documentationsValue');
export const schemasValue = Symbol('schemasValue');
export const securityValue = Symbol('securityValue');
export const sourceEndpointsValue = Symbol('sourceEndpointsValue');
export const endpointsValue = Symbol('endpointsValue');
export const openedEndpointsValue = Symbol('openedEndpointsValue');
export const layoutValue = Symbol('layoutValue');
export const queryValue = Symbol('queryValue');
export const queryApi = Symbol('queryApi');
export const queryEndpoints = Symbol('queryEndpoints');
export const layoutEndpoints = Symbol('processEndpoints');
export const queryDocumentations = Symbol('queryDocumentations');
export const querySchemas = Symbol('querySchemas');
export const querySecurity = Symbol('querySecurity');
export const createFlatTreeItems = Symbol('createFlatTreeItems');
export const getFilteredEndpoints = Symbol('getFilteredEndpoints');
export const getFilteredDocumentations = Symbol('getFilteredDocumentations');
export const getFilteredSchemas = Symbol('getFilteredSchemas');
export const getFilteredSecurity = Symbol('getFilteredSecurity');
export const computeEndpointPaddingValue = Symbol('computeEndpointPadding');
export const computeEndpointPaddingLeft = Symbol('computeEndpointPaddingLeft');
export const computeOperationPaddingValue = Symbol('computeOperationPaddingValue');
export const computeOperationPaddingLeft = Symbol('computeOperationPaddingLeft');
export const itemClickHandler = Symbol('itemClickHandler');
export const toggleSectionClickHandler = Symbol('toggleSectionClickHandler');
export const toggleSectionKeydownHandler = Symbol('toggleSectionKeydownHandler');
export const endpointToggleClickHandler = Symbol('endpointToggleClickHandler');
export const focusHandler = Symbol('focusHandler');
export const keydownHandler = Symbol('keydownHandler');
export const summaryTemplate = Symbol('summaryTemplate');
export const endpointsTemplate = Symbol('endpointsTemplate');
export const endpointTemplate = Symbol('endpointTemplate');
export const endpointToggleTemplate = Symbol('endpointToggleTemplate');
export const operationItemTemplate = Symbol('operationItemTemplate');
export const documentationsTemplate = Symbol('documentationsTemplate');
export const documentationTemplate = Symbol('documentationTemplate');
export const externalDocumentationTemplate = Symbol('externalDocumentationTemplate');
export const schemasTemplate = Symbol('schemasTemplate');
export const schemaTemplate = Symbol('schemaTemplate');
export const securitiesTemplate = Symbol('securitiesTemplate');
export const securityTemplate = Symbol('securityTemplate');
export const keyDownAction = Symbol('keyDownAction');
export const keyUpAction = Symbol('keyUpAction');
export const keyShiftTabAction = Symbol('keyShiftTabAction');
export const keyEscAction = Symbol('keyEscAction');
export const keySpaceAction = Symbol('keySpaceAction');
export const shiftTabPressedValue = Symbol('shiftTabPressedValue');
export const focusedItemValue = Symbol('focusedItemValue');
export const selectedItemValue = Symbol('selectedItemValue');
export const focusItem = Symbol('focusItem');
export const listActiveItems = Symbol('listActiveItems');
export const itemsValue = Symbol('itemsValue');
export const listSectionActiveNodes = Symbol('listSectionActiveNodes');
export const keyArrowRightAction = Symbol('keyArrowRightAction');
export const keyArrowLeftAction = Symbol('keyArrowLeftAction');
export const makeSelection = Symbol('makeSelection');
export const selectItem = Symbol('selectItem');
export const deselectItem = Symbol('deselectItem');
export const findSelectable = Symbol('findSelectable');
export const toggleSectionElement = Symbol('toggleSectionElement');
export const summarySelected = Symbol('summarySelected');
export const filterTemplate = Symbol('filterTemplate');
export const processQuery = Symbol('processQuery');
export const searchHandler = Symbol('searchHandler');
export const resetTabindices = Symbol('resetTabindices');
export const notifyNavigation = Symbol('notifyNavigation');
export const addingEndpointValue = Symbol('addingEndpointValue');
export const addEndpointInputTemplate = Symbol('addEndpointInputTemplate');
export const addEndpointKeydownHandler = Symbol('addEndpointKeydownHandler');
export const commitNewEndpoint = Symbol('commitNewEndpoint');
export const cancelNewEndpoint = Symbol('cancelNewEndpoint');
export const findViewModelItem = Symbol('findViewModelItem');
export const renameInputTemplate = Symbol('renameInputTemplate');
export const renameKeydownHandler = Symbol('renameKeydownHandler');
export const renameBlurHandler = Symbol('renameBlurHandler');
export const updateNameHandler = Symbol('updateNameHandler');
export const addDocumentationInputTemplate = Symbol('addDocumentationInputTemplate');
export const addDocumentationKeydownHandler = Symbol('addDocumentationKeydownHandler');
export const addingDocumentationValue = Symbol('addingDocumentationValue');
export const addingExternalValue = Symbol('addingExternalValue');
export const commitNewDocumentation = Symbol('commitNewDocumentation');
export const externalDocumentationHandler = Symbol('externalDocumentationHandler');
export const addingSchemaValue = Symbol('addingSchemaValue');
export const addSchemaInputTemplate = Symbol('addSchemaInputTemplate');
export const addSchemaKeydownHandler = Symbol('addSchemaKeydownHandler');
export const commitNewSchema = Symbol('commitNewSchema');
export const addingSchemaTypeValue = Symbol('addingSchemaTypeValue');
export const graphChangeHandler = Symbol('graphChangeHandler');
export const documentMetaValue = Symbol('documentMetaValue');

export default class ApiNavigationElement extends EventsTargetMixin(LitElement) {
  static get styles(): CSSResult[] {
    return [navStyles, HttpStyles.default];
  }

  [queryingValue]?: boolean;

  [abortControllerValue]?: AbortController;

  [domainIdValue]?: string;

  [domainTypeValue]?: SelectionType;

  [selectedItemValue]?: HTMLElement;

  [focusedItemValue]?: HTMLElement;

  /** 
   * The processed and final query term for the list items.
   */
  [queryValue]?: string;

  [documentMetaValue]?: DocumentMeta;

  [layoutValue]?: NavigationLayout;

  [endpointsExpandedValue]?: boolean;

  [endpointsValue]?: EndpointItem[];

  [documentationsValue]?: ApiDefinitions.IDocumentationItem[];

  [schemasValue]?: ApiDefinitions.INodeShapeItem[];

  [securityValue]?: ApiDefinitions.ISecurityItem[];

  /** 
   * Holds a list of ids of currently opened endpoints.
   */
  [openedEndpointsValue]: string[];

  /** 
   * Cached list of all list elements
   */
  [itemsValue]?: HTMLElement[];

  [sourceEndpointsValue]?: ApiDefinitions.IApiEndPointWithOperationsListItem[];

  [shiftTabPressedValue]?: boolean;

  [summarySelected]?: boolean;

  [addingSchemaTypeValue]?: string;

  [addingSchemaValue]?: boolean;

  [addingDocumentationValue]?: boolean;

  [addingExternalValue]?: boolean;

  [addingEndpointValue]?: boolean;

  /** 
   * When true then the element is currently querying for the graph data.
   */
  get querying(): boolean {
    return this[queryingValue] || false;
  }

  /**
   * Set when `querying`. Use to abort the query operation.
   * When calling `abort` on the controller the element stops querying and processing the graph data.
   * All data that already has been processed are not cleared.
   */
  get abortController(): AbortController | undefined {
    return this[abortControllerValue];
  }

  /**
   * A model `@id` of selected documentation part.
   * Special case is for `summary` view. It's not part of an API
   * but most applications has some kins of summary view for the
   * API.
   * @attribute
   */
  @property({ type: String, reflect: true })
  get domainId(): string | undefined {
    return this[domainIdValue];
  }

  set domainId(value: string | undefined) {
    const old = this[domainIdValue];
    if (old === value) {
      return;
    }
    this[domainIdValue] = value;
    this.requestUpdate('domainId', old);
    this.select(value);
  }

  /**
   * Type of the selected domain item.
   */
  get domainType(): SelectionType | undefined {
    return this[domainTypeValue];
  }

  /**
   * true when `_docs` property is set with values
   */
  get hasDocs(): boolean {
    const docs = this[documentationsValue];
    return Array.isArray(docs) && !!docs.length;
  }

  /**
   * true when has schemas definitions
   */
  get hasSchemas(): boolean {
    const items = this[schemasValue];
    return Array.isArray(items) && !!items.length;
  }

  /**
   * true when `_security` property is set with values
   */
  get hasSecurity(): boolean {
    const items = this[securityValue];
    return Array.isArray(items) && !!items.length;
  }

  /**
   * true when `_endpoints` property is set with values
   */
  get hasEndpoints(): boolean {
    const items = this[endpointsValue];
    return Array.isArray(items) && !!items.length;
  }

  /**
   * A reference to currently selected element.
   */
  get selectedItem(): HTMLElement | undefined {
    return this[selectedItemValue];
  }

  /**
   * The currently focused item.
   */
  get focusedItem(): HTMLElement | undefined {
    return this[focusedItemValue];
  }

  /**
   * Filters list elements by this value when set.
   * Clear the value to reset the search.
   *
   * This is not currently exposed in element's UI due
   * to complexity of search and performance.
   * @attribute
   */
  @property({ type: String })
  get query(): string | undefined {
    return this[queryValue];
  }

  set query(value: string | undefined) {
    const old = this[queryValue];
    if (old === value) {
      return;
    }
    this[queryValue] = value;
    this[processQuery](value);
    this.requestUpdate('query', old);
  }

  get documentMeta(): DocumentMeta | undefined {
    return this[documentMetaValue];
  }

  /** 
   * By default the endpoints are rendered one-by-one as defined in the API spec file
   * without any tree structure. When this option is set it sorts the endpoints 
   * alphabetically and creates a tree structure for the endpoints.
   * 
   * - tree - creates a tree structure from the endpoints list
   * - natural - behavior consistent with the previous version of the navigation. Creates a tree structure based on the previous endpoints.
   * - natural-sort - as `natural` but endpoints are sorted by name.
   * - off (or none) - just like in the API spec.
   * 
   * Note, the resulted tree structure will likely be different to the one encoded 
   * in the API spec file.
   * @attribute
   */
  @property({ type: String, reflect: true })
  get layout(): NavigationLayout | undefined {
    return this[layoutValue];
  }

  set layout(value: NavigationLayout | undefined) {
    const old = this[layoutValue];
    if (old === value) {
      return;
    }
    this[layoutValue] = value;
    this[layoutEndpoints]();
    this.requestUpdate('layout', old);
  }

  /** 
   * When set it expands or opens all endpoints and makes all operations visible.
   * Note, the user can toggle an endpoint anyway so this property does not mean
   * that all endpoints are expanded. When it's true then it means that all endpoints
   * was expanded at some point in time.
   * @attribute
   */
  @property({ type: Boolean, reflect: true })
  get endpointsExpanded(): boolean {
    const value = this[endpointsExpandedValue];
    if (typeof value !== 'boolean') {
      return false;
    }
    return value;
  }

  set endpointsExpanded(value: boolean | undefined) {
    const old = this[endpointsExpandedValue];
    if (old === value) {
      return;
    }
    this[endpointsExpandedValue] = value;
    if (value) {
      this.expandAllEndpoints();
    } else {
      this.collapseAllEndpoints();
    }
  }

  /**
   * True when the summary entry is rendered.
   * Summary should be rendered only when `summary` is set and current model is not a RAML fragment.
   */
  get summaryRendered(): boolean {
    const { summary, documentMeta } = this;
    if (!summary || !documentMeta) {
      return false;
    }
    const { isFragment, isLibrary } = documentMeta;
    return !isFragment && !isLibrary;
  }

  /** 
   * When this property change the element queries the graph store for the data model.
   * It can be skipped when the application calls the `queryGraph()` method imperatively.
   * @attribute
   */
  @property({ type: String, reflect: true })
  apiId?: string;

  /**
   * If set it renders `API summary` menu option.
   * It will allow to set `domainId` and `domainType` to `summary`
   * when this option is set.
   * @attribute
   */
  @property({ type: Boolean, reflect: true })
  summary?: boolean;

  /**
   * A label for the `summary` section.
   * @attribute
   */
  @property({ type: String, reflect: true })
  summaryLabel: string;

  /**
   * Determines and changes state of documentation panel.
   * @attribute
   */
  @property({ type: Boolean, reflect: true })
  documentationsOpened?: boolean;

  /**
   * Determines and changes state of schemas (types) panel.
   * @attribute
   */
  @property({ type: Boolean, reflect: true })
  schemasOpened?: boolean;

  /**
   * Determines and changes state of security panel.
   * @attribute
   */
  @property({ type: Boolean, reflect: true })
  securityOpened?: boolean;

  /**
   * Determines and changes state of endpoints panel.
   * @attribute
   */
  @property({ type: Boolean, reflect: true })
  endpointsOpened?: boolean;

  /**
   * Size of endpoint indentation for nested resources.
   * In pixels.
   *
   * The attribute name for this property is `indent-size`. Note, that this
   * will change to web consistent name `indentSize` in the future.
   * @attribute
   */
  @property({ type: Number, reflect: true })
  indentSize?: number;

  /** 
   * When set it renders an input to filter the menu items.
   * @attribute
   */
  @property({ type: Boolean, reflect: true })
  filter?: boolean;

  /** 
   * When set the element won't query the store when attached to the DOM.
   * Instead set the `apiId` property or directly call the `queryGraph()` function.
   * @attribute
   */
  @property({ type: Boolean, reflect: true })
  manualQuery?: boolean;

  /** 
   * When set it enables graph items editing functionality.
   * The user can double-click on a menu item and edit its name.
   * @attribute
   */
  @property({ type: Boolean, reflect: true })
  edit?: boolean;

  /**
   * @attribute
   */
  @property({ type: Boolean, reflect: true })
  anypoint?: boolean;

  constructor() {
    super();
    this.summaryLabel = 'Summary';
    this.indentSize = 8;

    this[openedEndpointsValue] = [];

    this[focusHandler] = this[focusHandler].bind(this);
    this[keydownHandler] = this[keydownHandler].bind(this);
    this[graphChangeHandler] = this[graphChangeHandler].bind(this);
  }

  /**
   * Ensures aria role attribute is in place.
   * Attaches element's listeners.
   */
  connectedCallback(): void {
    super.connectedCallback();
    if (!this.getAttribute('aria-label')) {
      this.setAttribute('aria-label', 'API navigation');
    }
    if (!this.getAttribute('tabindex')) {
      this.setAttribute('tabindex', '0');
    }
    this.addEventListener('focus', this[focusHandler]);
    this.addEventListener('keydown', this[keydownHandler]);
    if (!this.manualQuery) {
      this.queryGraph();
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('focus', this[focusHandler]);
    this.removeEventListener('keydown', this[keydownHandler]);
    this[itemsValue] = undefined;
  }

  _attachListeners(node: EventTarget): void {
    super._attachListeners(node);
    node.addEventListener(EventTypes.Store.graphChange, this[graphChangeHandler]);
  }

  _detachListeners(node: EventTarget): void {
    super._detachListeners(node);
    node.removeEventListener(EventTypes.Store.graphChange, this[graphChangeHandler]);
  }

  /**
   * Handler for the event dispatched by the store when the graph model change.
   */
  [graphChangeHandler](): void {
    this.queryGraph();
  }

  /**
   * Queries for the API data from the graph store.
   */
  async queryGraph(): Promise<void> {
    if (this.querying) {
      return;
    }
    this[queryingValue] = true;
    this[itemsValue] = undefined;
    const ctrl = new AbortController();
    this[abortControllerValue] = ctrl;
    await this[queryApi](ctrl.signal);
    await this[queryEndpoints](ctrl.signal);
    await this[queryDocumentations](ctrl.signal);
    await this[querySchemas](ctrl.signal);
    await this[querySecurity](ctrl.signal);
    if (!ctrl.signal.aborted) {
      this[layoutEndpoints]();
    }
    this[queryingValue] = false;
    this[abortControllerValue] = undefined;
    this[openedEndpointsValue] = [];
    this.requestUpdate();
    await this.updateComplete;
    this[resetTabindices]();
    this.dispatchEvent(new Event('graphload'));
  }

  /**
   * Queries for the current API base info.
   */
  async [queryApi](signal: AbortSignal): Promise<void> {
    this[documentMetaValue] = undefined;
    try {
      const info = await Events.Api.documentMeta(this);
      if (signal.aborted) {
        return;
      }
      this[documentMetaValue] = info;
    } catch (e) {
      const ex = e as Error;
      Events.Telemetry.exception(this, ex.message, false);
      Events.Reporting.error(this, ex, `Enable to query for API data: ${ex.message}`, this.localName);
    }
  }

  /**
   * Queries and sets endpoints data
   */
  async [queryEndpoints](signal: AbortSignal): Promise<void> {
    if (signal.aborted) {
      return;
    }
    try {
      const result = await Events.Endpoint.list(this);
      if (signal.aborted) {
        return;
      }
      if (!result) {
        return;
      }
      this[sourceEndpointsValue] = result;
    } catch (e) {
      const ex = e as Error;
      this[sourceEndpointsValue] = undefined;
      Events.Telemetry.exception(this, ex.message, false);
      Events.Reporting.error(this, ex, `Enable to query for Endpoints data: ${ex.message}`, this.localName);
    }
  }

  /**
   * Queries and sets documentations data
   */
  async [queryDocumentations](signal: AbortSignal): Promise<void> {
    this[documentationsValue] = undefined;
    if (signal.aborted) {
      return;
    }
    try {
      const result = await Events.Documentation.list(this);
      if (signal.aborted) {
        return;
      }
      this[documentationsValue] = result;
    } catch (e) {
      const ex = e as Error;
      Events.Telemetry.exception(this, ex.message, false);
      Events.Reporting.error(this, ex, `Enable to query for Documents data: ${ex.message}`, this.localName);
    }
  }

  /**
   * Queries and sets types (schemas) data
   */
  async [querySchemas](signal: AbortSignal): Promise<void> {
    this[schemasValue] = undefined;
    if (signal.aborted) {
      return;
    }
    try {
      const result = await Events.Type.list(this);
      if (signal.aborted) {
        return;
      }
      this[schemasValue] = result;
    } catch (e) {
      const ex = e as Error;
      Events.Telemetry.exception(this, ex.message, false);
      Events.Reporting.error(this, ex, `Enable to query for Schemas data: ${ex.message}`, this.localName);
    }
  }

  /**
   * Queries and sets security data
   */
  async [querySecurity](signal: AbortSignal): Promise<void> {
    this[securityValue] = undefined;
    if (signal.aborted) {
      return;
    }
    try {
      const result = await Events.Security.list(this);
      if (signal.aborted) {
        return;
      }
      this[securityValue] = result;
    } catch (e) {
      const ex = e as Error;
      Events.Telemetry.exception(this, ex.message, false);
      Events.Reporting.error(this, ex, `Enable to query for Security data: ${ex.message}`, this.localName);
    }
  }

  [createFlatTreeItems](items: ApiDefinitions.IApiEndPointWithOperationsListItem[]): ApiDefinitions.IEndpointItem[] {
    if (!Array.isArray(items) || !items.length) {
      return [];
    }
    return items.map((endpoint) => ({
      ...endpoint,
      indent: 0,
      label: endpoint.name || endpoint.path,
      selected: false,
      secondarySelected: false,
    }));
  }

  /**
   * Processes endpoints layout for the given configuration.
   */
  [layoutEndpoints](): void {
    const { layout } = this;
    const endpoints = this[sourceEndpointsValue];
    if (!endpoints) {
      this[endpointsValue] = undefined;
      return;
    }
    if (layout === 'tree') {
      const sorted = ApiSorting.sortEndpointsByPath([...endpoints]);
      const items = new EndpointsTree().create(sorted);
      this[endpointsValue] = items;
      return;
    }
    if (layout === 'natural') {
      this[endpointsValue] = new NaturalTree().create(endpoints);
      return;
    }
    if (layout === 'natural-sort') {
      const sorted = ApiSorting.sortEndpointsByPath([...endpoints]) as ApiEndPointWithOperationsListItem[];
      this[endpointsValue] = new NaturalTree().create(sorted);
      return;
    }
    //
    // Default layout
    //
    this[endpointsValue] = this[createFlatTreeItems](endpoints);
  }

  /**
   * Filters the current endpoints by the current query value.
   */
  [getFilteredEndpoints](): ApiEndpointsTreeItem[] | undefined {
    const value = this[endpointsValue];
    if (!value || !value.length) {
      return undefined;
    }
    const q = this[queryValue];
    if (!q) {
      return value;
    }
    const result: ApiEndpointsTreeItem[] = [];
    value.forEach((endpoint) => {
      const { path, label = '', operations = [] } = endpoint;
      const lPath = path.toLowerCase();
      const lLabel = label.toLowerCase();
      // If the endpoint's path or label matches the query include whole item
      if (lPath.includes(q) || lLabel.includes(q)) {
        result[result.length] = endpoint;
        return;
      }
      // otherwise check all operations and only include matched operations. If none match
      // then do not include the endpoint.
      const ops = operations.filter((op) => op.method.toLowerCase().includes(q) || (op.name || '').toLowerCase().includes(q));
      if (ops.length) {
        const copy = { ...endpoint } as ApiEndpointsTreeItem;
        copy.operations = ops;
        result[result.length] = copy;
      }
    });
    return result;
  }

  /**
   * Computes `style` attribute value for endpoint item.
   * It sets padding-left property to indent resources.
   * See https://github.com/mulesoft/api-console/issues/571.
   *
   * @param indent The computed indentation of the item.
   * @returns The value for the left padding of the endpoint menu item.
   */
  [computeEndpointPaddingValue](indent = 0): string {
    const padding = this[computeEndpointPaddingLeft]();
    if (indent < 1) {
      return `${padding}px`;
    }
    const result = indent * (this.indentSize || 0) + padding;
    return `${result}px`;
  }

  /**
   * Computes endpoint list item left padding from CSS variables.
   */
  [computeEndpointPaddingLeft](): number {
    const prop = '--api-navigation-list-item-padding';
    const defaultPadding = 16;
    const padding = getComputedStyle(this).getPropertyValue(prop);
    if (!padding) {
      return defaultPadding;
    }
    const parts = padding.split(' ');
    let paddingLeftValue;
    switch (parts.length) {
      case 1:
        paddingLeftValue = parts[0];
        break;
      case 2:
        paddingLeftValue = parts[1];
        break;
      case 3:
        paddingLeftValue = parts[1];
        break;
      case 4:
        paddingLeftValue = parts[3];
        break;
      default:
        return defaultPadding;
    }
    if (!paddingLeftValue) {
      return defaultPadding;
    }
    paddingLeftValue = paddingLeftValue.replace('px', '').trim();
    const result = Number(paddingLeftValue);
    if (Number.isNaN(result)) {
      return defaultPadding;
    }
    return result;
  }

  /**
   * Computes `style` attribute value for an operation item.
   * It sets padding-left property to indent operations relative to a resource.
   *
   * @param indent The computed indentation of the parent resource.
   * @returns The value for the left padding of the endpoint menu item.
   */
  [computeOperationPaddingValue](indent = 0): string {
    const endpointAdjustment = 32;
    const padding = this[computeOperationPaddingLeft]() + endpointAdjustment;
    const { indentSize = 0 } = this;
    if (indentSize < 1) {
      return `${padding}px`;
    }
    const result = indent * indentSize + padding;
    return `${result}px`;
  }

  /**
   * Computes operation list item left padding from CSS variables.
   */
  [computeOperationPaddingLeft](): number {
    const prop = '--api-navigation-operation-item-padding-left';
    let paddingLeft = getComputedStyle(this).getPropertyValue(prop);
    const defaultPadding = 24;
    if (!paddingLeft) {
      return defaultPadding;
    }
    paddingLeft = paddingLeft.replace('px', '').trim();
    const result = Number(paddingLeft);
    if (Number.isNaN(result)) {
      return defaultPadding;
    }
    return result;
  }

  /**
   * A handler for the click event on a menu list item.
   * Makes a selection from the target.
   */
  [itemClickHandler](e: MouseEvent): void {
    const node = e.currentTarget as HTMLElement;
    const { graphId, graphShape } = node.dataset;
    if (graphId && graphShape) {
      this[makeSelection](graphId, graphShape as SelectionType);
    } else {
      // this is probably the abstract endpoint from the EndpointTree class.
      // We are preventing default so the element can ignore focusing on the item.
      e.preventDefault();
      e.stopPropagation();
    }
  }

  /**
   * A handler for the click event on endpoints toggle button.
   */
  [endpointToggleClickHandler](e: MouseEvent): void {
    const node = e.currentTarget as HTMLElement;
    const { graphId } = node.dataset;
    if (graphId) {
      this.toggleEndpoint(graphId);
      e.stopPropagation();
      e.preventDefault();
      Events.Telemetry.event(this, {
        category: 'API navigation',
        action: 'Toggle endpoint',
      });
    }
  }

  /**
   * Toggles operations visibility for an endpoint.
   * @param graphId The Endpoint graph id.
   */
  toggleEndpoint(graphId: string): void {
    const index = this[openedEndpointsValue].indexOf(graphId);
    if (index === -1) {
      this[openedEndpointsValue].push(graphId);
    } else {
      this[openedEndpointsValue].splice(index, 1);
    }
    this.requestUpdate();
  }

  /**
   * A handler for the click event on a section item. Toggles the clicked section.
   */
  [toggleSectionClickHandler](e: MouseEvent): void {
    const node = e.currentTarget as HTMLElement;
    this[toggleSectionElement](node);
    Events.Telemetry.event(this, {
      category: 'API navigation',
      action: 'Toggle section',
      label: node.dataset.section,
    });
  }

  [toggleSectionKeydownHandler](): void {
    throw new Error(`Not implemented.`);
  }

  /**
   * Toggles a section of the menu represented by the element (section list item).
   */
  [toggleSectionElement](element: HTMLElement): void {
    const prop = element.dataset.property;
    if (!prop) {
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this as any)[prop] = !(this as any)[prop];
  }

  /**
   * @returns The list of documentation items filtered by the current query.
   */
  [getFilteredDocumentations](): ApiDefinitions.IDocumentationItem[] {
    const items = this[documentationsValue];
    if (!Array.isArray(items) || !items.length) {
      return [];
    }
    const q = this[queryValue];
    if (!q) {
      return items;
    }
    return items.filter((doc) =>
      (doc.title || '').toLocaleLowerCase().includes(q));
  }

  /**
   * @returns The list of schemas items filtered by the current query.
   */
  [getFilteredSchemas](): ApiDefinitions.INodeShapeItem[] {
    const items = this[schemasValue];
    if (!Array.isArray(items) || !items.length) {
      return [];
    }
    const q = this[queryValue];
    if (!q) {
      return items;
    }
    return items.filter((doc) =>
      (doc.name || '').toLocaleLowerCase().includes(q) ||
      (doc.displayName || '').toLocaleLowerCase().includes(q));
  }

  /**
   * @returns The list of security items filtered by the current query.
   */
  [getFilteredSecurity](): ApiDefinitions.ISecurityItem[] {
    const items = this[securityValue];
    if (!Array.isArray(items) || !items.length) {
      return [];
    }
    const q = this[queryValue];
    if (!q) {
      return items;
    }
    return items.filter((doc) =>
      (doc.name || '').toLocaleLowerCase().includes(q) ||
      (doc.displayName || '').toLocaleLowerCase().includes(q) ||
      (doc.type || '').toLocaleLowerCase().includes(q));
  }

  /**
   * A handler for the focus event on this element.
   */
  [focusHandler](e: FocusEvent): void {
    if (this[shiftTabPressedValue]) {
      // do not focus the menu itself
      return;
    }
    const path = e.composedPath();
    const rootTarget = path[0] as HTMLElement;
    if (rootTarget !== this && typeof rootTarget.tabIndex !== 'undefined' && !this.contains(rootTarget)) {
      return;
    }
    this[focusedItemValue] = undefined;
    const { selectedItem } = this;
    if (selectedItem) {
      this[focusItem](selectedItem);
    } else {
      this.focusNext();
    }
  }

  /**
   * Sets a list item focused
   */
  [focusItem](item: HTMLElement): void {
    const old = this[focusedItemValue];
    this[focusedItemValue] = item;
    if (old) {
      old.setAttribute('tabindex', '-1');
    }
    if (item && !item.hasAttribute('disabled')) {
      item.setAttribute('tabindex', '0');
      item.focus();
    }
  }

  /**
   * Handler for the keydown event.
   */
  [keydownHandler](e: KeyboardEvent): void {
    const path = e.composedPath();
    const target = path[0] as HTMLElement;
    if (target.localName === 'input') {
      return;
    }
    if (e.key === 'ArrowDown') {
      this[keyDownAction](e);
    } else if (e.key === 'ArrowUp') {
      this[keyUpAction](e);
    } else if (e.key === 'Tab' && e.shiftKey) {
      this[keyShiftTabAction]();
    } else if (e.key === 'Escape') {
      this[keyEscAction]();
    } else if (e.key === ' ' || e.code === 'Space') {
      this[keySpaceAction](e);
    } else if (e.key === 'Enter' || e.key === 'NumpadEnter') {
      this[keySpaceAction](e);
    } else if (e.key === 'ArrowRight') {
      this[keyArrowRightAction](e);
    } else if (e.key === 'ArrowLeft') {
      this[keyArrowLeftAction](e);
    }
    e.stopPropagation();
  }

  /**
   * Handler that is called when the down key is pressed.
   */
  [keyDownAction](e: KeyboardEvent): void {
    e.preventDefault();
    e.stopPropagation();
    this.focusNext();
  }

  /**
   * Handler that is called when the up key is pressed.
   */
  [keyUpAction](e: KeyboardEvent): void {
    e.preventDefault();
    this.focusPrevious();
  }

  /**
   * Handles shift+tab keypress on the menu.
   */
  [keyShiftTabAction](): void {
    const oldTabIndex = this.getAttribute('tabindex');
    this[shiftTabPressedValue] = true;
    this[focusedItemValue] = undefined;
    this.setAttribute('tabindex', '-1');
    setTimeout(() => {
      if (oldTabIndex) {
        this.setAttribute('tabindex', oldTabIndex);
      }
      this[shiftTabPressedValue] = false;
    }, 1);
  }

  /**
   * Handler that is called when the esc key is pressed.
   */
  [keyEscAction](): void {
    const { focusedItem } = this;
    if (focusedItem) {
      focusedItem.blur();
    }
  }

  /**
   * A handler for the space bar key down.
   */
  [keySpaceAction](e: KeyboardEvent): void {
    e.preventDefault();
    e.stopPropagation();
    const path = e.composedPath();
    const target = path && path[0] as HTMLElement;
    if (!target) {
      return;
    }
    const { classList, dataset } = target;
    if (classList.contains('section-title')) {
      this[toggleSectionElement](target);
    } else if (classList.contains('list-item')) {
      const { graphId, graphShape } = dataset;
      if (graphId && graphShape) {
        this[makeSelection](graphId, graphShape as SelectionType);
      }
    }
  }

  /**
   * A handler for the key right down. Opens operations when needed.
   */
  [keyArrowRightAction](e: KeyboardEvent): void {
    const path = e.composedPath();
    const target = path && path[0] as HTMLElement;
    if (!target) {
      return;
    }
    const { classList, dataset } = target;
    if (dataset.graphId && classList.contains('endpoint') && classList.contains('list-item')) {
      if (!this[openedEndpointsValue].includes(dataset.graphId)) {
        this[openedEndpointsValue].push(dataset.graphId);
        this.requestUpdate();
      }
    }
  }

  /**
   * A handler for the key left down. Closes operations when needed.
   */
  [keyArrowLeftAction](e: KeyboardEvent): void {
    const path = e.composedPath();
    const target = path && path[0] as HTMLElement;
    if (!target) {
      return;
    }
    const { classList, dataset } = target;
    if (dataset.graphId && classList.contains('endpoint') && classList.contains('list-item')) {
      const index = this[openedEndpointsValue].indexOf(dataset.graphId);
      if (index !== -1) {
        this[openedEndpointsValue].splice(index, 1);
        this.requestUpdate();
      }
    }
  }

  /**
   * Focuses on the previous item in the navigation.
   */
  focusPrevious(): void {
    const items = this[listActiveItems]();
    const { length } = items;
    const curFocusIndex = this[focusedItemValue] ? items.indexOf(this[focusedItemValue]) : -1;
    for (let i = 1; i < length + 1; i++) {
      const item = items[(curFocusIndex - i + length) % length];
      if (item && !item.hasAttribute('disabled')) {
        const owner = (item.getRootNode && item.getRootNode()) as Document || document;
        this[focusItem](item);
        // Focus might not have worked, if the element was hidden or not
        // focusable. In that case, try again.
        if (owner.activeElement === item) {
          return;
        }
      }
    }
  }

  /**
   * Focuses on the next item in the navigation.
   */
  focusNext(): void {
    const items = this[listActiveItems]();
    const { length } = items;
    const curFocusIndex = this[focusedItemValue] ? items.indexOf(this[focusedItemValue]) : -1;
    for (let i = 1; i < length + 1; i++) {
      const item = items[(curFocusIndex + i) % length];
      if (!item.hasAttribute('disabled')) {
        const owner = (item.getRootNode && item.getRootNode()) as Document || document;
        this[focusItem](item);
        // Focus might not have worked, if the element was hidden or not
        // focusable. In that case, try again.
        if (owner.activeElement === item) {
          return;
        }
      }
    }
  }

  /**
   * Selects an item in the navigation.
   * Note, this dispatches the navigation action event.
   */
  select(id?: string): void {
    const { shadowRoot } = this;
    if (!id || !shadowRoot) {
      return;
    }
    const element = (shadowRoot.querySelector(`[data-graph-id="${id}"]`)) as HTMLElement | null;
    if (!element) {
      return;
    }
    const { graphShape } = element.dataset;
    this[makeSelection](id, graphShape as SelectionType);
  }

  /**
   * Lists all HTML elements that are currently rendered in the view.
   * @returns Currently rendered items.
   */
  [listActiveItems](): HTMLElement[] {
    if (this[itemsValue]) {
      return this[itemsValue];
    }
    const { shadowRoot } = this;
    if (!shadowRoot) {
      return [];
    }
    let result: HTMLElement[] = [];
    if (this.summary) {
      const node = shadowRoot.querySelector('.list-item.summary');
      if (node) {
        result[result.length] = node as HTMLElement;
      }
    }
    if (this.hasEndpoints) {
      const node = shadowRoot.querySelector('.endpoints .section-title');
      if (node) {
        result[result.length] = node as HTMLElement;
      }
      const nodes = Array.from(shadowRoot.querySelectorAll('.endpoints .list-item.endpoint'));
      nodes.forEach((item) => {
        result[result.length] = item as HTMLElement;
        const collapse = item.nextElementSibling;
        if (!collapse || collapse.localName !== 'anypoint-collapse') {
          return;
        }
        const children = Array.from(collapse.querySelectorAll('.list-item.operation')) as HTMLElement[];
        if (children.length) {
          result = result.concat(children);
        }
      });
    }
    if (this.hasDocs) {
      const children = this[listSectionActiveNodes]('.documentation');
      result = result.concat(children);
    }
    if (this.hasSchemas) {
      const children = this[listSectionActiveNodes]('.schemas');
      result = result.concat(children);
    }
    if (this.hasSecurity) {
      const children = this[listSectionActiveNodes]('.security');
      result = result.concat(children);
    }
    this[itemsValue] = result.length ? result : undefined;
    return result;
  }

  /**
   * @param selector The prefix for the query selector
   * @returns Nodes returned from query function.
   */
  [listSectionActiveNodes](selector: string): HTMLElement[] {
    const { shadowRoot } = this;
    let result: HTMLElement[] = [];
    if (!shadowRoot) {
      return result;
    }
    const node = shadowRoot.querySelector(`${selector} .section-title`);
    if (node) {
      result[result.length] = node as HTMLElement;
      const collapse = node.nextElementSibling;
      if (collapse) {
        const children = Array.from(collapse.querySelectorAll('.list-item')) as HTMLElement[];
        if (children.length) {
          result = result.concat(children);
        }
      }
    }
    return result;
  }

  /**
   * Selects an item in the menu.
   *
   * @param id The domain id of the node to be selected
   * @param type The selected type of the item.
   */
  [makeSelection](id: string, type: SelectionType): void {
    const { shadowRoot } = this;
    if (!shadowRoot) {
      return ;
    }
    const element = (shadowRoot.querySelector(`[data-graph-id="${id}"]`)) as HTMLElement | null;
    if (!element) {
      return;
    }
    this[selectedItemValue] = element;
    this[deselectItem](this.domainId as string, this.domainType as SelectionType);
    this[domainIdValue] = id;
    this[domainTypeValue] = type;
    if (id === 'summary') {
      this[summarySelected] = true;
    } else {
      this[selectItem](id, type);
    }
    this[focusItem](this[selectedItemValue]);
    this.requestUpdate();
    this[notifyNavigation](id, type);
    let parent = element.parentElement;
    while (parent) {
      if (parent === this) {
        return;
      }
      if (parent.localName === 'anypoint-collapse') {
        (parent as AnypointCollapseElement).opened = true;
      }
      parent = parent.parentElement;
    }
  }

  /**
   * Selects an item.
   * @param id The domain id of the menu item.
   * @param type The type of the data.
   */
  [selectItem](id: string, type: SelectionType): void {
    const selectable = this[findSelectable](id, type);
    if (selectable) {
      selectable.selected = true;
      this.requestUpdate();
    }
  }

  /**
   * Removes all selections from an item.
   * @param id The domain id of the menu item.
   * @param type The type of the data.
   */
  [deselectItem](id: string, type: SelectionType): void {
    this[summarySelected] = false;
    const selectable = this[findSelectable](id, type);
    if (selectable) {
      selectable.selected = false;
      selectable.secondarySelected = false;
      this.requestUpdate();
    }
  }

  /**
   * Finds a selectable item by its id and type.
   * @param id The domain id of the menu item.
   * @param type The type of the data.
   */
  [findSelectable](id: string, type: SelectionType): SelectableMenuItem|undefined {
    if (!id || !type) {
      return undefined;
    }
    let selectable: SelectableMenuItem | undefined;
    if (type === 'resource') {
      selectable = (this[endpointsValue] || []).find((item) => item.id === id);
    } else if (type === 'operation') {
      const endpoint = (this[endpointsValue] || []).find((item) => {
        if (!Array.isArray(item.operations) || !item.operations.length) {
          return false;
        }
        const op = item.operations.find((opItem) => opItem.id === id);
        return !!op;
      });
      if (endpoint) {
        selectable = endpoint.operations.find((item) => item.id === id);
      }
    } else if (type === 'documentation') {
      selectable = (this[documentationsValue] || []).find((item) => item.id === id);
    } else if (type === 'schema') {
      selectable = (this[schemasValue] || []).find((item) => item.id === id);
    } else if (type === 'security') {
      selectable = (this[securityValue] || []).find((item) => item.id === id);
    }
    return selectable;
  }

  /**
   * @param value The new query. Empty or null to clear the query
   */
  [processQuery](value?: string): void {
    if (typeof value !== 'string' || value.trim() === '') {
      this[queryValue] = undefined;
    } else {
      this[queryValue] = value.toLowerCase();
    }
    this.requestUpdate();
  }

  /**
   * A handler for the search event from the filter input.
   */
  [searchHandler](e: Event): void {
    const input = (e.target as HTMLInputElement);
    this.query = input.value;
    Events.Telemetry.event(this, {
      category: 'API navigation',
      action: 'Filter',
      label: input.value ? 'Query' : 'Clear',
    });
  }

  /**
   * Opens all sections of the menu and all endpoints.
   */
  expandAll(): void {
    this.endpointsOpened = true;
    this.schemasOpened = true;
    this.securityOpened = true;
    this.documentationsOpened = true;
    this.expandAllEndpoints();
  }

  /**
   * Closes all sections of the menu and all endpoints.
   */
  collapseAll(): void {
    this.endpointsOpened = false;
    this.schemasOpened = false;
    this.securityOpened = false;
    this.documentationsOpened = false;
    this.collapseAllEndpoints();
  }

  /**
   * Opens all endpoints exposing all operations
   */
  expandAllEndpoints(): void {
    const { shadowRoot } = this;
    if (!shadowRoot) {
      return;
    }
    this.endpointsOpened = true;
    const items = Array.from(shadowRoot.querySelectorAll('section.endpoints .list-item.endpoint')) as HTMLInputElement[];
    this[openedEndpointsValue] = [];
    items.forEach((item) => {
      const { graphId } = item.dataset;
      if (graphId) {
        this[openedEndpointsValue].push(graphId);
      }
    });
    this[endpointsExpandedValue] = true;
    this.requestUpdate();
  }

  /**
   * Hides all operations and collapses all endpoints.
   */
  collapseAllEndpoints(): void {
    this[openedEndpointsValue] = [];
    this[endpointsExpandedValue] = false;
    this.requestUpdate();
  }

  /**
   * Triggers a flow when the user can define a new endpoint in the navigation.
   * This renders an input in the view (in the endpoints list) where the user can enter the path name.
   */
  async addEndpoint(): Promise<void> {
    if (!this.endpointsOpened) {
      this.endpointsOpened = true;
      await this.updateComplete;
    }
    this[addingEndpointValue] = true;
    this.requestUpdate();
    await this.updateComplete;
    const wrap = this.shadowRoot?.querySelector('.add-endpoint-input');
    if (wrap) {
      wrap.scrollIntoView();
      const input = wrap.querySelector('input') as HTMLInputElement;
      input.focus();
      input.select();
    }
  }

  /**
   * Triggers a flow when the user can define a new documentation document.
   * This renders an input in the view (in the documentation list) where the user can enter the name.
   * @param isExternal Whether the documentation is a link to a www document.
   */
  async addDocumentation(isExternal = false) : Promise<void>{
    if (!this.documentationsOpened) {
      this.documentationsOpened = true;
    }
    this[addingDocumentationValue] = true;
    this[addingExternalValue] = isExternal;
    this.requestUpdate();
    await this.updateComplete;
    const selector = isExternal ? '.add-external-doc-input' : '.add-documentation-input';
    const wrap = this.shadowRoot?.querySelector(selector) as HTMLInputElement;
    if (wrap) {
      wrap.scrollIntoView();
      const input = wrap.querySelector('input') as HTMLInputElement;
      input.focus();
      input.select();
    }
  }

  /**
   * Triggers a flow when the user can define a new schema in the navigation.
   * This renders an input in the view (in the schema list) where the user can enter the schema name.
   * @param type The type of the schema to add. Default to `object`.
   */
  async addSchema(type: SchemaAddType = 'object'): Promise<void> {
    if (!this.schemasOpened) {
      this.schemasOpened = true;
    }
    this[addingSchemaValue] = true;
    this[addingSchemaTypeValue] = type;
    this.requestUpdate();
    await this.updateComplete;
    const wrap = this.shadowRoot?.querySelector('.add-schema-input');
    if (wrap) {
      wrap.scrollIntoView();
      const input = wrap.querySelector('input') as HTMLInputElement;
      input.focus();
      input.select();
    }
  }

  /**
   * Resets all tabindex attributes to the appropriate value based on the
   * current selection state. The appropriate value is `0` (focusable) for
   * the default selected item, and `-1` (not keyboard focusable) for all
   * other items. Also sets the correct initial values for aria-selected
   * attribute, true for default selected item and false for others.
   */
  [resetTabindices](): void {
    const { selectedItem } = this;
    const items = this[listActiveItems]();
    items.forEach((item) => item.setAttribute('tabindex', item === selectedItem ? '0' : '-1'));
  }

  /**
   * Dispatches the navigation event.
   * @param id The domain id of the selected node
   * @param type The domain type.
   */
  [notifyNavigation](id: string, type: SelectionType): void {
    let parent;
    if (type === 'operation' && id) {
      const node = this.shadowRoot?.querySelector(`.operation[data-graph-id="${id}"]`);
      if (node) {
        parent = (node as HTMLElement).dataset.graphParent;
      }
    }
    Events.Navigation.apiNavigate(this, id, type, parent);
    Events.Telemetry.event(this, {
      category: 'API navigation',
      action: 'Navigate',
      label: type,
    });
  }

  /**
   * Event handler for the keydown event of the add endpoint input.
   */
  [addEndpointKeydownHandler](e: KeyboardEvent): void {
    if (e.key === 'Enter' || e.key === 'NumpadEnter') {
      e.preventDefault();
      this[commitNewEndpoint]();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      this[cancelNewEndpoint]();
    }
  }

  /**
   * Event handler for the keydown event of the add documentation input.
   */
  [addDocumentationKeydownHandler](e: KeyboardEvent): void {
    if (e.key === 'Enter' || e.key === 'NumpadEnter') {
      e.preventDefault();
      const input = e.target as HTMLInputElement;
      this[commitNewDocumentation](input.value);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      this[addingDocumentationValue] = false;
      this[addingExternalValue] = undefined;
      this.requestUpdate();
    }
  }

  /**
   * Event handler for the keydown event of the add schema input.
   */
  [addSchemaKeydownHandler](e: KeyboardEvent): void {
    if (e.key === 'Enter' || e.key === 'NumpadEnter') {
      e.preventDefault();
      const input = (e.target as HTMLInputElement);
      this[commitNewSchema](input.value);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      this[addingSchemaValue] = false;
      this[addingSchemaTypeValue] = undefined;
      this.requestUpdate();
    }
  }

  async [commitNewEndpoint](): Promise<void> {
    const input = this.shadowRoot?.querySelector('.add-endpoint-input input');
    if (!input) {
      return;
    }
    const name = (input as HTMLInputElement).value.trim();
    if (!name) {
      return;
    }
    // await Events.Endpoint.add(this, { path: name });
    await this[cancelNewEndpoint]();
  }

  async [cancelNewEndpoint](): Promise<void> {
    this[addingEndpointValue] = false;
    this.requestUpdate();
    await this.updateComplete;
  }

  /**
   * @param value The title of the documentation.
   */
  async [commitNewDocumentation](value = ''): Promise<void> {
    const name = value.trim();
    if (!name) {
      return;
    }
    // const opts = { title: name };
    // const isExternal = this[addingExternalValue];
    // if (isExternal) {
    //   const input = (this.shadowRoot?.querySelector('.add-external-doc-input input'));
    //   if (input) {
    //     opts.url = (input as HTMLInputElement).value;
    //   }
    // }
    this[addingDocumentationValue] = false;
    this[addingExternalValue] = undefined;
    // await Events.Documentation.add(this, opts);
    this.requestUpdate();
  }

  /**
   * @param value The name of the schema.
   */
  async [commitNewSchema](value = ''): Promise<void> {
    const name = value.trim();
    if (!name) {
      return;
    }
    // const type = this[addingSchemaTypeValue];
    // const opts = { name };

    // switch (type) {
    //   case 'object': opts.type = AmfNamespace.w3.shacl.NodeShape; break;
    //   case 'scalar': opts.type = AmfNamespace.aml.vocabularies.shapes.ScalarShape; break;
    //   case 'array': opts.type = AmfNamespace.aml.vocabularies.shapes.ArrayShape; break;
    //   case 'file': opts.type = AmfNamespace.aml.vocabularies.shapes.FileShape; break;
    //   case 'union': opts.type = AmfNamespace.aml.vocabularies.shapes.UnionShape; break;
    //   default:
    // }
    this[addingSchemaValue] = false;
    this[addingSchemaTypeValue] = undefined;
    // await Events.Type.add(this, opts);
    this.requestUpdate();
  }

  /**
   * Triggers a rename action for the menu item identified by the `id`.
   * @param id The domain id of the item to edit.
   */
  async renameAction(id: string): Promise<void> {
    const { shadowRoot } = this;
    if (!shadowRoot) {
      throw new Error(`Invalid state. The DOM is not ready.`);
    }
    const item = this[findViewModelItem](id);
    if (!item) {
      return;
    }
    item.nameEditor = true;
    this.requestUpdate();
    await this.updateComplete;
    const input = (shadowRoot.querySelector(`input[data-id="${id}"]`)) as HTMLInputElement;
    input.select();
    input.focus();
  }

  /**
   * @param id The domain id of the item to find.
   */
  [findViewModelItem](id: string): SelectableMenuItem & EditableMenuItem | null {
    const endpoints = this[endpointsValue];
    if (endpoints && endpoints.length) {
      for (let i = 0, len = endpoints.length; i < len; i++) {
        const endpoint = endpoints[i];
        if (endpoint.id === id) {
          return endpoint;
        }
        const operation = endpoint.operations.find((op) => op.id === id);
        if (operation) {
          return operation;
        }
      }
    }
    const docs = this[documentationsValue];
    if (docs && docs.length) {
      const doc = docs.find((item) => item.id === id);
      if (doc) {
        return doc;
      }
    }
    const schemas = this[schemasValue];
    if (schemas && schemas.length) {
      const schema = schemas.find((item) => item.id === id);
      if (schema) {
        return schema;
      }
    }
    return null;
  }

  /**
   * A key down event handler on the rename input
   */
  async [renameKeydownHandler](e: KeyboardEvent): Promise<void> {
    // do not interfere with the navigation logic.
    e.stopPropagation();
    if (!['Enter', 'NumpadEnter', 'Escape'].includes(e.code)) {
      return;
    }
    e.preventDefault();
    const input = e.target as HTMLInputElement;
    const { value, dataset } = input;
    const { id, type } = dataset;
    const item = this[findViewModelItem](id as string);
    if (!item) {
      return;
    }
    item.nameEditor = false;
    this.requestUpdate();
    if (e.code === 'Escape') {
      return;
    }
    await this[updateNameHandler](id as string, value, type as SelectionType);
  }

  /**
   * A blur event handler on the rename input
   */
  async [renameBlurHandler](e: Event): Promise<void> {
    const input = e.target as HTMLInputElement;
    const { value, dataset } = input;
    const { id, type } = dataset;
    const item = this[findViewModelItem](id as string);
    if (!item) {
      return;
    }
    item.nameEditor = false;
    this.requestUpdate();
    await this[updateNameHandler](id as string, value, type as SelectionType);
  }

  /**
   * Updates the name or the display name of the menu object
   * @param id The id of the domain object to update
   * @param value The new value.
   * @param type The object type
   * @returns A promise when the update operation finish.
   */
  async [updateNameHandler](id: string, value: string, type: SelectionType): Promise<void> {
    const updateValue = value.trim();
    if (!updateValue) {
      return;
    }
    const promise = Promise.reject(new Error(`APi editing of ${type} ${id} is not yet supported`));
    // let promise;
    // if (type === 'SelectionType') {
    //   promise = Events.Endpoint.update(this, id, 'name', updateValue);
    // } else if (type === 'operation') {
    //   promise = Events.Operation.update(this, id, 'name', updateValue);
    // } else if (type === 'documentation') {
    //   const obj = await StoreEvents.Documentation.get(this, id);
    //   const prop = obj.title ? 'title' : 'description';
    //   promise = Events.Documentation.update(this, id, prop, updateValue);
    // } else if (type === 'schema') {
    //   const obj = await StoreEvents.Type.get(this, id);
    //   const { displayName } = obj;
    //   const prop = displayName ? 'displayName' : 'name';
    //   promise = Events.Type.update(this, id, prop, updateValue);
    // }
    try {
      await promise;
    } catch (e) {
      const ex = e as Error;
      Events.Reporting.error(this, ex, `Unable rename object: ${ex.message}`, 'graph-api-navigation');
    }
  }

  /**
   * Click handler for the external navigation item.
   * Dispatches the external navigation event. When this event is handled (cancelled)
   * the original event is cancelled to prevent default behavior.
   */
  [externalDocumentationHandler](e: Event): void {
    const a = e.currentTarget as HTMLAnchorElement;
    const handled = Events.Navigation.navigateExternal(this, a.href);
    if (handled) {
      cancelEvent(e);
    }
  }

  render(): TemplateResult {
    return html`
    <div class="wrapper" role="menu" aria-label="Navigate the API">
      ${this[filterTemplate]()}
      ${this[summaryTemplate]()}
      ${this[endpointsTemplate]()}
      ${this[documentationsTemplate]()}
      ${this[schemasTemplate]()}
      ${this[securitiesTemplate]()}
    </div>
    `;
  }

  /**
   * @returns The template for the summary filed.
   */
  [summaryTemplate](): TemplateResult | string {
    const { summaryRendered, summaryLabel } = this;
    if (!summaryRendered || !summaryLabel) {
      return '';
    }
    const selected = !!this[summarySelected];
    const classes = {
      'list-item': true,
      summary: true,
      selected,
    };
    return html`
    <section class="summary">
      <div 
        part="api-navigation-list-item" 
        class="${classMap(classes)}"
        role="menuitem"
        tabindex="-1"
        data-graph-id="summary"
        data-graph-shape="summary"
        @click="${this[itemClickHandler]}"
      >
        ${summaryLabel}
      </div>
    </section>
    `;
  }

  /**
   * @returns The template for the list of endpoints.
   */
  [endpointsTemplate](): TemplateResult | string {
    const { edit } = this;
    if (!this.hasEndpoints && !edit) {
      return '';
    }
    const items = this[getFilteredEndpoints]();
    const hasItems = !!items && !!items.length;
    if (!hasItems && !edit) {
      return '';
    }
    const { endpointsOpened, documentMeta } = this;
    const toggleState = endpointsOpened ? 'Expanded' : 'Collapsed';
    const sectionLabel = documentMeta && documentMeta.isAsync ? 'Channels' : 'Endpoints';
    const classes = {
      endpoints: true,
      opened: !!endpointsOpened,
    };
    const addingEndpoint = this[addingEndpointValue];
    const showEmpty = !hasItems && !addingEndpoint;
    return html`
    <section
      class="${classMap(classes)}"
    >
      <div
        class="section-title"
        data-property="endpointsOpened"
        data-section="endpoints"
        @click="${this[toggleSectionClickHandler]}"
        @keydown="${this[toggleSectionKeydownHandler]}"
        title="Toggle the list"
        aria-haspopup="true"
        role="menuitem"
      >
        <div class="title-h3">${sectionLabel}</div>
        <anypoint-icon-button
          part="toggle-button"
          class="toggle-button section"
          aria-label="Toggle the list"
          ?anypoint="${this.anypoint}"
          tabindex="-1"
        >
          <arc-icon aria-label="${toggleState}" role="img" icon="keyboardArrowDown"></arc-icon>
        </anypoint-icon-button>
      </div>
      <anypoint-collapse
        .opened="${endpointsOpened}"
        aria-hidden="${endpointsOpened ? 'false' : 'true'}"
        role="menu"
      >
        <div class="children">
          ${addingEndpoint ? this[addEndpointInputTemplate]() : ''}
          ${hasItems ? items.map((item) => this[endpointTemplate](item)) : ''}
          ${showEmpty ? html`<p class="empty-section">No endpoints in this API</p>` : ''}
        </div>
      </anypoint-collapse>
    </section>
    `;
  }

  /**
   * @returns The template for an endpoint.
   */
  [endpointTemplate](item: EndpointItem): TemplateResult {
    const { indent, operations, label, path, id, selected, secondarySelected, nameEditor } = item;
    const itemStyles = {
      paddingLeft: this[computeEndpointPaddingValue](indent),
    };
    const renderChildren = Array.isArray(operations) && !!operations.length;
    const opened = renderChildren && this[openedEndpointsValue].includes(id as string);
    const classes = {
      'list-item': true,
      'endpoint': true,
      opened,
      selected: !!selected,
      secondarySelected: !!secondarySelected,
    };
    return html`
    <div
      part="api-navigation-list-item"
      class="${classMap(classes)}"
      data-path="${path}"
      data-graph-id="${ifDefined(id)}"
      data-graph-shape="resource"
      @click="${this[itemClickHandler]}"
      title="Open this endpoint"
      style="${styleMap(itemStyles)}"
      role="menuitem"
      aria-haspopup="true"
    >
      ${nameEditor ?
        this[renameInputTemplate](id as string, 'resource', label)
        : html`
        ${renderChildren ? this[endpointToggleTemplate](id as string) : html`<div class="endpoint-toggle-mock"></div>`}
        <div class="endpoint-name">${label}</div>
        `
      }
    </div>
    ${renderChildren ? html`
      <anypoint-collapse
        part="api-navigation-operation-collapse"
        class="operation-collapse"
        data-graph-id="${id as string}"
        role="menu"
        .opened="${opened}"
      >
        ${item.operations.map((op) => this[operationItemTemplate](item, op))}
      </anypoint-collapse>
    ` : ''}
    `;
  }

  /**
   * @param id The domain id of the endpoint.
   * @return The template for an endpoint toggle button.
   */
  [endpointToggleTemplate](id: string): TemplateResult {
    return html`
    <anypoint-icon-button 
      class="toggle-button endpoint" 
      aria-label="Toggle the list of operations" 
      ?anypoint="${this.anypoint}" 
      tabindex="-1"
      data-graph-id="${id}"
      @click="${this[endpointToggleClickHandler]}"
    >
      <arc-icon icon="arrowDropDown" role="img" aria-label="Toggle the list of operations"></arc-icon>
    </anypoint-icon-button>`;
  }

  /**
   * @param item The endpoint definition 
   * @param op The operation definition.
   * @return The template for an operation list item.
   */
  [operationItemTemplate](item: EndpointItem, op: OperationItem): TemplateResult {
    const { id, name, method, selected, secondarySelected, nameEditor } = op;
    const itemStyles = {
      paddingLeft: this[computeOperationPaddingValue](item.indent),
    };
    const classes = {
      'list-item': true,
      operation: true,
      selected: !!selected,
      secondarySelected: !!secondarySelected,
    };
    return html`
    <div
      part="api-navigation-list-item"
      class="${classMap(classes)}"
      role="menuitem"
      tabindex="-1"
      data-graph-parent="${item.id as string}"
      data-graph-id="${id}"
      data-graph-shape="operation"
      data-operation="${method}"
      @click="${this[itemClickHandler]}"
      style="${styleMap(itemStyles)}"
    >
      ${nameEditor ?
        this[renameInputTemplate](id, 'operation', name)
        : html`
        <span class="method-label" data-method="${method}">${method}</span>
        ${name}
        `
      }
    </div>
    `;
  }

  /**
   * @return The template for the documentations section.
   */
  [documentationsTemplate](): TemplateResult | string {
    const { edit } = this;
    const items = this[getFilteredDocumentations]();
    if (!items.length && !edit) {
      return '';
    }
    const { documentationsOpened } = this;
    const classes = {
      documentation: true,
      opened: !!documentationsOpened,
    };
    const toggleState = documentationsOpened ? 'Expanded' : 'Collapsed';
    const addingDocumentation = this[addingDocumentationValue];
    const showItems = !!items.length;
    const showEmpty = !showItems && !addingDocumentation;
    return html`
    <section
      class="${classMap(classes)}"
    >
      <div
        class="section-title"
        data-property="documentationsOpened"
        data-section="documentations"
        @click="${this[toggleSectionClickHandler]}"
        @keydown="${this[toggleSectionKeydownHandler]}"
        title="Toggle the list"
        aria-haspopup="true"
        role="menuitem"
      >
        <div class="title-h3">Documentation</div>
        <anypoint-icon-button
          part="toggle-button"
          class="toggle-button section"
          aria-label="Toggle the list"
          ?anypoint="${this.anypoint}"
          tabindex="-1"
        >
          <arc-icon aria-label="${toggleState}" role="img" icon="keyboardArrowDown"></arc-icon>
        </anypoint-icon-button>
      </div>
      <anypoint-collapse .opened="${documentationsOpened}">
        <div class="children">
          ${addingDocumentation ? this[addDocumentationInputTemplate]() : ''}
          ${showItems ? items.map((item) => this[documentationTemplate](item)) : ''}
          ${showEmpty ? html`<p class="empty-section">No documentations in this API</p>` : ''}
        </div>
      </anypoint-collapse>
    </section>
    `;
  }

  /**
   * @return The template for the documentation list item.
   */
  [documentationTemplate](item: DocumentationItem): TemplateResult {
    if (item.url) {
      return this[externalDocumentationTemplate](item);
    }
    const { title, id, selected, secondarySelected, nameEditor } = item;
    const classes = {
      'list-item': true,
      documentation: true,
      selected: !!selected,
      secondarySelected: !!secondarySelected,
    }
    return html`<div
      part="api-navigation-list-item"
      class="${classMap(classes)}"
      role="menuitem"
      tabindex="-1"
      data-graph-id="${id}"
      data-graph-shape="documentation"
      @click="${this[itemClickHandler]}"
    >
      ${nameEditor ? this[renameInputTemplate](id, 'documentation', title) : title}
    </div>`;
  }

  /**
   * @return The template for the external documentation list item.
   */
  [externalDocumentationTemplate](item: DocumentationItem): TemplateResult {
    const { title, description, url, id, selected, secondarySelected, nameEditor } = item;
    const label = title || description;
    const classes = {
      'list-item': true,
      documentation: true,
      selected: !!selected,
      secondarySelected: !!secondarySelected,
    }
    return html`<a
      href="${url as string}"
      target="_blank"
      part="api-navigation-list-item"
      class="${classMap(classes)}"
      tabindex="-1"
      data-graph-id="${id}"
      data-graph-shape="documentation"
      @click="${this[externalDocumentationHandler]}"
    >
      ${nameEditor ?
        this[renameInputTemplate](id, 'documentation', label)
        : html`
        ${label}
        <arc-icon class="icon new-tab" title="Opens in a new tab" icon="openInNew"></arc-icon>
        `
      }
    </a>`;
  }

  /**
   * @return The template for the types (schemas) section.
   */
  [schemasTemplate](): TemplateResult | string {
    const { edit } = this;
    const items = this[getFilteredSchemas]();
    if (!items.length && !edit) {
      return '';
    }
    const { schemasOpened } = this;
    const classes = {
      schemas: true,
      opened: !!schemasOpened,
    };
    const toggleState = schemasOpened ? 'Expanded' : 'Collapsed';
    const addingSchema = this[addingSchemaValue];
    const showItems = !!items.length;
    const showEmpty = !showItems && !addingSchema;
    return html`
    <section
      class="${classMap(classes)}"
    >
      <div
        class="section-title"
        data-property="schemasOpened"
        data-section="schemas"
        @click="${this[toggleSectionClickHandler]}"
        @keydown="${this[toggleSectionKeydownHandler]}"
        title="Toggle the list"
        aria-haspopup="true"
        role="menuitem"
      >
        <div class="title-h3">Schemas</div>
        <anypoint-icon-button
          part="toggle-button"
          class="toggle-button section"
          aria-label="Toggle the list"
          ?anypoint="${this.anypoint}"
          tabindex="-1"
        >
          <arc-icon aria-label="${toggleState}" role="img" icon="keyboardArrowDown"></arc-icon>
        </anypoint-icon-button>
      </div>
      <anypoint-collapse .opened="${schemasOpened}">
        <div class="children">
          ${addingSchema ? this[addSchemaInputTemplate]() : ''}
          ${showItems ? items.map((item) => this[schemaTemplate](item)) : ''}
          ${showEmpty ? html`<p class="empty-section">No schemas in this API</p>` : ''}
        </div>
      </anypoint-collapse>
    </section>
    `;
  }

  /**
   * @return The template for the documentation list item.
   */
  [schemaTemplate](item: NodeShapeItem): TemplateResult {
    const { id, displayName, name, selected, secondarySelected, nameEditor } = item;
    const label = displayName || name || 'Unnamed schema';
    const classes = {
      'list-item': true,
      schema: true,
      selected: !!selected,
      secondarySelected: !!secondarySelected,
    }
    return html`
    <div
      part="api-navigation-list-item"
      class="${classMap(classes)}"
      role="menuitem"
      tabindex="-1"
      data-graph-id="${id}"
      data-graph-shape="schema"
      @click="${this[itemClickHandler]}"
    >
      ${nameEditor ? this[renameInputTemplate](id, 'schema', label) : label}
   </div>`;
  }

  /**
   * @return The template for the security section.
   */
  [securitiesTemplate](): TemplateResult | string {
    const items = this[getFilteredSecurity]();
    if (!items.length) {
      return '';
    }
    const { securityOpened } = this;
    const classes = {
      security: true,
      opened: !!securityOpened,
    };
    const toggleState = securityOpened ? 'Expanded' : 'Collapsed';
    return html`
    <section
      class="${classMap(classes)}"
    >
      <div
        class="section-title"
        data-property="securityOpened"
        data-section="security"
        @click="${this[toggleSectionClickHandler]}"
        @keydown="${this[toggleSectionKeydownHandler]}"
        title="Toggle the list"
        aria-haspopup="true"
        role="menuitem"
      >
        <div class="title-h3">Security</div>
        <anypoint-icon-button
          part="toggle-button"
          class="toggle-button section"
          aria-label="Toggle the list"
          ?anypoint="${this.anypoint}"
          tabindex="-1"
        >
          <arc-icon aria-label="${toggleState}" role="img" icon="keyboardArrowDown"></arc-icon>
        </anypoint-icon-button>
      </div>
      <anypoint-collapse .opened="${securityOpened}">
        <div class="children">
          ${items.map((item) => this[securityTemplate](item))}
        </div>
      </anypoint-collapse>
    </section>
    `;
  }

  /**
   * @return The template for the security list item.
   */
  [securityTemplate](item: SecurityItem): TemplateResult {
    const { id, displayName, name, selected, secondarySelected, type } = item;
    const label = displayName || name || 'Unnamed security';
    const classes = {
      'list-item': true,
      security: true,
      selected: !!selected,
      secondarySelected: !!secondarySelected,
    }
    return html`
    <div
      part="api-navigation-list-item"
      class="${classMap(classes)}"
      role="menuitem"
      tabindex="-1"
      data-graph-id="${id}"
      data-graph-shape="security"
      @click="${this[itemClickHandler]}"
    >
      ${type}: ${label}
   </div>`;
  }

  /**
   * @return The template for the filter input.
   */
  [filterTemplate](): TemplateResult | string {
    const { filter } = this;
    if (!filter) {
      return '';
    }
    return html`
    <div class="filter-wrapper">
      <input 
        type="search" 
        name="filter" 
        aria-label="Filter the menu" 
        placeholder="Filter" 
        @search="${this[searchHandler]}"
        @change="${this[searchHandler]}"
      />
      <arc-icon icon="search"></arc-icon>
    </div>
    `;
  }

  /**
   * @return The template for the new endpoint input.
   */
  [addEndpointInputTemplate](): TemplateResult {
    return html`
    <div
      part="api-navigation-input-item"
      class="input-item add-endpoint-input"
      data-graph-shape="resource"
    >
      <input 
        type="text" 
        class="add-endpoint-input" 
        @keydown="${this[addEndpointKeydownHandler]}"
        placeholder="Endpoint's path"
        aria-label="Enter the path for the endpoint"
      >
      <arc-icon icon="add" title="Enter to save, ESC to cancel"></arc-icon>
    </div>
    `;
  }

  /**
   * @return The template for the new documentation input.
   */
  [addDocumentationInputTemplate](): TemplateResult {
    const isExternal = this[addingExternalValue];
    return html`
    ${isExternal ? html`
    <div
      part="api-navigation-input-item"
      class="input-item add-external-doc-input"
    >
      <input 
        type="url" 
        class="add-external-doc-input" 
        aria-label="Enter the documentation URL"
        placeholder="Documentation URL"
      />
    </div>
    ` : ''}
    <div
      part="api-navigation-input-item"
      class="input-item add-documentation-input"
      data-graph-shape="documentation"
    >
      <input 
        type="text" 
        class="add-documentation-input" 
        aria-label="Enter name for the documentation"
        placeholder="Documentation title"
        @keydown="${this[addDocumentationKeydownHandler]}"/>
      <arc-icon icon="add" title="Enter to save, ESC to cancel"></arc-icon>
    </div>
    `;
  }

  /**
   * @return The template for the new schema input.
   */
  [addSchemaInputTemplate](): TemplateResult {
    return html`
    <div
      part="api-navigation-input-item"
      class="input-item add-schema-input"
      data-graph-shape="schema"
    >
      <input type="text" class="add-schema-input" @keydown="${this[addSchemaKeydownHandler]}"/>
      <arc-icon icon="add" title="Enter to save, ESC to cancel"></arc-icon>
    </div>
    `;
  }

  /**
   * @param id The domain id of the item being edited
   * @param label The current name to render.
   * @returns The template for the rename input. 
   */
  [renameInputTemplate](id: string, type: SelectionType, label = ''): TemplateResult {
    return html`
    <input 
      type="text" 
      .value="${label}" 
      required
      class="rename"
      data-id="${id}"
      data-type="${type}"
      @click="${cancelEvent}"
      @keydown="${this[renameKeydownHandler]}"
      @blur="${this[renameBlurHandler]}"
    />
    `;
  }
}
