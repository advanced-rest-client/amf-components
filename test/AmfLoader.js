/* eslint-disable no-continue */
/* eslint-disable no-param-reassign */
import { AmfHelperMixin } from '../src/helpers/AmfHelperMixin.js';
import { AmfSerializer } from '../src/helpers/AmfSerializer.js';

/** @typedef {import('../src/helpers/amf').AmfDocument} AmfDocument */
/** @typedef {import('../src/helpers/amf').EndPoint} EndPoint */
/** @typedef {import('../src/helpers/amf').Operation} Operation */
/** @typedef {import('../src/helpers/amf').Payload} Payload */
/** @typedef {import('../src/helpers/amf').SecurityRequirement} SecurityRequirement */
/** @typedef {import('../src/helpers/amf').SecurityScheme} SecurityScheme */
/** @typedef {import('../src/helpers/amf').Shape} Shape */
/** @typedef {import('../src/helpers/amf').CreativeWork} CreativeWork */
/** @typedef {import('../src/helpers/amf').WebApi} WebApi */
/** @typedef {import('../src/helpers/amf').Response} Response */
/** @typedef {import('../src/helpers/amf').Request} Request */
/** @typedef {import('../src/helpers/amf').Server} Server */
/** @typedef {import('../src/helpers/amf').Parameter} Parameter */
/** @typedef {import('../src/helpers/api').ApiEndPoint} ApiEndPoint */
/** @typedef {import('../src/helpers/api').ApiOperation} ApiOperation */
/** @typedef {import('../src/helpers/api').ApiPayload} ApiPayload */
/** @typedef {import('../src/helpers/api').ApiSecurityRequirement} ApiSecurityRequirement */
/** @typedef {import('../src/helpers/api').ApiSecurityScheme} ApiSecurityScheme */
/** @typedef {import('../src/helpers/api').ApiShapeUnion} ApiShapeUnion */
/** @typedef {import('../src/helpers/api').ApiDocumentation} ApiDocumentation */
/** @typedef {import('../src/helpers/api').ApiServer} ApiServer */
/** @typedef {import('../src/helpers/api').ApiParameter} ApiParameter */
/** @typedef {import('../src/helpers/api').ApiRequest} ApiRequest */
/** @typedef {import('../src/helpers/api').ApiResponse} ApiResponse */

/**
 * @typedef EndpointOperation
 * @property {EndPoint} endpoint
 * @property {Operation} operation
 */

export class AmfLoader extends AmfHelperMixin(Object) {
  /**
   * Reads AMF graph model as string
   * @param {boolean=} [compact='false']
   * @param {string=} [fileName='demo-api']
   * @returns {Promise<AmfDocument>} 
   */
  async getGraph(compact=false, fileName='demo-api') {
    const suffix = compact ? '-compact' : '';
    const file = `${fileName}${suffix}.json`;
    const url = `${window.location.protocol}//${window.location.host}/demo/models/${file}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Unable to download API data model');
    }
    let result = await  response.json();
    if (Array.isArray(result)) {
      [result] = result;
    }
    return result;
  }

  /**
   * @param {AmfDocument} model
   * @param {string} path
   * @return {EndPoint}
   */
  lookupEndpoint(model, path) {
    this.amf = model;
    const webApi = this._computeApi(model);
    if (!webApi) {
      throw new Error('This AMF model does not contain API definition.');
    }
    const endpoints = webApi[this._getAmfKey(this.ns.aml.vocabularies.apiContract.endpoint)];
    if (!Array.isArray(endpoints) || !endpoints.length) {
      throw new Error('This API does not contain endpoints.');
    }
    const pathKey = this.ns.aml.vocabularies.apiContract.path;
    const ep = endpoints.find(i => this._getValue(i, pathKey) === path);
    if (!ep) {
      throw new Error(`An endpoint with path ${path} does not exist in this API.`);
    }
    return ep;
  }

  /**
   * @param {AmfDocument} model
   * @param {string} path
   * @return {ApiEndPoint}
   */
  getEndpoint(model, path) {
    const op = this.lookupEndpoint(model, path);
    if (!op) {
      throw new Error(`Unknown endpoint for path ${path}`);
    }
    const serializer = new AmfSerializer(model);
    return serializer.endPoint(op);
  }

  /**
   * @param {AmfDocument} model
   * @param {string} endpoint
   * @param {string} operation
   * @return {Operation}
   */
  lookupOperation(model, endpoint, operation) {
    const endPoint = this.lookupEndpoint(model, endpoint);
    const opKey = this._getAmfKey(this.ns.aml.vocabularies.apiContract.supportedOperation);
    const ops = this._ensureArray(endPoint[opKey]);
    return ops.find((item) => this._getValue(item, this.ns.aml.vocabularies.apiContract.method) === operation);
  }

  /**
   * @param {AmfDocument} model
   * @param {string} endpoint
   * @param {string} operation
   * @return {ApiOperation}
   */
  getOperation(model, endpoint, operation) {
    const op = this.lookupOperation(model, endpoint, operation);
    if (!op) {
      throw new Error(`Unknown operation for path ${endpoint} and method ${operation}`);
    }
    const serializer = new AmfSerializer(model);
    return serializer.operation(op);
  }

  /**
   * @param {AmfDocument} model
   * @param {string} path
   * @param {string} operation
   * @return {EndpointOperation}
   */
  lookupEndpointOperation(model, path, operation) {
    const endpoint = this.lookupEndpoint(model, path);
    const opKey = this._getAmfKey(this.ns.aml.vocabularies.apiContract.supportedOperation);
    const ops = this._ensureArray(endpoint[opKey]);
    const op = ops.find((item) => this._getValue(item, this.ns.aml.vocabularies.apiContract.method) === operation);
    return {
      endpoint, 
      operation: op,
    };
  }

  /**
   * @param {AmfDocument} model
   * @param {string} path
   * @param {string} operation
   * @return {Request}
   */
  lookupExpects(model, path, operation) {
    const op = this.lookupOperation(model, path, operation);
    if (!op) {
      throw new Error(`Unknown operation for path ${path} and method ${operation}`);
    }
    let expects = op[this._getAmfKey(this.ns.aml.vocabularies.apiContract.expects)];
    if (!expects) {
      throw new Error(`Operation has no "expects" value.`);
    }
    if (Array.isArray(expects)) {
      [expects] = expects;
    }
    return expects;
  }

  /**
   * @param {AmfDocument} model
   * @param {string} endpoint
   * @param {string} operation
   * @return {Payload[]}
   */
  lookupPayloads(model, endpoint, operation) {
    const expects = this.lookupExpects(model, endpoint, operation);
    let payloads = expects[this._getAmfKey(this.ns.aml.vocabularies.apiContract.payload)];
    if (payloads && !Array.isArray(payloads)) {
      payloads = [payloads];
    }
    return payloads;
  }

  /**
   * @param {AmfDocument} model
   * @param {string} endpoint
   * @param {string} operation
   * @return {ApiPayload[]}
   */
  getPayloads(model, endpoint, operation) {
    const payloads = this.lookupPayloads(model, endpoint, operation);
    if (!payloads) {
      throw new Error(`No payloads for path ${endpoint} and operation ${operation}`);
    }
    const serializer = new AmfSerializer(model);
    return payloads.map(i => serializer.payload(i));
  }

  /**
   * @param {AmfDocument} model 
   * @param {string} name 
   * @returns {SecurityScheme}
   */
  lookupSecurity(model, name) {
    this.amf = model;
    const declares = this._computeDeclares(model) || [];
    let security = declares.find((item) => {
      if (Array.isArray(item)) {
        [item] = item;
      }
      if (this._getValue(item, this.ns.aml.vocabularies.core.displayName) === name) {
        return true;
      }
      if (this._getValue(item, this.ns.aml.vocabularies.core.name) === name) {
        return true;
      }
      return this._getValue(item, this.ns.aml.vocabularies.security.name) === name;
    });
    if (Array.isArray(security)) {
      [security] = security;
    }
    if (!security) {
      const references = this._computeReferences(model) || [];
      for (let i = 0, len = references.length; i < len; i++) {
        if (!this._hasType(references[i], this.ns.aml.vocabularies.document.Module)) {
          continue;
        }
        security = this.lookupSecurity(references[i], name);
        if (security) {
          break;
        }
      }
    }
    return security;
  }

  /**
   * @param {AmfDocument} model
   * @param {string} name 
   * @return {ApiSecurityScheme}
   */
  getSecurity(model, name) {
    const security = this.lookupSecurity(model, name);
    if (!security) {
      throw new Error(`No security named ${name}`);
    }
    const serializer = new AmfSerializer(model);
    return serializer.securityScheme(security);
  }

  /**
   * @param {AmfDocument} model 
   * @param {string} name 
   * @returns {Shape}
   */
  lookupShape(model, name) {
    let amf = model;
    if (Array.isArray(amf)) {
      [amf] = amf;
    }
    this.amf = amf;
    const declares = (this._computeDeclares(amf) || []);
    let shape = declares.find((item) => {
      if (Array.isArray(item)) {
        [item] = item;
      }
      return this._getValue(item, this.ns.w3.shacl.name) === name;
    });
    if (Array.isArray(shape)) {
      [shape] = shape;
    }
    if (!shape) {
      const references = this._computeReferences(model) || [];
      for (let i = 0, len = references.length; i < len; i++) {
        if (!this._hasType(references[i], this.ns.aml.vocabularies.document.Module)) {
          continue;
        }
        shape = this.lookupShape(references[i], name);
        if (shape) {
          break;
        }
      }
    }
    return shape;
  }

  /**
   * @param {AmfDocument} model 
   * @param {string} name 
   * @returns {ApiShapeUnion}
   */
  getShape(model, name) {
    const shape = this.lookupShape(model, name);
    if (!shape) {
      throw new Error(`No API shape named ${name}`);
    }
    const serializer = new AmfSerializer(model);
    return serializer.unknownShape(shape);
  }

  /**
   * @param {AmfDocument} model 
   * @param {string} name 
   * @returns {CreativeWork}
   */
  lookupDocumentation(model, name) {
    this.amf = model;
    const webApi = this._computeApi(model);
    const key = this._getAmfKey(this.ns.aml.vocabularies.core.documentation);
    const docs = this._ensureArray(webApi[key]);
    return docs.find((item) => {
      if (Array.isArray(item)) {
        [item] = item;
      }
      return this._getValue(item, this.ns.aml.vocabularies.core.title) === name;
    });
  }

  /**
   * @param {AmfDocument} model 
   * @param {string} name 
   * @returns {ApiDocumentation}
   */
  getDocumentation(model, name) {
    const shape = this.lookupDocumentation(model, name);
    if (!shape) {
      throw new Error(`No documentation named ${name}`);
    }
    const serializer = new AmfSerializer(model);
    return serializer.documentation(shape);
  }

  /**
   * @param {AmfDocument} model 
   * @returns {WebApi}
   */
  lookupEncodes(model) {
    if (Array.isArray(model)) {
      [model] = model;
    }
    this.amf = model;
    const key = this._getAmfKey(this.ns.aml.vocabularies.document.encodes);
    let result = model[key];
    if (Array.isArray(result)) {
      [result] = result;
    }
    return result;
  }

  /**
   * @param {AmfDocument} model
   * @param {string} endpoint
   * @param {string} operation
   * @return {Response[]}
   */
  lookupResponses(model, endpoint, operation) {
    const method = this.lookupOperation(model, endpoint, operation);
    return method[this._getAmfKey(this.ns.aml.vocabularies.apiContract.returns)];
  }

  /**
   * @param {AmfDocument} model
   * @param {string} endpoint
   * @param {string} operation
   * @return {ApiResponse[]}
   */
  getResponses(model, endpoint, operation) {
    const responses = this.lookupResponses(model, endpoint, operation);
    const serializer = new AmfSerializer(model);
    return responses.map(i => serializer.response(i));
  }

  /**
   * @param {AmfDocument} model 
   * @param {string} path The endpoint path
   * @param {string} operation The operation path
   * @param {string} code The response's status code
   * @returns {Response} 
   */
  lookupResponse(model, path, operation, code) {
    const responses = this.lookupResponses(model, path, operation);
    if (!Array.isArray(responses) || !responses.length) {
      throw new Error(`No responses for path ${path} and operation ${operation}`);
    }
    const response = responses.find((item) => {
      if (this._getValue(item, this.ns.aml.vocabularies.apiContract.statusCode) === String(code)) {
        return true;
      }
      return false;
    });
    if (!response) {
      throw new Error(`No responses the status code ${code}`);
    }
    return response;
  }

  /**
   * @param {AmfDocument} model
   * @param {string} endpoint
   * @param {string} operation
   * @param {string} code The response's status code
   * @return {ApiResponse}
   */
  getResponse(model, endpoint, operation, code) {
    const response = this.lookupResponse(model, endpoint, operation, code);
    const serializer = new AmfSerializer(model);
    return serializer.response(response);
  }

  /**
   * @param {AmfDocument} model
   * @param {string} endpoint
   * @param {string} operation
   * @return {Request}
   */
  lookupRequest(model, endpoint, operation) {
    const method = this.lookupOperation(model, endpoint, operation);
    let requests = method[this._getAmfKey(this.ns.aml.vocabularies.apiContract.expects)];
    if (Array.isArray(requests)) {
      [requests] = requests;
    }
    if (!requests) {
      throw new Error(`No request found in operation ${operation} and path ${endpoint}`);
    }
    return requests;
  }

  /**
   * @param {AmfDocument} model
   * @param {string} endpoint
   * @param {string} operation
   * @return {ApiRequest}
   */
  getRequest(model, endpoint, operation) {
    const request = this.lookupRequest(model, endpoint, operation);
    if (!request) {
      throw new Error(`No request found in operation ${operation} and path ${endpoint}`);
    }
    const serializer = new AmfSerializer(model);
    return serializer.request(request);
  }

  /**
   * @param {AmfDocument} model 
   * @param {string} path The endpoint path
   * @param {string} operation The operation path
   * @param {string} code The response's status code
   * @returns {Payload[]} 
   */
  lookupResponsePayloads(model, path, operation, code) {
    const response = this.lookupResponse(model, path, operation, code);
    const pKey = this._getAmfKey(this.ns.aml.vocabularies.apiContract.payload);
    const payloads = response[pKey];
    return this._ensureArray(payloads);
  }

  /**
   * @param {AmfDocument} model 
   * @param {string} path The endpoint path
   * @param {string} operation The operation path
   * @param {string} code The response's status code
   * @returns {ApiPayload[]} 
   */
  getResponsePayloads(model, path, operation, code) {
    const payloads = this.lookupResponsePayloads(model, path, operation, code);
    const serializer = new AmfSerializer(model);
    return payloads.map(p => serializer.payload(p));
  }

  /**
   * @param {AmfDocument} model
   * @return {Server[]}
   */
   lookupServers(model) {
    this.amf = model;
    const webApi = this._computeApi(model);
    const key = this._getAmfKey(this.ns.aml.vocabularies.apiContract.server);
    let result = webApi[key];
    if (result && !Array.isArray(result)) {
      result = [result];
    }
    return result;
  }

  /**
   * @param {AmfDocument} model
   * @return {ApiServer[]}
   */
  getServers(model) {
    const servers = this.lookupServers(model);
    if (servers) {
      const serializer = new AmfSerializer(model);
      return servers.map(s => serializer.server(s));
    }
    return undefined;
  }

  /**
   * @param {Object} model
   * @param {string} path
   * @param {string} operation
   * @return {Response[]}
   */
  lookupReturns(model, path, operation) {
    const op = this.lookupOperation(model, path, operation);
    if (!op) {
      throw new Error(`Unknown operation for path ${path} and method ${operation}`);
    }
    let returns = op[this._getAmfKey(this.ns.aml.vocabularies.apiContract.returns)];
    if (!returns) {
      throw new Error(`Operation has no "returns" value.`);
    }
    if (!Array.isArray(returns)) {
      returns = [returns];
    }
    return returns;
  }

  /**
   * Lookups a shape object from the declares array
   * @param {AmfDocument} model 
   * @param {string} name 
   * @returns {Shape}
   */
  lookupDeclaredShape(model, name) {
    this.amf = model;
    const items = this._computeDeclares(model);
    return items.find((item) => {
      const typed = /** @type Shape */ (item);
      const objectName = this._getValue(typed, this.ns.w3.shacl.name);
      return objectName === name;
    });
  }

  /**
   * @param {AmfDocument} model
   * @param {string} path
   * @param {string} operation
   * @return {SecurityRequirement[]}
   */
  lookupOperationSecurity(model, path, operation) {
    const op = this.lookupOperation(model, path, operation);
    if (!op) {
      throw new Error(`Unknown operation for path ${path} and method ${operation}`);
    }
    let security = op[this._getAmfKey(this.ns.aml.vocabularies.security.security)];
    if (!security) {
      throw new Error(`Operation has no "security" value.`);
    }
    if (!Array.isArray(security)) {
      security = [security];
    }
    return security;
  }

  /**
   * @param {AmfDocument} model
   * @param {string} path
   * @param {string} operation
   * @return {Payload[]}
   */
  lookupRequestPayloads(model, path, operation) {
    const request = this.lookupExpects(model, path, operation);
    const payload = request[this._getAmfKey(this.ns.aml.vocabularies.apiContract.payload)];
    if (!payload || !payload.length) {
      throw new Error(`Operation ${operation} of endpoint ${payload} has no request payload.`);
    }
    return payload;
  }

  /**
   * @param {AmfDocument} model
   * @param {string} path
   * @param {string} operation
   * @param {string} mime
   * @return {Payload}
   */
  lookupRequestPayload(model, path, operation, mime) {
    const payloads = this.lookupRequestPayloads(model, path, operation);
    const payload = payloads.find(i => this._getValue(i, this.ns.aml.vocabularies.core.mediaType) === mime);
    if (!payload) {
      throw new Error(`Operation ${operation} of endpoint ${payload} has no request payload for ${mime}.`);
    }
    return payload;
  }

  /**
   * Reads a request parameter from an operation for: URI, query params, headers, and cookies.
   * 
   * @param {AmfDocument} model 
   * @param {string} endpoint The endpoint path
   * @param {string} operation The operation path
   * @param {string} param The param name
   * @returns {ApiParameter} 
   */
  getParameter(model, endpoint, operation, param) {
    const expects = this.lookupExpects(model, endpoint, operation);
    if (!expects) {
      throw new Error(`The operation ${operation} of endpoint ${endpoint} has no request.`);
    }

    const serializer = new AmfSerializer(model);
    const request = serializer.request(expects);
    if (!request) {
      throw new Error(`The operation ${operation} of endpoint ${endpoint} has no request.`);
    }
    /** @type ApiParameter[] */
    let pool = [];
    if (Array.isArray(request.uriParameters)) {
      pool = pool.concat(request.uriParameters);
    }
    if (Array.isArray(request.cookieParameters)) {
      pool = pool.concat(request.cookieParameters);
    }
    if (Array.isArray(request.queryParameters)) {
      pool = pool.concat(request.queryParameters);
    }
    if (Array.isArray(request.headers)) {
      pool = pool.concat(request.headers);
    }
    const result = pool.find(i => i.name === param);
    if (!result) {
      throw new Error(`Parameter ${param} not found.`);
    }
    return result;
  }

  /**
   * @param {Request|Response} source 
   * @returns {Parameter[]|undefined}
   */
  readHeaders(source) {
    const key = this._getAmfKey(this.ns.aml.vocabularies.apiContract.header);
    let values = source[key];
    if (values && !Array.isArray(values)) {
      values = [values];
    }
    return values;
  }

  /**
   * Computes a list of query parameters
   * @param {Request} source 
   * @returns {Parameter[]|undefined}
   */
  readQueryParameters(source) {
    const key = this._getAmfKey(this.ns.aml.vocabularies.apiContract.parameter);
    let values = source[key];
    if (values && !Array.isArray(values)) {
      values = [values];
    }
    return values;
  }
}
