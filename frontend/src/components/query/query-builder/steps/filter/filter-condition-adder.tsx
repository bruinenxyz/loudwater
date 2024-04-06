"use client";
import {
  FilterCondition,
  InferSchemaOutputSuccess,
  InferredSchemaColumn,
  InferredSchemaColumnSchema,
  Operators,
  OperatorsEnumSchema,
} from "@/definitions";
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
import SingleColumnSelector from "@/components/column-selectors/single-column-selector/single-column-selector";
import { useEffect, useState } from "react";
import * as _ from "lodash";

const operators: Operators[] = _.map(
  OperatorsEnumSchema.enum,
  (value: Operators) => {
    return value;
  },
);

export default function FilterConditionAdder({
  inputSchema,
  conditions,
  setConditions,
}: {
  inputSchema: InferSchemaOutputSuccess;
  conditions: FilterCondition[];
  setConditions: (conditions: FilterCondition[]) => void;
}) {
  const [selectedColumn, setSelectedColumn] =
    useState<InferredSchemaColumn | null>(null);
  const [selectedOperator, setSelectedOperator] = useState<Operators | null>(
    null,
  );
  const [valueType, setValueType] = useState<"column" | "value" | null>(null);
  const [selectedValue, setSelectedValue] = useState<
    InferredSchemaColumn | string | boolean | number | null
  >(null);

  // Reset operator, value type, & value when property changes
  useEffect(() => {
    setSelectedOperator(null);
    setValueType(null);
    setSelectedValue(null);
  }, [selectedColumn]);

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
    if (!selectedColumn || !selectedOperator) {
      // If no column or operator is selected, return false
      return false;
    } else if (!_.includes(["is_null", "is_not_null"], selectedOperator)) {
      // If the operator is not is_null or is_not_null, check if the value is valid
      if (!valueType || selectedValue === null) {
        // If no value type or value is selected, return false
        return false;
      } else if (valueType === "column") {
        // If the value type is column, check if the selected column is a valid column
        return (
          typeof selectedValue === "object" &&
          InferredSchemaColumnSchema.safeParse(selectedValue).success
        );
      } else {
        if (
          selectedColumn.type === "number" ||
          selectedColumn.type === "float"
        ) {
          // If the column type is number or float, check if the value is a number
          return "number" === typeof selectedValue;
        } else if (selectedColumn.type === "enum") {
          return "string" === typeof selectedValue;
        } else if (
          selectedColumn.type !== "date" &&
          selectedColumn.type !== "datetime"
        ) {
          // If the column type is not date or datetime, check if the type of the value is the same type as the column (only string and boolean left)
          return selectedColumn.type === typeof selectedValue;
        } else {
          // Otherwise, the value type is date or datetime, so check if the value is a string (to convert to date when adding the condition)
          return "string" === typeof selectedValue;
        }
      }
    } else {
      // If the operator is is_null or is_not_null, return true
      return true;
    }
  }

  function addCondition() {
    const newCondition = {
      column: selectedColumn,
      operator: selectedOperator,
      value: selectedValue === null ? undefined : selectedValue,
    } as FilterCondition;
    const newConditions = [...conditions, newCondition];
    setConditions(newConditions);
    setSelectedColumn(null);
    setSelectedOperator(null);
    setValueType(null);
    setSelectedValue(null);
  }

  function selectColumn(column: InferredSchemaColumn) {
    if (_.isEqual(column, selectedColumn)) {
      setSelectedColumn(null);
    } else {
      setSelectedColumn(column);
    }
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

  const renderValueType: ItemRenderer<"column" | "value"> = (
    type: "column" | "value",
    { handleClick, modifiers },
  ) => {
    return (
      <MenuItem
        roleStructure="listoption"
        selected={valueType === type}
        shouldDismissPopover={true}
        text={_.capitalize(type)}
        onClick={handleClick}
      />
    );
  };

  const selectValueType = (selection: "column" | "value") => {
    if (valueType && selection === valueType) {
      setValueType(null);
    } else {
      setValueType(selection);
    }
  };

  function selectValueColumn(column: InferredSchemaColumn) {
    if (_.isEqual(column, selectedValue)) {
      setSelectedValue(null);
    } else {
      setSelectedValue(column);
    }
  }

  function renderValueSelector() {
    if (valueType === "column") {
      return (
        <SingleColumnSelector
          disabled={false}
          items={_.filter(
            inputSchema.data.columns,
            (column: InferredSchemaColumn) =>
              !_.isEqual(column, selectedColumn),
          )}
          selected={(selectedValue as InferredSchemaColumn) || null}
          onColumnSelect={selectValueColumn}
        />
      );
    }
    switch (selectedColumn!.type) {
      case "boolean":
        return (
          <RadioGroup
            className="flex flex-row pt-1"
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
            allowNumericCharactersOnly={true}
            value={selectedValue !== null ? (selectedValue as number) : ""}
            onValueChange={(newValue: number) => setSelectedValue(newValue)}
          />
        );
      case "float":
        return (
          <NumericInput
            value={selectedValue !== null ? (selectedValue as number) : ""}
            onValueChange={(newValue: number) => setSelectedValue(newValue)}
          />
        );
      case "date":
        return (
          <DateInput3
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
    <div className="flex flex-row flex-wrap items-center mt-2 gap-x-2 gap-y-2">
      <SingleColumnSelector
        disabled={false}
        items={inputSchema.data.columns}
        selected={selectedColumn}
        onColumnSelect={selectColumn}
      />
      <Select<Operators>
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
      <Select<"column" | "value">
        items={["column", "value"]}
        itemRenderer={renderValueType}
        filterable={false}
        onItemSelect={selectValueType}
        disabled={
          !selectedOperator ||
          _.includes(["is_null", "is_not_null"], selectedOperator) ||
          !selectedColumn
        }
      >
        <Button
          text={valueType ? _.capitalize(valueType) : "Select value type"}
          rightIcon="double-caret-vertical"
          disabled={
            !selectedOperator ||
            _.includes(["is_null", "is_not_null"], selectedOperator) ||
            !selectedColumn
          }
        />
      </Select>
      {!selectedOperator ||
      !selectedColumn ||
      !valueType ||
      _.includes(["is_null", "is_not_null"], selectedOperator)
        ? null
        : renderValueSelector()}
      <Button
        disabled={!canAddCondition()}
        text="Add"
        onClick={() => addCondition()}
      />
    </div>
  );
}
