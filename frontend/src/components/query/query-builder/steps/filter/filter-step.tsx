"use client";
import {
  FilterCondition,
  FilterLogicalOperators,
  FilterStep,
  InferSchemaOutputSuccess,
  Pipeline,
  Step,
  StepIdentifierEnum,
} from "@/definitions";
import {
  Button,
  Menu,
  MenuItem,
  Popover,
  Section,
  Text,
} from "@blueprintjs/core";
import { ItemRenderer, Select } from "@blueprintjs/select";
import Loading from "@/app/loading";
import { ErrorDisplay } from "@/components/error-display";
import { NewStepSelection } from "../../query-builder";
import InvalidStepPopover from "../../invalid-step-popover";
import FilterConditionAdder from "./filter-condition-adder";
import FilterConditionTag from "./filter-condition-tag";
import { usePipelineSchema } from "@/data/use-user-query";
import { useState, useEffect } from "react";
import * as _ from "lodash";

interface FilterStepProps {
  index: number;
  step: FilterStep | null;
  pipeline: Pipeline;
  setPipeline: (value: Pipeline) => void;
  edit: boolean;
  setEditStepIndex: (value: number | null) => void;
  setNewStepType: (value: NewStepSelection | null) => void;
  create?: boolean;
}

export default function FilterStepComponent({
  index,
  step,
  pipeline,
  setPipeline,
  edit,
  setEditStepIndex,
  setNewStepType,
  create,
}: FilterStepProps) {
  const [logicalOperator, setLogicalOperator] =
    useState<FilterLogicalOperators | null>(null);
  const [conditions, setConditions] = useState<FilterCondition[]>([]);

  const {
    data: inputSchema,
    isLoading: isLoadingInputSchema,
    error: inputSchemaError,
  } = usePipelineSchema({
    ...pipeline,
    steps: _.slice(pipeline.steps, 0, index),
  });

  const {
    data: schema,
    isLoading: isLoadingSchema,
    error: schemaError,
  } = usePipelineSchema({
    ...pipeline,
    steps: _.slice(pipeline.steps, 0, index + 1),
  });

  useEffect(() => {
    resetFields();
  }, [step]);

  function resetFields() {
    if (step) {
      setLogicalOperator(step.logicalOperator);
      setConditions(step.conditions);
    } else {
      setLogicalOperator(null);
      setConditions([]);
    }
  }

  function canSubmit() {
    return logicalOperator && conditions.length;
  }

  function getAdditionalClasses() {
    if (inputSchema && !inputSchema.success) {
      return "border-2 border-gold";
    } else if (schema && !schema.success) {
      return "border-2 border-error";
    }
  }

  function renderTitle() {
    // If we are creating a new step, editing a step, or the step is not defined, show the default title
    // Also show the default title if the schemas are loading or errored
    if (
      edit ||
      create ||
      !step ||
      isLoadingSchema ||
      isLoadingInputSchema ||
      inputSchemaError ||
      schemaError
    ) {
      return <Text className="text-xl grow-0">Filter:</Text>;
    } else if (inputSchema && !inputSchema.success) {
      return (
        <div className="flex flex-row items-center">
          <Text className="text-xl grow-0">Filter:</Text>
          <div className="flex flex-row flex-wrap gap-1 mx-2 grow">
            {_.map(
              step.conditions,
              (condition: FilterCondition, index: number) => {
                return (
                  <div className="flex flex-row items-center gap-1">
                    {index > 0 && (
                      <Text className="font-normal">
                        {step!.logicalOperator.toUpperCase()}
                      </Text>
                    )}
                    <FilterConditionTag
                      condition={condition}
                      index={index}
                      removeable={false}
                      removeCondition={(index: number) => {}}
                    />
                  </div>
                );
              },
            )}
          </div>
        </div>
      );
    } else if (schema && !schema.success) {
      return (
        <div className="flex flex-row items-center">
          <Text className="text-xl grow-0">Filter:</Text>
          <InvalidStepPopover errors={schema!.error.issues} />
        </div>
      );
    } else {
      return (
        <div className="flex flex-row items-center">
          <Text className="text-xl grow-0">Filter:</Text>
          <div className="flex flex-row flex-wrap mx-2 gap-x-2 gap-y-1 grow">
            {_.map(
              step.conditions,
              (condition: FilterCondition, index: number) => {
                return (
                  <div className="flex flex-row items-center gap-2">
                    {index > 0 && (
                      <Text className="font-normal">
                        {step!.logicalOperator.toUpperCase()}
                      </Text>
                    )}
                    <FilterConditionTag
                      condition={condition}
                      index={index}
                      removeable={false}
                      removeCondition={(index: number) => {}}
                    />
                  </div>
                );
              },
            )}
          </div>
        </div>
      );
    }
  }

  function renderRightElement() {
    if (create) {
      return (
        <>
          <Button
            alignText="left"
            disabled={!canSubmit()}
            text="Add step"
            onClick={() => {
              setNewStepType(null);
              const newStep = {
                type: StepIdentifierEnum.Filter,
                logicalOperator: logicalOperator,
                conditions: conditions,
              } as FilterStep;
              const newSteps: Step[] = [...pipeline.steps];
              newSteps.splice(index, 0, newStep as Step);
              setPipeline({ ...pipeline, steps: newSteps });
            }}
          />
          <Button
            className="ml-2"
            alignText="left"
            text="Cancel step"
            onClick={() => {
              setNewStepType(null);
            }}
          />
        </>
      );
    } else {
      if (edit) {
        return (
          <>
            <Button
              alignText="left"
              disabled={!canSubmit()}
              text="Confirm step"
              onClick={() => {
                const updatedStep = {
                  type: StepIdentifierEnum.Filter,
                  logicalOperator: logicalOperator,
                  conditions: conditions,
                } as FilterStep;
                const newSteps: Step[] = [...pipeline.steps];
                newSteps.splice(index, 1, updatedStep as Step);
                setPipeline({ ...pipeline, steps: newSteps });
              }}
            />{" "}
            <Button
              className="ml-2"
              alignText="left"
              text="Cancel"
              onClick={() => {
                resetFields();
                setEditStepIndex(null);
              }}
            />
          </>
        );
      } else {
        return (
          <Popover
            content={
              <Menu>
                <MenuItem
                  icon="edit"
                  text="Edit step"
                  disabled={!!inputSchema && !inputSchema.success}
                  onClick={() => setEditStepIndex(index)}
                />
                <MenuItem
                  icon="trash"
                  text="Delete step"
                  onClick={() => {
                    const newSteps: Step[] = [...pipeline.steps];
                    newSteps.splice(index, 1);
                    setPipeline({ ...pipeline, steps: newSteps });
                  }}
                />
              </Menu>
            }
            placement="bottom"
          >
            <Button alignText="left" rightIcon="caret-down" text="Options" />
          </Popover>
        );
      }
    }
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

  function renderContent() {
    if (isLoadingSchema || isLoadingInputSchema) {
      return (
        <div className="flex flex-row justify-center my-1 h-fit">
          <Loading />
        </div>
      );
    } else if (schemaError || inputSchemaError) {
      return <ErrorDisplay description={schemaError || inputSchemaError} />;
    } else if (!inputSchema!.success) {
      return null;
    } else if (edit || create || !step) {
      const successInputSchema = inputSchema as InferSchemaOutputSuccess;
      return (
        <div className="flex flex-col mx-3 my-2">
          <div className="flex flex-row flex-wrap w-full gap-1">
            <Select<FilterLogicalOperators>
              filterable={false}
              items={["and", "or", "xor"]}
              itemRenderer={renderLogicalOperator}
              onItemSelect={selectLogicalOperator}
            >
              <Button
                className="mr-1 whitespace-nowrap grow-0"
                rightIcon="double-caret-vertical"
                text={
                  logicalOperator ? logicalOperator : "Select logical operator"
                }
              />
            </Select>
            {!!conditions.length && (
              <>
                {_.map(
                  conditions,
                  (condition: FilterCondition, index: number) => (
                    <FilterConditionTag
                      condition={condition}
                      index={index}
                      removeable={true}
                      removeCondition={(index: number) => {
                        const updatedConditions = [...conditions];
                        updatedConditions.splice(index, 1);
                        setConditions(updatedConditions);
                      }}
                    />
                  ),
                )}
              </>
            )}
          </div>

          <FilterConditionAdder
            inputSchema={successInputSchema}
            conditions={conditions}
            setConditions={setConditions}
          />
        </div>
      );
    }
  }

  return (
    <Section
      className={`flex-none w-full rounded-sm ${getAdditionalClasses()}`}
      title={renderTitle()}
      rightElement={<div className="flex flex-row">{renderRightElement()}</div>}
    >
      {renderContent()}
    </Section>
  );
}
