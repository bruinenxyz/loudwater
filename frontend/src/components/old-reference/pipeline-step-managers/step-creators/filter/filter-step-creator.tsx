"use client";
import {
  FilterLogicalOperators,
  FilterStep,
  InferredSchemaProperty,
  Operators,
  Pipeline,
  StepIdentifierEnum,
  PartialPipeline,
  PartialWorkbook,
  Workbook,
  WorkbookStep,
} from "@/definitions";
import { Button, MenuItem, Section, Text } from "@blueprintjs/core";
import { ItemRenderer, Select } from "@blueprintjs/select";
import NewStepSelection from "../new-step-selection";
import FilterConditionAdder from "./filter-condition-adder";
import FilterCreatorConditionTag from "./filter-creator-condition-tag";
import Loading from "@/app/loading";
import { ErrorDisplay } from "@/components/error-display";
import { useValidatePipelineAndWorkbook } from "@/data/use-pipeline";
import { useState } from "react";
import * as _ from "lodash";

export type FilterCreatorCondition = {
  property: InferredSchemaProperty;
  operator: Operators;
  value: InferredSchemaProperty | string | boolean | number | undefined;
};

export default function FilterStepCreator({
  fullPipeline,
  index,
  setNewStepType,
  addStepToPipeline,
}: {
  fullPipeline: Workbook | Pipeline | PartialPipeline | PartialWorkbook;
  index: number;
  setNewStepType: (newStepObj: NewStepSelection | null) => void;
  addStepToPipeline: (newStep: WorkbookStep, index: number) => void;
}) {
  const [logicalOperator, setLogicalOperator] =
    useState<FilterLogicalOperators | null>(null);
  const [conditions, setConditions] = useState<FilterCreatorCondition[]>([]);

  const partialPipeline = {
    ...fullPipeline,
    steps: fullPipeline.steps.slice(0, index),
  };

  const {
    data: schema,
    error: schemaError,
    isLoading: isLoadingSchema,
  } = useValidatePipelineAndWorkbook(partialPipeline);

  if (isLoadingSchema) {
    return <Loading />;
  }

  if (schemaError || !schema || !schema.success) {
    return (
      <ErrorDisplay
        title="Unexpected error"
        description={schemaError.message}
      />
    );
  }

  function extractAPIValue(
    input: InferredSchemaProperty | string | boolean | number | undefined,
  ) {
    if (input === undefined) {
      return undefined;
    } else if (_.includes(["string", "number", "boolean"], typeof input)) {
      return input;
    } else {
      return (input as InferredSchemaProperty).api_path;
    }
  }

  function renderConditions() {
    return (
      <div className="flex flex-row flex-wrap w-full gap-1 mt-2">
        {_.map(
          conditions,
          (condition: FilterCreatorCondition, index: number) => {
            return (
              <FilterCreatorConditionTag
                key={index}
                arrayIndex={index}
                conditions={conditions}
                setConditions={setConditions}
                property={condition.property}
                operator={condition.operator}
                value={condition.value}
              />
            );
          },
        )}
      </div>
    );
  }

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

  function selectLogicalOperator(selection: FilterLogicalOperators) {
    if (logicalOperator && selection === logicalOperator) {
      setLogicalOperator(null);
    } else {
      setLogicalOperator(selection);
    }
  }

  return (
    <Section
      className="flex-none w-full mt-2 rounded-sm"
      title={<Text className="text-xl">Filter</Text>}
      rightElement={
        <div className="flex flex-row">
          <Button
            alignText="left"
            disabled={!logicalOperator || !conditions.length}
            text="Add step"
            onClick={() =>
              addStepToPipeline(
                {
                  type: StepIdentifierEnum.Filter,
                  logicalOperator: logicalOperator,
                  conditions: _.map(
                    conditions,
                    (condition: FilterCreatorCondition) => {
                      return {
                        property: condition.property.api_path,
                        operator: condition.operator,
                        value: extractAPIValue(condition.value),
                      };
                    },
                  ),
                } as FilterStep,
                index,
              )
            }
          />
          <Button
            className="ml-2"
            alignText="left"
            text="Cancel step"
            onClick={() => {
              setNewStepType(null);
            }}
          />
        </div>
      }
    >
      <div className="flex flex-col mx-3 my-2">
        <Select<FilterLogicalOperators>
          filterable={false}
          items={["and", "or", "xor"]}
          itemRenderer={renderLogicalOperator}
          onItemSelect={selectLogicalOperator}
        >
          <Button
            className="whitespace-nowrap grow-0"
            rightIcon="double-caret-vertical"
            text={logicalOperator ? logicalOperator : "Select logical operator"}
          />
        </Select>
        {!!conditions.length && renderConditions()}
        <FilterConditionAdder
          schema={schema.data}
          conditions={conditions}
          setConditions={setConditions}
        />
      </div>
    </Section>
  );
}
