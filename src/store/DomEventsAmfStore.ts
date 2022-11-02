import { InMemAmfGraphStore } from './InMemAmfGraphStore.js';
import { AmfStoreDomEventsMixin } from './mixins/AmfStoreDomEventsMixin.js';

export class DomEventsAmfStore extends AmfStoreDomEventsMixin(InMemAmfGraphStore) {
  
}
