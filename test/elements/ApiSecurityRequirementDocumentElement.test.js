import { fixture, assert, html, aTimeout } from '@open-wc/testing';
import { AmfLoader } from '../AmfLoader.js';
import { DomEventsAmfStore } from '../../src/store/DomEventsAmfStore.js';
import '../../define/api-security-requirement-document.js';

/** @typedef {import('../../').ApiSecurityRequirementDocumentElement} ApiSecurityRequirementDocumentElement */
/** @typedef {import('../../src/helpers/amf').AmfDocument} AmfDocument */
/** @typedef {import('../../src/helpers/amf').DomainElement} DomainElement */
/** @typedef {import('../../src/helpers/amf').SecurityRequirement} SecurityRequirement */
/** @typedef {import('../../src/helpers/api').ApiSecurityRequirement} ApiSecurityRequirement */

describe('ApiSecurityRequirementDocumentElement', () => {
  const loader = new AmfLoader();
  const store = new DomEventsAmfStore(window);
  store.listen();

  /**
   * @param {string=} domainId
   * @returns {Promise<ApiSecurityRequirementDocumentElement>}
   */
  async function domainIdFixture(domainId) {
    const element = await fixture(html`<api-security-requirement-document 
      .queryDebouncerTimeout="${0}"
      .domainId="${domainId}"
    ></api-security-requirement-document>`);
    await aTimeout(0);
    return /** @type ApiSecurityRequirementDocumentElement */ (element);
  }

  /**
   * @param {ApiSecurityRequirement=} model
   * @returns {Promise<ApiSecurityRequirementDocumentElement>}
   */
  async function modelFixture(model) {
    const element = await fixture(html`<api-security-requirement-document 
      .queryDebouncerTimeout="${0}"
      .securityRequirement="${model}"
    ></api-security-requirement-document>`);
    await aTimeout(0);
    return /** @type ApiSecurityRequirementDocumentElement */ (element);
  }

  /** @type AmfDocument */
  let model;
  before(async () => {
    model = await loader.getGraph('secured-api');
    store.amf = model;
  });

  it('finds the security for an operation', async () => {
    const op = loader.getOperation(model, '/custom1', 'get');
    const [security] = op.security;
    const { id } = security;
    const element = await domainIdFixture(id);
    assert.deepEqual(element.securityRequirement, security);
  });

  it('renders the security requirement when passing a serialized model', async () => {
    const op = loader.getOperation(model, '/custom1', 'get');
    const [security] = op.security;
    const element = await modelFixture(security);
    const node = element.shadowRoot.querySelector('api-parametrized-security-scheme');
    assert.ok(node, 'has the documentation element node');
  });
});
