import _ from "lodash";

export function makeFriendly(str: string) {
  if (!str) return str;
  const substrings = str.split(" ");
  const friendlySubstrings = substrings.map(
    (substring: string) => str.charAt(0).toUpperCase() + str.slice(1),
  );
  return friendlySubstrings.join(" ");
}

export function makeApiName(str: string) {
  if (!str) return str;
  // transform a string into an api (url safe) string replacing special characters and spaces with underscore, and deburring using lodash
  return _.deburr(str)
    .replace(/[^a-zA-Z0-9]/g, "_")
    .toLowerCase();
}
