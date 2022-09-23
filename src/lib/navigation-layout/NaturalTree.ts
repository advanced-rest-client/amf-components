/* eslint-disable no-param-reassign */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-plusplus */

import { ApiEndpointsTreeItem, ApiEndPointWithOperationsListItem } from "../../types.js";

/**
 * A class that transforms the list of endpoints and methods into
 * a "natural" tree structure with indentation.
 * This is consistent with the legacy API navigation element sorting.
 */
export class NaturalTree {
  result: ApiEndpointsTreeItem[];

  basePaths: string[];

  constructor() {
    this.result = [];
    this.basePaths = [];
  }

  /**
   * @param list The list of endpoints as they appear in the API.
   */
  create(list: ApiEndPointWithOperationsListItem[]): ApiEndpointsTreeItem[] {
    list.forEach((item) => this.appendEndpointItem(item));
    return this.result;
  }

  appendEndpointItem(item: ApiEndPointWithOperationsListItem): void {
    const { path, name, id, operations,  } = item;
    const result: ApiEndpointsTreeItem = ({
      path,
      label: name,
      name,
      id,
      indent: 0,
      operations,
      hasChildren: false,
      hasShortPath: false,
    });

    let tmpPath = path;
    if (tmpPath[0] === '/') {
      tmpPath = tmpPath.substring(1);
    }
    const parts = tmpPath.split('/');
    let indent = 0;
    this.basePaths.push(path);

    if (parts.length > 1 /* && !this.renderFullPaths */) {
      const lowerParts = parts.slice(0, parts.length - 1);
      if (lowerParts.length) {
        for (let i = lowerParts.length - 1; i >= 0; i--) {
          const currentPath = `/${lowerParts.slice(0, i + 1).join('/')}`;
          const previousBasePathItem = this.basePaths[this.basePaths.length - 2];
          if (previousBasePathItem && (previousBasePathItem === currentPath || previousBasePathItem.startsWith(`${currentPath}/`))) {
            indent++;
          }
        }
      }
    }
    if (!result.label) {
      if (indent > 0) {
        try {
          result.label = this.computePathName(path, parts, indent);
        } catch (_) {
          result.label = path;
        }
      } else {
        result.label = path;
      }
    }
    result.indent = indent;
    this.result.push(result);
  }

  /**
   * Computes label for an endpoint when name is missing and the endpoint
   * is indented, hence name should be truncated.
   * @param currentPath Endpoint's path
   * @param parts Path parts
   * @param indent Endpoint indentation
   */
   computePathName(currentPath: string, parts: string[], indent: number): string {
    const { basePaths } = this;
    let path = '';
    
    const latestBasePath = basePaths[basePaths.length - 1];
    for (let i = 0, len = parts.length - 1; i < len; i++) {
      path += `/${parts[i]}`;
      if (!latestBasePath || latestBasePath.indexOf(`${path}/`) !== -1) {
        indent--;
      }
      if (indent === 0) {
        break;
      }
    }
    return currentPath.replace(path, '');
  }
}
