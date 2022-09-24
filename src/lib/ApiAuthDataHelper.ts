/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable no-param-reassign */
import { AuthUiDataHelper, AuthUiInit } from '@advanced-rest-client/base/api.js';
import CustomAuth from './auth-ui/CustomAuth.js';
import ApiKeyAuth from './auth-ui/ApiKeyAuth.js';
import PassThroughAuth from './auth-ui/PassThroughAuth.js';
import OAuth2Auth from './auth-ui/OAuth2Auth.js';
import ApiAuthorizationMethodElement from '../elements/ApiAuthorizationMethodElement.js';

export class ApiAuthDataHelper extends AuthUiDataHelper {
  static setupCustom(element: ApiAuthorizationMethodElement, init: AuthUiInit): CustomAuth {
    const i = new CustomAuth(init);
    i.security = element.security;
    i.descriptionOpened = element.descriptionOpened;
    i.globalCache = element.globalCache;
    i.anypoint = element.anypoint;
    return i;
  }

  static populateCustom(element: ApiAuthorizationMethodElement, ui: CustomAuth): void {
    // ...
  }

  static setupApiKey(element: ApiAuthorizationMethodElement, init: AuthUiInit): ApiKeyAuth {
    const i = new ApiKeyAuth(init);
    i.security = element.security;
    i.globalCache = element.globalCache;
    return i;
  }

  static populateApiKey(element: ApiAuthorizationMethodElement, ui: ApiKeyAuth): void {
    // ...
  }

  static setupPassThrough(element: ApiAuthorizationMethodElement, init: AuthUiInit): PassThroughAuth {
    const i = new PassThroughAuth(init);
    i.security = element.security;
    i.descriptionOpened = element.descriptionOpened;
    i.globalCache = element.globalCache;
    i.anypoint = element.anypoint;
    return i;
  }

  static populatePassThrough(element: ApiAuthorizationMethodElement, ui: PassThroughAuth): void {
    // ...
  }

  static setupOauth2(element: ApiAuthorizationMethodElement, init: AuthUiInit): OAuth2Auth {
    const i = new OAuth2Auth(init);
    i.security = element.security;
    i.globalCache = element.globalCache;
    AuthUiDataHelper.setOAuth2Values(element, init);
    return i;
  }
}
