import React from "react";
import { Parameter } from "./query-parameters";
import {
  Button,
  ControlGroup,
  FormGroup,
  InputGroup,
  Popover,
  SegmentedControl,
} from "@blueprintjs/core";
import { Label } from "recharts";
import { on } from "events";

interface QueryParameterProps {
  parameter: Parameter;
  index: number;
  removeParameter: (index: number) => void;
  saveParameter: (parameter: Partial<Parameter>) => void;
  onValueChange: (index: number, value: any) => void;
}

const QueryParameter: React.FC<QueryParameterProps> = (props) => {
  const { parameter, saveParameter, onValueChange, index, removeParameter } =
    props;

  const [popoverOpen, setPopoverOpen] = React.useState(false);
  const [fieldValues, setFieldValues] = React.useState({
    name: parameter.name,
    description: parameter.description,
    type: parameter.type,
    defaultValue: parameter.defaultValue,
  });

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFieldValues({
      ...fieldValues,
      [e.target.name]: e.target.value,
    });
  };

  const handleConfirm = () => {
    saveParameter(fieldValues);
    setPopoverOpen(false);
  };

  const getRightElement = () => {
    return (
      <Popover
        isOpen={popoverOpen}
        onInteraction={(nextOpenState) => setPopoverOpen(nextOpenState)}
        content={
          <div style={{ padding: "10px" }}>
            <h5>Edit Parameter</h5>
            <SegmentedControl
              defaultValue="text"
              options={[
                {
                  label: "Text",
                  value: "text",
                },
                {
                  label: "Date",
                  value: "date",
                },
                {
                  label: "Number",
                  value: "number",
                },
              ]}
              onValueChange={(value) => {
                setFieldValues({
                  ...fieldValues,
                  type: value,
                });
              }}
            />
            <FormGroup label="Name" labelFor="name">
              <InputGroup
                id="name"
                name="name"
                placeholder="Name"
                value={fieldValues.name}
                onChange={handleFieldChange}
              />
            </FormGroup>
            <FormGroup label="Description" labelFor="description">
              <InputGroup
                id="description"
                name="description"
                placeholder="Description"
                value={fieldValues.description}
                onChange={handleFieldChange}
              />
            </FormGroup>
            <FormGroup label="Default Value" labelFor="defaultValue">
              <InputGroup
                id="defaultValue"
                name="defaultValue"
                type={fieldValues.type}
                placeholder="Default Value"
                value={fieldValues.defaultValue}
                onChange={handleFieldChange}
              />
            </FormGroup>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "10px",
              }}
            >
              <Button
                style={{ marginRight: "5px" }}
                onClick={() => {
                  setPopoverOpen(false);
                  setFieldValues({
                    name: "",
                    description: "",
                    type: "",
                    defaultValue: "",
                  });
                }}
              >
                Cancel
              </Button>
              <Button intent="primary" onClick={handleConfirm}>
                Confirm
              </Button>
            </div>
          </div>
        }
      >
        <Button
          icon="settings"
          minimal={true}
          onClick={() => setPopoverOpen(true)}
        />
      </Popover>
    );
  };
  return (
    <div className="">
      <FormGroup
        label={
          <div className="flex items-center">
            <span className="mr-2">{parameter.name}</span>
            <Button
              icon="cross"
              minimal={true}
              small={true}
              className="ml-auto"
              onClick={() => removeParameter(index)}
            />
          </div>
        }
        helperText={parameter.description ? parameter.description : undefined}
      >
        <InputGroup
          small
          value={parameter.value || parameter.defaultValue}
          type={parameter.type}
          onValueChange={(value) => onValueChange(index, value)}
          rightElement={getRightElement()}
        />
      </FormGroup>
    </div>
  );
};

export default QueryParameter;
