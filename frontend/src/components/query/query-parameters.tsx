import React from "react";
import { Button, EditableText, FormGroup } from "@blueprintjs/core";
import { Select } from "@blueprintjs/select";
import * as _ from "lodash";
import QueryParameter from "./query-parameter";

export interface Parameter {
  name: string;
  description: string;
  type: string;
  defaultValue: string;
  value: any;
}

interface QueryParametersProps {
  parameters: Parameter[];
  setParameters: (parameters: Parameter[]) => void;
}

const QueryParameters: React.FC<QueryParametersProps> = (props) => {
  const { parameters, setParameters } = props;

  const saveParameter = (index: number, parameter: Partial<Parameter>) => {
    const newParameters = _.cloneDeep(parameters);
    newParameters[index] = {
      ...newParameters[index],
      ...parameter,
    };
    setParameters(newParameters);
  };

  const removeParameter = (index: number) => {
    const newParameters = _.cloneDeep(parameters);
    newParameters.splice(index, 1);
    setParameters(newParameters);
  };

  const setValue = (index: number, value: any) => {
    const newParameters = _.cloneDeep(parameters);
    newParameters[index].value = value;
    setParameters(newParameters);
  };

  const addParameter = () => {
    setParameters([
      ...parameters,
      {
        type: "string",
        defaultValue: "",
        value: null,
        name: "new_parameter",
        description: "",
      },
    ]);
  };

  return (
    <div className="my-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
      {_.map(parameters, (p, index) => {
        return (
          <div key={index} className="col-span-1 items-center">
            <QueryParameter
              parameter={p}
              index={index}
              saveParameter={(param) => saveParameter(index, param)}
              removeParameter={(index) => removeParameter(index)}
              onValueChange={setValue}
            />
          </div>
        );
      })}
      <div className="col-span-1 flex justify-center items-center">
        <Button icon="plus" onClick={addParameter} fill></Button>
      </div>
    </div>
  );
};

export default QueryParameters;
