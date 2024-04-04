import React from "react";
import { Button } from "@blueprintjs/core";
import QueryParameter from "./query-parameter";
import * as _ from "lodash";

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
    <div className="flex flex-row flex-wrap items-center w-full gap-2 mb-2">
      {_.map(parameters, (p, index) => {
        return (
          <QueryParameter
            key={index}
            parameter={p}
            index={index}
            saveParameter={(param) => saveParameter(index, param)}
            removeParameter={(index) => removeParameter(index)}
            onValueChange={setValue}
          />
        );
      })}

      <div className="w-fit">
        <Button icon="plus" onClick={addParameter} fill>
          Add parameter
        </Button>
      </div>
    </div>
  );
};

export default QueryParameters;
