"use client";
import {
  OrderColumn,
  OrderStep,
  InferSchemaOutputSuccess,
  InferredSchemaColumn,
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
import OrderCaseTag from "./order-case-tag";
import SingleColumnSelector from "@/components/column-selectors/single-column-selector/single-column-selector";
import { usePipelineSchema } from "@/data/use-user-query";
import { useState, useEffect } from "react";
import * as _ from "lodash";

interface OrderStepProps {
  index: number;
  step: OrderStep | null;
  pipeline: Pipeline;
  setPipeline: (value: Pipeline) => void;
  edit: boolean;
  setEditStepIndex: (value: number | null) => void;
  setNewStepType: (value: NewStepSelection | null) => void;
  create?: boolean;
}

type Direction = "asc" | "desc";

export default function OrderStepComponent({
  index,
  step,
  pipeline,
  setPipeline,
  edit,
  setEditStepIndex,
  setNewStepType,
  create,
}: OrderStepProps) {
  const [orderCases, setOrderCases] = useState<OrderColumn[]>([]);
  const [selectedColumn, setSelectedColumn] =
    useState<InferredSchemaColumn | null>(null);
  const [selectedDirection, setSelectedDirection] = useState<Direction>("asc");

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
      setOrderCases(step.order);
    } else {
      setOrderCases([]);
    }
    setSelectedDirection("asc");
  }

  function canSubmit() {
    return orderCases.length > 0;
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
      return <Text className="text-xl grow-0">Order:</Text>;
    } else if (inputSchema && !inputSchema.success) {
      return (
        <div className="flex flex-row items-center">
          <Text className="text-xl grow-0">Order:</Text>
          <div className="flex flex-row flex-wrap gap-1 mx-2 grow">
            {_.map(step.order, (orderCase: OrderColumn, index: number) => (
              <OrderCaseTag
                orderCase={orderCase}
                index={index}
                removeable={false}
                removeCase={(index: number) => {}}
              />
            ))}
          </div>
        </div>
      );
    } else if (schema && !schema.success) {
      return (
        <div className="flex flex-row items-center">
          <Text className="text-xl grow-0">Order:</Text>
          <InvalidStepPopover errors={schema!.error.issues} />
        </div>
      );
    } else {
      return (
        <div className="flex flex-row items-center">
          <Text className="text-xl grow-0">Order:</Text>
          <div className="flex flex-row flex-wrap gap-1 mx-2 grow">
            {_.map(step.order, (orderCase: OrderColumn, index: number) => (
              <OrderCaseTag
                orderCase={orderCase}
                index={index}
                removeable={false}
                removeCase={(index: number) => {}}
              />
            ))}
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
                type: StepIdentifierEnum.Order,
                order: orderCases,
              } as OrderStep;
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
                  type: StepIdentifierEnum.Order,
                  order: orderCases,
                } as OrderStep;
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

  function selectColumn(column: InferredSchemaColumn) {
    if (_.isEqual(column, selectedColumn)) {
      setSelectedColumn(null);
    } else {
      setSelectedColumn(column);
    }
  }

  const renderDirection: ItemRenderer<"asc" | "desc"> = (
    direction: "asc" | "desc",
    { handleClick, modifiers },
  ) => {
    return (
      <MenuItem
        key={direction}
        roleStructure="listoption"
        selected={direction === selectedDirection}
        text={direction === "asc" ? "Ascending" : "Descending"}
        onClick={handleClick}
      />
    );
  };

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
          {!!orderCases.length && (
            <div className="flex flex-row flex-wrap w-full gap-1 mb-2">
              {_.map(orderCases, (orderCase: OrderColumn, index: number) => (
                <OrderCaseTag
                  orderCase={orderCase}
                  index={index}
                  removeable={true}
                  removeCase={(index: number) => {
                    const updatedCases = [...orderCases];
                    updatedCases.splice(index, 1);
                    setOrderCases(updatedCases);
                  }}
                />
              ))}
            </div>
          )}
          <div className="flex flex-row items-center">
            <SingleColumnSelector
              disabled={false}
              items={successInputSchema.data.columns}
              selected={selectedColumn}
              onColumnSelect={selectColumn}
            />
            <Select<Direction>
              className="ml-3"
              filterable={false}
              items={["asc", "desc"]}
              itemRenderer={renderDirection}
              onItemSelect={(selection: Direction) =>
                setSelectedDirection(selection)
              }
            >
              <Button
                rightIcon="double-caret-vertical"
                text={
                  selectedDirection
                    ? selectedDirection === "asc"
                      ? "Ascending"
                      : "Descending"
                    : "Select direction"
                }
              />
            </Select>
            <Button
              disabled={!selectedColumn || !selectedDirection}
              className="ml-3"
              text="Add"
              onClick={() => {
                const newCase = {
                  column: selectedColumn,
                  direction: selectedDirection,
                } as OrderColumn;
                setOrderCases([...orderCases, newCase]);
                setSelectedColumn(null);
                setSelectedDirection("asc");
              }}
            />
          </div>
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
