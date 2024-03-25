"use client";
import {
  ObjectDefinition,
  InferSchemaOutputSuccess,
  Pipeline,
  Step,
  StepIdentifierEnum,
  Workbook,
  WorkbookStep,
  PartialWorkbook,
  PartialPipeline,
} from "@/definitions";
import {
  Button,
  Colors,
  Icon,
  IconSize,
  Menu,
  MenuItem,
  Popover,
  Section,
  Text,
} from "@blueprintjs/core";
import { ErrorDisplay } from "@/components/error-display";
import InvalidStepPopover from "../invalid-step-popover";
import AggregateEditor from "../step-editors/aggregate/aggregate-editor";
import FilterEditor from "../step-editors/filter/filter-editor";
import OrderEditor from "../step-editors/order/order-editor";
import RelateEditor from "../step-editors/relate/relate-editor";
// Step editors
import SelectEditor from "../step-editors/select/select-editor";
import TakeEditor from "../step-editors/take/take-editor";
import AggregateGroupContent from "./aggregate/aggregate-group-content";
import AggregateTitle from "./aggregate/aggregate-title";
import DataPreview from "./data-preview";
import FilterTitle from "./filter/filter-title";
import OrderTitle from "./order/order-title";
import RelateTitle from "./relate/relate-title";
// Step titles
import SelectTitle from "./select/select-title";
import TakeTitle from "./take/take-title";
import Loading from "@/app/loading";

import { useValidatePipelineAndWorkbook } from "@/data/use-pipeline";
import { useState } from "react";
import * as _ from "lodash";

export default function BaseStepDisplay({
  objectDefinition,
  step,
  stepIndex,
  pipeline,
  deleteStep,
  updateStep,
  disabled,
  editable,
}: {
  objectDefinition: ObjectDefinition;
  step: WorkbookStep;
  stepIndex: number;
  pipeline: Workbook | PartialWorkbook | Pipeline | PartialPipeline;
  deleteStep: (index: number) => void;
  updateStep: (step: WorkbookStep, index: number) => void;

  disabled: boolean;
  editable?: boolean;
}) {
  const [viewDataToggle, setViewDataToggle] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Pipeline with only the steps up to and including this step
  const partialPipeline = {
    from: pipeline.from,
    steps: _.slice(pipeline.steps, 0, stepIndex + 1),
  };

  // Pipeline with only the steps up to and including the step prior to this step
  const inputPipeline = {
    from: pipeline.from,
    steps: _.slice(pipeline.steps, 0, stepIndex),
  };

  // Output schema for the pipeline up to and including this step
  const {
    data: schema,
    error: schemaError,
    isLoading: isLoadingSchema,
  } = useValidatePipelineAndWorkbook(partialPipeline);

  // Output schema for the pipeline up to and including the prior step (aka input schema for this step)
  const {
    data: inputSchema,
    error: inputSchemaError,
    isLoading: isLoadingInputSchema,
  } = useValidatePipelineAndWorkbook(inputPipeline);

  // If a prior step is invalid, disable this step
  if (disabled) {
    return (
      <Section
        className="flex-none w-full my-2 border rounded-sm cursor-not-allowed border-bluprint-warning-orange"
        title={
          <div className="items-center">
            <div className="flex flex-row items-center">
              <Text className="text-xl grow-0 text-bruinen-gray">
                {step.type.charAt(0).toUpperCase() + step.type.slice(1)}:
              </Text>
              <div className="flex flex-row items-center p-1 ml-2 border rounded-sm border-bluprint-border-gray text-bruinen-gray">
                <Icon
                  className="mr-1"
                  icon="warning-sign"
                  color={Colors.ORANGE3}
                />
                <Text>Fix prior invalid step</Text>
              </div>
            </div>
          </div>
        }
      />
    );
  }

  if (isLoadingSchema || isLoadingInputSchema) {
    return <Loading />;
  }

  if (schemaError || !schema || inputSchemaError || !inputSchema) {
    return (
      <ErrorDisplay
        title="Unexpected error"
        description={
          schemaError ? schemaError.message : inputSchemaError.message
        }
      />
    );
  }

  function updateEditedStep(newStep: WorkbookStep, index: number) {
    setIsEditing(false);
    updateStep(newStep, index);
  }

  function renderTitle() {
    if (schema!.success) {
      return (
        <div className="flex flex-row items-center">
          <Text className="text-xl grow-0">
            {step.type.charAt(0).toUpperCase() + step.type.slice(1)}:
          </Text>
          {renderStepTitle()}
        </div>
      );
    } else {
      return (
        <div className="flex flex-row items-center">
          <Text className="text-xl grow-0">
            {step.type.charAt(0).toUpperCase() + step.type.slice(1)}:
          </Text>
          <InvalidStepPopover errors={schema!.error.issues} />
        </div>
      );
    }
  }

  function renderRightElement() {
    return (
      <Popover
        content={
          <Menu>
            <MenuItem
              icon="edit"
              text="Edit step"
              onClick={() => setIsEditing(true)}
            />
            <MenuItem
              icon="trash"
              text="Delete step"
              onClick={() => deleteStep(stepIndex)}
            />
          </Menu>
        }
        placement="bottom"
      >
        <Button alignText="left" rightIcon="caret-down" text="Options" />
      </Popover>
    );
  }

  function renderContent() {
    if (schema!.success) {
      return (
        <div className="flex flex-col items-start">
          {step.type === StepIdentifierEnum.Aggregate && (
            <AggregateGroupContent
              step={step}
              inputSchema={inputSchema as InferSchemaOutputSuccess}
            />
          )}
          <div className="w-full px-3 py-1">
            <div
              className="flex flex-row items-center text-sm hover:cursor-pointer"
              onClick={() => setViewDataToggle(!viewDataToggle)}
            >
              {viewDataToggle ? (
                <>
                  <Text className="mr-1">Hide data</Text>
                  <Icon icon="chevron-down" size={IconSize.LARGE} />
                </>
              ) : (
                <>
                  <Text className="mr-1">View data</Text>
                  <Icon icon="chevron-right" size={IconSize.LARGE} />
                </>
              )}
            </div>
            {viewDataToggle && (
              <DataPreview
                // Removes display steps from the pipeline for preview
                pipeline={{
                  ...partialPipeline,
                  steps: _.filter(
                    partialPipeline.steps,
                    (step: WorkbookStep) =>
                      step.type !== StepIdentifierEnum.Display,
                  ) as Step[],
                }}
              />
            )}
          </div>
        </div>
      );
    } else {
      return undefined;
    }
  }

  function renderStepTitle() {
    switch (step.type) {
      case StepIdentifierEnum.Select:
        return (
          <SelectTitle
            step={step}
            inputSchema={inputSchema as InferSchemaOutputSuccess}
          />
        );
      case StepIdentifierEnum.Order:
        return (
          <OrderTitle
            step={step}
            inputSchema={inputSchema as InferSchemaOutputSuccess}
          />
        );
      case StepIdentifierEnum.Filter:
        return (
          <FilterTitle
            step={step}
            inputSchema={inputSchema as InferSchemaOutputSuccess}
          />
        );
      case StepIdentifierEnum.Aggregate:
        return (
          <AggregateTitle
            step={step}
            inputSchema={inputSchema as InferSchemaOutputSuccess}
          />
        );
      case StepIdentifierEnum.Take:
        return <TakeTitle step={step} />;
      case StepIdentifierEnum.Relate:
        return (
          <RelateTitle
            step={step}
            schema={schema as InferSchemaOutputSuccess}
          />
        );
    }
  }

  function renderEditor() {
    switch (step.type) {
      case StepIdentifierEnum.Select:
        return (
          <SelectEditor
            step={step}
            stepIndex={stepIndex}
            updateStep={updateEditedStep}
            schema={schema!}
            inputSchema={inputSchema as InferSchemaOutputSuccess}
            setIsEditing={setIsEditing}
          />
        );
      case StepIdentifierEnum.Order:
        return (
          <OrderEditor
            step={step}
            stepIndex={stepIndex}
            updateStep={updateEditedStep}
            schema={schema!}
            inputSchema={inputSchema as InferSchemaOutputSuccess}
            setIsEditing={setIsEditing}
          />
        );
      case StepIdentifierEnum.Filter:
        return (
          <FilterEditor
            step={step}
            stepIndex={stepIndex}
            updateStep={updateEditedStep}
            schema={schema!}
            inputSchema={inputSchema as InferSchemaOutputSuccess}
            setIsEditing={setIsEditing}
          />
        );
      case StepIdentifierEnum.Aggregate:
        return (
          <AggregateEditor
            step={step}
            stepIndex={stepIndex}
            updateStep={updateEditedStep}
            schema={schema!}
            inputSchema={inputSchema as InferSchemaOutputSuccess}
            setIsEditing={setIsEditing}
          />
        );
      case StepIdentifierEnum.Take:
        return (
          <TakeEditor
            step={step}
            stepIndex={stepIndex}
            updateStep={updateEditedStep}
            setIsEditing={setIsEditing}
          />
        );
      case StepIdentifierEnum.Relate:
        return (
          <RelateEditor
            baseObjectDefinition={objectDefinition}
            step={step}
            stepIndex={stepIndex}
            updateStep={updateEditedStep}
            schema={schema!}
            inputSchema={inputSchema as InferSchemaOutputSuccess}
            setIsEditing={setIsEditing}
          />
        );
      default:
        return undefined;
    }
  }

  return (
    <>
      {isEditing ? (
        renderEditor()
      ) : (
        <Section
          className={`flex-none w-full my-2 rounded-sm ${
            !schema.success ? "border-2 border-error" : ""
          }`}
          title={renderTitle()}
          rightElement={editable ? renderRightElement() : undefined}
        >
          {renderContent()}
        </Section>
      )}
    </>
  );
}
