"use client";
import {
  FilterCondition,
  Operators,
  OperatorsEnumSchema,
} from "@/definitions/pipeline";
import {
  HydratedTable,
  InferredSchemaColumn,
  InferredSchemaColumnSchema,
} from "@/definitions";
import {
  Button,
  InputGroup,
  MenuItem,
  NumericInput,
  Radio,
  RadioGroup,
  Text,
} from "@blueprintjs/core";
import { DateInput3 } from "@blueprintjs/datetime2";
import { ItemRenderer, Select } from "@blueprintjs/select";
import { useEffect, useState } from "react";
import * as _ from "lodash";

const operators: Operators[] = _.map(
  OperatorsEnumSchema.enum,
  (value: Operators) => {
    return value;
  },
);

type ValueType = "column" | "value";

export default function FilterConditionAdder({
  table,
  conditions,
  setConditions,
}: {
  table: HydratedTable;
  conditions: FilterCondition[];
  setConditions: (conditions: FilterCondition[]) => void;
}) {
  const [selectedColumn, setSelectedColumn] =
    useState<InferredSchemaColumn | null>(null);
  const [selectedOperator, setSelectedOperator] = useState<Operators | null>(
    null,
  );
  const [valueType, setValueType] = useState<ValueType | null>(null);
  const [selectedValue, setSelectedValue] = useState<
    string | boolean | number | null | InferredSchemaColumn
  >(null);

  // Reset operator, value type, & value when column changes
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
        // If the value type is column, check if the selected column is a valid column on the table's schema
        return (
          typeof selectedValue === "object" &&
          "name" in selectedValue &&
          _.includes(_.keys(table.external_columns), selectedValue.name)
        );
      } else {
        if (
          selectedColumn.type === "number" ||
          selectedColumn.type === "float"
        ) {
          // If the column type is number or float, check if the value is a number
          return "number" === typeof selectedValue;
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
      column: { ...selectedColumn, table: table.id },
      operator: selectedOperator,
      value: selectedValue === null ? undefined : selectedValue,
    } as FilterCondition;
    const newConditions = [...conditions, newCondition] as FilterCondition[];
    setConditions(newConditions);
    setSelectedColumn(null);
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

  const renderValueType: ItemRenderer<ValueType> = (
    type: ValueType,
    { handleClick, modifiers },
  ) => {
    return (
      <MenuItem
        roleStructure="listoption"
        selected={valueType === type}
        shouldDismissPopover={true}
        text={type}
        onClick={handleClick}
      />
    );
  };

  const selectValueType = (selection: ValueType) => {
    if (valueType && selection === valueType) {
      setValueType(null);
    } else {
      setValueType(selection);
    }
  };

  const renderValueColumn: ItemRenderer<InferredSchemaColumn> = (
    column: InferredSchemaColumn,
    { handleClick, modifiers },
  ) => {
    return (
      <MenuItem
        key={column.name}
        roleStructure="listoption"
        selected={
          !!(
            selectedValue &&
            typeof selectedValue === "object" &&
            selectedValue.name === column.name
          )
        }
        shouldDismissPopover={true}
        text={<Text className="font-bold">{column.name}</Text>}
        onClick={handleClick}
      />
    );
  };

  function selectValueColumn(selection: InferredSchemaColumn) {
    if (
      selectedValue &&
      typeof selectedValue === "object" &&
      "name" in selectedValue &&
      selection.name === selectedValue.name
    ) {
      setSelectedValue(null);
    } else {
      setSelectedValue(selection);
    }
  }

  function renderValueSelector() {
    if (valueType === "column") {
      return (
        <Select<InferredSchemaColumn>
          items={_.map(table.external_columns, (column) => {
            return { ...column, table: table.id };
          })}
          itemPredicate={filterColumns}
          itemRenderer={renderValueColumn}
          onItemSelect={selectValueColumn}
          noResults={noResults}
        >
          <Button
            className="ml-3"
            rightIcon="double-caret-vertical"
            text={
              selectedValue && typeof selectedValue === "object" ? (
                <Text className="font-bold">{selectedValue.name}</Text>
              ) : (
                "Select column"
              )
            }
          />
        </Select>
      );
    }
    switch (selectedColumn!.type) {
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

  const filterColumns = (query: string, column: InferredSchemaColumn) =>
    column.name.toLowerCase().includes(query.toLowerCase());

  const renderColumn: ItemRenderer<InferredSchemaColumn> = (
    column: InferredSchemaColumn,
    { handleClick, modifiers },
  ) => {
    return (
      <MenuItem
        key={column.name}
        roleStructure="listoption"
        selected={!!(selectedColumn && selectedColumn.name === column.name)}
        shouldDismissPopover={true}
        text={<Text className="font-bold">{column.name}</Text>}
        onClick={handleClick}
      />
    );
  };

  function selectColumn(selection: InferredSchemaColumn) {
    if (selectedColumn && selection.name === selectedColumn.name) {
      setSelectedColumn(null);
    } else {
      setSelectedColumn(selection);
    }
  }

  const noResults = (
    <MenuItem disabled={true} text="No results." roleStructure="listoption" />
  );

  return (
    <div className="flex flex-row items-center mt-2">
      <Select<InferredSchemaColumn>
        items={_.map(table.external_columns, (column) => {
          return { ...column, table: table.id };
        })}
        itemPredicate={filterColumns}
        itemRenderer={renderColumn}
        onItemSelect={selectColumn}
        noResults={noResults}
      >
        <Button
          rightIcon="double-caret-vertical"
          text={
            selectedColumn ? (
              <Text className="font-bold">{selectedColumn.name}</Text>
            ) : (
              "Select column"
            )
          }
        />
      </Select>
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
      <Select<ValueType>
        className="ml-3"
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
        className="ml-3"
        text="Add"
        onClick={() => addCondition()}
      />
    </div>
  );
}
