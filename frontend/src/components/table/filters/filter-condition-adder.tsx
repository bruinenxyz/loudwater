"use client";
import {
  FilterCondition,
  Operators,
  OperatorsEnumSchema,
} from "@/definitions/pipeline";
import { HydratedTable } from "@/definitions";
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

type ValueType = "property" | "value";

export default function FilterConditionAdder({
  table,
  conditions,
  setConditions,
}: {
  table: HydratedTable;
  conditions: FilterCondition[];
  setConditions: (conditions: FilterCondition[]) => void;
}) {
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [selectedOperator, setSelectedOperator] = useState<Operators | null>(
    null,
  );
  const [valueType, setValueType] = useState<ValueType | null>(null);
  const [selectedValue, setSelectedValue] = useState<
    string | boolean | number | null
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
        // If the value type is property, check if the selected property is a valid property on the table's schema
        return _.includes(_.keys(table.external_columns), selectedValue);
      } else {
        const selectedPropertyType =
          table.external_columns[selectedProperty].type;
        if (
          selectedPropertyType === "number" ||
          selectedPropertyType === "float"
        ) {
          // If the property type is number or float, check if the value is a number
          return "number" === typeof selectedValue;
        } else if (
          selectedPropertyType !== "date" &&
          selectedPropertyType !== "datetime"
        ) {
          // If the property type is not date or datetime, check if the type of the value is the same type as the property (only string and boolean left)
          return selectedPropertyType === typeof selectedValue;
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
      property: selectedProperty,
      operator: selectedOperator,
      value: selectedValue === null ? undefined : selectedValue,
    } as FilterCondition;
    const newConditions = [...conditions, newCondition] as FilterCondition[];
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

  function selectValueColumn(selection: string) {
    if (selectedValue && selection === selectedValue) {
      setSelectedValue(null);
    } else {
      setSelectedValue(selection);
    }
  }

  function renderValueSelector() {
    if (valueType === "property") {
      return (
        <Select<string>
          items={_.keys(table.external_columns)}
          itemPredicate={filterColumns}
          itemRenderer={renderColumn}
          onItemSelect={selectValueColumn}
          noResults={noResults}
        >
          <Button
            rightIcon="double-caret-vertical"
            text={
              selectedProperty ? (
                <Text className="font-bold">{selectedProperty}</Text>
              ) : (
                "Select column"
              )
            }
          />
        </Select>
      );
    }
    const selectedPropertyType = table.external_columns[selectedProperty!].type;
    switch (selectedPropertyType) {
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

  const filterColumns = (query: string, column: string) =>
    column.toLowerCase().includes(query.toLowerCase());

  const renderColumn: ItemRenderer<string> = (
    column: string,
    { handleClick, modifiers },
  ) => {
    return (
      <MenuItem
        key={column}
        roleStructure="listoption"
        selected={!!(selectedProperty && selectedProperty === column)}
        shouldDismissPopover={true}
        text={<Text className="font-bold">{column}</Text>}
        onClick={handleClick}
      />
    );
  };

  function selectColumn(selection: string) {
    if (selectedProperty && selection === selectedProperty) {
      setSelectedProperty(null);
    } else {
      setSelectedProperty(selection);
    }
  }

  const noResults = (
    <MenuItem disabled={true} text="No results." roleStructure="listoption" />
  );

  return (
    <div className="flex flex-row items-center mt-2">
      <Select<string>
        items={_.keys(table.external_columns)}
        itemPredicate={filterColumns}
        itemRenderer={renderColumn}
        onItemSelect={selectColumn}
        noResults={noResults}
      >
        <Button
          rightIcon="double-caret-vertical"
          text={
            selectedProperty ? (
              <Text className="font-bold">{selectedProperty}</Text>
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
