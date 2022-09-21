import { ApiEndPointListItem } from "../../types.js";

export class ApiSorting {
  /**
   * Sorts endpoints by path.
   */
  static sortEndpointsByPath(list: ApiEndPointListItem[]): ApiEndPointListItem[] {
    list.sort((a,b) => {
      if (a.path < b.path){
        return -1;
      }
      if (a.path > b.path){
        return 1;
      }
      return 0;
    });
    return list;
  }
}
