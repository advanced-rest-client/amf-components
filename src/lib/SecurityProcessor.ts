import { Headers, UrlParser, AuthorizationUtils, ApiDefinitions } from '@api-client/core/build/browser.js';
import { BasicAuthorization, OidcAuthorization, OAuth2Authorization, BearerAuthorization, RamlCustomAuthorization, ApiKeyAuthorization, PassThroughAuthorization } from '@advanced-rest-client/events/src/authorization/Authorization.js';
import { RequestAuthorization } from '@advanced-rest-client/events/src/request/ArcRequest.js';
import {
  METHOD_CUSTOM,
  METHOD_PASS_THROUGH,
  METHOD_API_KEY,
} from '../elements/ApiAuthorizationMethodElement.js';
import { ApiConsoleRequest, SecuritySelectorListItem } from '../types.js';

/**
 * Applies a map of query parameters to the request object.
 * @param request The request object
 * @param params A map of query parameters to apply to the request
 */
function applyQueryParams(request: ApiConsoleRequest, params?: Record<string, string>): void {
  if (typeof params !== 'object') {
    return;
  }
  const keys = Object.keys(params);
  if (!keys.length) {
    return;
  }
  const parser = new UrlParser(request.url);
  const sParams = parser.searchParams as string[][];
  keys.forEach((name) => {
    const value = params[name];
    const index = sParams.findIndex((item) => item[0] === name);
    if (index !== -1) {
      sParams.splice(index, 1);
    }
    sParams.push([name, value]);
  });
  parser.searchParams = sParams;
  request.url = parser.toString();
}

/**
 * Applies a map of headers to the request object.
 * @param request The request object
 * @param headers A map of headers to apply to the request
 */
function applyHeaders(request: ApiConsoleRequest, headers?: Record<string, string>): void {
  if (typeof headers !== 'object') {
    return;
  }
  const keys = Object.keys(headers);
  if (!keys.length) {
    return;
  }
  const parser = new Headers(request.headers || '');
  keys.forEach((name) => {
    const value = headers[name];
    parser.append(name, value);
  });
  request.headers = parser.toString();
}

export class SecurityProcessor {
  static readSecurityList(security: ApiDefinitions.IApiSecurityRequirement[]): SecuritySelectorListItem[] {
    const result: SecuritySelectorListItem[] = []
    if (!Array.isArray(security) || !security.length) {
      return result;
    }
    security.forEach((item) => {
      const { schemes } = item;
      if (!Array.isArray(schemes)) {
        return;
      }
      result.push(SecurityProcessor.readSecurityListItem(item));
    });
    return result;
  }

  static readSecurityListItem(item: ApiDefinitions.IApiSecurityRequirement): SecuritySelectorListItem {
    const { schemes } = item;
    const result: SecuritySelectorListItem = {
      types: [],
      labels: [],
      security: item,
    };
    schemes.forEach((scheme) => {
      const { name, scheme: settings } = scheme;
      if (name === 'null') {
        // RAML allows to define a "null" scheme. This means that the authorization
        // for this endpoint is optional.
        result.types.push(undefined);
        result.labels.push('No authorization');
        return;
      }
      const label = name || settings && settings.name;
      const type = settings && settings.type;
      result.types.push(type);
      result.labels.push(label);
    });
    return result;
  }

  /**
   * Applies authorization configuration to the API Console request object.
   */
  static applyAuthorization(request: ApiConsoleRequest, authorization: RequestAuthorization[]): void {
    if (!Array.isArray(authorization) || !authorization.length) {
      return;
    }

    for (const auth of authorization) {
      if (!auth.enabled || !auth.config) {
        continue;
      }
      switch (AuthorizationUtils.normalizeType(auth.type)) {
        case AuthorizationUtils.METHOD_BASIC: 
          SecurityProcessor.applyBasicAuth(request, (auth.config as BasicAuthorization));
          auth.enabled = false; 
          break;
        case AuthorizationUtils.METHOD_OAUTH2: 
          SecurityProcessor.applyOAuth2(request, (auth.config as OAuth2Authorization)); 
          auth.enabled = false;
          break;
        case AuthorizationUtils.METHOD_OIDC: 
          SecurityProcessor.applyOpenId(request, (auth.config as OidcAuthorization)); 
          auth.enabled = false;
          break;
        case AuthorizationUtils.METHOD_BEARER: 
          SecurityProcessor.applyBearer(request, (auth.config as BearerAuthorization)); 
          auth.enabled = false;
          break;
        case METHOD_CUSTOM: 
          SecurityProcessor.applyCustomAuth(request, (auth.config as RamlCustomAuthorization)); 
          auth.enabled = false;
          break;
        case METHOD_API_KEY: 
          SecurityProcessor.applyApiKeys(request, (auth.config as ApiKeyAuthorization)); 
          auth.enabled = false;
          break;
        case METHOD_PASS_THROUGH: 
          SecurityProcessor.applyPassThrough(request, (auth.config as PassThroughAuthorization)); 
          auth.enabled = false;
          break;
        // case METHOD_OAUTH1:
        //   SecurityProcessor.applyOAuth1(request, (auth.config as OAuth1Authorization)); 
        //   auth.enabled = false;
        //   break;
        default:
      }
    }
  }

  /**
   * Injects basic auth header into the request headers.
   */
  static applyBasicAuth(request: ApiConsoleRequest, config: BasicAuthorization): void {
    const { username, password } = config;
    if (!username) {
      return;
    }
    const value = btoa(`${username}:${password || ''}`);

    const headers = new Headers(request.headers || '');
    headers.append('authorization', `Basic ${value}`);
    request.headers = headers.toString();
  }

  /**
   * Injects oauth 2 auth header into the request headers.
   */
  static applyOAuth2(request: ApiConsoleRequest, config: OAuth2Authorization): void {
    const { accessToken, tokenType='Bearer', deliveryMethod='header', deliveryName='authorization' } = config;
    if (!accessToken) {
      return;
    }
    const value = `${tokenType} ${accessToken}`;
    if (deliveryMethod === 'header') {
      const headers = new Headers(request.headers || '');
      headers.append(deliveryName, value);
      request.headers = headers.toString();
    } else if (deliveryMethod === 'query') {
      const { url } = request;
      try {
        const parsed = new URL(url);
        parsed.searchParams.append(deliveryName, value);
        request.url = parsed.toString();
      } catch (e) {
        // ...
      }
    }
  }

  /**
   * Injects OpenID Connect auth header into the request headers.
   */
  static applyOpenId(request: ApiConsoleRequest, config: OidcAuthorization): void {
    const { accessToken } = config;
    if (accessToken) {
      SecurityProcessor.applyOAuth2(request, config);
    }
    // todo - if AT is missing find the current token from the tokens list in the passed configuration.
    // Currently the authorization method UI sets the token when the requests is generated so it's not as much important.
  }

  /**
   * Injects bearer auth header into the request headers.
   */
  static applyBearer(request: ApiConsoleRequest, config: BearerAuthorization): void {
    const { token } = config;
    const value = `Bearer ${token}`;

    const headers = new Headers(request.headers || '');
    headers.append('authorization', value);
    request.headers = headers.toString();
  }

  /**
   * Injects the RAML custom configuration into the request
   */
  static applyCustomAuth(request: ApiConsoleRequest, config: RamlCustomAuthorization): void {
    const { header, query } = config;
    applyQueryParams(request, query);
    applyHeaders(request, header);
  }

  /**
   * Injects the ApiKey configuration into the request
   */
  static applyApiKeys(request: ApiConsoleRequest, config: ApiKeyAuthorization): void {
    const { header, query, } = config;
    applyQueryParams(request, query);
    applyHeaders(request, header);
  }

  /**
   * Injects the PassThrough configuration into the request
   */
  static applyPassThrough(request: ApiConsoleRequest, config: PassThroughAuthorization): void {
    const { header, query, } = config;
    applyQueryParams(request, query);
    applyHeaders(request, header);
  }

  /*
  @jarrodek The OAuth1 logic is enclosed in a custom element.
  I don't want to move it to a separate class and maintain to be
  able to apply here OAuth 1. So far we have no usage signs from anyone
  (and it's been years since this logic works here).
  If there's a request from a customer, in the `@advanced-rest-client/base`
  module create a class that extracts the logic from the oauth 1 component 
  and sign the request.
  */

  // /**
  //  * Signs the OAuth 1 request.
  //  * @param {ApiConsoleRequest} request 
  //  * @param {OAuth1Authorization} config 
  //  */
  // static applyOAuth1(request: ApiConsoleRequest, config: OAuth1Authorization): void {
    // ...
  // }
}
