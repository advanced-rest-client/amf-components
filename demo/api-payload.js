import { html } from 'lit-html';
import { AmfDemoBase } from './lib/AmfDemoBase.js';
import '../define/api-payload-document.js';

/** @typedef {import('../').Amf.Payload} Payload */
/** @typedef {import('../src/events/NavigationEvents').ApiNavigationEvent} ApiNavigationEvent */

/** 
 * @typedef ResponsePayload 
 * @property {string} code
 * @property {Payload[]} payloads
 */

class ComponentPage extends AmfDemoBase {
  constructor() {
    super();
    this.initObservableProperties([ 
      'request', 'response',
    ]);
    /** @type Payload[] */
    this.request = undefined;
    /** @type ResponsePayload[] */
    this.response = undefined;
    this.componentName = 'api-payload-document';
  }

  /**
   * @param {ApiNavigationEvent} e
   */
  _navChanged(e) {
    const { domainId, domainType, passive } = e.detail;
    if (passive) {
      return;
    }
    this.request = [];
    this.response = [];
    if (domainType === 'operation') {
      this.setPayloads(domainId);
    }
  }

  /**
   * @param {string} operationId
   */
  setPayloads(operationId) {
    const webApi = this._computeApi(this.amf);
    const operation = this._computeMethodModel(webApi, operationId);
    if (!operation) {
      return;
    }
    const expects = this._computeExpects(operation);
    if (expects) {
      let payloads = expects[this._getAmfKey(this.ns.aml.vocabularies.apiContract.payload)];
      if (payloads) {
        if (!Array.isArray(payloads)) {
          payloads = [payloads];
        }
        this.request = payloads;
      }
    }

    const returns = operation[this._getAmfKey(this.ns.aml.vocabularies.apiContract.returns)];
    if (Array.isArray(returns)) {
      const result = [];
      returns.forEach((response) => {
        const code = this._getValue(response, this.ns.aml.vocabularies.apiContract.statusCode);
        let payloads = response[this._getAmfKey(this.ns.aml.vocabularies.apiContract.payload)];
        if (payloads) {
          if (!Array.isArray(payloads)) {
            payloads = [payloads];
          }
          const item = /** @type ResponsePayload */ ({
            code,
            payloads,
          });
          result.push(item);
        }
      });
      this.response = result;
    }
  }

  contentTemplate() {
    return html`
      <h2>API payload</h2>
      <p>Former <code>api-body-document</code></p>
      ${this.demoTemplate()}
    `;
  }

  demoTemplate() {
    const { loaded } = this;
    return html`
    <section class="documentation-section">
      <h3>Interactive demo</h3>
      <p>
        This demo lets you preview the API payload document with various configuration options.
      </p>

      ${!loaded ? html`<p>Load an API model first.</p>` : this.loadedTemplate()}
    </section>
    `;
  }

  loadedTemplate() {
    return html`
    ${this.componentTemplate()}
    `;
  }

  componentTemplate() {
    const { request, response } = this;
    const hasRequests = Array.isArray(request) && !!request.length;
    const hasResponses = Array.isArray(response) && !!response.length;
    if (!hasRequests && !hasResponses) {
      return html`<p>Select API operation in the navigation</p>`;
    }
    return html`
    ${this.requestsTemplate()}
    ${this.responsesTemplate()}
    `;
  }

  requestsTemplate() {
    const { request } = this;
    if (!Array.isArray(request) || !request.length) {
      return '';
    }
    return html`
    <div class="payload-section">
      <h3>Request payload</h3>
      ${request.map(p => this.payloadTemplate(p))}
    </div>
    `;
  }

  responsesTemplate() {
    const { response } = this;
    if (!Array.isArray(response) || !response.length) {
      return '';
    }
    return html`
    <div class="payload-section">
      <h3>Response payload</h3>
      ${response.map((item) => this.responseItemTemplate(item))}
    </div>
    `;
  }

  /**
   * @param {ResponsePayload} item
   */
  responseItemTemplate(item) {
    const { code, payloads } = item;
    const hasPayload = Array.isArray(payloads) && !!payloads.length;
    return html`
    <div class="payload-item">
      <h4>Status code: ${code}</h4>
      ${!hasPayload ? html`<p>No payload defined for this status code</p>` : ''}
      ${hasPayload ? payloads.map(p => this.payloadTemplate(p)) : ''}
    </div>
    `;
  }

  /**
   * @param {Payload} payload
   */
  payloadTemplate(payload) {
    return html`
    <api-payload-document .domainId="${payload['@id']}"></api-payload-document>
    `;
  }

  _apiListTemplate() {
    const result = [];
    [
      ['demo-api', 'Demo API'],
      ['SE-11508', 'SE-11508'],
      ['SE-12291', 'OAS "and" type'],
      ['APIC-463', 'APIC-463'],
      ['anyOf', 'AnyOf'],
      ['stevetest', 'stevetest'],
    ].forEach(([file, label]) => {
      result[result.length] = html`
      <anypoint-item data-src="models/${file}.json">${label}</anypoint-item>
      `;
    });
    return result;
  }
}
const instance = new ComponentPage();
instance.render();
