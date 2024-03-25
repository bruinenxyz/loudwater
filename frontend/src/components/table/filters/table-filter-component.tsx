"use client";
import {
  FilterCondition,
  FilterLogicalOperators,
  FilterStep,
  FilterStepSchema,
  OrderStep,
  StepIdentifierEnum,
  TakeStep,
} from "@/definitions/pipeline";
import { ExternalColumn, HydratedTable } from "@/definitions";
import { Button, Icon, MenuItem, Popover, Text } from "@blueprintjs/core";
import { ItemRenderer, Select } from "@blueprintjs/select";
import FilterConditionAdder from "./filter-condition-adder";
import { getFormattedDateStrings } from "@/utils/value-format";
import { useEffect, useState } from "react";
import * as _ from "lodash";

export default function TableFilterComponent({
  table,
  resultsConfig,
  setResultsConfig,
}: {
  table: HydratedTable;
  resultsConfig: {
    filters?: FilterStep;
    order?: OrderStep;
    take?: TakeStep;
  };
  setResultsConfig: (config: {
    filters?: FilterStep;
    order?: OrderStep;
    take?: TakeStep;
  }) => void;
}) {
  const [logicalOperator, setLogicalOperator] =
    useState<FilterLogicalOperators>("and");
  const [conditions, setConditions] = useState<FilterCondition[]>([]);

  useEffect(() => {
    if (conditions.length === 0) {
      setResultsConfig({
        ...resultsConfig,
        filters: undefined,
      });
    } else {
      const filters: FilterStep = FilterStepSchema.parse({
        type: StepIdentifierEnum.Filter,
        logicalOperator: logicalOperator,

        conditions: conditions,
      });
      setResultsConfig({
        ...resultsConfig,
        filters: filters,
      });
    }
  }, [logicalOperator, conditions]);

  const renderLogicalOperator: ItemRenderer<FilterLogicalOperators> = (
    operator: FilterLogicalOperators,
    { handleClick, modifiers },
  ) => {
    return (
      <MenuItem
        key={operator}
        roleStructure="listoption"
        selected={operator === logicalOperator}
        text={operator}
        onClick={handleClick}
      />
    );
  };

  function removeCondition(arrayIndex: number) {
    const newConditions = [...conditions];
    newConditions.splice(arrayIndex, 1);
    setConditions(newConditions);
  }

  function renderConditions() {
    const renderValue = (
      value: string | number | boolean | undefined,
      property: ExternalColumn,
    ) => {
      if (value === undefined) {
        return null;
      } else if (
        typeof value === "string" &&
        _.keys(table.external_columns).includes(value)
      ) {
        return (
          <div className="flex flex-row items-center mr-2">
            <Text className="ml-1 font-bold text-bluprint-text-light">
              {value}
            </Text>
          </div>
        );
      } else {
        if (property.type === "date" || property.type === "datetime") {
          const { localString, utcString } = getFormattedDateStrings(value);
          return (
            <Popover
              content={
                <div className="p-1">
                  <Text className=" bp5-text-muted">{utcString}</Text>
                </div>
              }
              interactionKind="hover"
              placement="top"
            >
              <div className="flex flex-row items-center mr-2">
                <Text className="font-bold cursor-help text-bluprint-text-light">
                  {localString}
                </Text>
              </div>
            </Popover>
          );
        } else if (typeof value === "string") {
          return (
            <div className="flex flex-row items-center mr-2">
              <Text className="font-bold text-bluprint-text-light">{`"${value}"`}</Text>
            </div>
          );
        } else if (typeof value === "boolean") {
          return (
            <div className="flex flex-row items-center mr-2">
              <Text className="font-bold text-bluprint-text-light">
                {value ? "True" : "False"}
              </Text>
            </div>
          );
        } else {
          return (
            <div className="flex flex-row items-center mr-2">
              <Text className="font-bold text-bluprint-text-light">
                {value!.toString()}
              </Text>
            </div>
          );
        }
      }
    };

    return (
      <div className="flex flex-row flex-wrap w-full gap-1">
        {_.map(
          resultsConfig.filters!.conditions,
          (condition: FilterCondition, index: number) => {
            const property = table.external_columns[condition.property];
            return (
              <div className="flex flex-row items-center h-4 rounded bg-bluprint-tag-gray">
                <div className="flex flex-row items-center ml-1 mr-2">
                  <Text className="ml-1 font-bold text-bluprint-text-light">
                    {condition.property}
                  </Text>
                </div>
                <Text className="mr-2 font-bold flex-nowrap text-bluprint-text-light">
                  {condition.operator.replace(/_/g, " ")}
                </Text>
                {renderValue(condition.value, property)}
                <Icon
                  className="mr-1 cursor-pointer text-bluprint-text-light"
                  icon="cross"
                  onClick={() => removeCondition(index)}
                />
              </div>
            );
          },
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col mb-2">
      <div className="flex flex-row">
        <Select<FilterLogicalOperators>
          filterable={false}
          items={["and", "or"]}
          itemRenderer={renderLogicalOperator}
          onItemSelect={setLogicalOperator}
        >
          <Button
            className="mr-2 whitespace-nowrap grow-0"
            rightIcon="double-caret-vertical"
            text={logicalOperator ? logicalOperator : "Select logical operator"}
          />
        </Select>
        {!!resultsConfig.filters?.conditions.length && renderConditions()}
      </div>
      <FilterConditionAdder
        table={table}
        conditions={
          resultsConfig.filters ? resultsConfig.filters.conditions : []
        }
        setConditions={setConditions}
      />
    </div>
  );
}
