"use client";
import {
  FilterCondition,
  FilterLogicalOperators,
  FilterStep,
  InferSchemaOutput,
  InferSchemaOutputSuccess,
  InferredSchemaProperty,
  Operators,
  StepIdentifierEnum,
  WorkbookStep,
} from "@/definitions";
import { Button, MenuItem, Section, Text } from "@blueprintjs/core";
import { ItemRenderer, Select } from "@blueprintjs/select";
import FilterConditionAdder from "../../step-creators/filter/filter-condition-adder";
import FilterCreatorConditionTag from "../../step-creators/filter/filter-creator-condition-tag";
import InvalidConditionPropertyTag from "./tags/invalid-condition-property-tag";
import InvalidConditionValueTag from "./tags/invalid-condition-value-tag";
import InvalidStepPopover from "../../invalid-step-popover";
import { useEffect, useState } from "react";
import * as _ from "lodash";

export type FilterEditorCondition = {
  property: InferredSchemaProperty;
  operator: Operators;
  value: InferredSchemaProperty | string | boolean | number | undefined;
};

type InvalidConditions = {
  property: FilterCondition[];
  value: FilterCondition[];
};

export default function FilterEditor({
  step,
  stepIndex,
  updateStep,
  schema,
  inputSchema,
  setIsEditing,
}: {
  step: FilterStep;
  stepIndex: number;
  updateStep: (step: WorkbookStep, index: number) => void;
  schema: InferSchemaOutput;
  inputSchema: InferSchemaOutputSuccess;
  setIsEditing: (value: boolean) => void;
}) {
  // State for the logical operator
  const [logicalOperator, setLogicalOperator] =
    useState<FilterLogicalOperators | null>(step.logicalOperator);

  // State for valid conditions
  const [conditions, setConditions] = useState<FilterEditorCondition[]>([]);

  // State for invalid conditions separated by whether the condition property or value causes invalidity
  const [invalidConditions, setInvalidConditions] = useState<InvalidConditions>(
    { property: [], value: [] },
  );

  // Update selected conditions & invalid conditions when input schema loads
  useEffect(() => {
    if (inputSchema && inputSchema.success) {
      const availablePropertyPaths = _.map(
        inputSchema.data.properties,
        (property: InferredSchemaProperty) => property.api_path,
      );
      const [validConditions, invalidFilterConditions] = _.partition(
        step.conditions,
        (condition: FilterCondition) => {
          if (!condition.value) {
            return _.includes(availablePropertyPaths, condition.property);
          } else {
            const property = _.find(
              inputSchema.data.properties,
              (property: InferredSchemaProperty) =>
                property.api_path === condition.property,
            );
            return (
              // Checks that the property is available in the input schema and the value is either available in the input schema or is of approprtiate type for the property
              (_.includes(availablePropertyPaths, condition.property) &&
                (_.includes(availablePropertyPaths, condition.value) ||
                  typeof condition.value === property!.type)) ||
              ((property!.type === "date" || property!.type === "datetime") &&
                typeof condition.value === "string")
            );
          }
        },
      );
      const [invalidConditionProperty, invalidConditionValue] = _.partition(
        invalidFilterConditions,
        (condition: FilterCondition) => {
          return !_.includes(availablePropertyPaths, condition.property);
        },
      );
      setInvalidConditions({
        property: invalidConditionProperty,
        value: invalidConditionValue,
      });
      setConditions(
        _.map(validConditions, (condition: FilterCondition) => {
          if (condition.value === undefined) {
            return {
              property: _.find(
                inputSchema.data.properties,
                (property: InferredSchemaProperty) =>
                  property.api_path === condition.property,
              ) as InferredSchemaProperty,
              operator: condition.operator,
              value: undefined,
            };
          } else {
            const valueProperty = _.find(
              inputSchema.data.properties,
              (property: InferredSchemaProperty) =>
                property.api_path === condition.value,
            ) as InferredSchemaProperty;
            return {
              property: _.find(
                inputSchema.data.properties,
                (property: InferredSchemaProperty) =>
                  property.api_path === condition.property,
              ) as InferredSchemaProperty,
              operator: condition.operator,
              value: valueProperty ? valueProperty : condition.value,
            };
          }
        }),
      );
    }
  }, [inputSchema]);

  // Remove specified invalid condition from the invalid conditions state
  function removeInvalidCondition(
    invalidType: "property" | "value",
    selectedIndex: number,
  ) {
    if (invalidType === "property") {
      setInvalidConditions({
        property: _.filter(
          invalidConditions.property,
          (value, index) => index !== selectedIndex,
        ),
        value: [...invalidConditions.value],
      });
    } else {
      setInvalidConditions({
        property: [...invalidConditions.property],
        value: _.filter(
          invalidConditions.value,
          (value, index) => index !== selectedIndex,
        ),
      });
    }
  }

  // Extract the API value from a condition value
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
          (condition: FilterEditorCondition, index: number) => {
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

  function renderInvalidConditions() {
    return (
      <div className="flex flex-row mt-2">
        <div className="flex flex-row items-center h-4">
          <Text className="text-md">Invalid conditions:</Text>
        </div>
        <div className="flex flex-row flex-wrap gap-1 ml-2 grow">
          {_.map(
            invalidConditions.property,
            (condition: FilterCondition, index: number) => {
              return (
                <InvalidConditionPropertyTag
                  key={index}
                  condition={condition}
                  index={index}
                  removeCondition={removeInvalidCondition}
                />
              );
            },
          )}
          {_.map(
            invalidConditions.value,
            (condition: FilterCondition, index: number) => {
              return (
                <InvalidConditionValueTag
                  key={index}
                  condition={{
                    ...condition,
                    property: _.find(
                      inputSchema!.data.properties,
                      (property: InferredSchemaProperty) =>
                        property.api_path === condition.property,
                    ) as InferredSchemaProperty,
                    value: condition.value ?? undefined,
                  }}
                  index={index}
                  removeCondition={removeInvalidCondition}
                />
              );
            },
          )}
        </div>
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

  function renderRightElement() {
    return (
      <div className="flex flex-row">
        <Button
          alignText="left"
          disabled={!logicalOperator || !conditions.length}
          text="Save"
          onClick={() =>
            updateStep(
              {
                type: StepIdentifierEnum.Filter,
                logicalOperator: logicalOperator,
                conditions: [
                  ..._.map(conditions, (condition: FilterEditorCondition) => {
                    return {
                      property: condition.property.api_path,
                      operator: condition.operator,
                      value: extractAPIValue(condition.value),
                    };
                  }),
                  ...invalidConditions.property,
                  ...invalidConditions.value,
                ],
              } as FilterStep,
              stepIndex,
            )
          }
        />
        <Button
          className="ml-2"
          alignText="left"
          text="Cancel"
          onClick={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <Section
      className={`flex-none w-full my-2 rounded-sm ${
        invalidConditions.property.length || invalidConditions.value.length
          ? "border-2 border-error"
          : ""
      }`}
      title={
        !invalidConditions.property.length &&
        !invalidConditions.value.length ? (
          <Text className="text-xl">Filter</Text>
        ) : (
          <div className="items-center">
            <div className="flex flex-row items-center">
              <Text className="text-xl grow-0">Filter:</Text>
              <InvalidStepPopover errors={schema!.error.issues} />
            </div>
          </div>
        )
      }
      rightElement={renderRightElement()}
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
        {!!(
          invalidConditions.property.length || invalidConditions.value.length
        ) && renderInvalidConditions()}
        {!!conditions.length && renderConditions()}
        <FilterConditionAdder
          schema={inputSchema.data}
          conditions={conditions}
          setConditions={setConditions}
        />
      </div>
    </Section>
  );
}
