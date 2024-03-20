"use client";
import {
  InferredSchema,
  InferredSchemaProperty,
  Operators,
  OperatorsEnumSchema,
} from "@/definitions/pipeline";
import {
  Button,
  InputGroup,
  MenuItem,
  NumericInput,
  Radio,
  RadioGroup,
} from "@blueprintjs/core";
import { DateInput3 } from "@blueprintjs/datetime2";
import { ItemRenderer, Select } from "@blueprintjs/select";
import { SinglePropertySelector } from "@/components/old-reference/property-selectors";
import { FilterCreatorCondition } from "./filter-step-creator";
import { useEffect, useState } from "react";
import * as _ from "lodash";

const operators: Operators[] = _.map(
  OperatorsEnumSchema.enum,
  (value: Operators) => {
    return value;
  },
);

export default function FilterConditionAdder({
  schema,
  conditions,
  setConditions,
}: {
  schema: InferredSchema;
  conditions: FilterCreatorCondition[];
  setConditions: (conditions: FilterCreatorCondition[]) => void;
}) {
  const [selectedProperty, setSelectedProperty] =
    useState<InferredSchemaProperty | null>(null);
  const [selectedOperator, setSelectedOperator] = useState<Operators | null>(
    null,
  );
  const [valueType, setValueType] = useState<"property" | "value" | null>(null);
  const [selectedValue, setSelectedValue] = useState<
    InferredSchemaProperty | string | boolean | number | null
  >(null);

  // Reset operator, value type, & value when property changes
  useEffect(() => {
    setSelectedOperator(null);
    setValueType(null);
    setSelectedValue(null);
  }, [selectedProperty]);

  // Reset value type & value when operator changes to null or is_null/is_not_null
  useEffect(() => {
    if (
      !selectedOperator ||
      _.includes(["is_null", "is_not_null"], selectedOperator)
    ) {
      setValueType(null);
      setSelectedValue(null);
    }
  }, [selectedOperator]);

  // Reset value when value type changes
  useEffect(() => {
    setSelectedValue(null);
  }, [valueType]);

  // Checks if the condition can be added to the list of conditions
  function canAddCondition() {
    if (!selectedProperty || !selectedOperator) {
      // If no property or operator is selected, return false
      return false;
    } else if (!_.includes(["is_null", "is_not_null"], selectedOperator)) {
      // If the operator is not is_null or is_not_null, check if the value is valid
      if (!valueType || selectedValue === null) {
        // If no value type or value is selected, return false
        return false;
      } else if (valueType === "property") {
        // If the value type is property, check if the selected property is a valid property on the schema
        return _.includes(
          _.map(schema!.properties, "api_path"),
          (selectedValue as InferredSchemaProperty).api_path,
        );
      } else if (
        selectedProperty.type === "number" ||
        selectedProperty.type === "float"
      ) {
        // If the property type is number or float, check if the value is a number
        return "number" === typeof selectedValue;
      } else if (
        selectedProperty.type !== "date" &&
        selectedProperty.type !== "datetime"
      ) {
        // If the property type is not date or datetime, check if the type of the value is the same type as the property (only string and boolean left)
        return selectedProperty.type === typeof selectedValue;
      } else {
        // Otherwise, the value type is date or datetime, so check if the value is a string (to convert to date when adding the condition)
        return "string" === typeof selectedValue;
      }
    } else {
      // If the operator is is_null or is_not_null, return true
      return true;
    }
  }

  function addCondition() {
    const newCondition = {
      property: selectedProperty,
      operator: selectedOperator,
      value: selectedValue === null ? undefined : selectedValue,
    } as FilterCreatorCondition;
    const newConditions = [...conditions, newCondition];
    setConditions(newConditions);
    setSelectedProperty(null);
    setSelectedOperator(null);
    setValueType(null);
    setSelectedValue(null);
  }

  const renderOperator: ItemRenderer<Operators> = (
    operator: Operators,
    { handleClick, modifiers },
  ) => {
    return (
      <MenuItem
        key={operator}
        roleStructure="listoption"
        selected={operator === selectedOperator}
        text={operator.replace(/_/g, " ")} // Makes operators more readable by replacing underscores with spaces
        onClick={handleClick}
      />
    );
  };

  function selectOperator(selection: Operators) {
    if (selectedOperator && selection === selectedOperator) {
      setSelectedOperator(null);
    } else {
      setSelectedOperator(selection);
    }
  }

  const renderValueType: ItemRenderer<"property" | "value"> = (
    type: "property" | "value",
    { handleClick, modifiers },
  ) => {
    return (
      <MenuItem
        roleStructure="listoption"
        selected={valueType === type}
        shouldDismissPopover={true}
        text={type.charAt(0).toUpperCase() + type.slice(1)}
        onClick={handleClick}
      />
    );
  };

  const selectValueType = (selection: "property" | "value") => {
    if (valueType && selection === valueType) {
      setValueType(null);
    } else {
      setValueType(selection);
    }
  };

  function renderValueSelector() {
    if (valueType === "property") {
      return (
        <SinglePropertySelector
          className="ml-3"
          selectedProperty={selectedValue as InferredSchemaProperty | null}
          setSelectedProperty={setSelectedValue}
          items={_.filter(
            schema!.properties,
            (property: InferredSchemaProperty) =>
              property.api_path !== selectedProperty!.api_path,
          )}
        />
      );
    }
    switch (selectedProperty!.type) {
      case "boolean":
        return (
          <RadioGroup
            className="flex flex-row pt-1 ml-3"
            selectedValue={
              selectedValue !== null ? selectedValue.toString() : undefined
            }
            onChange={(event) => {
              setSelectedValue(event.currentTarget.value === "true");
            }}
          >
            <Radio label="true" value="true" />
            <Radio className="ml-2" label="false" value="false" />
          </RadioGroup>
        );
      case "number":
        return (
          <NumericInput
            className="ml-3"
            allowNumericCharactersOnly={true}
            value={selectedValue !== null ? (selectedValue as number) : ""}
            onValueChange={(newValue: number) => setSelectedValue(newValue)}
          />
        );
      case "float":
        return (
          <NumericInput
            className="ml-3"
            value={selectedValue !== null ? (selectedValue as number) : ""}
            onValueChange={(newValue: number) => setSelectedValue(newValue)}
          />
        );
      case "date":
        return (
          <DateInput3
            className="ml-3"
            popoverProps={{ placement: "top" }}
            dateFnsFormat="yyyy-MM-dd"
            value={selectedValue !== null ? (selectedValue as string) : null}
            onChange={(newValue: string | null) => {
              setSelectedValue(
                newValue ? new Date(newValue).toISOString() : newValue,
              );
            }}
          />
        );
      case "datetime":
        return (
          <DateInput3
            className="ml-3"
            popoverProps={{ placement: "top" }}
            showTimezoneSelect={true}
            timePrecision="minute"
            dateFnsFormat="yyyy-MM-dd HH:mm"
            timePickerProps={{
              showArrowButtons: false,
              useAmPm: true,
              precision: "minute",
            }}
            value={selectedValue !== null ? (selectedValue as string) : null}
            onChange={(newValue: string | null) => {
              setSelectedValue(
                newValue ? new Date(newValue).toISOString() : newValue,
              );
            }}
          />
        );
      default:
        return (
          <InputGroup
            id="value-input"
            className="ml-3"
            value={selectedValue !== null ? (selectedValue as string) : ""}
            onValueChange={(newValue: string) => {
              setSelectedValue(newValue);
            }}
            autoFocus={false}
          />
        );
    }
  }

  return (
    <div className="flex flex-row items-center mt-2">
      <SinglePropertySelector
        selectedProperty={selectedProperty}
        setSelectedProperty={setSelectedProperty}
        items={schema!.properties}
      />
      <Select<Operators>
        className="ml-3"
        filterable={false}
        items={operators}
        itemRenderer={renderOperator}
        onItemSelect={selectOperator}
      >
        <Button
          rightIcon="double-caret-vertical"
          text={
            selectedOperator
              ? selectedOperator.replace(/_/g, " ") // Makes operators more readable by replacing underscores with spaces
              : "Select operator"
          }
        />
      </Select>
      <Select<"property" | "value">
        className="ml-3"
        items={["property", "value"]}
        itemRenderer={renderValueType}
        filterable={false}
        onItemSelect={selectValueType}
        disabled={
          !selectedOperator ||
          _.includes(["is_null", "is_not_null"], selectedOperator) ||
          !selectedProperty
        }
      >
        <Button
          text={valueType ? _.capitalize(valueType) : "Select value type"}
          rightIcon="double-caret-vertical"
          disabled={
            !selectedOperator ||
            _.includes(["is_null", "is_not_null"], selectedOperator) ||
            !selectedProperty
          }
        />
      </Select>
      {!selectedOperator ||
      !selectedProperty ||
      !valueType ||
      _.includes(["is_null", "is_not_null"], selectedOperator)
        ? null
        : renderValueSelector()}
      <Button
        disabled={!canAddCondition()}
        className="ml-3"
        text="Add"
        onClick={() => addCondition()}
      />
    </div>
  );
}
