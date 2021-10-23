import { HTTPRequest, RequestAuthorization } from '@advanced-rest-client/events/src/request/ArcRequest';
import { ApiParameter, ApiShapeUnion, ApiSecurityRequirement, ApiServer, ApiEndPoint, ApiExample } from './helpers/api';
import { default as XhrSimpleRequestTransportElement } from './elements/XhrSimpleRequestTransportElement';

export declare interface ApiConsoleRequest extends HTTPRequest {
  /**
   * The authorization settings.
   * Some of them are already applied to the request object.
   */
  authorization?: RequestAuthorization[];
  /**
   * The id of the request generated when the Api request event is dispatched.
   */
  id?: string;
  /**
   * Whether or not to send credentials on the request. Default is false.
   */
  withCredentials?: boolean;
  /**
   * Timeout for request, in milliseconds.
   */
  timeout?: number;
}

export declare interface ApiConsoleResponse {
  /**
   * The id of the request generated when the Api request event is dispatched.
   */
  id: string;
  isError: boolean;
  request: ApiConsoleRequest;
  response: ApiConsoleHTTPResponse;
  error?: Error;
  loadingTime: number;
}

export declare interface ApiConsoleHTTPResponse {
  status: number;
  statusText?: string;
  payload?: any;
  headers?: string;
}

export declare interface AbortRequestEventDetail {
  /**
   * The URL of the request
   */
  url: string,
  /**
   * The id of the request.
   */
  id: string;
}

export declare interface XHRQueueItem {
  startTime: number;
  request: ApiConsoleRequest;
  xhr: XhrSimpleRequestTransportElement;
}

export declare interface PopulationInfo {
  annotationName: string;
  annotationValue: string;
  fieldValue: string;
}

export interface OperationParameter {
  /**
   * Works with the `allowDisableParams` configuration. By default 
   * a parameter is always enabled regardless of this value.
   * When the `allowDisableParams` is set it uses this value to ignore some parameters (even the required ones).
   */
  enabled?: boolean;
  /**
   * The parameter definition transformed from the AMF graph model.
   * This is set for path, query, and header parameters.
   */
  parameter: ApiParameter;
  /**
   * The schema associated with the parameter. Determines the shape of the user input control.
   */
  schema?: ApiShapeUnion;
  /**
   * Link to `parameter.id`.
   */
  paramId: string;
  /**
   * Link to `schema.id`.
   */
  schemaId?: string;
  /**
   * The value of the binding. Determines where the control should be rendered (parameters or headers).
   */
  binding: string;
  /**
   * A property set to determine from where the object came from. Used internally in the code.
   */
  source: string;
}

export interface SecuritySelectorListItem {
  types: string[];
  labels: string[];
  security: ApiSecurityRequirement;
}

export interface ParameterRenderOptions {
  /**
   * When set it overrides the parameter's / schema's required property
   * and renders the input as required.
   * This also forces the renderer to force example value when default is not present.
   */
  required?: boolean;
}

export interface ShapeTemplateOptions extends ParameterRenderOptions {
  nillable?: boolean;
  arrayItem?: boolean;
  index?: number;
  value?: any;
}

export interface ComputeBaseUriOptions {
  /**
   * The API base URI to use. When not set it computes the base URI from the `server` and `protocols`.
   */
  baseUri?: string;
  /**
   * When set it uses the server to determine the base URI.
   * When the `baseUri` is set this value is ignored.
   * When both are missing then the URL computations ignores the base URI part and reads the path only.
   */
  server?: ApiServer;
  /**
   * The endpoint definition used to compute path of the URL.
   * When not set it ignores the path part.
   */
  endpoint?: ApiEndPoint;
  /**
   * The protocols to use with the computation of the URL.
   * When the server has no protocol (http or https) defined on the base URI
   * then these protocols will be used.
   * If in both cases this is missing then the protocol is not included.
   * Note, it adds the protocol only when the base URI is defined (from the server).
   */
  protocols?: string[];
  /**
   * The API version. When set it replaces the `{version}` URI template with the value.
   */
  version?: string;
  /**
   * When set is forces setting an HTTP protocol (http:) when protocol information is missing in the API spec.
   */
  forceHttpProtocol?: boolean;
}

export interface OperationParameter {
  parameter: ApiParameter;
  schema?: ApiShapeUnion;
  paramId: string;
  schemaId?: string;
  binding: string;
  source: string;
}

export declare interface SelectionInfo {
  /**
   * Type of the detected selection
   */
  type: string;
  /**
   * The normalized value to be used by API editors
   */
  value: string;
}

export declare interface UpdateServersOptions {
  /**
   * The selected node type where servers should be fetched
   */
  type?: string;
  /**
   * The selected node ID where servers should be fetched
   */
  id?: string;
  /**
   * Optional endpoint id the method id belongs to
   */
  endpointId?: string;
}

/**
 * The selected type
 * 
 * - `server`: server from the AMF model
 * - `custom`: custom base URI value (entered by the user)
 * - `extra`: an application controlled server value selected by the user.
 */
export type ServerType = 'server' | 'custom' | 'extra';
export type SelectionType = 'summary' | 'resource' | 'operation' | 'schema' | 'security' | 'documentation';

export declare interface NavigationItem {
  label: string;
  id: string;
}

export declare interface MethodItem extends NavigationItem {
  method: string;
}

export declare interface EndpointItem extends NavigationItem {
  path: string;
  renderPath: boolean;
  indent: number;
  methods: MethodItem[];
}

export declare interface SecurityItem extends NavigationItem {}

export declare interface TypeItem extends NavigationItem {}

export declare interface DocumentationItem extends NavigationItem {
  /**
   * When set the documentation item refers to an external document
   */
  isExternal: boolean;
  /**
   * Only set when `isExternal` equals `true`.
   * An URL for the external documentation.
   */
  url?: string;
}

export declare interface TargetModel {
  documentation?: DocumentationItem[];
  types?: TypeItem[];
  securitySchemes?: SecurityItem[];
  endpoints?: EndpointItem[];
  _typeIds?: string[];
  _basePaths?: string[];
}

export declare interface SchemaExample extends ApiExample {
  /**
   * The value to render as the example value.
   */
  renderValue?: string;
  label?: string;
}

export declare interface ShapeRenderOptions {
  /**
   * All selected unions in the current view.
   * When the processor encounter an union it checks this array
   * to pick the selected union.
   * When the selected union cannot be determined it picks the first union.
   */
  selectedUnions?: string[];
  /**
   * Whether to include optional fields into the schema.
   * @default false
   */
  renderOptional?: boolean;
  /**
   * When set it uses the data mocking library to generate the values
   * when examples and default are not set.
   */
  renderMocked?: boolean;
  /**
   * The library **always** uses default values in the schema.
   * When a default value is not set by default it inserts an empty value for 
   * the given data type ('', false, null, random date). When this is set
   * it includes examples in the generated value.
   */
  renderExamples?: boolean;
}

export interface MonacoSchema {
  uri: string;
  schema: MonacoProperty;
  fileMatch?: string[];
}

export interface MonacoProperty {
  $id?: string;
  title: string;
  type: string;
  description?: string;
  readOnly?: boolean;
  writeOnly?: boolean;
}

export interface MonacoScalarProperty extends MonacoProperty {
  default?: string;
  pattern?: string;
  format?: string;
  exclusiveMaximum?: boolean;
  exclusiveMinimum?: boolean;
  maxLength?: number;
  minLength?: number;
  minimum?: number;
  maximum?: number;
  multipleOf?: number;
  enum?: string[];
}

export interface MonacoObjectProperty extends MonacoProperty {
  properties: Record<string, MonacoProperty>;
  required: string[];
  additionalProperties?: boolean;
  minProperties?: number;
  maxProperties?: number;
}

export interface MonacoArrayProperty extends MonacoProperty {
  additionalItems?: boolean;
  items: {
    anyOf: MonacoProperty[]
  }
  uniqueItems?: boolean;
  minItems?: number;
  maxItems?: number;
  required: string[];
}

export interface ApiSchemaReadOptions {
  /**
   * Whether the value should be read only when the required property is set.
   */
  requiredOnly?: boolean;
  /**
   * Whether to read the examples to generate the value.
   */
  fromExamples?: boolean;
}

export interface ApiEndPointListItem {
  /**
   * The domain id of the endpoint.
   * It may be undefined when the endpoint is created "abstract" endpoint vor the visualization.
   */
  id?: string;
  path: string;
  name?: string;
}

export interface ApiEndPointWithOperationsListItem extends ApiEndPointListItem {
  operations: ApiOperationListItem[];
}

export interface ApiOperationListItem {
  id: string;
  method: string;
  name?: string;
}

export interface ApiEndpointsTreeItem extends ApiEndPointWithOperationsListItem {
  label: string;
  indent: number;
  hasShortPath?: boolean;
  hasChildren?: boolean;
}

export interface ApiSecuritySchemeListItem {
  id: string;
  type: string;
  name?: string;
  displayName?: string;
}

export declare interface ApiNodeShapeListItem {
  id: string;
  name?: string;
  displayName?: string;
}

export interface DocumentMeta {
  /**
   * True when the loaded document represent an API (in an opposite to a fragment or a partial model).
   */
  isApi: boolean;
  /**
   * Whether the loaded document represent an Async API.
   */
  isAsync: boolean;
  /**
   * Whether the loaded document represent a RAML fragment / OAS reference.
   */
  isFragment: boolean;
  /**
   * A special type of fragment that is a RAML library.
   */
  isLibrary: boolean;
  /**
   * The list of types of the loaded document.
   */
  types: string[];
  /**
   * The domain id of the `encodes` property.
   */
  encodesId?: string;
}
