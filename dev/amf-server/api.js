/* eslint-disable class-methods-use-this */
import { AmfService } from './AmfService.mjs';
import { ApiError } from './ApiError.mjs';

/** @typedef {import('koa').ParameterizedContext} ParameterizedContext */
/** @typedef {import('koa').Next} Next */

const ApiBase = '/amf-server/api';

class AmfServer {
  constructor() {
    this.service = new AmfService();
  }

  /**
   * Handles an API request
   * 
   * @param {ParameterizedContext} context
   * @returns {Promise<void>} 
   */
  async handleRequest(context) {
    let body;
    const { request } = context;
    const url = request.url.replace(ApiBase, '');
    try {
      if (url === '/parse-text') {
        await this.handleParseText(context);
        return;
      } 
      if (url.startsWith('/status')) {
        await this.handleStatus(context);
        return;
      } 
      if (url.startsWith('/result')) {
        await this.handleResult(context);
        return;
      }
      body = this.wrapError(new Error(`Unknown route: ${url}`), 404);
    } catch (e) {
      console.log('ROUTE ERROR', e);
      body = this.wrapError(e, e.code || 500);
    }
    if (body.code) {
      context.status = body.code;
    }
    context.body = body;
  }

  /**
   * @param {Error} cause
   * @param {number=} code
   * @returns {any} 
   */
  wrapError(cause, code=500) {
    return {
      error: true,
      code,
      message: cause.message,
      detail: 'The server misbehave. That is all we know.'
    };
  }

  /**
   * Handles the `/parse-text` route
   * 
   * @param {ParameterizedContext} context
   * @returns {Promise<void>} 
   */
  async handleParseText(context) {
    const { headers } = context.request;
    const previous = headers['x-previous-request'];
    if (previous) {
      this.service.removeProcess(previous);
    }
    const key = await this.service.parseText(context.request);
    context.status = 201;
    context.set('location', `${ApiBase}/status/${key}`);
    context.body = { 
      status: 201, 
      location: `${ApiBase}/status/${key}`,
      key,
    };
  }

  /**
   * Handles the `/status` route
   * 
   * @param {ParameterizedContext} context
   * @returns {Promise<void>} 
   */
  async handleStatus(context) {
    const url = context.request.url.replace(ApiBase, '');
    const key = url.replace('/status/', '');
    const status = await this.service.checkStatus(key);
    if (status === 'running' || status === 'initialized') {
      context.status = 204;
      context.set('location', `${ApiBase}/status/${key}`);
      context.body = { status, location: `${ApiBase}/status/${key}`, key, };
    } else if (status === 'failed') {
      const body = await this.service.getError(key);
      this.service.removeProcess(key);
      const e = new ApiError(body || 'Unknown error', 500);
      context.body = this.wrapError(e, e.code);
      context.status = e.code;
    } else {
      context.status = 200;
      context.set('location', `${ApiBase}/result/${key}`);
      context.body = { status, location: `${ApiBase}/result/${key}`, key, };
    }
  }

  /**
   * Handles the `/result` route
   * 
   * @param {ParameterizedContext} context
   * @returns {Promise<void>} 
   */
  async handleResult(context) {
    const url = context.request.url.replace(ApiBase, '');
    const key = url.replace('/result/', '');
    const body = await this.service.getResult(key);
    this.service.removeProcess(key);
    context.status = 200;
    context.type = 'application/json';
    context.body = body;
  }

}

const server = new AmfServer();

/**
 * The API entry point. Use this as a middleware function in the dev server.
 * 
 * @export
 * @param {ParameterizedContext} context
 * @param {Next} next
 * @returns {Promise<any>} 
 */
export async function amfParserApi(context, next) {
  const { request } = context;
  if (request.url.startsWith(`${ApiBase}/`)) {
    await server.handleRequest(context);
    return undefined;
  }
  return next();
}
