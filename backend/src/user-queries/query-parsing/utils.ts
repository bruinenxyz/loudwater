import * as _ from "lodash";

export const baseObjectTemplate = `
let {{ varName }} = (
  from {{ tableName }}
  derive {
    {{ deriveProperties }}
  }
  select {
    {{ selectProperties }}
  }
)`;

export const compileTemplate = (template: string, data: object) => {
  const templateOptions = {
    interpolate: /{{([\s\S]+?)}}/g, // This regex matches '{{ variableName }}'
  };
  const compiledTemplate = _.template(template, templateOptions)(data);
  return compiledTemplate;
};
