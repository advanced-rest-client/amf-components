/* eslint-disable class-methods-use-this */
import { TemplateResult, CSSResult } from 'lit';
import { ApiDefinitions, AmfNamespace } from '@api-client/core/build/browser.js';
import ApiSecurityDocumentElement, {
  settingsTemplate,
  apiKeySettingsTemplate,
  openIdConnectSettingsTemplate,
  oAuth2SettingsTemplate,
} from "./ApiSecurityDocumentElement.js";
import elementStyles from './styles/ParametrizedSecurityElement.js';

export const settingsIdValue = Symbol('settingsIdValue');
export const querySettings = Symbol('querySettings');
export const settingsValue = Symbol('settingsValue');
export const mergeSettings = Symbol('mergeSettings');

export default class ApiParametrizedSecuritySchemeElement extends ApiSecurityDocumentElement {
  static get styles(): CSSResult[] {
    return [...super.styles, elementStyles];
  }

  [settingsValue]: ApiDefinitions.IApiSecuritySettingsUnion | undefined;

  get settings(): ApiDefinitions.IApiSecuritySettingsUnion | undefined {
    return this[settingsValue];
  }

  set settings(value) {
    const old = this[settingsValue];
    if (old === value) {
      return;
    }
    this[settingsValue] = value;
    this.requestUpdate();
  }

  /**
   * @returns The template for the security settings, when required.
   */
  [settingsTemplate](scheme: ApiDefinitions.IApiSecurityScheme): TemplateResult | string {
    const appliedSettings = this[settingsValue];
    if (!appliedSettings) {
      return super[settingsTemplate](scheme);
    }
    const { settings } = scheme;
    if (!settings) {
      return '';
    }
    const { types } = settings;
    const mergedSettings = this[mergeSettings](appliedSettings, settings);

    if (types.includes(AmfNamespace.aml.vocabularies.security.ApiKeySettings)) {
      return this[apiKeySettingsTemplate](mergedSettings);
    }
    if (types.includes(AmfNamespace.aml.vocabularies.security.OpenIdConnectSettings)) {
      return this[openIdConnectSettingsTemplate](mergedSettings);
    }
    if (types.includes(AmfNamespace.aml.vocabularies.security.OAuth2Settings)) {
      return this[oAuth2SettingsTemplate](mergedSettings as ApiDefinitions.IApiSecurityOAuth2Settings);
    }
    return '';
  }

  /**
   * @param applied The settings applied to the current object
   * @param scheme The settings defined in the scheme
   * @returns The merged settings to render.
   */
  [mergeSettings](applied: ApiDefinitions.IApiSecuritySettingsUnion, scheme: ApiDefinitions.IApiSecuritySettingsUnion): ApiDefinitions.IApiSecuritySettingsUnion {
    const result = { ...scheme } as ApiDefinitions.IApiSecuritySettingsUnion;
    Object.keys(applied).forEach((key) => {
      if (['id', 'types', 'additionalProperties'].includes(key)) {
        return;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      result[key as keyof ApiDefinitions.IApiSecuritySettingsUnion] = (applied as any)[key];
    });
    return result;
  }
}
