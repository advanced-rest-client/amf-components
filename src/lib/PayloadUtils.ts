import { ApiDefinitions, AmfShapes, ApiExampleGenerator, ApiMonacoSchemaGenerator, ApiSchemaGenerator } from '@api-client/core/build/browser.js';
import { ApiType } from '@api-client/core/build/legacy.js';

export interface PayloadInfo {
  value: string | FormData | Blob;
  model?: ApiType[];
  schemas?: any;
}

/** @typedef {import('@advanced-rest-client/events').ApiTypes.ApiType} ApiType */
/** @typedef {import('../helpers/api').ApiPayload} ApiPayload */
/** @typedef {import('../helpers/api').ApiShapeUnion} ApiShapeUnion */
/** @typedef {import('../helpers/api').ApiAnyShape} ApiAnyShape */

const cache: Map<string, PayloadInfo> = new Map();

export function getPayloadValue(payload: ApiDefinitions.IApiPayload): PayloadInfo {
  if (cache.has(payload.id)) {
    return cache.get(payload.id) as PayloadInfo;
  }
  const { id, mediaType = 'text/plain', schema } = payload;

  if (mediaType === 'multipart/form-data') {
    // schema generators don't support this yet,
    const info = { value: new FormData(), schemas: [] } as PayloadInfo;
    cache.set(id, info);
    return info;
  }
  if (!schema) {
    const info = { value: '', schemas: [] };
    cache.set(id, info);
    return info;
  }

  const schemaFactory = new ApiMonacoSchemaGenerator();
  const monacoSchemes = schemaFactory.generate(schema, id);
  let { examples } = payload;
  if (!Array.isArray(examples) || !examples.length) {
    examples = (schema as AmfShapes.IApiAnyShape).examples;
  }
  if (Array.isArray(examples) && examples.length) {
    const [example] = examples;
    const generator = new ApiExampleGenerator();
    const value = generator.read(example, mediaType);
    const info = { value, schemas: monacoSchemes } as PayloadInfo;
    cache.set(id, info);
    return info;
  }
  // generate values.
  const result = ApiSchemaGenerator.asExample(schema, mediaType, {
    selectedUnions: [],
    renderExamples: true,
    renderOptional: true,
    renderMocked: true,
  });
  if (!result || !result.renderValue) {
    const info = { value: '', schemas: monacoSchemes };
    cache.set(id, info);
    return info;
  }
  const info = { value: result.renderValue, schemas: monacoSchemes } as PayloadInfo;
  cache.set(id, info);
  return info;
}

/**
 * @param id The ApiPayload id.
 * @param value The value to cache.
 * @param model Optional model to set.
 */
export function cachePayloadValue(id: string, value: string, model?: ApiType[]): void {
  if (cache.has(id)) {
    const info = cache.get(id) as PayloadInfo;
    info.value = value;
    if (model) {
      info.model = model;
    }
    return;
  }
  cache.set(id, { value, model });
}

/**
 * @param id Payload id to read the value.
 */
export function readCachePayloadValue(id: string): PayloadInfo | undefined {
  return cache.get(id);
}
