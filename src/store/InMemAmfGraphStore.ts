/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable default-param-last */
import { AmfHelperMixin } from '../helpers/AmfHelperMixin.js';
import { StoreEvents } from '../events/StoreEvents.js';
import { AmfStore } from './AmfStore.js';
import { AmfDocument, Api, CreativeWork, DomainElement } from '../helpers/amf.js';
import { ApiSummary, ApiEndPoint, ApiOperation, ServersQueryOptions, ApiServer, ApiDocumentation, ApiSecurityScheme, ApiSecurityRequirement, ApiRequest, ApiResponse, ApiPayload, ApiShapeUnion } from '../helpers/api.js';
import { DocumentMeta, ApiEndPointWithOperationsListItem, ApiSecuritySchemeListItem, ApiNodeShapeListItem } from '../types.js';


/**
 * The store that provides an API to read data from the AMF graph model.
 * The graph model is kept in memory in a form of a Raw ld+json graph representation of the 
 * AMF's domain model.
 */
export class InMemAmfGraphStore extends AmfHelperMixin(AmfStore) {
  /**
   * @param target The event target to dispatch the events on.
   * @param graph The full API model.
   */
  constructor(target: EventTarget = window, graph?: AmfDocument) {
    super(target, graph);
    let amf = graph;
    if (Array.isArray(graph)) {
      [amf] = graph;
    }
    /** 
     * The graph model.
     */
    this.amf = amf;
  }

  __amfChanged(amf: AmfDocument): void {
    this.serializer.amf = amf;
    if (this.target) {
      StoreEvents.graphChange(this.target);
    }
  }

  /**
   * @returns The list of domain types for the currently loaded document.
   */
  getDocumentTypes(): string[] {
    let { amf } = this;
    if (Array.isArray(amf)) {
      [amf] = amf;
    }
    if (!amf) {
      return [];
    }
    return this.serializer.readTypes(amf['@type']);
  }

  /**
   * Gathers information about the loaded document.
   * This is mainly used by the `api-documentation` element to decide which documentation to render.
   */
  async documentMeta(): Promise<DocumentMeta> {
    const result: DocumentMeta = ({
      isApi: false,
      isAsync: false,
      isFragment: false,
      isLibrary: false,
      types: this.getDocumentTypes(),
      encodesId: undefined,
    });
    let { amf } = this;
    if (Array.isArray(amf)) {
      [amf] = amf;
    }
    if (!amf) {
      return result;
    }
    const encodes = this._computeEncodes(amf);
    result.encodesId = encodes && encodes['@id'];
    const api = this._computeApi(amf);
    const isApi = !!api;
    result.isApi = isApi;
    const { ns } = this;
    if (isApi) {
      result.isAsync = this._isAsyncAPI(amf);
    } else if (result.types[0] === ns.aml.vocabularies.document.Module) {
      result.isLibrary = true;
    } else {
      const fragmentTypes = [
        ns.aml.vocabularies.security.SecuritySchemeFragment,
        ns.aml.vocabularies.apiContract.UserDocumentationFragment,
        ns.aml.vocabularies.shapes.DataTypeFragment,
      ];
      result.isFragment = fragmentTypes.some(type => result.types.includes(type));
    }
    return result;
  }

  /**
   * @returns API summary for the summary view.
   */
  async apiSummary(): Promise<ApiSummary|null> {
    const { amf } = this;
    if (!amf) {
      return null;
    }
    const api = this._computeApi(amf);
    if (!api) {
      return null;
    }
    const result = this.serializer.apiSummary(api);
    return result;
  }

  /**
   * @returns Currently loaded API's protocols
   */
  async apiProtocols(): Promise<string[]|null> {
    const { amf } = this;
    if (!amf) {
      return null;
    }
    const wa = this._computeApi(amf);
    const protocols = this._getValueArray(wa, this.ns.aml.vocabularies.apiContract.scheme) as string[];
    return protocols;
  }

  /**
   * @returns Currently loaded API's version
   */
  async apiVersion(): Promise<string|null> {
    const { amf } = this;
    if (!amf) {
      return null;
    }
    const version = this._computeApiVersion(amf) || null;
    return version;
  }

  /**
   * Finds an endpoint in the graph.
   * @param id The domain id of the endpoint.
   * @private
   */
  findEndpoint(id: string): ApiEndPoint|null {
    const { amf } = this;
    if (!amf) {
      return null;
    }
    const api = this._computeApi(amf);
    if (!api) {
      return null;
    }
    const endpoint = this._computeEndpointModel(api, id);
    if (!endpoint) {
      throw new Error(`Endpoint ${id} does not exist.`);
    }
    const result = this.serializer.endPoint(endpoint);
    return result;
  }
  
  /**
   * Reads an endpoint by its id.
   * @param id The domain id of the endpoint.
   */
  async getEndpoint(id: string): Promise<ApiEndPoint|null> {
    return this.findEndpoint(id);
  }

  /**
   * Reads an endpoint by its path.
   * @param path The path value of the endpoint or channel name.
   */
  async getEndpointByPath(path: string): Promise<ApiEndPoint|null> {
    const { amf } = this;
    if (!amf) {
      return null;
    }
    const api = this._computeApi(amf);
    if (!api) {
      return null;
    }
    const endpoints = this._computeEndpoints(api);
    if (!Array.isArray(endpoints) || !endpoints.length) {
      throw new Error(`This API has no endpoints.`);
    }
    const endpoint = endpoints.find((e) => this._getValue(e, this.ns.aml.vocabularies.apiContract.path) === path);
    if (!endpoint) {
      throw new Error(`Endpoint ${endpoint} does not exist.`);
    }
    const result = this.serializer.endPoint(endpoint);
    return result;
  }

  /**
   * Lists all endpoints with operations included into the result.
   */
  async listEndpointsWithOperations(): Promise<ApiEndPointWithOperationsListItem[]> {
    const { amf } = this;
    if (!amf) {
      return [];
    }
    const api = this._computeApi(amf);
    if (!api) {
      return [];
    }
    const endpoints = this._computeEndpoints(api);
    if (!Array.isArray(endpoints) || !endpoints.length) {
      return [];
    }
    return endpoints.map((ep) => this.serializer.endPointWithOperationsListItem(ep));
  }

  /**
   * Queries for the list of servers for method, if defined, or endpoint, if defined, or root level 
   * @param query Server query options
   * @returns The list of servers for given query.
   */
  async queryServers(query?: ServersQueryOptions): Promise<ApiServer[]> {
    const { amf } = this;
    if (!amf) {
      return [];
    }
    const servers = this._getServers(query);
    if (!Array.isArray(servers)) {
      return [];
    }
    return servers.map(s => this.serializer.server(s));
  }

  /**
   * Searches for an operation in the API.
   * @param operationId The domain id of the operation to read.
   * @param endpointId Optional endpoint id. When not set it searches through all endpoints.
   */
  findOperation(operationId: string, endpointId?: string): ApiOperation|undefined {
    if (endpointId) {
      const ep = this.findEndpoint(endpointId);
      if (!ep) {
        return undefined;
      }
      return ep.operations.find((op) => op.id === operationId || op.method === operationId);
    }
    const { amf } = this;
    if (!amf) {
      return undefined;
    }
    const api = this._computeApi(amf);
    if (!api) {
      return undefined;
    }
    const endpoints = this._computeEndpoints(api);
    if (!endpoints) {
      return undefined;
    }
    const { apiContract } = this.ns.aml.vocabularies;
    const opKey = this._getAmfKey(apiContract.supportedOperation) as string;
    for (const endpoint of endpoints) {
      let operations = (endpoint as any)[opKey];
      if (!operations) {
        continue;
      }
      if (!Array.isArray(operations)) {
        operations = [operations];
      }
      for (const operation of operations) {
        if (operation['@id'] === operationId || this._getValue(operation, apiContract.method) === operationId) {
          return this.serializer.operation(operation);
        }
      }
    }
    return undefined;
  }

  /**
   * Reads the operation model.
   * @param operationId The domain id of the operation to read.
   * @param endpointId Optional endpoint id. When not set it searches through all endpoints.
   */
  async getOperation(operationId: string, endpointId?: string): Promise<ApiOperation> {
    const op = this.findOperation(operationId, endpointId);
    if (!op) {
      throw new Error(`No operation ${operationId} in the graph`);
    }
    return op;
  }

  /**
   * Finds an endpoint that has the operation.
   * @param id Method name or the domain id of the operation to find
   */
  async getOperationParent(id: string): Promise<ApiEndPoint|undefined> {
    const { amf } = this;
    if (!amf) {
      return undefined;
    }
    const api = this._computeApi(amf);
    if (!api) {
      return undefined;
    }
    const endpoint = this._computeMethodEndpoint(api, id);
    if (!endpoint) {
      throw new Error(`Operation ${id} does not exist.`);
    }
    const result = this.serializer.endPoint(endpoint);
    return result;
  }

  /**
   * Lists the documentation definitions for the API.
   */
  async listDocumentations(): Promise<ApiDocumentation[] | undefined> {
    const { amf } = this;
    if (!amf) {
      return undefined;
    }
    if (this._hasType(amf, this.ns.aml.vocabularies.apiContract.UserDocumentationFragment)) {
      const model = this._computeEncodes(amf);
      if (!model) {
        return undefined;
      }
      return [this.serializer.documentation(model)];
    }
    const api = this._computeApi(amf);
    if (!api) {
      return undefined;
    }
    const key = this._getAmfKey(this.ns.aml.vocabularies.core.documentation) as string;
    const docs = this._ensureArray((api as any)[key]) as CreativeWork[];
    if (docs) {
      return docs.map((doc) => this.serializer.documentation(doc));
    }
    return undefined;
  }

  /**
   * Reads the documentation object from the store.
   * @param id The domain id of the documentation object
   * @returns The read documentation.
   */
  async getDocumentation(id: string): Promise<ApiDocumentation|undefined> {
    const { amf } = this;
    if (!amf) {
      return undefined;
    }
    const types = this.getDocumentTypes();
    // when we have loaded Documentation fragment then the id doesn't matter.
    if (types.includes(this.ns.aml.vocabularies.apiContract.UserDocumentationFragment)) {
      const encodes = this._computeEncodes(amf);
      return this.serializer.documentation(encodes as Api);
    }
    const api = this._computeApi(amf);
    if (!api) {
      return undefined;
    }
    const creative = this._computeDocument(api, id);
    if (!creative) {
      throw new Error(`Documentation ${id} does not exist.`);
    }
    const result = this.serializer.documentation(creative);
    return result;
  }

  /**
   * Reads the SecurityScheme object from the graph.
   * @param id The domain id of the SecurityScheme
   */
  async getSecurityScheme(id: string): Promise<ApiSecurityScheme | undefined> {
    const types = this.getDocumentTypes();
    // when we have loaded Security fragment then the id doesn't matter.
    if (types.includes(this.ns.aml.vocabularies.security.SecuritySchemeFragment)) {
      const { amf } = this;
      if (!amf) {
        return undefined;
      }
      const encodes = this._computeEncodes(amf);
      return this.serializer.securityScheme(encodes as Api);
    }
    const object = this.findSecurityScheme(id);
    if (!object) {
      throw new Error(`No SecurityRequirement for ${id}`);
    }
    return this.serializer.securityScheme(object);
  }

  /**
   * Reads the SecurityRequirement object from the graph.
   * @param id The domain id of the SecurityRequirement
   */
  async getSecurityRequirement(id: string): Promise<ApiSecurityRequirement | undefined> {
    const { amf } = this;
    if (!amf) {
      return undefined;
    }
    const wa = this._computeApi(amf);
    if (!wa) {
      return undefined;
    }
    const endpoints = (wa as any)[this._getAmfKey(this.ns.aml.vocabularies.apiContract.endpoint) as string];
    if (!Array.isArray(endpoints)) {
      return undefined;
    }
    for (const endpoint of endpoints) {
      const operations = endpoint[this._getAmfKey(this.ns.aml.vocabularies.apiContract.supportedOperation) as string];
      if (Array.isArray(operations)) {
        for (const operation of operations) {
          const securityList = operation[this._getAmfKey(this.ns.aml.vocabularies.security.security) as string];
          if (Array.isArray(securityList)) {
            for (const security of securityList) {
              if (security['@id'] === id) {
                return this.serializer.securityRequirement(security);
              }
            }
          }
        }
      }
    }
    return undefined;
  }

  /**
   * Lists the security definitions for the API.
   */
  async listSecurity(): Promise<ApiSecuritySchemeListItem[]> {
    const { amf } = this;
    if (!amf) {
      return [];
    }
    if (this._hasType(amf, this.ns.aml.vocabularies.security.SecuritySchemeFragment)) {
      const model = this._computeEncodes(amf);
      if (!model) {
        return [];
      }
      return [this.serializer.securitySchemeListItem(model)];
    }
    const items = this.getByType(amf, this.ns.aml.vocabularies.security.SecurityScheme);
    return items.map(item => this.serializer.securitySchemeListItem(item));
  }

  /**
   * Reads the Request object from the graph.
   * @param id The domain id of the Request
   */
  async getRequest(id: string): Promise<ApiRequest | undefined> {
    const { amf } = this;
    if (!amf) {
      return undefined;
    }
    const wa = this._computeApi(amf);
    if (!wa) {
      return undefined;
    }
    const endpoints = (wa as any)[this._getAmfKey(this.ns.aml.vocabularies.apiContract.endpoint) as string];
    if (!Array.isArray(endpoints)) {
      return undefined;
    }
    for (const endpoint of endpoints) {
      const operations = endpoint[this._getAmfKey(this.ns.aml.vocabularies.apiContract.supportedOperation) as string];
      if (Array.isArray(operations)) {
        for (const operation of operations) {
          const expectsList = operation[this._getAmfKey(this.ns.aml.vocabularies.apiContract.expects) as string];
          if (Array.isArray(expectsList)) {
            for (const expects of expectsList) {
              if (expects['@id'] === id) {
                return this.serializer.request(expects);
              }
            }
          }
        }
      }
    }
    return undefined;
  }

  /**
   * Reads the response data from the graph.
   * @param id The domain id of the response.
   */
  async getResponse(id: string): Promise<ApiResponse | undefined> {
    const { amf } = this;
    if (!amf) {
      return undefined;
    }
    const wa = this._computeApi(amf);
    if (!wa) {
      return undefined;
    }
    const endpoints = (wa as any)[this._getAmfKey(this.ns.aml.vocabularies.apiContract.endpoint) as string];
    if (!Array.isArray(endpoints)) {
      return undefined;
    }
    for (const endpoint of endpoints) {
      const operations = endpoint[this._getAmfKey(this.ns.aml.vocabularies.apiContract.supportedOperation) as string];
      if (Array.isArray(operations)) {
        for (const operation of operations) {
          const returnsList = operation[this._getAmfKey(this.ns.aml.vocabularies.apiContract.returns) as string];
          if (Array.isArray(returnsList)) {
            for (const returns of returnsList) {
              if (returns['@id'] === id) {
                return this.serializer.response(returns);
              }
            }
          }
        }
      }
    }
    return undefined;
  }

  /**
   * Finds a payload in a request or a response object.
   */
  findPayload(object: DomainElement, domainId: string): ApiPayload|undefined {
    const list = (object as any)[this._getAmfKey(this.ns.aml.vocabularies.apiContract.payload) as string];
    if (!Array.isArray(list) || !list.length) {
      return undefined;
    }
    const model = list.find(i => i['@id'] === domainId);
    if (!model) {
      return undefined;
    }
    return this.serializer.payload(model);
  }

  /**
   * Reads Payload data from the graph
   * @param id The domain id of the payload
   */
  async getPayload(id: string): Promise<ApiPayload | undefined> {
    const { amf } = this;
    if (!amf) {
      return undefined;
    }
    const wa = this._computeApi(amf);
    if (!wa) {
      return undefined;
    }
    const endpoints = (wa as any)[this._getAmfKey(this.ns.aml.vocabularies.apiContract.endpoint) as string];
    if (!Array.isArray(endpoints)) {
      return undefined;
    }
    for (const endpoint of endpoints) {
      const operations = endpoint[this._getAmfKey(this.ns.aml.vocabularies.apiContract.supportedOperation) as string];
      if (Array.isArray(operations)) {
        for (const operation of operations) {
          const expectsList = operation[this._getAmfKey(this.ns.aml.vocabularies.apiContract.expects) as string];
          if (Array.isArray(expectsList)) {
            for (const expects of expectsList) {
              const payload = this.findPayload(expects, id);
              if (payload) {
                return payload;
              }
            }
          }
          const returnsList = operation[this._getAmfKey(this.ns.aml.vocabularies.apiContract.returns) as string];
          if (Array.isArray(returnsList)) {
            for (const returns of returnsList) {
              const payload = this.findPayload(returns, id);
              if (payload) {
                return payload;
              }
            }
          }
        }
      }
    }
    return undefined;
  }

  /**
   * Lists the type (schema) definitions for the API.
   */
  async listTypes(): Promise<ApiNodeShapeListItem[]> {
    const { amf } = this;
    if (!amf) {
      return [];
    }
    if (this._hasType(amf, this.ns.aml.vocabularies.shapes.DataTypeFragment)) {
      const model = this._computeEncodes(amf);
      if (!model) {
        return [];
      }
      return [this.serializer.unknownShape(model)];
    }
    const items = this.getByType(amf, this.ns.aml.vocabularies.shapes.Shape);
    return items.map(item => this.serializer.unknownShape(item));
  }

  /**
   * @param id The domain id of the API type (schema).
   */
  async getType(id: string): Promise<ApiShapeUnion | undefined> {
    const { amf } = this;
    if (!amf) {
      return undefined;
    }
    const types = this.getDocumentTypes();
    // when we have loaded Type fragment then the id doesn't matter.
    if (types.includes(this.ns.aml.vocabularies.shapes.DataTypeFragment)) {
      const encodes = this._computeEncodes(amf);
      return this.serializer.unknownShape(encodes as Api);
    }
    const declares = this._computeDeclares(amf);
    const references = this._computeReferences(amf);
    const type = this._computeType(declares as DomainElement[], references as DomainElement[], id);
    if (!type) {
      return undefined;
    }
    return this.serializer.unknownShape(type);
  }
}
