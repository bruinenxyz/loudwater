import json2csv from "json2csv";

export const convertToCSV = (json: any[]) => {
  const fields = Object.keys(json[0]);
  const csv = json2csv.parse(json, { fields });
  return csv;
};
