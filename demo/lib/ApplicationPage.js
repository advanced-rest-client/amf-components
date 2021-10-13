/* eslint-disable class-methods-use-this */
import { ReactiveMixin } from './mixins/ReactiveMixin.js';
import { RenderableMixin } from './mixins/RenderableMixin.js';

/**
 * A base class for pages build outside the LitElement. It uses `lit-html` 
 * as the template renderer.
 * 
 * The implementation (extending this class) should override the `appTemplate()`
 * function that returns the `TemplateResult` from the `lit-html` library.
 * 
 * To reflect the changed state call the `render()` function. The function schedules
 * a micro task (through `requestAnimationFrame`) to call the render function on the template.
 * 
 * More useful option is to use the `initObservableProperties()` function that accepts a list 
 * of properties set on the base class that once set triggers the render function. The setter checks
 * whether the a value actually changed. It works well for primitives but it won't work as expected
 * for complex types.
 */
export class ApplicationPage extends RenderableMixin(ReactiveMixin(EventTarget)) {
  constructor() {
    super();
    this.initObservableProperties('isMobile');
    /** 
     * True when the app should render mobile friendly view.
     */
    this.isMobile = false;
    this.initMediaQueries();
  }

  /**
   * Initializes media queries and observers.
   */
  initMediaQueries() {
    const mql = window.matchMedia('(max-width: 600px)');
    this.isMobile = mql.matches;
    mql.addEventListener('change', (e) => {
      this.isMobile = e.matches;
    });
  }
}
