const amf = require('amf-client-js');

/** @typedef {import('amf-client-js').AMFConfiguration} AMFConfiguration */
/** @typedef {import('../types').ParserProcessMessage} ParserProcessMessage */
/** @typedef {import('../types').ContentParseCommand} ContentParseCommand */
/** @typedef {import('../types').ParserProcessResult} ParserProcessResult */

const {
  RAMLConfiguration,
  OASConfiguration,
  AsyncAPIConfiguration,
  RenderOptions,
  PipelineId,
} = amf;

class AmfParserProcess {
  /**
   * Handles the message from the main process.
   * @param {ParserProcessMessage} data
   */
  handleMessage(data) {
    const { action, command } = data;
    if (action === 'parse-content') {
      this.parseContent(/** @type ContentParseCommand */ (command));
      return;
    }
    process.send(/** @type  ParserProcessResult */ ({
      status: 'failed',
      result: `Unknown action: ${action}`,
    }));
  }

  /**
   * @param {ContentParseCommand} command
   */
  async parseContent(command) {
    const { content, mime, vendor } = command;
    try {
      const result = await this.doParseContent(content, mime, vendor);
      process.send(/** @type ParserProcessResult */ ({
        status: 'finished',
        result,
      }));
    } catch (e) {
      process.send(/** @type  ParserProcessResult */ ({
        status: 'failed',
        result: e.message,
      }));
    }
  }

  /**
   * @param {string} content
   * @param {string} mime
   * @param {string} vendor
   */
  async doParseContent(content, mime, vendor) {
    const ro = new RenderOptions().withSourceMaps().withCompactUris();
    const apiConfiguration = this.getConfiguration(vendor).withRenderOptions(ro);
    const client = apiConfiguration.baseUnitClient();
    const result = await client.parseContent(content, mime);
    const transformed = client.transform(result.baseUnit, PipelineId.Editing);
    return client.render(transformed.baseUnit, 'application/ld+json');
    // const parser = amf.Core.parser(vendor, mime);
    // const doc = await parser.parseStringAsync(content);
    // const resolver = amf.Core.resolver(vendor);
    // const resolved = resolver.resolve(doc, 'editing');
    // const generator = amf.Core.generator('AMF Graph', 'application/ld+json');
    // const opts = new amf.render.RenderOptions().withSourceMaps.withCompactUris;
    // return generator.generateString(resolved, opts);
  }

  /**
   * @param {string} vendor 
   * @returns {AMFConfiguration}
   */
  getConfiguration(vendor) {
    switch (vendor) {
      case 'RAML 0.8': return RAMLConfiguration.RAML08();
      case 'RAML 1.0': return RAMLConfiguration.RAML10();
      case 'OAS 2.0': return OASConfiguration.OAS20();
      case 'OAS 3.0': return OASConfiguration.OAS30();
      case 'ASYNC 2.0': return AsyncAPIConfiguration.Async20();
      default: throw new Error(`Unknown vendor: ${vendor}`);
    }
  }
}

const parser = new AmfParserProcess();

process.on('message', (data) => parser.handleMessage(/** @type ParserProcessMessage */ (data)));
