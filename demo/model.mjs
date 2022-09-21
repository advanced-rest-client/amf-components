import pkg from 'amf-client-js';
import path from 'path';
import { writeFile, mkdir } from 'fs/promises';

/** @typedef {import('amf-client-js').AMFConfiguration} AMFConfiguration */
/** 
 * @typedef ApiConfiguration 
 * @property {string} type
 * @property {string=} mime
 */

const {
  RAMLConfiguration,
  OASConfiguration,
  AsyncAPIConfiguration,
  RenderOptions,
  PipelineId,
} = pkg;


/** @type {Map<string, ApiConfiguration>} */
const config = new Map();
config.set('demo-api/demo-api.raml', { type: "RAML 1.0" });
config.set('amf-helper-api/amf-helper-api.raml', { type: "RAML 1.0" });
config.set('arc-demo-api/arc-demo-api.raml', { type: "RAML 1.0" });
config.set('navigation-api/navigation-api.raml', { type: "RAML 1.0" });
config.set('schema-api/schema-api.raml', { type: "RAML 1.0" });
config.set('security-api/security-api.raml', { type: "RAML 1.0" });
config.set('array-body/array-body.raml', { type: "RAML 1.0" });
config.set('google-drive-api/google-drive-api.raml', { type: "RAML 1.0" });
config.set('appian-api/appian-api.raml', { type: "RAML 1.0" });
config.set('nexmo-sms-api/nexmo-sms-api.raml', { type: "RAML 1.0" });
config.set('httpbin/httpbin.json', { type: "OAS 2.0", mime: 'application/json' });
config.set('oas-demo/oas-demo.yaml', { type: "OAS 3.0", mime: 'application/yaml' });
config.set('21143/21143.json', { type: "OAS 2.0" });
config.set('APIC-15/APIC-15.raml', { type: "RAML 1.0" });
config.set('apic-83/apic-83.raml', { type: "RAML 1.0" });
config.set('APIC-168/APIC-168.raml', { type: "RAML 1.0" });
config.set('apic-169/apic-169.raml', { type: 'RAML 1.0' });
config.set('APIC-187/APIC-187.raml', { type: 'RAML 1.0' });
config.set('APIC-188/APIC-188.raml', { type: 'RAML 1.0' });
config.set('APIC-233/APIC-233.raml', { type: 'RAML 0.8' });
config.set('APIC-282/APIC-282.raml', { type: "RAML 1.0" });
config.set('APIC-289/APIC-289.yaml', { type: "OAS 2.0", mime: 'application/yaml' });
config.set('APIC-298/APIC-298.json', { type: 'OAS 2.0', mime: 'application/json' });
config.set('APIC-332/APIC-332.raml', { type: 'RAML 1.0' });
config.set('APIC-349-cache-resolution/APIC-349-cache-resolution.raml', { type: 'RAML 1.0' });
config.set('APIC-390/APIC-390.raml', { type: "RAML 1.0" });
config.set('APIC-391/APIC-391.raml', { type: 'RAML 1.0' });
config.set('APIC-429/APIC-429.yaml', { type: "OAS 3.0", mime: 'application/yaml' });
config.set('APIC-435/APIC-435.yaml', { type: "OAS 2.0", mime: 'application/yaml' });
config.set('APIC-449/APIC-449.yaml', { type: "OAS 3.0", mime: 'application/yaml' });
config.set('APIC-463/APIC-463.raml', { type: "RAML 1.0" });
config.set('APIC-480/APIC-480.raml', { type: 'RAML 1.0' });
config.set('APIC-483/APIC-483.raml', { type: "RAML 1.0" });
config.set('APIC-487/APIC-487.raml', { type: 'RAML 1.0' });
config.set('APIC-550/APIC-550.raml', { type: "RAML 1.0" });
config.set('APIC-553/APIC-553.raml', { type: "RAML 1.0" });
config.set('APIC-554/APIC-554.raml', { type: "RAML 1.0" });
config.set('APIC-554-ii/APIC-554-ii.raml', { type: "RAML 1.0" });
config.set('APIC-560/APIC-560.yaml', { type: "ASYNC 2.0" });
config.set('APIC-582/APIC-582.yaml', { type: "ASYNC 2.0" });
config.set('APIC-613/APIC-613.raml', { type: 'RAML 1.0' });
config.set('APIC-631/APIC-631.raml', { type: "RAML 1.0" });
config.set('APIC-641/APIC-641.yaml', { type: "OAS 3.0", mime: 'application/yaml' });
config.set('APIC-649/APIC-649.yaml', { type: "OAS 3.0", mime: 'application/yaml' });
config.set('APIC-650/APIC-650.yaml', { type: "OAS 3.0" });
config.set('APIC-655/APIC-655.raml', { type: 'RAML 1.0' });
config.set('APIC-667/APIC-667.raml', { type: "RAML 1.0" });
config.set('APIC-671/APIC-671.yaml', { type: "OAS 3.0", mime: 'application/yaml' });
config.set('APIC-689/APIC-689.raml', { type: 'RAML 1.0' });
config.set('APIC-690/APIC-690.raml', { type: 'RAML 1.0' });
config.set('APIC-711/APIC-711.raml', { type: "RAML 1.0" });
config.set('aap-1698/aap-1698.raml', { type: "RAML 1.0" });
config.set('SE-10469/SE-10469.raml', { type: "RAML 1.0" });
config.set('SE-11155/SE-11155.raml', { type: "RAML 1.0" });
config.set('SE-11415/SE-11415.raml', { type: "RAML 1.0" });
config.set('SE-11508/SE-11508.raml', { type: "RAML 1.0" });
config.set('SE-12042/SE-12042.raml', { type: "RAML 1.0" });
config.set('SE-12224/SE-12224.raml', { type: "RAML 1.0" });
config.set('SE-12291/SE-12291.json', { type: "OAS 2.0", mime: 'application/json' });
config.set('SE-12752/SE-12752.raml', { type: "RAML 1.0" });
config.set('SE-12957/SE-12957.json', { type: "OAS 2.0", mime: 'application/json' });
config.set('SE-12959/SE-12959.json', { type: "OAS 2.0", mime: 'application/json' });
config.set('SE-13092/SE-13092.raml', { type: 'RAML 1.0' });
config.set('SE-17897/SE-17897.yaml', { type: "OAS 3.0", mime: 'application/yaml' });
config.set('SE-19215/SE-19215.raml', { type: "RAML 1.0" });
config.set('SE-19500/SE-19500.raml', { type: "RAML 1.0" });
config.set('SE-22063/SE-22063.raml', { type: 'RAML 1.0' });
config.set('oauth1-fragment/oauth1-fragment.raml', { type: "RAML 1.0" });
config.set('oauth2-fragment/oauth2-fragment.raml', { type: "RAML 1.0" });
config.set('type-fragment/type-fragment.raml', { type: "RAML 1.0" });
config.set('documentation-fragment/documentation-fragment.raml', { type: "RAML 1.0" });
config.set('lib-fragment/lib-fragment.raml', { type: "RAML 1.0" });
config.set('example-fragment/example-fragment.raml', { type: "RAML 1.0" });
config.set('multi-server/multi-server.yaml', { type: "OAS 3.0", mime: 'application/yaml' });
config.set('async-api/async-api.yaml', { type: "ASYNC 2.0" });
config.set('Streetlights/Streetlights.yaml', { type: "ASYNC 2.0" });
config.set('streetlights2/streetlights2.yaml', { type: "ASYNC 2.0" });
config.set('api-keys/api-keys.yaml', { type: "OAS 3.0", mime: 'application/yaml' });
config.set('oauth-flows/oauth-flows.yaml', { type: "OAS 3.0", mime: 'application/yaml' });
config.set('oas-bearer/oas-bearer.yaml', { type: "OAS 3.0", mime: 'application/yaml' });
config.set('oauth-pkce/oauth-pkce.raml', { type: "RAML 1.0" });
config.set('secured-unions/secured-unions.yaml', { type: "OAS 3.0" });
config.set('secured-api/secured-api.raml', { type: "RAML 1.0" });
config.set('oas-callbacks/oas-callbacks.yaml', { type: "OAS 3.0", mime: 'application/yaml' });
config.set('documented-api/documented-api.raml', { type: "RAML 1.0" });
config.set('annotated-api/annotated-api.raml', { type: "RAML 1.0" });
config.set('examples-api/examples-api.raml', { type: "RAML 1.0" });
config.set('enum-test/enum-test.raml', { type: "RAML 1.0" });
config.set('oas-api/Petstore-v2.yaml', { type: "OAS 2.0", mime: 'application/yaml' });
config.set('petstore/petstore.yaml', { type: "OAS 3.0" });
config.set('new-oas3-types/new-oas3-types.yaml', { type: "OAS 3.0", mime: 'application/yaml' });
config.set('oas-api/read-only-properties.yaml', { type: "OAS 3.0", mime: 'application/yaml' });
config.set('anyOf/anyOf.yaml', { type: 'ASYNC 2.0' });
config.set('steveTest-1/stevetest.json', { type: 'OAS 2.0' });
config.set('mocking-service/mocking-service.raml', { type: 'RAML 1.0' });
config.set('no-endpoints/no-endpoints.raml', { type: 'RAML 1.0' });
config.set('no-server/no-server.raml', { type: 'RAML 1.0' });
config.set('prevent-xss/prevent-xss.json', { type: 'OAS 2.0', mime: 'application/json' });
config.set('loan-ms/loan-microservice.json', { type: 'OAS 2.0', mime: 'application/json' });
config.set('annotated-parameters/annotated-parameters.raml', { type: "RAML 1.0" });
config.set('oas-3-api/oas-3-api.yaml', { type: "OAS 3.0" });
config.set('modular-api/modular-api.raml', { type: "RAML 1.0" });
config.set('servers-api/servers-api.yaml', { type: 'OAS 3.0', mime: 'application/yaml' });
config.set('no-servers-api/no-servers-api.yaml', { type: 'OAS 3.0', mime: 'application/yaml' });
config.set('multiple-servers/multiple-servers.yaml', { type: 'OAS 3.0', mime: 'application/yaml' });
config.set('flattened-api/flattened-api.raml', { type: 'RAML 1.0', mime: 'application/yaml', flattened: true });
config.set('expanded-api/expanded-api.raml', { type: 'RAML 1.0', mime: 'application/yaml', flattened: false });
config.set('ext-docs/ext-docs.yaml', { type: 'OAS 3.0' });
config.set('missing-endpoints/missing-endpoints.raml', { type: 'RAML 1.0' });
config.set('unordered-endpoints/unordered-endpoints.raml', { type: 'RAML 1.0' });
config.set('rearrange-api/rearrange-api.raml', { type: 'RAML 1.0' });
config.set('simple-api/simple-api.raml', { type: 'RAML 1.0' });
config.set('example-generator-api/example-generator-api.raml', { type: "RAML 1.0" });
config.set('tracked-examples/tracked-to-linked.raml', { type: 'RAML 1.0' });
config.set('types-list/types-list.raml', { type: 'RAML 1.0' });
config.set('not-schema/not-schema.yaml', { type: 'OAS 3.0' });

const srcFolder = path.join('demo', 'apis');
const descFolder = path.join('demo', 'models');

class ApiParser {
  /**
   * @param {Map<string, ApiConfiguration>} list 
   */
  async batch(list) {
    await mkdir(descFolder, { recursive: true });
    for (const [file, info] of list) {
      console.log('Processing API file', file);
      try {
        // eslint-disable-next-line no-await-in-loop
        await this.run(file, info.type);
      } catch (e) {
        let message;
        if (e.message) {
          message = e.message;
        } else {
          message = e.toString();
        }
        console.error(`Unable to finish: `, message);
        process.exit(1);
      }
    }
  }

  /**
   * @param {string} file 
   * @param {string} vendor 
   * @returns {Promise<void>}
   */
  async run(file, vendor) {
    let destFile = `${file.substring(0, file.lastIndexOf('.')) }.json`;
    if (destFile.indexOf('/') !== -1) {
      destFile = destFile.substring(destFile.lastIndexOf('/'));
    }
    const location = path.join(srcFolder, file);
    const content = await this.parse(vendor, location);
    const destination = path.join(descFolder, destFile);
    await writeFile(destination, content);
  }

  /**
   * @param {string} vendor 
   * @param {string} location 
   * @returns {Promise<string>}
   */
  async parse(vendor, location) {
    const ro = new RenderOptions().withSourceMaps().withCompactUris();
    const apiConfiguration = this.getConfiguration(vendor).withRenderOptions(ro);
    const client = apiConfiguration.baseUnitClient();
    const result = await client.parse(`file://${location}`);
    const transformed = client.transform(result.baseUnit, PipelineId.Editing);
    return client.render(transformed.baseUnit, 'application/ld+json');
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

const parser = new ApiParser();
parser.batch(config);
