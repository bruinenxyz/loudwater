// const convertToColumns = (data) => {
//   return _.reduce(
//     data,
//     (acc, item, index) => {
//       const flattenedItem = flattenObject(item, "");
//       _.forEach(item, (value, key) => {
//         if (!acc[key]) {
//           acc[key] = _.times(index);
//         }
//         acc[key] = acc[key] || [];
//         acc[key].push(value);
//       });
//       return acc;
//     },
//     {},
//   );
// };

import _ from "lodash";

// const flattenObject = (data: any, prefix: string) => {
//   const newObject: any = {};
//   _.forEach(data, (value, key) => {
//     if (typeof value === "object") {
//       const flatObj = flattenObject(value, prefix + key + "_");
//       _.assign(newObject, flatObj);
//     } else {
//       newObject[prefix + key] = value;
//     }
//   });
// };

export const convertToColumns = (data: any) => {
  const columns = _.reduce(
    data,
    (acc: any, item: any, index: number) => {
      _.forEach(item, (value: any, key: string) => {
        acc[key] = acc[key] || [];
        acc[key].push(value);
      });
      return acc;
    },
    {},
  );

  return columns;
};
