/* eslint-disable default-param-last */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-plusplus */
/* eslint-disable no-continue */

/**
@license
Copyright 2018 The Advanced REST client authors <arc@mulesoft.com>
Licensed under the Apache License, Version 2.0 (the "License"); you may not
use this file except in compliance with the License. You may obtain a copy of
the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
License for the specific language governing permissions and limitations under
the License.
*/
// @ts-ignore
import { AmfModelExpander, JsonLdOptions, JsonLd } from 'amf-json-ld-lib';
import { dedupeMixin } from '@open-wc/dedupe-mixin';
import { ns as Namespace } from './Namespace.js';
import {
  AmfDocument, AsyncApi, DomainElement, EndPoint, Operation, Parameter, Payload, Request, Response,
  SecurityScheme, Server, Shape, WebApi, Api
} from './amf.js';
import { ServersQueryOptions } from './api.js';

/** @typedef {import('./Namespace').ns} Namespace */
/** @typedef {import('./amf').DomainElement} DomainElement */
/** @typedef {import('./amf').AmfDocument} AmfDocument */
/** @typedef {import('./amf').WebApi} WebApi */
/** @typedef {import('./amf').AsyncApi} AsyncApi */
/** @typedef {import('./amf').Server} Server */
/** @typedef {import('./amf').EndPoint} EndPoint */
/** @typedef {import('./amf').Operation} Operation */
/** @typedef {import('./amf').Shape} Shape */
/** @typedef {import('./amf').Parameter} Parameter */
/** @typedef {import('./amf').Request} Request */
/** @typedef {import('./amf').Response} Response */
/** @typedef {import('./amf').Payload} Payload */
/** @typedef {import('./amf').SecurityScheme} SecurityScheme */
/** @typedef {import('./api').ServersQueryOptions} ServersQueryOptions */
/** @typedef {import('./api').ServerQueryOptions} ServerQueryOptions */
/** @typedef {import('./api').ComputeUriOptions} ComputeUriOptions */

export const expandKey = Symbol('expandKey');
export const findAmfType = Symbol('findAmfType');
export const findReferenceObject = Symbol('findReferenceObject');
export const getArrayItems = Symbol('getArrayItems');
export const computeReferenceSecurity = Symbol('computeReferenceSecurity');

type Constructor<T = {}> = new (...args: any[]) => T;

/**
 * Common functions used by AMF components to compute AMF values.
 */
export interface AmfHelperMixinInterface {
  /**
   * A namespace for AMF model.
   */
  readonly ns: typeof Namespace;

  /**
   * Generated AMF json/ld model form the API spec.
   * The element assumes the object of the first array item to be a
   * type of `"http://raml.org/vocabularies/document#Document`
   * on AMF vocabulary.
   *
   * It is only useful for the element to resolve references.
   */
  amf: AmfDocument | undefined;
  _amf: AmfDocument | undefined;

  /**
   * This is an abstract method to be implemented by the components.
   * If, instead, the component uses `amf` setter you must use `super.amf` to
   * set the value.
   * @param amf Current AMF model. Can be undefined.
   */
  __amfChanged(amf: AmfDocument): void
  /**
   * Expands flattened AMF model
   */
  _expand(amf: any): AmfDocument;

  /**
   * Returns compact model key for given value.
   *
   * @param property AMF original property
   * @param context A context to use. If not set, it looks for the context of the passed model
   * @returns Compact model property name or the same value if
   * value not found in the context.
   */
  _getAmfKey(property: string | undefined, context?: Record<string, string>): string | undefined;

  /**
   * Ensures that the model is AMF object.
   *
   * @param amf AMF json/ld model
   * @returns API spec
   */
  _ensureAmfModel(amf: any): AmfDocument | undefined;

  /**
   * Ensures that the value is an array.
   * It returns undefined when there's no value.
   * It returns the same array if the value is already an array.
   * It returns new array of the item is not an array.
   *
   * @param value An item to test
   */
  _ensureArray<T>(value: T): T[] | undefined;

  /**
   * Ensures that the value is an array.
   * It returns undefined when there's no value.
   * It returns the same array if the value is already an array.
   * It returns new array of the item is not an array.
   *
   * @param value An item to test
   */
  _ensureArray<T>(value: T[]): T[] | undefined;

  /**
   * Gets a single scalar value from a model.
   *
   * @param model Amf model to extract the value from.
   * @param key Model key to search for the value
   * @param context A context to use. If not set, it looks for the context of the passed model
   * @returns Value for key
   */
  _getValue(model: DomainElement, key: string, context?: Record<string, string>): string | number | boolean | undefined | null;

  /**
   * Gets values from a model as an array of `@value` properties.
   *
   * @param model Amf model to extract the value from.
   * @param key Model key to search for the value
   * @param context A context to use. If not set, it looks for the context of the passed model
   * @returns Value for key
   */
  _getValueArray(model: DomainElement, key: string, context?: Record<string, string>): Array<string | number | boolean | null> | undefined;

  /**
   * Reads an array from the model.
   * 
   * @param model Amf model to extract the value from.
   * @param key Model key to search for the value
   * @param context A context to use. If not set, it looks for the context of the passed model
   * @returns Value for the key
   */
  [getArrayItems](model: DomainElement, key: string, context?: Record<string, string>): DomainElement[] | undefined;

  /**
   * Reads the value of the `@id` property.
   * @param model Amf model to extract the value from.
   * @param key Model key to search for the @id
   * @param context A context to use. If not set, it looks for the context of the passed model
   */
  _getLinkValue(model: DomainElement, key: string, context?: Record<string, string>): string | undefined;

  /**
   * Reads the list of value for the `@id` property.
   * @param model Amf model to extract the value from.
   * @param key Model key to search for the `@id`
   * @param context A context to use. If not set, it looks for the context of the passed model
   */
  _getLinkValues(model: DomainElement, key: string, context?: Record<string, string>): string[] | undefined;

  /**
   * Checks if a model has a type.
   *
   * @param model Model to test
   * @param type Type name
   * @param context A context to use. If not set, it looks for the context of the passed model
   * @returns True if model has a type.
   */
  _hasType(model: DomainElement, type: string, context?: Record<string, string>): boolean | null;

  /**
   * Checks if a shape has a property.
   *
   * @param shape The shape to test
   * @param key Property name to test
   * @param context A context to use. If not set, it looks for the context of the passed model
   */
  _hasProperty(shape: DomainElement, key: string, context?: Record<string, string>): boolean | null;

  /**
   * Computes array value of a property in a model (shape).
   *
   * @param shape AMF shape object
   * @param key Property name
   * @param context A context to use. If not set, it looks for the context of the passed model
   */
  _computePropertyArray(shape: DomainElement, key: string, context?: Record<string, string>): Array<string | number | boolean | null | Object> | undefined;

  /**
   * Computes API version from the AMF model.
   */
  _computeApiVersion(amf: AmfDocument, context?: Record<string, string>): string | undefined;

  /**
   * Computes model's `encodes` property.
   *
   * @param model AMF data model
   * @param context A context to use. If not set, it looks for the context of the passed model
   * @returns List of encodes
   */
  _computeEncodes(model: AmfDocument, context?: Record<string, string>): Api | undefined;

  /**
   * Computes list of declarations in the AMF api model.
   *
   * @param model AMF json/ld model for an API
   * @param context A context to use. If not set, it looks for the context of the passed model
   * @returns List of declarations
   */
  _computeDeclares(model: AmfDocument, context?: Record<string, string>): DomainElement[] | undefined;

  /**
   * Computes list of references in the AMF api model.
   *
   * @param model AMF json/ld model for an API
   * @param context A context to use. If not set, it looks for the context of the passed model
   * @returns List of declarations
   */
  _computeReferences(model: AmfDocument, context?: Record<string, string>): DomainElement[] | undefined;

  /**
   * Computes AMF's `http://schema.org/WebAPI` model
   *
   * @param model AMF json/ld model for an API
   * @param context A context to use. If not set, it looks for the context of the passed model
   * @returns Web API declaration.
   */
  _computeWebApi(model: AmfDocument, context?: Record<string, string>): WebApi | undefined;

  /**
   * Computes AMF's `http://schema.org/API` model
   *
   * @param model AMF json/ld model for an API
   * @param context A context to use. If not set, it looks for the context of the passed model
   * @return The API declaration.
   */
  _computeApi(model: AmfDocument, context?: Record<string, string>): AsyncApi | WebApi;

  /**
   * Returns whether an AMF node is a WebAPI node
   * 
   * @param model  AMF json/ld model for an API
   * @param context A context to use. If not set, it looks for the context of the passed model
   */
  _isWebAPI(model: AmfDocument, context?: Record<string, string>): boolean;

  /**
   * Returns whether an AMF node is an AsyncAPI node
   * 
   * @param model  AMF json/ld model for an API
   * @param context A context to use. If not set, it looks for the context of the passed model
   */
  _isAsyncAPI(model: AmfDocument, context?: Record<string, string>): boolean;

  /**
   * Returns whether an AMF node is an API node
   * 
   * @param model  AMF json/ld model for an API
   * @param context A context to use. If not set, it looks for the context of the passed model
   */
  _isAPI(model: AmfDocument, context?: Record<string, string>): boolean;

  /**
   * Determines whether a partial model is valid for reading servers from
   * Current valid values:
   * - Operation
   * - Endpoint
   * @param model The partial model to evaluate
   * @param context A context to use. If not set, it looks for the context of the passed model
   * @returns Whether the model's type is part of the array of valid node types from which to read servers
   */
  _isValidServerPartial(model: any, context?: Record<string, string>): boolean;

  /**
   * @param context A context to use. If not set, it looks for the context of the passed model
   * @returns List of servers for method, if defined, or endpoint, if defined, or root level
   */
  _getServers(opts?: ServersQueryOptions, context?: Record<string, string>): Server[] | undefined;

  /**
   * Computes value for the `expects` property.
   *
   * @param method AMF `supportedOperation` model
   * @param context A context to use. If not set, it looks for the context of the passed model
   */
  _computeExpects(method: Operation, context?: Record<string, string>): Request | undefined;

  /**
   * Computes list of endpoints from a WebApi model.
   *
   * @param context A context to use. If not set, it looks for the context of the passed model
   * @returns Always returns an array of endpoints.
   */
  _computeEndpoints(webApi: WebApi, context?: Record<string, string>): EndPoint[] | undefined;

  /**
   * Computes model for an endpoint documentation.
   *
   * @param webApi Current value of `webApi` property
   * @param id Selected shape ID
   * @param context A context to use. If not set, it looks for the context of the passed model
   * @returns An endpoint definition
   */
  _computeEndpointModel(webApi: WebApi, id: string, context?: Record<string, string>): EndPoint | undefined;

  /**
   * Computes method for the method documentation.
   *
   * @param webApi Current value of `webApi` property
   * @param selected Selected shape
   * @param context A context to use. If not set, it looks for the context of the passed model
   * @returns A method definition
   */
  _computeMethodModel(webApi: WebApi, selected: string, context?: Record<string, string>): Operation | undefined;

  /**
   * Computes an endpoint for a method.
   *
   * @param webApi The WebApi AMF model
   * @param methodId Method id
   * @param context A context to use. If not set, it looks for the context of the passed model
   * @returns An endpoint model of undefined.
   */
  _computeMethodEndpoint(webApi: WebApi, methodId: string, context?: Record<string, string>): EndPoint | undefined;

  /**
   * Computes a list of methods for an endpoint that contains a method with
   * given id.
   *
   * @param webApi WebApi model
   * @param methodId Method id.
   * @param context A context to use. If not set, it looks for the context of the passed model
   * @returns A list of sibling methods or undefined.
   */
  __computeMethodsListForMethod(webApi: WebApi, methodId: string, context?: Record<string, string>): Operation[] | undefined;

  /**
   * Computes a type documentation model.
   *
   * @param declares Current value of `declares` property
   * @param references Current value of `references` property
   * @param selected Selected shape
   * @param context A context to use. If not set, it looks for the context of the passed model
   * @returns A type definition
   */
  _computeType(declares: DomainElement[], references: DomainElement[], selected: string, context?: Record<string, string>): Shape | undefined;

  /**
   * Finds a type in the model declares and references.
   * @param domainId The domain id of the type (AMF's shape).
   * @param context A context to use. If not set, it looks for the context of the passed model
   * @returns The AMF shape or undefined when not found.
   */
  [findAmfType](domainId?: string, context?: Record<string, string>): Shape | undefined;

  /**
   * Searches for an object in model's references list.
   * It does not resolve the object (useful for handling links correctly).
   * 
   * @param domainId The domain of the object to find in the references.
   * @param context A context to use. If not set, it looks for the context of the passed model
   * @returns The domain object or undefined.
   */
  [findReferenceObject](domainId?: string, context?: Record<string, string>): DomainElement | undefined;

  /**
   * Computes a type model from a reference (library for example).
   *
   * @param reference AMF model for a reference to extract the data from
   * @param selected Node ID to look for
   * @param context A context to use. If not set, it looks for the context of the passed model
   * @returns Type definition or undefined if not found.
   */
  _computeReferenceType(reference: DomainElement, selected: string, context?: Record<string, string>): Shape | undefined;

  /**
   * Computes a documentation model.
   *
   * @param webApi Current value of `webApi` property
   * @param selected Selected shape
   * @param context A context to use. If not set, it looks for the context of the passed model
   * @returns A method definition
   */
  _computeDocument(webApi: WebApi, selected: string, context?: Record<string, string>): DomainElement | undefined;

  /**
   * Resolves a reference to an external fragment.
   *
   * @param shape A shape to resolve
   * @param context A context to use. If not set, it looks for the context of the passed model
   * @returns Resolved shape.
   */
  _resolve<T>(shape: T, context?: Record<string, string>): T;
  _getLinkTarget(amf: AmfDocument, id: string, context?: Record<string, string>): DomainElement | undefined;

  /**
   * Resolves the shape of a given reference.
   *
   * @param references References object to search in
   * @param id Id of the shape to resolve
   * @param context A context to use. If not set, it looks for the context of the passed model
   * @returns Resolved shape for given reference, undefined otherwise
   */
  _obtainShapeFromReferences(references: DomainElement[], id: string, context?: Record<string, string>): DomainElement | undefined;

  /**
   * Searches a node with a given ID in an array
   *
   * @param array Array to search for a given ID
   * @param id Id to search for
   * @param context A context to use. If not set, it looks for the context of the passed model
   * @returns Node with the given ID when found, undefined otherwise
   */
  _findById(array: DomainElement[], id: string): DomainElement | undefined;
  _getReferenceId(amf: AmfDocument, id: string, context?: Record<string, string>): DomainElement | undefined;
  _resolveRecursive<T>(shape: T, context?: Record<string, string>): T;

  /**
   * Merge two shapes together. If the resulting shape has one of the "special merge" keys,
   * then the special merge function for that key will be used to match that property
   * @param shapeA AMF node
   * @param shapeB AMF node
   * @param context A context to use. If not set, it looks for the context of the passed model
   * @returns Merged AMF node
   */
  _mergeShapes(shapeA: any, shapeB: any, context?: Record<string, string>): any;

  /**
   * Obtains source map sources value from two shapes and returns the merged result
   * If neither shape has a sources node, then an empty object will be returned.
   * Result is wrapped in an array as per AMF model standard
   * @param AMF node
   * @param AMF node
   * @param context A context to use. If not set, it looks for the context of the passed model
   * @returns Empty object or resulting merge, wrapped in an array
   */
  _mergeSourceMapsSources(shapeA: any, shapeB: any, context?: Record<string, string>): any[];

  /**
   * Expands the key property from compacted mode to full mode.
   * @param value The value to process
   * @param context A context to use. If not set, it looks for the context of the passed model
   * @returns The expanded value.
   */
  [expandKey](value: string, context?: Record<string, string>): string;
  /**
   * Computes a security model from a reference (library for example).
   * @param domainId Domain id of the security requirement to find.
   * @param context A context to use. If not set, it looks for the context of the passed model
   * @returns Type definition or undefined if not found.
   */
  findSecurityScheme(domainId: string, context?: Record<string, string>): SecurityScheme | undefined;

  /**
   * Computes a security model from a reference (library for example).
   * @param reference AMF model for a reference to extract the data from
   * @param selected Node ID to look for
   * @param context A context to use. If not set, it looks for the context of the passed model
   * @returns Type definition or undefined if not found.
   */
  [computeReferenceSecurity](reference: DomainElement, selected: string, context?: Record<string, string>): SecurityScheme | undefined;
  /**
   * Collects domain objects by a domain type.
   * @param source The element to search for declare/encoded objects.
   * @param type The domain type
   * @param context A context to use. If not set, it looks for the context of the passed model
   */
  getByType(source: DomainElement, type: string, context?: Record<string, string>): DomainElement[];
}

export const AmfHelperMixin = dedupeMixin(<T extends Constructor<any>>(superClass: T): Constructor<AmfHelperMixinInterface> & T => {
  class AmfHelperMixinClass extends superClass {
    static get properties() {
      return {
        /**
         * Generated AMF json/ld model form the API spec.
         * The element assumes the object of the first array item to be a
         * type of `"http://raml.org/vocabularies/document#Document`
         * on AMF vocabulary.
         *
         * It is only useful for the element to resolve references.
         */
        amf: { type: Object }
      };
    }

    /**
     * A namespace for AMF model.
     */
    get ns(): typeof Namespace {
      return Namespace;
    }

    get amf() {
      return this._amf;
    }

    set amf(value) {
      const old = this._amf;
      if (old === value) {
        return;
      }
      let expanded;
      if (!value || AmfModelExpander.isInExpandedForm(value)) {
        this._flattenedAmf = undefined;
        expanded = value;
      } else {
        const oldFlattened = this._flattenedAmf;
        if (oldFlattened === value) {
          return;
        }
        this._flattenedAmf = value;
        expanded = this._expand(value);
      }
      // Cached keys cannot be static as this element can be using in the sane
      // document with different AMF models
      this.__cachedKeys = {};
      this._amf = expanded;
      this.__amfChanged(expanded);
      if (this.requestUpdate) {
        this.requestUpdate('amf', old);
      }
    }

    /**
     * This is an abstract method to be implemented by the components.
     * If, instead, the component uses `amf` setter you must use `super.amf` to
     * set the value.
     * @param amf Current AMF model. Can be undefined.
     */
    __amfChanged(amf: any) {
      // ...
    }

    /**
     * Expands flattened AMF model
     */
    _expand(amf: any) {
      AmfModelExpander.preprocessLegacyRootNodeId(amf)
      const linkEmbeddingFilter = (key: string) => !key.endsWith("fixPoint")
      const rootNode = amf['@context'] ? '' : "amf://id";
      const options = JsonLdOptions.apply()
        .withEmbeddedLinks(linkEmbeddingFilter)
        .withCompactedIris()
        .withExpandedStructure()
        .withRootNode(rootNode)
      return JsonLd.process(amf, options)
    }

    /**
     * Returns compact model key for given value.
     * @param property AMF original property
     * @param context A context to use. If not set, it looks for the context of the passed model
     * @returns Compact model property name or the same value if
     * value not found in the context.
     */
    _getAmfKey(property: string, context?: Record<string, string>): string | undefined {
      if (!property) {
        return undefined;
      }
      let { amf } = this;
      if (!amf && !context) {
        return property;
      }
      if (Array.isArray(amf)) {
        [amf] = amf;
      }
      if (!this.__cachedKeys) {
        this.__cachedKeys = {};
      }
      const ctx = (context || amf['@context']) as Record<string, string>;
      if (!ctx || !property) {
        return property;
      }
      const cache = this.__cachedKeys;
      if (property in cache) {
        return cache[property];
      }
      /* eslint-disable-next-line no-param-reassign */
      property = String(property);
      const hashIndex = property.indexOf('#');
      const hashProperty = property.substr(0, hashIndex + 1);
      const keys = Object.keys(ctx);
      for (let i = 0, len = keys.length; i < len; i++) {
        const k = keys[i];
        if (ctx[k] === property) {
          cache[property] = k;
          return k;
        } if (hashIndex === -1 && property.indexOf(ctx[k]) === 0) {
          const result = property.replace(ctx[k], `${k}:`);
          cache[property] = result;
          return result;
        } if (ctx[k] === hashProperty) {
          const result = `${k}:${property.substr(hashIndex + 1)}`;
          cache[property] = result;
          return result;
        }
      }
      return property;
    }

    /**
     * Ensures that the model is AMF object.
     *
     * @param amf AMF json/ld model
     * @returns API spec
     */
    _ensureAmfModel(amf: any): AmfDocument | undefined {
      if (!amf) {
        return undefined;
      }
      if (Array.isArray(amf)) {
        /* eslint-disable-next-line no-param-reassign */
        [amf] = amf;
      }
      if (this._hasType(amf, Namespace.aml.vocabularies.document.Document)) {
        return amf;
      }
      return undefined;
    }

    /**
     * Ensures that the value is an array.
     * It returns undefined when there's no value.
     * It returns the same array if the value is already an array.
     * It returns new array of the item is not an array.
     *
     * @param value An item to test
     */
    _ensureArray(value: any): unknown {
      if (!value) {
        return undefined;
      }
      if (value instanceof Array) {
        return value;
      }
      return [value];
    }

    /**
     * Gets a single scalar value from a model.
     * @param model Amf model to extract the value from.
     * @param inKey Model key to search for the value
     * @param context A context to use. If not set, it looks for the context of the passed model
     * @returns The value for key
     */
    _getValue(model: DomainElement, inKey: string, context?: Record<string, string>): string | number | boolean | undefined | null {
      /* eslint-disable-next-line no-param-reassign */
      const key = this._getAmfKey(inKey, context);
      if (!key) {
        return undefined;
      }
      let data = model && (model as any)[key] as any;
      if (!data) {
        // This includes "undefined", "false", "null" and "0"
        return data;
      }
      if (Array.isArray(data)) {
        /* eslint-disable-next-line no-param-reassign */
        [data] = data;
      }
      if (!data) {
        return undefined;
      }
      const type = typeof data;
      if (['string', 'number', 'boolean', 'undefined'].indexOf(type) !== -1) {
        return data;
      }
      return data['@value'];
    }

    /**
     * Gets values from a model as an array of `@value` properties.
     * @param model Amf model to extract the value from.
     * @param inKey Model key to search for the value
     * @param context A context to use. If not set, it looks for the context of the passed model
     * @returns The value for key
     */
    _getValueArray(model: DomainElement, inKey: string, context?: Record<string, string>): Array<string | number | boolean | null> | undefined {
      const key = this._getAmfKey(inKey, context);
      if (!key) {
        return undefined;
      }
      const data = model && this._ensureArray((model as any)[key]);
      if (!Array.isArray(data)) {
        return undefined;
      }
      return data.map((item) => item['@value'] || item);
    }

    /**
     * Reads an array from the model.
     * 
     * @param model Amf model to extract the value from.
     * @param key Model key to search for the value
     * @param context A context to use. If not set, it looks for the context of the passed model
     * @returns The value for the key
     */
    [getArrayItems](model: DomainElement, key: string, context?: Record<string, string>): DomainElement[] | undefined {
      const k = this._getAmfKey(key, context);
      if (!k) {
        return undefined;
      }
      const data = model && this._ensureArray((model as any)[k]);
      if (!Array.isArray(data)) {
        return undefined;
      }
      return data;
    }

    /**
     * Reads the value of the `@id` property.
     * @param model Amf model to extract the value from.
     * @param key Model key to search for the @id
     * @param context A context to use. If not set, it looks for the context of the passed model
     */
    _getLinkValue(model: DomainElement, key: string, context?: Record<string, string>): string | undefined {
      const k = this._getAmfKey(key, context);
      if (!k) {
        return undefined;
      }
      let data = model && (model as any)[k];
      if (!data) {
        return undefined;
      }
      if (Array.isArray(data)) {
        [data] = data;
      }
      if (!data) {
        return undefined;
      }
      return data['@id'];
    }

    /**
     * Reads the list of value for the `@id` property.
     * @param model Amf model to extract the value from.
     * @param inKey Model key to search for the @id
     * @param context A context to use. If not set, it looks for the context of the passed model
     */
    _getLinkValues(model: DomainElement, inKey: string, context?: Record<string, string>): string[] | undefined {
      const k = this._getAmfKey(inKey, context);
      if (!k) {
        return undefined;
      }
      let data = (model && (model as any)[k]) as DomainElement[] | undefined;
      if (!data) {
        return undefined;
      }
      if (!Array.isArray(data)) {
        data = [data];
      }
      return data.map(i => i['@id']);
    }

    /**
     * Checks if a model has a type.
     * @param model Model to test
     * @param type Type name
     * @param context A context to use. If not set, it looks for the context of the passed model
     * @returns True if model has a type.
     */
    _hasType(model: DomainElement, type: string, context?: Record<string, string>): boolean {
      const types = this._ensureArray(model && model['@type']) as string[];
      if (!types || !types.length) {
        return false;
      }
      const key = this._getAmfKey(type, context);
      for (let i = 0; i < types.length; i++) {
        if (types[i] === key) {
          return true;
        }
      }
      return false;
    }

    /**
     * Checks if a shape has a property.
     * @param shape The shape to test
     * @param inKey Property name to test
     * @param context A context to use. If not set, it looks for the context of the passed model
     */
    _hasProperty(shape: DomainElement, inKey: string, context?: Record<string, string>): boolean {
      const k = this._getAmfKey(inKey, context);
      if (!k) {
        return false;
      }
      return !!(shape && k && k in shape);
    }

    /**
     * Computes array value of a property in a model (shape).
     *
     * @param shape AMF shape object
     * @param inKey Property name
     * @param context A context to use. If not set, it looks for the context of the passed model
     */
    _computePropertyArray(shape: DomainElement, inKey: string, context?: Record<string, string>): Array<string | number | boolean | null | Object> | undefined {
      if (!shape) {
        return undefined;
      }
      const k = this._getAmfKey(inKey, context);
      if (!k) {
        return undefined;
      }
      const data = this._ensureArray(shape && (shape as any)[k]);
      if (!data || !Array.isArray(data)) {
        return undefined;
      }
      return data;
    }

    /**
     * Computes API version from the AMF model.
     *
     * @param amf
     * @param context A context to use. If not set, it looks for the context of the passed model
     * @returns {string}
     */
    _computeApiVersion(amf: AmfDocument, context?: Record<string, string>) {
      const api = this._computeApi(amf);
      if (!api) {
        return undefined;
      }
      return /** @type string */ (this._getValue(api, this.ns.aml.vocabularies.core.version, context));
    }

    /**
     * Computes model's `encodes` property.
     *
     * @param model AMF data model
     * @param context A context to use. If not set, it looks for the context of the passed model
     * @returns List of encodes
     */
    _computeEncodes(model: AmfDocument, context?: Record<string, string>): DomainElement | undefined {
      if (!model) {
        return undefined;
      }
      if (Array.isArray(model)) {
        /* eslint-disable-next-line no-param-reassign */
        [model] = model;
      }
      const key = this._getAmfKey(this.ns.aml.vocabularies.document.encodes, context);
      if (!key) {
        return undefined;
      }
      const data = (model as any)[key];
      if (data) {
        return Array.isArray(data) ? data[0] : data;
      }
      return undefined;
    }

    /**
     * Computes list of declarations in the AMF api model.
     *
     * @param model AMF json/ld model for an API
     * @param context A context to use. If not set, it looks for the context of the passed model
     * @returns List of declarations
     */
    _computeDeclares(model: AmfDocument, context?: Record<string, string>): DomainElement[] | undefined {
      if (!model) {
        return undefined;
      }
      if (Array.isArray(model)) {
        /* eslint-disable-next-line no-param-reassign */
        [model] = model;
      }
      if (!model) {
        return undefined;
      }
      const key = this._getAmfKey(this.ns.aml.vocabularies.document.declares, context);
      if (!key) {
        return undefined;
      }
      const data = this._ensureArray((model as any)[key]);
      return Array.isArray(data) ? data : undefined;
    }

    /**
     * Computes list of references in the AMF api model.
     *
     * @param model AMF json/ld model for an API
     * @param context A context to use. If not set, it looks for the context of the passed model
     * @returns List of declarations
     */
    _computeReferences(model: AmfDocument, context?: Record<string, string>): DomainElement[] | undefined {
      if (!model) {
        return undefined;
      }
      if (Array.isArray(model)) {
        /* eslint-disable-next-line no-param-reassign */
        [model] = model;
      }
      if (!model) {
        return undefined;
      }
      const key = this._getAmfKey(this.ns.aml.vocabularies.document.references, context);
      if (!key) {
        return undefined;
      }
      const data = this._ensureArray((model as any)[key]) as DomainElement[] | undefined;
      return data instanceof Array ? data : undefined;
    }

    /**
     * Computes AMF's `http://schema.org/WebAPI` model
     *
     * @param model AMF json/ld model for an API
     * @param context A context to use. If not set, it looks for the context of the passed model
     * @returns Web API declaration.
     */
    _computeWebApi(model: AmfDocument, context?: Record<string, string>): WebApi | undefined {
      const enc = this._computeEncodes(model, context);
      if (!enc) {
        return undefined;
      }
      if (this._hasType(enc, this.ns.aml.vocabularies.apiContract.WebAPI, context)) {
        return enc;
      }
      return undefined;
    }

    /**
     * Computes AMF's `http://schema.org/API` model
     *
     * @param model AMF json/ld model for an API
     * @param context A context to use. If not set, it looks for the context of the passed model
     * @returns API declaration.
     */
    _computeApi(model: AmfDocument, context?: Record<string, string>): AsyncApi | WebApi | undefined {
      const enc = this._computeEncodes(model, context);
      if (!enc) {
        return undefined;
      }
      if (this._isAPI(model, context) || this._isWebAPI(model, context) || this._isAsyncAPI(model, context)) {
        return enc;
      }
      return undefined;
    }

    /**
     * Returns whether an AMF node is a WebAPI node
     * 
     * @param model  AMF json/ld model for an API
     * @param context A context to use. If not set, it looks for the context of the passed model
     */
    _isWebAPI(model: AmfDocument, context?: Record<string, string>): boolean {
      const enc = this._computeEncodes(model, context);
      if (!enc) {
        return false;
      }
      return this._hasType(enc, this.ns.aml.vocabularies.apiContract.WebAPI, context);
    }

    /**
     * Returns whether an AMF node is an AsyncAPI node
     * 
     * @param model  AMF json/ld model for an API
     * @param context A context to use. If not set, it looks for the context of the passed model
     */
    _isAsyncAPI(model: AmfDocument, context?: Record<string, string>): boolean {
      const enc = this._computeEncodes(model, context);
      if (!enc) {
        return false;
      }
      return this._hasType(enc, this.ns.aml.vocabularies.apiContract.AsyncAPI, context);
    }

    /**
     * Returns whether an AMF node is an API node
     * 
     * @param model  AMF json/ld model for an API
     * @param context A context to use. If not set, it looks for the context of the passed model
     */
    _isAPI(model: AmfDocument, context?: Record<string, string>): boolean {
      const enc = this._computeEncodes(model, context);
      if (!enc) {
        return false;
      }
      return this._hasType(enc, this.ns.aml.vocabularies.apiContract.API, context);
    }

    /**
     * Determines whether a partial model is valid for reading servers from
     * Current valid values:
     * - Operation
     * - Endpoint
     * @param model The partial model to evaluate
     * @param context A context to use. If not set, it looks for the context of the passed model
     * @returns Whether the model's type is part of the array of valid node types from which
     * to read servers
     */
    _isValidServerPartial(model: DomainElement, context?: Record<string, string>): boolean {
      if (Array.isArray(model)) {
        /* eslint-disable-next-line no-param-reassign */
        [model] = model;
      }
      if (!model) {
        return false;
      }
      const oKey = this.ns.aml.vocabularies.apiContract.Operation;
      const eKey = this.ns.aml.vocabularies.apiContract.EndPoint;
      const allowedPartialModelTypes = [this._getAmfKey(oKey, context), this._getAmfKey(eKey, context)];
      const types = model['@type'];
      for (const type of types) {
        if (allowedPartialModelTypes.indexOf(type) !== -1) {
          return true;
        }
      }
      return false;
    }

    /**
     * @param options Server query options
     * @param context A context to use. If not set, it looks for the context of the passed model
     * @returns List of servers for method, if defined, or endpoint, if defined, or root level
     */
    _getServers(options: ServersQueryOptions = {}, context?: Record<string, string>): Server[] | undefined {
      const { endpointId, methodId } = options;
      const { amf } = this;
      if (!amf) {
        return undefined;
      }
      let api = this._computeApi(amf, context);
      if (Array.isArray(api)) {
        [api] = api;
      }
      if (!api) {
        if (this._isValidServerPartial(amf, context)) {
          api = amf;
        } else {
          return undefined;
        }
      }

      const serverKey = this._getAmfKey(this.ns.aml.vocabularies.apiContract.server, context) as string;
      const getRootServers = () => (this[getArrayItems](api as DomainElement, serverKey, context)) as Server[];
      const getEndpointServers = () => {
        const endpoint = this._computeEndpointModel(api as WebApi, endpointId, context);
        const servers = (this[getArrayItems](endpoint as EndPoint, serverKey, context)) as Server[];
        if (servers) {
          return servers;
        }
        return getRootServers();
      };
      const getMethodServers = () => {
        const method = this._computeMethodModel(api as WebApi, methodId as string, context);
        const servers = (this[getArrayItems](method as Operation, serverKey, context)) as Server[];
        if (servers) {
          return servers;
        }
        return getEndpointServers();
      };

      if (methodId) {
        return getMethodServers();
      } if (endpointId) {
        return getEndpointServers();
      }
      return getRootServers();
    }

    /**
     * Computes value for the `expects` property.
     *
     * @param method AMF `supportedOperation` model
     * @param context A context to use. If not set, it looks for the context of the passed model
     */
    _computeExpects(method: Operation, context?: Record<string, string>): Request | undefined {
      const operationKey = this.ns.aml.vocabularies.apiContract.Operation;
      const expectsKey = this.ns.aml.vocabularies.apiContract.expects;
      if (this._hasType(method, operationKey, context)) {
        const key = this._getAmfKey(expectsKey, context);
        if (!key) {
          return undefined;
        }
        const expects = this._ensureArray((method as any)[key]);
        if (expects) {
          return Array.isArray(expects) ? expects[0] : expects;
        }
      }
      return undefined;
    }

    /**
     * Computes list of endpoints from a WebApi model.
     * @param webApi
     * @param context A context to use. If not set, it looks for the context of the passed model
     * @returns An array of endpoints.
     */
    _computeEndpoints(webApi: WebApi, context?: Record<string, string>): EndPoint[] | undefined {
      if (!webApi) {
        return [];
      }
      const endpointKey = this.ns.aml.vocabularies.apiContract.endpoint;
      const key = this._getAmfKey(endpointKey, context);
      if (!key) {
        return undefined;
      }
      return this._ensureArray((webApi as any)[key]) as EndPoint[];
    }

    /**
     * Computes model for an endpoint documentation.
     *
     * @param webApi Current value of `webApi` property
     * @param id Selected shape ID
     * @param context A context to use. If not set, it looks for the context of the passed model
     * @returns An endpoint definition
     */
    _computeEndpointModel(webApi: WebApi, id?: string, context?: Record<string, string>): EndPoint | undefined {
      if (this._hasType(webApi, this.ns.aml.vocabularies.apiContract.EndPoint, context)) {
        return webApi;
      }
      const endpoints = this._computeEndpoints(webApi, context);
      if (!endpoints) {
        return undefined;
      }
      return endpoints.find((item) => item['@id'] === id);
    }

    /**
     * Computes method for the method documentation.
     *
     * @param webApi Current value of `webApi` property
     * @param selected Selected shape
     * @param context A context to use. If not set, it looks for the context of the passed model
     * @returns A method definition
     */
    _computeMethodModel(webApi: WebApi, selected: string, context?: Record<string, string>): Operation | undefined {
      const methods = this.__computeMethodsListForMethod(webApi, selected, context);
      if (!methods) {
        return undefined;
      }
      return methods.find((item) => item['@id'] === selected);
    }

    /**
     * Computes an endpoint for a method.
     * @param webApi The WebApi AMF model
     * @param methodId Method id
     * @param context A context to use. If not set, it looks for the context of the passed model
     * @returns An endpoint model of undefined.
     */
    _computeMethodEndpoint(webApi: WebApi, methodId: string, context?: Record<string, string>): EndPoint | undefined {
      if (!webApi || !methodId) {
        return undefined;
      }
      if (this._hasType(webApi, this.ns.aml.vocabularies.apiContract.EndPoint, context)) {
        return webApi;
      }
      const endpoints = this._computeEndpoints(webApi, context);
      if (!endpoints) {
        return undefined;
      }
      const opKey = this._getAmfKey(this.ns.aml.vocabularies.apiContract.supportedOperation, context) as string;
      for (let i = 0, len = endpoints.length; i < len; i++) {
        const endpoint = endpoints[i];
        let methods = (endpoint as any)[opKey] as Operation[] | undefined;
        if (!methods) {
          continue;
        }
        if (!Array.isArray(methods)) {
          methods = [methods];
        }
        for (let j = 0, jLen = methods.length; j < jLen; j++) {
          if (methods[j]['@id'] === methodId) {
            return endpoint;
          }
        }
      }
      return undefined;
    }

    /**
     * Computes a list of methods for an endpoint that contains a method with
     * given id.
     *
     * @param webApi WebApi model
     * @param methodId Method id.
     * @param context A context to use. If not set, it looks for the context of the passed model
     * @returns A list of sibling methods or undefined.
     */
    __computeMethodsListForMethod(webApi: WebApi, methodId: string, context?: Record<string, string>): Operation[] | undefined {
      const endpoint = this._computeMethodEndpoint(webApi, methodId, context);
      if (!endpoint) {
        return undefined;
      }
      const opKey = this._getAmfKey(this.ns.aml.vocabularies.apiContract.supportedOperation, context);
      if (!opKey) {
        return undefined;
      }
      return this._ensureArray((endpoint as any)[opKey]) as Operation[];
    }

    /**
     * Computes a type documentation model.
     *
     * @param declares Current value of `declares` property
     * @param references Current value of `references` property
     * @param selected Selected shape
     * @param context A context to use. If not set, it looks for the context of the passed model
     * @returns A type definition
     */
    _computeType(declares: DomainElement[], references: DomainElement[], selected: string, context?: Record<string, string>): Shape | undefined {
      if ((!declares && !references) || !selected) {
        return undefined;
      }
      // In compact model some IDs are presented in long version (in source maps for examples)
      // This must test for this case as well.
      const compactId = selected.replace('amf://id', '');
      let type = declares && declares.find((item) => item['@id'] === selected || item['@id'] === compactId);
      if (!type && references && references.length) {
        for (let i = 0, len = references.length; i < len; i++) {
          if (!this._hasType(references[i], this.ns.aml.vocabularies.document.Module)) {
            continue;
          }
          type = this._computeReferenceType(references[i], selected, context);
          if (type) {
            break;
          }
        }
      }
      return type;
    }

    /**
     * Finds a type in the model declares and references.
     * @param domainId The domain id of the type (AMF's shape).
     * @param context A context to use. If not set, it looks for the context of the passed model
     * @returns The AMF shape or undefined when not found.
     */
    [findAmfType](domainId: string, context?: Record<string, string>): Shape | undefined {
      let { amf } = this;
      if (!amf) {
        return undefined;
      }
      if (Array.isArray(amf)) {
        [amf] = amf;
      }
      const declares = this._computeDeclares(amf, context);
      const compactId = domainId.replace('amf://id', '');
      if (Array.isArray(declares)) {
        const result = declares.find((item) => item['@id'] === domainId || item['@id'] === compactId);
        if (result) {
          return result;
        }
      }
      return this[findReferenceObject](domainId);
    }

    /**
     * Searches for an object in model's references list.
     * It does not resolve the object (useful for handling links correctly).
     * 
     * @param domainId The domain of the object to find in the references.
     * @param context A context to use. If not set, it looks for the context of the passed model
     * @returns The domain object or undefined.
     */
    [findReferenceObject](domainId: string, context?: Record<string, string>): DomainElement | undefined {
      let { amf } = this;
      if (!amf) {
        return undefined;
      }
      if (Array.isArray(amf)) {
        [amf] = amf;
      }
      const references = this._computeReferences(amf, context);
      if (!Array.isArray(references) || !references.length) {
        return undefined;
      }
      const compactId = domainId.replace('amf://id', '');
      for (let i = 0, len = references.length; i < len; i++) {
        const ref = /** @type AmfDocument */ (references[i]);
        const declares = this._computeDeclares(ref, context);
        if (!Array.isArray(declares)) {
          continue;
        }
        for (let j = 0, lenDecl = declares.length; j < lenDecl; j++) {
          let declared = declares[j];
          if (Array.isArray(declared)) {
            [declared] = declared;
          }
          if (declared['@id'] === domainId || declared['@id'] === compactId) {
            return declared;
          }
        }
      }
      return undefined;
    }

    /**
     * Computes a type model from a reference (library for example).
     * @param reference AMF model for a reference to extract the data from
     * @param selected Node ID to look for
     * @param context A context to use. If not set, it looks for the context of the passed model
     * @returns Type definition or undefined if not found.
     */
    _computeReferenceType(reference: DomainElement, selected: string, context?: Record<string, string>): Shape | undefined {
      const declare = this._computeDeclares(reference, context);
      if (!declare) {
        return undefined;
      }
      // In compact model some IDs are presented in long version (in source maps for examples)
      // This must test for this case as well.
      const compactId = selected.replace('amf://id', '');
      let result = declare.find((item) => {
        if (Array.isArray(item)) {
          /* eslint-disable-next-line no-param-reassign */
          [item] = item;
        }
        return item['@id'] === selected || item['@id'] === compactId;
      });
      if (Array.isArray(result)) {
        [result] = result;
      }
      return this._resolve(result as Shape);
    }

    /**
     * Computes a documentation model.
     *
     * @param webApi Current value of `webApi` property
     * @param selected Selected shape
     * @param context A context to use. If not set, it looks for the context of the passed model
     */
    _computeDocument(webApi: WebApi, selected: string, context?: Record<string, string>): DomainElement | undefined {
      if (!webApi || !selected) {
        return undefined;
      }
      const key = this._getAmfKey(this.ns.aml.vocabularies.core.documentation, context) as string;
      const docs = this._ensureArray((webApi as any)[key]) as DomainElement[];
      return docs && docs.find((item) => item['@id'] === selected);
    }

    /**
     * Resolves a reference to an external fragment.
     *
     * @param shape A shape to resolve
     * @param context A context to use. If not set, it looks for the context of the passed model
     * @returns Resolved shape.
     */
    _resolve<P>(shape: P & { __apicResolved?: boolean }, context?: Record<string, string>): P {
      const { amf } = this;
      if (!shape || typeof shape !== 'object' || Array.isArray(shape) || !amf || shape.__apicResolved) {
        return shape;
      }
      let refKey = this._getAmfKey(this.ns.aml.vocabularies.document.linkTarget, context) as string;
      let refValue = this._ensureArray((shape as any)[refKey]) as any[];
      let refData;
      if (refValue) {
        const rk = refValue[0]['@id'];
        if (rk === (shape as any)['@id']) {
          // recursive shape.
          /* eslint-disable-next-line no-param-reassign */
          shape.__apicResolved = true;
          return shape;
        }
        refData = this._getLinkTarget(amf, rk, context);
      } else {
        refKey = this._getAmfKey(this.ns.aml.vocabularies.document.referenceId, context) as string;
        refValue = this._ensureArray((shape as any)[refKey]) as any[];
        if (refValue) {
          const rk = refValue[0]['@id'];
          if (rk === (shape as any)['@id']) {
            // recursive shape.
            /* eslint-disable-next-line no-param-reassign */
            shape.__apicResolved = true;
            return shape;
          }
          refData = this._getReferenceId(amf, rk, context);
        }
      }
      if (!refData) {
        this._resolveRecursive(shape);
        /* eslint-disable-next-line no-param-reassign */
        shape.__apicResolved = true;
        return shape;
      }
      const copy = { ...refData };
      delete (copy as any)['@id'];
      const types = copy['@type'];
      if (types) {
        if ((shape as any)['@type']) {
          /* eslint-disable-next-line no-param-reassign */
          (shape as any)['@type'] = (shape as any)['@type'].concat(types);
        } else {
          /* eslint-disable-next-line no-param-reassign */
          (shape as any)['@type'] = types;
        }
        delete (copy as any)['@type'];
      }
      this._mergeShapes(shape, copy, context);
      /* eslint-disable-next-line no-param-reassign */
      shape.__apicResolved = true;
      this._resolveRecursive(shape);
      return shape;
    }

    /**
     * @param amf References object to search in
     * @param id Id of the shape to resolve
     * @param context A context to use. If not set, it looks for the context of the passed model
     * @returns Resolved shape for given reference, undefined otherwise
     */
    _getLinkTarget(amf: AmfDocument, id: string, context?: Record<string, string>): DomainElement | undefined {
      if (!amf || !id) {
        return undefined;
      }
      let target;
      const declares = this._computeDeclares(amf, context);
      if (declares) {
        target = this._findById(declares, id);
      }
      if (!target) {
        const references = this._computeReferences(amf, context);
        target = this._obtainShapeFromReferences(references as DomainElement[], id, context);
      }
      if (!target) {
        return undefined;
      }
      // Declaration may contain references
      target = this._resolve(target);
      return target;
    }

    /**
     * Resolves the shape of a given reference.
     *
     * @param references References object to search in
     * @param id Id of the shape to resolve
     * @param context A context to use. If not set, it looks for the context of the passed model
     * @returns Resolved shape for given reference, undefined otherwise
     */
    _obtainShapeFromReferences(references: DomainElement[], id: string, context?: Record<string, string>): DomainElement | undefined {
      if (!Array.isArray(references) || !references.length) {
        return undefined;
      }
      let target;
      for (let i = 0; i < references.length; i++) {
        const _ref = references[i];
        // case of fragment that encodes the shape
        const encoded = this._computeEncodes(_ref, context);
        if (encoded && encoded['@id'] === id) {
          target = encoded;
          break;
        }
        // case of a library which declares types
        if (!encoded) {
          const decl = this._computeDeclares(_ref, context) as DomainElement[];
          target = this._findById(decl, id);
          if (target) break;
        }
      }
      return target;
    }

    /**
     * Searches a node with a given ID in an array
     *
     * @param array Array to search for a given ID
     * @param id Id to search for
     * @returns Node with the given ID when found, undefined otherwise
     */
    _findById(array: DomainElement[], id: string): DomainElement | undefined {
      if (!array) return undefined;
      let target;
      for (let i = 0; i < array.length; i++) {
        const _current = array[i];
        if (_current && _current['@id'] === id) {
          target = _current;
          break;
        }
      }
      return target;
    }

    _getReferenceId(amf: AmfDocument, id: string, context?: Record<string, string>) {
      if (!amf || !id) {
        return undefined;
      }
      const refs = this._computeReferences(amf, context);
      if (!refs) {
        return undefined;
      }
      for (let i = 0; i < refs.length; i++) {
        const _ref = refs[i];
        const enc = this._computeEncodes(_ref, context);
        if (enc) {
          if (enc['@id'] === id) {
            return enc;
          }
        }
      }
      return undefined;
    }

    _resolveRecursive(shape: any, context?: Record<string, string>): void {
      Object.keys(shape).forEach((key) => {
        const currentShape = shape[key];
        if (Array.isArray(currentShape)) {
          for (let i = 0, len = currentShape.length; i < len; i++) {
            currentShape[i] = this._resolve(currentShape[i]);
          }
        } else if (typeof currentShape === 'object') {
          /* eslint-disable-next-line no-param-reassign */
          shape[key] = this._resolve(currentShape, context);
        }
      });
    }

    /**
     * Merge two shapes together. If the resulting shape has one of the "special merge" keys,
     * then the special merge function for that key will be used to match that property
     * @param shapeA AMF node
     * @param shapeB AMF node
     * @param context A context to use. If not set, it looks for the context of the passed model
     * @returns Merged AMF node
     */
    _mergeShapes(shapeA: any, shapeB: any, context?: Record<string, string>): any {
      const merged = { ...shapeA, ...shapeB };
      const specialMerges = [
        {
          key: this._getAmfKey(this.ns.aml.vocabularies.docSourceMaps.sources, context) as string,
          merger: this._mergeSourceMapsSources.bind(this)
        },
      ];
      specialMerges.forEach(({ key, merger }) => {
        if (this._hasProperty(merged, key, context)) {
          merged[key] = merger(shapeA, shapeB, context);
        }
      });
      return Object.assign(shapeA, merged);
    }

    /**
     * Obtains source map sources value from two shapes and returns the merged result
     * If neither shape has a sources node, then an empty object will be returned.
     * Result is wrapped in an array as per AMF model standard
     * @param shapeA AMF node
     * @param shapeB AMF node
     * @param context A context to use. If not set, it looks for the context of the passed model
     * @returns Empty object or resulting merge, wrapped in an array
     */
    _mergeSourceMapsSources(shapeA: any, shapeB: any, context?: Record<string, string>): (any | {})[] {
      const sourcesKey = this._getAmfKey(this.ns.aml.vocabularies.docSourceMaps.sources, context) as string;
      let aSources = shapeA[sourcesKey] || {};
      if (Array.isArray(aSources)) {
        /* eslint-disable prefer-destructuring */
        aSources = aSources[0];
      }
      let bSources = shapeB[sourcesKey] || {};
      if (Array.isArray(bSources)) {
        /* eslint-disable prefer-destructuring */
        bSources = bSources[0];
      }
      return [Object.assign(aSources, bSources)];
    }

    /**
     * Expands the key property from compacted mode to full mode.
     * @param value The value to process
     * @param context
     * @returns The expanded value.
     */
    [expandKey](value: string, context?: Record<string, string>): string {
      let { amf } = this;
      if (!value || typeof value !== 'string' || (!amf && !context)) {
        return value;
      }
      if (Array.isArray(amf)) {
        [amf] = amf;
      }
      const ctx = context || amf['@context'];
      if (!ctx) {
        return value;
      }
      const [root, key] = value.split(':');
      if (!root || !key) {
        return value;
      }
      const prefix = ctx[root];
      if (!prefix) {
        return value;
      }
      return `${prefix}${key}`;
    }

    /**
     * Computes a security model from a reference (library for example).
     * @param domainId Domain id of the security requirement to find.
     * @param context A context to use. If not set, it looks for the context of the passed model
     * @returns Type definition or undefined if not found.
     */
    findSecurityScheme(domainId: string, context?: Record<string, string>): SecurityScheme | undefined {
      const { amf } = this;
      const declares = this._computeDeclares(amf, context);
      let result;
      if (declares) {
        result = declares.find((item) => item['@id'] === domainId);
      }
      if (result) {
        result = this._resolve(result);
        return result;
      }
      const references = this._computeReferences(amf, context);
      if (Array.isArray(references) && references.length) {
        for (const ref of references) {
          if (this._hasType(ref, this.ns.aml.vocabularies.document.Module, context)) {
            result = this[computeReferenceSecurity](ref, domainId, context);
            if (result) {
              result = this._resolve(result);
              return result;
            }
          }
        }
      }
      return undefined;
    }

    /**
     * Computes a security model from a reference (library for example).
     * @param reference AMF model for a reference to extract the data from
     * @param selected Node ID to look for
     * @param context A context to use. If not set, it looks for the context of the passed model
     * @returns Type definition or undefined if not found.
     */
    [computeReferenceSecurity](reference: DomainElement, selected: string, context?: Record<string, string>): SecurityScheme | undefined {
      const declare = this._computeDeclares(reference, context);
      if (!declare) {
        return undefined;
      }
      let result = declare.find((item) => {
        let declared = item;
        if (Array.isArray(declared)) {
          [declared] = declared;
        }
        return declared['@id'] === selected;
      });
      if (Array.isArray(result)) {
        [result] = result;
      }
      return this._resolve(result as DomainElement) as SecurityScheme;
    }

    /**
     * Collects domain objects by a domain type.
     * @param source The element to search for declare/encoded objects.
     * @param type The domain type
     * @param context A context to use. If not set, it looks for the context of the passed model
     */
    getByType(source: DomainElement, type: string, context?: Record<string, string>): DomainElement[] {
      if (!source) {
        return [];
      }
      let result: DomainElement[] = [];
      const declares = this._computeDeclares(source);
      const key = this._getAmfKey(type, context);
      if (!key) {
        return [];
      }
      if (declares && declares.length) {
        declares.forEach((declared) => {
          if (this._hasType(declared, key)) {
            result.push(declared);
          }
        });
      }
      const references = this._computeReferences(source);
      if (Array.isArray(references) && references.length) {
        for (const ref of references) {
          if (this._hasType(ref, this.ns.aml.vocabularies.document.Module)) {
            const items = this.getByType(ref, type, context);
            if (items.length) {
              result = result.concat(items);
            }
          }
        }
      }
      return result;
    }
  }
  return AmfHelperMixinClass as Constructor<AmfHelperMixinInterface> & T;
});
