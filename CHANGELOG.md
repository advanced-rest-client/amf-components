# Changelog

## ApiResourceDocumentElement (former api-endpoint-documentation)

The `api-resource-document` element has the following properties changes compared to deprecated `api-endpoint-documentation`

- `noTryIt` is renamed to `tryItButton`. When `tryItButton` is set then the try it button in operations is rendered.
- `inlineMethods` is renamed to `tryItPanel`. Has the same function.
- `noUrlEditor` is now renamed to `urlEditor`. When `urlEditor` is set then the HTTP request editor renders the URL editor input field.

## ApiOperationDocumentElement (former api-operation-documentation)

- `tryIt` is renamed to `tryItButton`
- `tryItButton` is always set to `false` when `tryItPanel` is set on the resource document element.

## Authorization

### Configuration and HTTP request

The authorization has been moved into this library and has a new API surface.

The request object generated by the request editor has a new `authorization` property (`auth` in version 0.2.0).
It is a list of authorization settings defined by the user and/or the API.

By default the application that hosts the element must apply the authorization setting to the request. When the `applyAuthorization` property is set on the editor / panel then before dispatching the request authorization configuration is applied to the HTTP message (headers, URL). When applying the configuration to the request object, it sets the `enabled` property of the authorization settings object to `false`. Any processor that handled the request event should not process authorization values that are not enabled.

To maximize the compatibility with 0.2.0 use the following configuration:

```html
<api-request-editor
  applyAuthorization
></api-request-editor>
```

## Caching values

The editor has a new boolean property `globalCache`. Once set it instruct the caching mechanism to cache user input in memory. The cached values are kept in memory even when API spec change.
Use the `src/lib/InputCache.js` class to manipulate the cache programmatically when needed.

When the `globalCache` is not set then the values are stored in a reference to the editor element. After removing the element from the DOM all cached properties are GC'd.

## Request editor

### Refactor

- `serializeRequest()` -> `serialize()`
- removed option `allowDisableParams`

### Setting URL values (baseUri, protocols, server)

With version `0.2.x` it was possible to set `server`, `baseUri`, and `protocols` properties so the component is able to compute the endpoint URL without having the `server` value read from the AMF graph model. This turned out to be a feature that is not used so it is removed in `0.3.0`. Use `baseUri` to override any value defined in the servers.
Note, when `baseUri` is set it takes precedence over any other URI configuration (like a selected server).

## URL editor

The URL editor is optional by default. The input won't be rendered until the `urlEditor` property is set.
For a better user experience do not set this option unless crucial for the application. To give user a feedback when updating parameters use option `urlLabel`.

Additionally, the user entered values are now updated on input value change rather than user input. This reduces UI changes (especially with URL editor enabled) while typing value into the editor.

## Body editor

The body editor has been re-created from scratch. The new editor uses monaco editor to render the body input.
This requires loading monaco environment before the editor is rendered and activated.

Use the `MonacoLoader` class from the `@advanced-rest-client/monaco-support` package to load the editor with the required dependencies.

```javascript
import { MonacoLoader } from '@advanced-rest-client/monaco-support';

// the base path from the current location to the editor location.
const base = `../node_modules/monaco-editor/`;
MonacoLoader.createEnvironment(base); // creates an environment to load the dependencies
await MonacoLoader.loadMonaco(base); // initializes the monaco editor.
await MonacoLoader.monacoReady(); // waits until all libraries are loaded.
```

Note, Monaco does not support encapsulation. Once loaded a global `Monaco` variable is created.

## Events

With this version the following events are deprecated:

- ~~api-request~~
- ~~abort-api-request~~
- ~~api-response~~

All DOM event types should be lowercase [a-z] names. This version dispatches both new and old events. The deprecated events will be removed in the future.

Use the following evens instead:

- `apirequest`
- `apiabort`
- `apiresponse`

Also, use the `src/events/EventTypes.js` and `src/events/RequestEvents.js` definitions to dispatch or handle the events:

```javascript
import { EventTypes, RequestEvents } from '@api-components/api-request';

// handle a request event
window.addEventListener(EventTypes.Request.apiRequest, (e) => {
  console.log(e.detail);
});

// dispatch the request event
RequestEvents.apiRequest(window, { /* the request definition */ });
```

## Tests

The tests for Firefox currently fails because `playwright` uses a previous version of the browser which has no support for ES modules in web workers. However, the current version support them. Firefox is temporarily removed from tests.