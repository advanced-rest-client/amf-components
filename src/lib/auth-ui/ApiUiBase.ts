/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable class-methods-use-this */
import { ApiDefinitions } from '@api-client/core/build/browser.js';
import AuthUiBase from "@advanced-rest-client/base/src/elements/authorization/ui/AuthUiBase.js";
import '@anypoint-web-components/awc/dist/define/anypoint-dropdown-menu.js';
import '@anypoint-web-components/awc/dist/define/anypoint-listbox.js';
import '@anypoint-web-components/awc/dist/define/anypoint-item.js';
import '@anypoint-web-components/awc/dist/define/anypoint-input.js';
import '@anypoint-web-components/awc/dist/define/anypoint-checkbox.js';
import '@anypoint-web-components/awc/dist/define/anypoint-button.js';
import '@anypoint-web-components/awc/dist/define/anypoint-icon-button.js';
import '@advanced-rest-client/icons/arc-icon.js';
import { AmfParameterMixin } from '../AmfParameterMixin.js';

const securityValue = Symbol("securityValue");

export default class ApiUiBase extends AmfParameterMixin(AuthUiBase) {
  [securityValue]?: ApiDefinitions.IApiParametrizedSecurityScheme;
  
  get security(): ApiDefinitions.IApiParametrizedSecurityScheme | undefined {
    return this[securityValue];
  }

  set security(value: ApiDefinitions.IApiParametrizedSecurityScheme | undefined) {
    const old = this[securityValue];
    if (old === value) {
      return;
    }
    this[securityValue] = value;
    this.initializeApiModel();
  }

  /**
   * To be implemented by the child classes.
   * Called when the `security` value change. Should be used
   * to initialize the UI after setting AMF models.
   */
  initializeApiModel(): void {
    // ...
  }

  /**
   * Updates, if applicable, query parameter value.
   *
   * This does nothing if the query parameter has not been defined for the current
   * scheme.
   *
   * @param name The name of the changed parameter
   * @param newValue A value to apply. May be empty but must be defined.
   */
  updateQueryParameter(name: string, newValue: string): void {
    // ...
  }

  /**
   * Updates, if applicable, header value.
   * This is supported for RAML custom scheme and Pass Through
   * that operates on headers model which is only an internal model.
   *
   * This does nothing if the header has not been defined for current
   * scheme.
   *
   * @param name The name of the changed header
   * @param newValue A value to apply. May be empty but must be defined.
   */
  updateHeader(name: string, newValue: string): void {
    // ...
  }

  /**
   * Updates, if applicable, cookie value.
   * This is supported in OAS' Api Key.
   *
   * This does nothing if the cookie has not been defined for current
   * scheme.
   *
   * @param name The name of the changed cookie
   * @param newValue A value to apply. May be empty but must be defined.
   */
  updateCookie(name: string, newValue: string): void {
    // ...
  }

  /**
   * To be implemented by the child classes.
   * @returns True when the UI is in valid state.
   */
  validate(): boolean {
    return true;
  }
}
