import '../define/api-documentation.js';
import '../define/api-request.js';
import '../define/api-navigation.js';
import '../define/xhr-simple-request.js';
import { DomEventsAmfStore } from '../index.js';

async function downloadAmfModel() {
  const response = await fetch('/demo/models/demo-api.json');
  return response.json();
}

async function init() {
  const apiStore = new DomEventsAmfStore();
  apiStore.listen();
  const model = await downloadAmfModel();
  apiStore.amf = model;
}
init();
