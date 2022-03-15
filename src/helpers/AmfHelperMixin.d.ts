import { 
  AmfDocument, AsyncApi, DomainElement, EndPoint, Operation, Parameter, Payload, Request, Response, 
  SecurityScheme, Server, Shape, WebApi, Api
} from './amf';
import { Namespace } from './Namespace';
import { ServersQueryOptions } from './api';

export {AmfHelperMixin};

/**
 * Common functions used by AMF components to compute AMF values.
 */
declare function AmfHelperMixin<T extends new (...args: any[]) => {}>(base: T): T & AmfHelperMixinConstructor;

interface AmfHelperMixinConstructor {
  new(...args: any[]): AmfHelperMixin;
}

export {AmfHelperMixinConstructor};

export const expandKey: unique symbol;
export const findAmfType: unique symbol;
export const findReferenceObject: unique symbol;
export const getArrayItems: unique symbol;
export const computeReferenceSecurity: unique symbol;

interface AmfHelperMixin {

  /**
   * A namespace for AMF model.
   */
  readonly ns: Namespace;

  /**
   * Generated AMF json/ld model form the API spec.
   * The element assumes the object of the first array item to be a
   * type of `"http://raml.org/vocabularies/document#Document`
   * on AMF vocabulary.
   *
   * It is only useful for the element to resolve references.
   */
  amf: AmfDocument|undefined;
  _amf: AmfDocument|undefined;

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
  _getAmfKey(property: string|undefined, context?: Record<string, string>): string|undefined;

  /**
   * Ensures that the model is AMF object.
   *
   * @param amf AMF json/ld model
   * @returns API spec
   */
  _ensureAmfModel(amf: any): AmfDocument|undefined;

  /**
   * Ensures that the value is an array.
   * It returns undefined when there's no value.
   * It returns the same array if the value is already an array.
   * It returns new array of the item is not an array.
   *
   * @param value An item to test
   */
  _ensureArray<T>(value: T): T[]|undefined;

  /**
   * Ensures that the value is an array.
   * It returns undefined when there's no value.
   * It returns the same array if the value is already an array.
   * It returns new array of the item is not an array.
   *
   * @param value An item to test
   */
  _ensureArray<T>(value: T[]): T[]|undefined;

  /**
   * Gets a single scalar value from a model.
   *
   * @param model Amf model to extract the value from.
   * @param key Model key to search for the value
   * @param context A context to use. If not set, it looks for the context of the passed model
   * @returns Value for key
   */
  _getValue(model: DomainElement, key: string, context?: Record<string, string>): string|number|boolean|undefined|null;

  /**
   * Gets values from a model as an array of `@value` properties.
   *
   * @param model Amf model to extract the value from.
   * @param key Model key to search for the value
   * @param context A context to use. If not set, it looks for the context of the passed model
   * @returns Value for key
   */
  _getValueArray(model: DomainElement, key: string, context?: Record<string, string>): Array<string|number|boolean|null>|undefined;

  /**
   * Reads an array from the model.
   * 
   * @param model Amf model to extract the value from.
   * @param key Model key to search for the value
   * @param context A context to use. If not set, it looks for the context of the passed model
   * @returns Value for the key
   */
  [getArrayItems](model: DomainElement, key: string, context?: Record<string, string>): DomainElement[]|undefined;

  /**
   * Reads the value of the `@id` property.
   * @param model Amf model to extract the value from.
   * @param key Model key to search for the @id
   * @param context A context to use. If not set, it looks for the context of the passed model
   */
  _getLinkValue(model: DomainElement, key: string, context?: Record<string, string>): string|undefined;

  /**
   * Reads the list of value for the `@id` property.
   * @param model Amf model to extract the value from.
   * @param key Model key to search for the `@id`
   * @param context A context to use. If not set, it looks for the context of the passed model
   */
  _getLinkValues(model: DomainElement, key: string, context?: Record<string, string>): string[]|undefined;

  /**
   * Checks if a model has a type.
   *
   * @param model Model to test
   * @param type Type name
   * @param context A context to use. If not set, it looks for the context of the passed model
   * @returns True if model has a type.
   */
  _hasType(model: DomainElement, type: string, context?: Record<string, string>): boolean|null;

  /**
   * Checks if a shape has a property.
   *
   * @param shape The shape to test
   * @param key Property name to test
   * @param context A context to use. If not set, it looks for the context of the passed model
   */
  _hasProperty(shape: DomainElement, key: string, context?: Record<string, string>): boolean|null;

  /**
   * Computes array value of a property in a model (shape).
   *
   * @param shape AMF shape object
   * @param key Property name
   * @param context A context to use. If not set, it looks for the context of the passed model
   */
  _computePropertyArray(shape: DomainElement, key: string, context?: Record<string, string>): Array<string|number|boolean|null|Object>|undefined;

  /**
   * Computes API version from the AMF model.
   */
  _computeApiVersion(amf: AmfDocument, context?: Record<string, string>): string|undefined;

  /**
   * Computes model's `encodes` property.
   *
   * @param model AMF data model
   * @param context A context to use. If not set, it looks for the context of the passed model
   * @returns List of encodes
   */
  _computeEncodes(model: AmfDocument, context?: Record<string, string>): Api|undefined;

  /**
   * Computes list of declarations in the AMF api model.
   *
   * @param model AMF json/ld model for an API
   * @param context A context to use. If not set, it looks for the context of the passed model
   * @returns List of declarations
   */
  _computeDeclares(model: AmfDocument, context?: Record<string, string>): DomainElement[]|undefined;

  /**
   * Computes list of references in the AMF api model.
   *
   * @param model AMF json/ld model for an API
   * @param context A context to use. If not set, it looks for the context of the passed model
   * @returns List of declarations
   */
  _computeReferences(model: AmfDocument, context?: Record<string, string>): DomainElement[]|undefined;

  /**
   * Computes AMF's `http://schema.org/WebAPI` model
   *
   * @param model AMF json/ld model for an API
   * @param context A context to use. If not set, it looks for the context of the passed model
   * @returns Web API declaration.
   */
  _computeWebApi(model: AmfDocument, context?: Record<string, string>): WebApi|undefined;

  /**
   * Computes AMF's `http://schema.org/API` model
   *
   * @param model AMF json/ld model for an API
   * @param context A context to use. If not set, it looks for the context of the passed model
   * @return The API declaration.
   */
  _computeApi(model: AmfDocument, context?: Record<string, string>): AsyncApi|WebApi;

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
  _getServers(opts?: ServersQueryOptions, context?: Record<string, string>): Server[]|undefined;

  /**
   * Computes value for the `expects` property.
   *
   * @param method AMF `supportedOperation` model
   * @param context A context to use. If not set, it looks for the context of the passed model
   */
  _computeExpects(method: Operation, context?: Record<string, string>): Request|undefined;

  /**
   * Computes list of endpoints from a WebApi model.
   *
   * @param context A context to use. If not set, it looks for the context of the passed model
   * @returns Always returns an array of endpoints.
   */
  _computeEndpoints(webApi: WebApi, context?: Record<string, string>): EndPoint[]|undefined;

  /**
   * Computes model for an endpoint documentation.
   *
   * @param webApi Current value of `webApi` property
   * @param id Selected shape ID
   * @param context A context to use. If not set, it looks for the context of the passed model
   * @returns An endpoint definition
   */
  _computeEndpointModel(webApi: WebApi, id: string, context?: Record<string, string>): EndPoint|undefined;

  /**
   * Computes method for the method documentation.
   *
   * @param webApi Current value of `webApi` property
   * @param selected Selected shape
   * @param context A context to use. If not set, it looks for the context of the passed model
   * @returns A method definition
   */
  _computeMethodModel(webApi: WebApi, selected: string, context?: Record<string, string>): Operation|undefined;

  /**
   * Computes an endpoint for a method.
   *
   * @param webApi The WebApi AMF model
   * @param methodId Method id
   * @param context A context to use. If not set, it looks for the context of the passed model
   * @returns An endpoint model of undefined.
   */
  _computeMethodEndpoint(webApi: WebApi, methodId: string, context?: Record<string, string>): EndPoint|undefined;

  /**
   * Computes a list of methods for an endpoint that contains a method with
   * given id.
   *
   * @param webApi WebApi model
   * @param methodId Method id.
   * @param context A context to use. If not set, it looks for the context of the passed model
   * @returns A list of sibling methods or undefined.
   */
  __computeMethodsListForMethod(webApi: WebApi, methodId: string, context?: Record<string, string>): Operation[]|undefined;

  /**
   * Computes a type documentation model.
   *
   * @param declares Current value of `declares` property
   * @param references Current value of `references` property
   * @param selected Selected shape
   * @param context A context to use. If not set, it looks for the context of the passed model
   * @returns A type definition
   */
  _computeType(declares: DomainElement[], references: DomainElement[], selected: string, context?: Record<string, string>): Shape|undefined;

  /**
   * Finds a type in the model declares and references.
   * @param domainId The domain id of the type (AMF's shape).
   * @param context A context to use. If not set, it looks for the context of the passed model
   * @returns The AMF shape or undefined when not found.
   */
  [findAmfType](domainId?: string, context?: Record<string, string>): Shape|undefined;

  /**
   * Searches for an object in model's references list.
   * It does not resolve the object (useful for handling links correctly).
   * 
   * @param domainId The domain of the object to find in the references.
   * @param context A context to use. If not set, it looks for the context of the passed model
   * @returns The domain object or undefined.
   */
  [findReferenceObject](domainId?: string, context?: Record<string, string>): DomainElement|undefined;

  /**
   * Computes a type model from a reference (library for example).
   *
   * @param reference AMF model for a reference to extract the data from
   * @param selected Node ID to look for
   * @param context A context to use. If not set, it looks for the context of the passed model
   * @returns Type definition or undefined if not found.
   */
  _computeReferenceType(reference: DomainElement, selected: string, context?: Record<string, string>): Shape|undefined;

  /**
   * Computes a documentation model.
   *
   * @param webApi Current value of `webApi` property
   * @param selected Selected shape
   * @param context A context to use. If not set, it looks for the context of the passed model
   * @returns A method definition
   */
  _computeDocument(webApi: WebApi, selected: string, context?: Record<string, string>): DomainElement|undefined;

  /**
   * Resolves a reference to an external fragment.
   *
   * @param shape A shape to resolve
   * @param context A context to use. If not set, it looks for the context of the passed model
   * @returns Resolved shape.
   */
  _resolve<T>(shape: T, context?: Record<string, string>): T;
  _getLinkTarget(amf: AmfDocument, id: string, context?: Record<string, string>): DomainElement|undefined;

  /**
   * Resolves the shape of a given reference.
   *
   * @param references References object to search in
   * @param id Id of the shape to resolve
   * @param context A context to use. If not set, it looks for the context of the passed model
   * @returns Resolved shape for given reference, undefined otherwise
   */
  _obtainShapeFromReferences(references: DomainElement[], id: string, context?: Record<string, string>): DomainElement|undefined;

  /**
   * Searches a node with a given ID in an array
   *
   * @param array Array to search for a given ID
   * @param id Id to search for
   * @param context A context to use. If not set, it looks for the context of the passed model
   * @returns Node with the given ID when found, undefined otherwise
   */
  _findById(array: DomainElement[], id: string): DomainElement|undefined;
  _getReferenceId(amf: AmfDocument, id: string, context?: Record<string, string>): DomainElement|undefined;
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
  findSecurityScheme(domainId: string, context?: Record<string, string>): SecurityScheme|undefined;

  /**
   * Computes a security model from a reference (library for example).
   * @param reference AMF model for a reference to extract the data from
   * @param selected Node ID to look for
   * @param context A context to use. If not set, it looks for the context of the passed model
   * @returns Type definition or undefined if not found.
   */
  [computeReferenceSecurity](reference: DomainElement, selected: string, context?: Record<string, string>): SecurityScheme|undefined;
  /**
   * Collects domain objects by a domain type.
   * @param source The element to search for declare/encoded objects.
   * @param type The domain type
   * @param context A context to use. If not set, it looks for the context of the passed model
   */
  getByType(source: DomainElement, type: string, context?: Record<string, string>): DomainElement[];
}
