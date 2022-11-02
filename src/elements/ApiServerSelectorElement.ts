/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable arrow-body-style */
/* eslint-disable no-plusplus */
/* eslint-disable class-methods-use-this */
import { html, LitElement, TemplateResult, CSSResult } from 'lit';
import { property } from 'lit/decorators.js';
import { ApiDefinitions } from '@api-client/core/build/browser.js';
import { AnypointDropdownElement, AnypointListboxElement, EventsTargetMixin } from '@anypoint-web-components/awc';
import '@anypoint-web-components/awc/dist/define/anypoint-input.js';
import '@anypoint-web-components/awc/dist/define/anypoint-dropdown-menu.js';
import '@anypoint-web-components/awc/dist/define/anypoint-listbox.js';
import '@anypoint-web-components/awc/dist/define/anypoint-item.js';
import '@anypoint-web-components/awc/dist/define/anypoint-icon-button.js';
import { close } from '@advanced-rest-client/icons/ArcIcons.js';
import elementStyles from './styles/ServerSelector.js';
import { Events } from '../events/Events.js';
import { EventTypes } from '../events/EventTypes.js';
import { SelectionInfo, ServerType } from '../types.js';

export const domainIdValue = Symbol('domainIdValue');
export const domainTypeValue = Symbol('domainTypeValue');
export const debounceValue = Symbol('debounceValue');
export const processDebounce = Symbol('processDebounce');
export const customNodesCount = Symbol('customNodesCount');
export const allowCustomValue = Symbol('allowCustomValue');
export const baseUriValue = Symbol('baseUriValue');
export const valueValue = Symbol('valueValue');
export const customItems = Symbol('customItems');
export const serversValue = Symbol('serversValue');
export const onServersCountChangeValue = Symbol('onServersCountChangeValue');
export const onApiServerChange = Symbol('onApiServerChange');
export const getServerIndexByUri = Symbol('getServerIndexByUri');
export const getSelectionInfo = Symbol('getSelectionInfo');
export const getExtraServers = Symbol('getExtraServers');
export const resetSelection = Symbol('resetSelection');
export const updateServerSelection = Symbol('updateServerSelection');
export const notifyServersCount = Symbol('notifyServersCount');
export const setValue = Symbol('setValue');
export const customUriChangeHandler = Symbol('customUriChangeHandler');
export const selectionChangeHandler = Symbol('selectionChangeHandler');
export const childrenHandler = Symbol('childrenHandler');
export const dropDownOpenedHandler = Symbol('dropDownOpenedHandler');
export const listboxItemsHandler = Symbol('listboxItemsHandler');
export const slotTemplate = Symbol('slotTemplate');
export const selectorTemplate = Symbol('selectorTemplate');
export const selectorListTemplate = Symbol('selectorListTemplate');
export const serverListTemplate = Symbol('serverListTemplate');
export const serverListItemTemplate = Symbol('serverListItemTemplate');
export const customUriTemplate = Symbol('customUriTemplate');
export const customUriInputTemplate = Symbol('customUriInputTemplate');
export const graphChangeHandler = Symbol('graphChangeHandler');
export const queryServers = Symbol('queryServers');

/**
 * An element that renders a selection of servers defined in AMF graph model for an API.
 *
 * This component receives an AMF model, and selected node's id and type
 * to know which servers to render
 *
 * When the selected server changes, it dispatches an `api-server-changed`
 * event, with the following details:
 * - Server value: the server id (for listed servers in the model), the URI
 *    value (when custom base URI is selected), or the value of the `anypoint-item`
 *    component rendered into the extra slot
 * - Selected type: `server` | `custom` | `extra`
 *    - `server`: server from the AMF model
 *    - `custom`: custom base URI input change
 *    - `extra`: extra slot's anypoint-item `value` attribute (see below)
 *
 * Adding extra slot:
 * This component renders a `slot` element to render anything the users wants
 * to add in there. To enable this, sit the `extraOptions` value in this component
 * to true, and render an element associated to the slot name `custom-base-uri`.
 * The items rendered in this slot should be `anypoint-item` components, and have a
 * `value` attribute. This is the value that will be dispatched in the `api-server-changed`
 * event.
 * 
 * @fires apiserverchanged - The event dispatched when a server selection change.
 * @fires serverscountchanged - The event dispatched when a server count change.
 * @fires query - Dispatched when the element asks the context store for servers info.
 */
export default class ApiServerSelectorElement extends EventsTargetMixin(LitElement) {
  get styles(): CSSResult[] {
    return [elementStyles];
  }

  /**
   * Currently selected type of the input.
   * `server` | `extra` | `custom`
   * @attribute
   */
  @property({ type: String }) type?: string;

  /**
   * Enables outlined material theme
   * @attribute
   */
  @property({ type: Boolean }) outlined?: boolean;

  /**
   * Enables Anypoint platform styles.
   * @attribute
   */
  @property({ type: Boolean }) anypoint?: boolean;

  /**
   * When set it automatically selected the first server from the list
   * of servers when selection is missing.
   * @attribute
   */
  @property({ type: Boolean }) autoSelect?: boolean;

  /**
   * A programmatic access to the opened state of the drop down.
   * Note, this does nothing when custom element is rendered.
   * @attribute
   */
  @property({ type: Boolean }) opened?: boolean;

  [domainIdValue]?: string;

  [domainTypeValue]?: string;

  /**
   * The graph domain id of the selected domain object.
   * @attribute
   */
  @property({ type: String }) get domainId(): string | undefined {
    return this[domainIdValue];
  }

  set domainId(value: string | undefined) {
    const old = this[domainIdValue];
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this[domainIdValue] = value;
    this.requestUpdate('domainId', old);
    this[processDebounce]();
  }

  /** 
   * The selected domain type.
   * This is an abstract name from the api navigation.
   * @attribute
   */
  @property({ type: String }) get domainType(): string | undefined {
    return this[domainTypeValue];
  }

  set domainType(value: string | undefined) {
    const old = this[domainTypeValue];
    if (old === value) {
      return;
    }
    this[domainTypeValue] = value;
    this.requestUpdate('domainType', old);
    if (value) {
      this[processDebounce]();
    }
  }

  /**
   * Computed list of all URI values from both the servers
   * and the list of rendered custom items.
   */
  get serverValues(): string[] {
    const result = (this.servers || []).map(item => item.url);
    return result.concat(this[customItems] || []);
  }

  [serversValue]?: ApiDefinitions.IApiServer[];

  /**
   * The current list of servers to render
   */
  @property({ type: Array }) get servers(): ApiDefinitions.IApiServer[] | undefined {
    return this[serversValue] || [];
  }

  set servers(value: ApiDefinitions.IApiServer[] | undefined) {
    const old = this[serversValue];
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this[serversValue] = value;
    this[updateServerSelection](value);
    this.requestUpdate('servers', old);
    this[notifyServersCount]();
  }

  [allowCustomValue]?: boolean;

  /**
   * When set the `Custom base URI` is rendered in the dropdown
   * @attr
   */
  @property({ type: Boolean, reflect: true }) get allowCustom(): boolean | undefined {
    return this[allowCustomValue];
  }

  set allowCustom(value: boolean | undefined) {
    const old = this.allowCustom;
    /* istanbul ignore if */
    if (old === value) {
      return;
    }

    this[allowCustomValue] = value;
    this[notifyServersCount]();
    this.requestUpdate('allowCustom', old);
    if (!value && this.isCustom && !this[baseUriValue]) {
      this[resetSelection]();
    }
  }

  [baseUriValue]?: string;

  /**
   * The baseUri to override any server definition
   * @attr
   */
  @property({ type: String }) get baseUri(): string | undefined {
    return this[baseUriValue];
  }

  set baseUri(value: string | undefined) {
    const old = this[baseUriValue];
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this.type = 'custom';
    this.value = value;
    this[baseUriValue] = value;
    this.requestUpdate('baseUri', old);
  }

  [valueValue]?: string;

  /**
   * The current base URI value from either (in order) the baseUri, current value, or just empty string.
   * @attr
   */
  @property({ type: String }) get value(): string | undefined {
    return this.baseUri || this[valueValue] || '';
  }

  /**
   * Sets currently rendered value.
   * If the value is not one of the drop down options then it renders custom control.
   *
   * This can be used to programmatically set a value of the control.
   *
   * @param value The value to render.
   */
  set value(value: string | undefined) {
    if (this.baseUri) {
      return;
    }
    const old = this[valueValue];
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this[valueValue] = value;
    this[setValue](value);
    this.requestUpdate('value', old);
  }

  /**
   *  True if selected type is "custom" type.
   */
  get isCustom(): boolean {
    return this.type === 'custom';
  }

  /**
   * Checks whether the current value is a custom value related to current list of servers.
   * @returns True if the value is not one of the server values or custom servers.
   */
  get isValueCustom(): boolean {
    const { value } = this;
    if (!value) {
      return false;
    }
    return !this.serverValues.includes(value);
  }

  [onApiServerChange]: EventListener | null = null;

  /**
   * @returns Previously registered callback function for the `api-server-changed` event.
   */
  get onapiserverchange(): EventListener | null {
    return this[onApiServerChange];
  }

  /**
   * @param value A callback function to be called  when `api-server-changed` event is dispatched.
   */
  set onapiserverchange(value: EventListener | null) {
    const old = this[onApiServerChange];
    if (old) {
      this.removeEventListener(EventTypes.Server.serverChange, old);
    }
    const isFn = typeof value === 'function';
    if (isFn) {
      this[onApiServerChange] = value;
      this.addEventListener(EventTypes.Server.serverChange, value);
    } else {
      this[onApiServerChange] = null;
    }
  }

  [onServersCountChangeValue]: EventListener | null = null;

  /**
   * @returns Previously registered callback function for the `servers-count-changed` event.
   */
  get onserverscountchange(): EventListener | null {
    return this[onServersCountChangeValue] || null;
  }

  /**
   * @param value A callback function to be called when `servers-count-changed` event is dispatched.
   */
  set onserverscountchange(value: EventListener | null) {
    const old = this[onServersCountChangeValue];
    if (old) {
      this.removeEventListener(EventTypes.Server.serverCountChange, old);
    }
    const isFn = typeof value === 'function';
    if (isFn) {
      this[onServersCountChangeValue] = value;
      this.addEventListener(EventTypes.Server.serverCountChange, value);
    } else {
      this[onServersCountChangeValue] = null;
    }
  }

  /**
   * @returns Total number of list items being rendered.
   */
  get serversCount(): number {
    const { allowCustom, servers = [] } = this;
    const offset = allowCustom ? 1 : 0;
    const serversCount = servers.length + this[customNodesCount] + offset;
    return serversCount;
  }

  /**
   * Holds the size of rendered custom servers.
   */
  [customNodesCount]: number;

  /** 
   * The timeout after which the `queryGraph()` function is called 
   * in the debouncer.
   */
  queryDebouncerTimeout: number;

  /**
   * A list of custom items rendered in the slot.
   * This property is received from the list box that mixes in `AnypointSelectableMixin`
   * that dispatches `items-changed` event when rendered items change.
   */
  [customItems]: string[];

  [debounceValue]?: any;

  constructor() {
    super();
    this[customNodesCount] = 0;
    this.queryDebouncerTimeout = 1;
    this.opened = false;
    this.autoSelect = false;
    this.anypoint = false;
    this.outlined = false;

    this[customItems] = [];
    this[graphChangeHandler] = this[graphChangeHandler].bind(this);
  }

  connectedCallback(): void {
    super.connectedCallback();
    this[processDebounce]();
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
    this[processDebounce]()
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

  firstUpdated(): void {
    this[notifyServersCount]();
  }

  /**
   * Queries for the current API server data from the store.
   */
  async processGraph(): Promise<void> {
    const oldValue = this.value;
    await this[queryServers]();
    // this.requestUpdate();
    // await this.updateComplete;
    this.value = '';
    this.selectIfNeeded(oldValue);
    this[notifyServersCount]();
  }

  /**
   * Queries for the current servers value.
   */
  async [queryServers](): Promise<void> {
    const { domainId, domainType } = this;
    let endpointId;
    let methodId;
    if (domainType === 'operation') {
      methodId = domainId;
    } else if (domainType === 'resource') {
      endpointId = domainId;
    }
    try {
      const info = await Events.Server.query(this, {
        endpointId,
        methodId,
      });
      this[serversValue] = info;
    } catch (e) {
      const ex = e as Error;
      this[serversValue] = undefined;
      Events.Telemetry.exception(this, ex.message, false);
      Events.Reporting.error(this, ex, `Unable to query for API servers: ${ex.message}`, this.localName);
    }
  }

  /**
   * Async function to set value after component has finished updating
   */
  async [setValue](value?: string): Promise<void> {
    await this.updateComplete;
    const { type, value: effectiveValue } = this[getSelectionInfo](value);
    if (type === 'custom' && !this.allowCustom) {
      return;
    }
    if (this.type !== type) {
      this.type = type;
    }
    Events.Server.serverChange(this, effectiveValue, this.type as ServerType);
  }

  /**
   * Dispatches the `servers-count-changed` event with the current number of rendered servers.
   */
  [notifyServersCount](): void {
    Events.Server.serverCountChange(this, this.serversCount);
  }

  /**
   * A handler called when slotted number of children change.
   * It sets the `[customNodesCount]` property with the number of properties
   * and notifies the change.
   */
  [childrenHandler](): void {
    const nodes = this[getExtraServers]();
    this[customNodesCount] = nodes.length;
    this[notifyServersCount]();
  }

  /**
   * Executes auto selection logic.
   * 
   * @param preferred The value that should be selected when possible.
   */
  selectIfNeeded(preferred?: string): void {
    if (!this.autoSelect) {
      if (preferred) {
        this.value = preferred;
      }
      return;
    }
    if (preferred && this.servers) {
      const has = this.servers.some(i => i.url === preferred) || this[customItems].includes(preferred);
      if (has) {
        this.value = preferred;
        return;
      }
    }
    if (this.value) {
      return;
    }
    if (!this.value && preferred && this.type === 'custom') {
      this.value = preferred;
      return;
    }
    const { servers = [] } = this;
    const [first] = servers;
    if (first) {
      this.value = first.url;
    } else {
      const [extra] = this[getExtraServers]();
      if (extra) {
        this.type = 'extra';
        this.value = extra.getAttribute('data-value') || extra.getAttribute('value') || undefined;
      }
    }
  }

  /**
   * Collects information about selection from the current value.
   * @param value Current value for the server URI.
   * @returns A selection info object
   */
  [getSelectionInfo](value = ''): SelectionInfo {
    const { isCustom } = this;
    // Default values.
    const result = {
      type: 'server',
      value,
    };
    if (isCustom) {
      // prohibits closing the custom input.
      result.type = 'custom';
      return result;
    }
    if (!value) {
      // When a value is cleared it is always a server
      return result;
    }
    const values = this.serverValues;
    const index = values.indexOf(value);
    if (index === -1) {
      // this is not a custom value (isCustom would be set)
      // so this is happening when navigation change but the server is not 
      // in the list of selected servers. We return the set value but the 
      // later logic will reset the selection to the first server.
      return result;
    }
    const itemValue = values[index];
    const custom = this[customItems] || [];
    const isSlotted = custom.indexOf(itemValue) !== -1;
    if (isSlotted) {
      result.type = 'extra';
    } else {
      result.type = 'server';
    }
    return result;
  }

  /**
   * Takes care of recognizing whether a server selection should be cleared.
   * This happens when list of servers change and with the new list of server
   * current selection does not exist.
   * This ignores the selection when current type is not a `server`.
   *
   * @param servers List of new servers
   */
  [updateServerSelection](servers?: ApiDefinitions.IApiServer[]): void {
    if (!servers) {
      this[resetSelection]();
    }
    if (!servers || this.type !== 'server') {
      return;
    }
    const index = this[getServerIndexByUri](servers, this.value);
    if (index === -1) {
      this[resetSelection]();
    }
  }

  /**
   * @param servers List of current servers
   * @param value The value to look for
   * @returns The index of found server or -1 if none found.
   */
  [getServerIndexByUri](servers: ApiDefinitions.IApiServer[], value?: string): number {
    return servers.findIndex(s => s.url === value);
  }

  /**
   * Handler for the listbox's change event
   */
  [selectionChangeHandler](e: CustomEvent): void {
    const { selectedItem } = (e.target as any);
    if (!selectedItem) {
      return;
    }
    let value = selectedItem.getAttribute('data-value') || selectedItem.getAttribute('value');
    if (value === 'custom') {
      this.type = 'custom';
      value = '';
    }
    this.value = value;
  }

  /**
   * Retrieves custom base uris elements assigned to the
   * custom-base-uri slot
   *
   * @returns Elements assigned to custom-base-uri slot
   */
  [getExtraServers](): Element[] {
    const slot = (this.shadowRoot as ShadowRoot).querySelector('slot');
    const items = slot ? slot.assignedElements({ flatten: true }) : [];
    return items.filter((elm) => elm.hasAttribute('value') || elm.hasAttribute('data-value'));
  }

  /**
   * Handler for the input field change.
   */
  [customUriChangeHandler](e: Event): void {
    const { value } = e.target as HTMLInputElement;
    this.value = value;
  }

  /**
   * Resets current selection to a default value.
   */
  [resetSelection](): void {
    this.value = '';
    this.type = 'server';
    this.selectIfNeeded();
  }

  /**
   * Handler for the drop down's `opened-changed` event. It sets local value
   * for the opened flag.
   */
  [dropDownOpenedHandler](e: Event): void {
    this.opened = (e.target as AnypointDropdownElement).opened;
  }

  /**
   * Updates list of custom items rendered in the selector.
   */
  [listboxItemsHandler](e: Event): void {
    const value = (e.target as AnypointListboxElement).items;
    if (!Array.isArray(value) || !value.length) {
      this[customItems] = [];
      return;
    }
    const result: string[] = [];
    value.forEach((node) => {
      const slot = node.getAttribute('slot');
      if (slot !== 'custom-base-uri') {
        return;
      }
      const v = node.getAttribute('data-value') || node.getAttribute('value');
      if (!v) {
        return;
      }
      result.push(v);
    });
    this[customItems] = result;
  }

  render(): TemplateResult {
    const { styles, isCustom } = this;
    return html`
    <style>${styles}</style>
    ${isCustom ? this[customUriInputTemplate]() : this[selectorTemplate]()}
    `;
  }

  /**
   * @returns Template result for the custom input.
   */
  [customUriInputTemplate](): TemplateResult {
    const { anypoint, outlined, value } = this;
    return html`
    <anypoint-input
      class="uri-input"
      @input="${this[customUriChangeHandler]}"
      .value="${value}"
      ?anypoint="${anypoint}"
      ?outlined="${outlined}"
      label="API base URI"
    >
      <anypoint-icon-button
        aria-label="Activate to clear and close custom editor"
        title="Clear and close custom editor"
        slot="suffix"
        @click="${this[resetSelection]}"
        ?anypoint="${anypoint}"
      >
        <span class="icon">${close}</span>
      </anypoint-icon-button>
  </anypoint-input>`;
  }

  /**
   * @returns Template result for the drop down element.
   */
  [selectorTemplate](): TemplateResult {
    const { anypoint, outlined, value, opened = false } = this;
    return html`
    <anypoint-dropdown-menu
      class="api-server-dropdown"
      ?anypoint="${anypoint}"
      ?outlined="${outlined}"
      .opened="${opened}"
      fitPositionTarget
      @openedchange="${this[dropDownOpenedHandler]}"
    >
      <label slot="label">Select server</label>
      <anypoint-listbox
        .selected="${value}"
        slot="dropdown-content"
        tabindex="-1"
        attrforselected="data-value"
        selectable="[value],[data-value]"
        ?anypoint="${anypoint}"
        @selectedchange="${this[selectionChangeHandler]}"
        @itemschange="${this[listboxItemsHandler]}"
      >
        ${this[selectorListTemplate]()}
      </anypoint-listbox>
    </anypoint-dropdown-menu>`;
  }

  /**
   * Call the render functions for
   * - Server options (from AMF Model)
   * - Custom URI option
   * - Extra slot
   * @returns The combination of all options
   */
  [selectorListTemplate](): TemplateResult {
    return html`
      ${this[serverListTemplate]()}
      ${this[slotTemplate]()}
      ${this[customUriTemplate]()}
    `;
  }

  /**
   * @returns The template for the custom URI list item.
   */
  [customUriTemplate](): TemplateResult | string {
    const { allowCustom, anypoint } = this;
    if (!allowCustom) {
      return '';
    }
    return html`<anypoint-item
      class="custom-option"
      data-value="custom"
      ?anypoint="${anypoint}"
    >Custom base URI</anypoint-item>`;
  }

  /**
   * @returns Template result for the drop down list options for current servers
   */
  [serverListTemplate](): TemplateResult[] | string {
    const { servers } = this;
    if (!Array.isArray(servers)) {
      return '';
    }
    return servers.map(server => this[serverListItemTemplate](server));
  }

  /**
   * @param server The server definition
   * @returns The template for a server list item.
   */
  [serverListItemTemplate](server: ApiDefinitions.IApiServer): TemplateResult {
    const { anypoint } = this;
    return html`
    <anypoint-item
      data-value="${server.url}"
      ?anypoint="${anypoint}"
      data-item="server-dropdown-option"
    >
      ${server.url}
    </anypoint-item>
    `
  }

  /**
   * @returns Template result for the `slot` element
   */
  [slotTemplate](): TemplateResult {
    return html`<slot
      @slotchange="${this[childrenHandler]}"
      name="custom-base-uri"
    ></slot>`;
  }
}
