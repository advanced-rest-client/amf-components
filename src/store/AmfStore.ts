/* eslint-disable default-param-last */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
import { AmfDefinitions, AmfSerializer, ApiDefinitions, AmfShapes } from '@api-client/core/build/browser.js';
import { ServersQueryOptions } from '@api-client/core/build/src/amf/AmfMixin.js';
import { DocumentMeta, ApiEndPointWithOperationsListItem, ApiSecuritySchemeListItem, ApiNodeShapeListItem } from '../types.js';

/**
 * An abstract base class for the store implementation that works with API Components.
 */
export class AmfStore {
  /** 
   * For future use.
   * Indicates that the store is read only.
   */
  readonly: boolean;

  target: EventTarget;

  serializer: AmfSerializer;

  /**
   * @param target The event target to dispatch the events on.
   */
  constructor(target: EventTarget = window, graph?: AmfDefinitions.IAmfDocument) {
    this.readonly = true;
    this.target = target;
    let amf = graph;
    if (Array.isArray(graph)) {
      [amf] = graph;
    }
    /** 
     * The API serializer
     */
    this.serializer = new AmfSerializer(amf);
  }

  /**
   * @returns The list of domain types for the currently loaded document.
   */
  getDocumentTypes(): string[] {
    throw new Error('Not implemented');
  }

  /**
   * Gathers information about the loaded document.
   * This is mainly used by the `api-documentation` element to decide which documentation to render.
   */
  async documentMeta(): Promise<DocumentMeta> {
    throw new Error('Not implemented');
  }

  /**
   * @returns API summary for the summary view.
   */
  async apiSummary(): Promise<ApiDefinitions.IApiSummary | null> {
    throw new Error('Not implemented');
  }

  /**
   * @returns Currently loaded API's protocols
   */
  async apiProtocols(): Promise<string[] | null> {
    throw new Error('Not implemented');
  }

  /**
   * @returns Currently loaded API's version
   */
  async apiVersion(): Promise<string | null> {
    throw new Error('Not implemented');
  }

  /**
   * Reads an endpoint by its id.
   * @param id The domain id of the endpoint.
   */
  async getEndpoint(id: string): Promise<ApiDefinitions.IApiEndPoint | null> {
    throw new Error('Not implemented');
  }

  /**
   * Reads an endpoint by its path.
   * @param path The path value of the endpoint or channel name.
   */
  async getEndpointByPath(path: string): Promise<ApiDefinitions.IApiEndPoint | null> {
    throw new Error('Not implemented');
  }

  /**
   * Lists all endpoints with operations included into the result.
   */
  async listEndpointsWithOperations(): Promise<ApiEndPointWithOperationsListItem[]> {
    throw new Error('Not implemented');
  }

  /**
   * Queries for the list of servers for method, if defined, or endpoint, if defined, or root level 
   * @param query Server query options
   * @returns The list of servers for given query.
   */
  async queryServers(query?: ServersQueryOptions): Promise<ApiDefinitions.IApiServer[]> {
    throw new Error('Not implemented');
  }

  /**
   * Reads the operation model.
   * @param operationId The domain id of the operation to read.
   * @param endpointId Optional endpoint id. When not set it searches through all endpoints.
   */
  async getOperation(operationId: string, endpointId?: string): Promise<ApiDefinitions.IApiOperation | undefined> {
    throw new Error('Not implemented');
  }

  /**
   * Finds an endpoint that has the operation.
   * @param id Method name or the domain id of the operation to find
   */
  async getOperationParent(id: string): Promise<ApiDefinitions.IApiEndPoint | undefined> {
    throw new Error('Not implemented');
  }

  /**
   * Lists the documentation definitions for the API.
   */
  async listDocumentations(): Promise<ApiDefinitions.IApiDocumentation[] | undefined> {
    throw new Error('Not implemented');
  }

  /**
   * Reads the documentation object from the store.
   * @param id The domain id of the documentation object
   * @returns The read documentation.
   */
  async getDocumentation(id: string): Promise<ApiDefinitions.IApiDocumentation | undefined> {
    throw new Error('Not implemented');
  }

  /**
   * Reads the SecurityScheme object from the graph.
   * @param id The domain id of the SecurityScheme
   */
  async getSecurityScheme(id: string): Promise<ApiDefinitions.IApiSecurityScheme | undefined> {
    throw new Error('Not implemented');
  }

  /**
   * Reads the SecurityRequirement object from the graph.
   * @param id The domain id of the SecurityRequirement
   */
  async getSecurityRequirement(id: string): Promise<ApiDefinitions.IApiSecurityRequirement | undefined> {
    throw new Error('Not implemented');
  }

  /**
   * Lists the security definitions for the API.
   */
  async listSecurity(): Promise<ApiSecuritySchemeListItem[]> {
    throw new Error('Not implemented');
  }

  /**
   * Reads the Request object from the graph.
   * @param id The domain id of the Request
   */
  async getRequest(id: string): Promise<ApiDefinitions.IApiRequest | undefined> {
    throw new Error('Not implemented');
  }

  /**
   * Reads the response data from the graph.
   * @param id The domain id of the response.
   */
  async getResponse(id: string): Promise<ApiDefinitions.IApiResponse | undefined> {
    throw new Error('Not implemented');
  }

  /**
   * Reads Payload data from the graph
   * @param id The domain id of the payload
   */
  async getPayload(id: string): Promise<ApiDefinitions.IApiPayload | undefined> {
    throw new Error('Not implemented');
  }

  /**
   * Lists the type (schema) definitions for the API.
   */
  async listTypes(): Promise<ApiNodeShapeListItem[]> {
    throw new Error(`Not implemented`);
  }

  /**
   * @param id The domain id of the API type (schema).
   */
  async getType(id: string): Promise<AmfShapes.IShapeUnion | undefined> {
    throw new Error('Not implemented');
  }
}
