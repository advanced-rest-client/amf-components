import { fork } from 'child_process';

/** @typedef {import('child_process').ChildProcess} ChildProcess */
/** @typedef {import('../types').ProcessingStatus} ProcessingStatus */
/** @typedef {import('../types').ParserProcessResult} ParserProcessResult */
/** @typedef {import('../types').ParserProcessMessage} ParserProcessMessage */
/** @typedef {import('../types').ContentParseCommand} ContentParseCommand */

/**
 * A class that parses API content.
 */
export class AmfParser {
  constructor() {
    /** @type ProcessingStatus */
    this.status = 'initialized';
    /** 
     * The result of the parser computations.
     * Is is set when the status is `finished`
     * @type any
     */
    this.result = undefined;
    /** 
     * Any error message that made the process failed.
     * Is is set when the status is `failed`
     * @type string
     */
    this.error = undefined;
    /** @type ChildProcess */
    this.process = undefined;

    this.processExitHandler = this.processDisconnectHandler.bind(this);
    this.processMessage = this.processMessage.bind(this);
    this.processError = this.processError.bind(this);
  }

  /**
   * Cancels the current job.
   */
  cancel() {
    if (this.process && this.process.connected) {
      this.process.disconnect();
    }
    this.status = 'failed';
    this.error = 'The process was cancelled.';
  }

  /**
   * Parses an API from the body
   * @param {Buffer} body The request body
   * @param {string} vendor API vendor.
   * @param {string} mime API mime type.
   * @returns {Promise<void>}
   */
  async parseText(body, vendor, mime) {
    this.status = 'running';
    const proc = this.createProcess();
    this.process = proc;
    this.addProcessListeners(proc);
    const command = /** @type ContentParseCommand */ ({
      vendor, mime, 
      content: body.toString('utf8'),
    });
    const message = /** @type ParserProcessMessage */ ({
      action: 'parse-content',
      command,
    });
    proc.send(message);
  }

  /**
   * Creates a parser process.
   * @returns {ChildProcess} 
   */
  createProcess() {
    const env = { ...process.env, NODE_OPTIONS: '--max-old-space-size=4096' };
    const options = {
      execArgv: [],
      env
    };
    const dir = import.meta.url.replace('AmfParser.mjs', '').replace('file:', '');
    const proc = fork(`${dir}/ParserProcess.js`, options);
    return proc;
  }

  /**
   * @param {ChildProcess} proc
   */
  addProcessListeners(proc) {
    proc.on('disconnect', this.processDisconnectHandler);
    proc.on('message', this.processMessage);
    proc.on('error', this.processError);
  }

  /**
   * Logic executed when the process finish.
   */
  processDisconnectHandler() {
    if (!this.process) {
      return;
    }
    this.clearProcessListeners(this.process);
    this.process = undefined;
    if (this.status !== 'failed') {
      this.status = 'finished';
    }
  }

  /**
   * @param {ParserProcessResult} result
   */
  processMessage(result) {
    this.status = result.status;
    if (result.status === 'failed') {
      this.error = /** @type string */ (result.result);
    } else {
      this.result = /** @type string */ (result.result);
    }
    if (this.process.connected) {
      this.process.disconnect();
    }
  }

  /**
   * @param {Error} err
   */
  processError(err) {
    console.error(err);
    this.status = 'failed';
    this.error = err.message;
    if (this.process.connected) {
      this.process.disconnect();
    }
  }

  /**
   * @param {ChildProcess} proc
   */
  clearProcessListeners(proc) {
    proc.removeAllListeners();
  }
}
