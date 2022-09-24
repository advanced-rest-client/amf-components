/* eslint-disable class-methods-use-this */
import { v4 } from 'uuid';
import { ApiError } from './ApiError.mjs';
import { AmfParser } from './AmfParser.mjs';

/** @typedef {import('koa').Request} Request */
/** @typedef {import('../types').AmfProcessItem} AmfProcessItem */
/** @typedef {import('../types').ProcessingStatus} ProcessingStatus */

/**
 * A demo page AMF parsing service.
 */
export class AmfService {
  constructor() {
    /** 
     * @type {Map<string, AmfProcessItem>}
     */
    this.processes = new Map();
  }

  /**
   * Handles the request when requesting parsing of an API content.
   * @param {Request} request
   * @returns {Promise<any>} 
   */
  async parseText(request) {
    const { method, headers } = request;
    if (method !== 'POST') {
      throw new ApiError('Only POST method is allowed', 400);
    }
    const mime = headers['content-type'];
    const vendor = /** @type string */ (headers['x-api-vendor']);
    if (!mime) {
      throw new ApiError('content-type header is missing', 400);
    }
    if (!vendor) {
      throw new ApiError('x-api-vendor header is missing', 400);
    }
    const body = await this.readBody(request);
    const key = this.addProcess();
    const info = this.processes.get(key);
    info.parser.parseText(body, vendor, mime);
    return key;
  }

  /**
   * Reads the request body.
   * @param {Request} request
   * @returns {Promise<Buffer>} 
   */
  async readBody(request) {
    return new Promise((resolve, reject) => {
      let message;
      request.req.on('data', (chunk) => {
        try {
          if (message) {
            message = Buffer.concat([message, chunk]);
          } else {
            message = chunk;
          }
        } catch (e) {
          reject(e);
          throw e;
        }
      });
      request.req.on('end', () => {
        resolve(message);
      });
    });
  }

  /**
   * Checks for the status of a job.
   * @param {string} key
   * @returns {Promise<ProcessingStatus>} 
   */
  async checkStatus(key) {
    if (!this.processes.has(key)) {
      throw new ApiError(`Unknown resource ${key}`, 400);
    }
    const info = this.processes.get(key);
    return info.parser.status;
  }

  /**
   * Reads the process' error message.
   * @param {string} key The process key.
   * @returns {Promise<string>} The error message set on the process.
   */
  async getError(key) {
    if (!this.processes.has(key)) {
      throw new ApiError(`Unknown resource ${key}`, 400);
    }
    const info = this.processes.get(key);
    return info.parser.error;
  }

  /**
   * Reads the process' computation result.
   * @param {string} key The process key.
   * @returns {Promise<any>} The result
   */
  async getResult(key) {
    if (!this.processes.has(key)) {
      throw new ApiError(`Unknown resource ${key}`, 400);
    }
    const info = this.processes.get(key);
    return info.parser.result;
  }

  /**
   * Creates a new instance of an AMF parser.
   * @returns {string} The id of the parser instance.
   */
  addProcess() {
    const key = v4();
    const parser = new AmfParser();
    const info = /** @type AmfProcessItem */ ({
      parser,
    });
    this.processes.set(key, info);
    return key;
  }

  /**
   * @param {string} key
   */
  removeProcess(key) {
    if (!this.processes.has(key)) {
      throw new ApiError(`Unknown resource ${key}`, 400);
    }
    const info = this.processes.get(key);
    info.parser.cancel();
    this.processes.delete(key);
  }
}
