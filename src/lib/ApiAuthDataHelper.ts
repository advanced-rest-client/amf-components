/* eslint-disable no-unused-vars */
/* eslint-disable no-param-reassign */
import { AuthUiDataHelper, AuthUiInit } from '@advanced-rest-client/base/api.js';
import CustomAuth from './auth-ui/CustomAuth.js';
import ApiKeyAuth from './auth-ui/ApiKeyAuth.js';
import PassThroughAuth from './auth-ui/PassThroughAuth.js';
import OAuth2Auth from './auth-ui/OAuth2Auth.js';

/** @typedef {import('../elements/ApiAuthorizationMethodElement').default} ApiAuthorizationElement */

export class ApiAuthDataHelper extends AuthUiDataHelper {
  static setupCustom(element: ApiAuthorizationElement, init: AuthUiInit): CustomAuth {
    const i = new CustomAuth(init);
    i.security = element.security;
    i.descriptionOpened = element.descriptionOpened;
    i.globalCache = element.globalCache;
    i.anypoint = element.anypoint;
    return i;
  }

  static populateCustom(element: ApiAuthorizationElement, ui: CustomAuth): void {
    // ...
  }

  static setupApiKey(element: ApiAuthorizationElement, init: AuthUiInit): ApiKeyAuth {
    const i = new ApiKeyAuth(init);
    i.security = element.security;
    i.globalCache = element.globalCache;
    return i;
  }

  static populateApiKey(element: ApiAuthorizationElement, ui: ApiKeyAuth): void {
    // ...
  }

  static setupPassThrough(element: ApiAuthorizationElement, init: AuthUiInit): PassThroughAuth {
    const i = new PassThroughAuth(init);
    i.security = element.security;
    i.descriptionOpened = element.descriptionOpened;
    i.globalCache = element.globalCache;
    i.anypoint = element.anypoint;
    return i;
  }

  static populatePassThrough(element: ApiAuthorizationElement, ui: PassThroughAuth): void {
    // ...
  }

  static setupOauth2(element: ApiAuthorizationElement, init: AuthUiInit): OAuth2Auth {
    const i = new OAuth2Auth(init);
    i.security = element.security;
    i.globalCache = element.globalCache;
    AuthUiDataHelper.setOAuth2Values(element, init);
    return i;
  }
}
