/* eslint-disable prefer-destructuring */
/* eslint-disable no-param-reassign */

import { ComputeBaseUriOptions } from "../types.js";

/** @typedef {import('../helpers/api').ApiEndPoint} ApiEndPoint */
/** @typedef {import('../helpers/api').ApiServer} ApiServer */
/** @typedef {import('../types').ComputeBaseUriOptions} ComputeBaseUriOptions */

/**
 * Computes the base URI value for the API/endpoint/operation.
 * 
 * @param url The url to check for protocol information.
 * @param options The computation options
 * @returns The base uri value with a protocol,
 */
export function setProtocol(url='', options: ComputeBaseUriOptions={}): string {
  const { server, protocols=[] } = options;
  const schemes = [...protocols];
  if (server && server.protocol) {
    schemes.unshift(server.protocol);
  }

  let result = url;
  // this also run when an Async API is loaded so the protocol may be whatever.
  const hasProtocol = !!result && result.includes('://');
  if (result && !hasProtocol && schemes.length) {
    result = `${schemes[0]}://${result}`;
  } else if (result && !hasProtocol && options.forceHttpProtocol) {
    result = `http://${result}`;
  }
  return result;
}

/**
 * Computes the base URI value for the API/endpoint/operation.
 * 
 * @param options The computation options
 * @returns Base uri value. Can be empty string.
 */
export function computeApiBaseUri(options: ComputeBaseUriOptions={}): string {
  const { baseUri, server, version } = options;
  if (baseUri) {
    let result = baseUri;
    if (result.endsWith('/')) {
      result = result.substr(0, result.length - 1);
    }
    return setProtocol(result, options);
  }
  if (!server) {
    return '';
  }
  const { url='' } = server;
  let result = url;
  if (version && result) {
    result = result.replace('{version}', version);
  }
  if (result.endsWith('/')) {
    result = result.substr(0, result.length - 1);
  }
  return setProtocol(result, options);
}

/**
 * Computes the base URI value for the API/endpoint/operation.
 * 
 * @param options The computation options
 * @returns Base uri value. Can be empty string.
 */
export function computeEndpointUri(options: ComputeBaseUriOptions={}): string {
  let result = computeApiBaseUri(options);
  if (options.endpoint) {
    let { path='' } = options.endpoint;
    if (path[0] !== '/') {
      path = `/${path}`;
    }
    result += path;
  }
  if (!result) {
    result = '(unknown path)';
  }
  return result;
}

/**
 * @param str A key or value to encode as x-www-form-urlencoded.
 * @param replacePlus When set it replaces `%20` with `+`.
 */
export function wwwFormUrlEncode(str: string, replacePlus: boolean): string {
  // Spec says to normalize newlines to \r\n and replace %20 spaces with +.
  // jQuery does this as well, so this is likely to be widely compatible.
  if (!str) {
    return '';
  }
  let result = encodeURIComponent(str.toString().replace(/\r?\n/g, '\r\n'));
  if (replacePlus) {
    result = result.replace(/%20/g, '+');
  }
  return result;
}

/**
 * Creates a RegExp object to replace template variable from the base string
 * @param name Name of the parameter to be replaced
 */
function createUrlReplaceRegex(name: string): RegExp {
  if (name[0] === '+' || name[0] === '#') {
    // eslint-disable-next-line no-param-reassign
    name = `\\${name}`;
  }
  return new RegExp(`{${name}}`, 'g');
}

/**
 * @param url The current URL
 * @param variables The path variables to apply.
 * @param encode Whether to encode parameters.
 */
export function applyUrlVariables(url: string, variables: Record<string, any>, encode: boolean): string {
  let result = url || '';
  Object.keys(variables).forEach((variable) => {
    let value = variables[variable];
    if (value === undefined) {
      return;
    }
    value = String(value);
    if (value === '') {
      // this is to leave the URL template value in the URL so the validators
      // can report an error.
      return;
    }
    if (encode) {
      if (variable[0] === '+' || variable[0] === '#') {
        value = encodeURI(value);
      } else {
        value = wwwFormUrlEncode(value, false);
      }
    }
    const r = createUrlReplaceRegex(variable);
    result = result.replace(r, String(value));
  });
  return result;
}

/**
 * @param params The query parameters to use to generate the query string.
 * @param encode Whether to encode query parameters.
 * @returns The query string.
 */
function generateQueryString(params: Record<string, any>, encode: boolean): string {
  if (typeof params !== 'object') {
    return '';
  }
  const parts: string[] = [];
  function addPart(name: string, value: any): void {
    if (value === undefined) {
      value = '';
    } else {
      value = String(value);
    }
    if (encode) {
      name = wwwFormUrlEncode(name, true);
      value = wwwFormUrlEncode(value, true);
    }
    parts.push(`${name}=${value}`);
  }
  Object.keys(params).forEach((key) => {
    const value = params[key];
    if (Array.isArray(value)) {
      value.forEach((v) => {
        let arrayValue = v;
        if (Array.isArray(arrayValue)) {
          arrayValue = arrayValue.join(',');
        }
        addPart(key, arrayValue);
      });
    } else {
      addPart(key, value);
    }
  });
  return parts.join('&');
}

/**
 * @param url The current URL
 * @param params The query parameters to apply.
 * @param encode Whether to encode parameters.
 */
export function applyUrlParameters(url: string, params: Record<string, any>, encode: boolean): string {
  const query = generateQueryString(params, encode);
  if (!query) {
    return url;
  }
  let result = url || '';
  result += (result.indexOf('?') === -1) ? '?' : '&';
  result += query;
  return result;
}

/**
 * Applies query parameter values to an object.
 * Repeated parameters will have array value instead of string value.
 *
 * @param param Query parameter value as string. Eg `name=value`
 * @param obj Target for values
 */
export function applyQueryParamStringToObject(param: string, obj: Record<string, string|string[]>): void {
  if (!param || !obj || typeof param !== 'string') {
    return;
  }
  const parts = param.split('=');
  const name = parts[0];
  if (name in obj) {
    if (!Array.isArray(obj[name])) {
      obj[name] = [obj[name] as string];
    }
    (obj[name] as string[]).push(parts[1]);
  } else {
    obj[name] = parts[1];
  }
}
