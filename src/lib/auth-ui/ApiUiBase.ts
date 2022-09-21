/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable class-methods-use-this */
import AuthUiBase from "@advanced-rest-client/base/src/elements/authorization/ui/AuthUiBase.js";
import '@anypoint-web-components/awc/anypoint-dropdown-menu.js';
import '@anypoint-web-components/awc/anypoint-listbox.js';
import '@anypoint-web-components/awc/anypoint-item.js';
import '@anypoint-web-components/awc/anypoint-input.js';
import '@anypoint-web-components/awc/anypoint-checkbox.js';
import '@anypoint-web-components/awc/anypoint-button.js';
import '@anypoint-web-components/awc/anypoint-icon-button.js';
import '@advanced-rest-client/icons/arc-icon.js';
import { AmfParameterMixin } from '../AmfParameterMixin.js';
import { ApiParametrizedSecurityScheme } from "../../helpers/api.js";

const securityValue = Symbol("securityValue");

export default class ApiUiBase extends AmfParameterMixin(AuthUiBase) {
  [securityValue]?: ApiParametrizedSecurityScheme;
  
  get security(): ApiParametrizedSecurityScheme | undefined {
    return this[securityValue];
  }

  set security(value: ApiParametrizedSecurityScheme | undefined) {
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
