import * as _ from "lodash";

export function mergeByKey(arr1: any[], obj: any) {
  if (!arr1) {
    return [];
  }
  const index = _.findIndex(arr1, { id: obj.id });
  if (index === -1) {
    return arr1;
  }
  arr1[index] = obj;
  return arr1;
}
