export const EventTypes = Object.freeze({
  Security: Object.freeze({
    settingsChanged: 'securitysettingsinfochanged',
    get: 'amfstoresecurityget',
    getRequirement: 'amfstoresecuritygetrequirement',
    list: 'amfstoresecuritylist',
  }),
  Request: Object.freeze({
    apiRequest: 'apirequest',
    apiRequestLegacy: 'api-request',
    abortApiRequest: 'apiabort',
    abortApiRequestLegacy: 'abort-api-request',
    apiResponse: 'apiresponse',
    apiResponseLegacy: 'api-response',
    redirectUriChange: 'oauth2redirecturichange',
    redirectUriChangeLegacy: 'oauth2-redirect-uri-changed',
    populateAnnotatedFields: 'populateannotatedfields',
    populateAnnotatedFieldsLegacy: 'populate_annotated_fields',
    get: 'amfstorerequestget',
  }),
  Response: Object.freeze({
    get: 'amfstoreresponseget',
  }),
  Payload: Object.freeze({
    get: 'amfstorepayloadget',
  }),
  Server: Object.freeze({
    serverChange: 'apiserverchanged',
    serverCountChange: 'serverscountchanged',
    query: 'apistoreserverquery',
  }),
  Api: Object.freeze({
    summary: 'amfstoreapisummary',
    protocols: 'amfstoreapiprotocols',
    version: 'amfstoreapiversion',
    documentMeta: 'amfstoredocumentmeta',
  }),
  Navigation: Object.freeze({
    apiNavigate: 'apinavigate',
    navigateExternal: 'apinavigateexternal',
  }),
  Endpoint: Object.freeze({
    get: 'amfstoreendpointget',
    byPath: 'amfstoreendpointbypath',
    list: 'amfstoreendpointlist',
  }),
  Operation: Object.freeze({
    get: 'amfstoreopget',
    getParent: 'amfstoreopgetparent',
  }),
  Reporting: Object.freeze({
    error: 'apierror',
  }),
  Telemetry: Object.freeze({
    view: 'telemetryscreenview',
    event: 'telemetryevent',
    exception: 'telemetryexception',
    social: 'telemetrysocial',
    timing: 'telemetrytiming',
  }),
  Store: Object.freeze({
    graphChange: 'apistoregraphchange',
  }),
  Documentation: Object.freeze({
    get: 'amfstoredocumentationget',
    list: 'amfstoredocumentationlist',
  }),
  Type: Object.freeze({
    get: 'amfstoretypeget',
    list: 'amfstoretypelist',
  }),
});
