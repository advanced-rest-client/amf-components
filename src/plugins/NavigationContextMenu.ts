import { ContextMenu } from '@api-client/context-menu';

export class NavigationContextMenu extends ContextMenu {
  /**
   * Finds the click target which can be one of the model objects
   * or SVG elements.
   */
  findTarget(e: MouseEvent): HTMLElement|SVGElement|undefined {
    let target;
    const path = e.composedPath();
    while(path.length > 0) {
      const candidate = path.shift() as Element;
      if (candidate === this.workspace || (candidate.nodeType === Node.ELEMENT_NODE && (candidate.classList.contains('list-item') || candidate.classList.contains('section-title')))) {
        target = candidate as HTMLElement;
        break;
      }
    }
    return target;
  }

  /**
   * Maps an element to an internal target name.
   *
   * @param element The context click target
   * @returns The internal target name.
   */
  elementToTarget(element: HTMLElement): string|undefined {
    if (element === this.workspace) {
      return 'root';
    }
    if (element.dataset.graphShape) {
      return element.dataset.graphShape;
    }
    if (element.dataset.section) {
      return element.dataset.section;
    }
    return super.elementToTarget(element);
  }
}
