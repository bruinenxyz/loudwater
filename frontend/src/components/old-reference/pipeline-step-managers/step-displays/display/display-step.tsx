"use client";
import { ChartIdentifierEnum } from "@/definitions/displays/charts/charts";
import { DisplayIdentifierEnum } from "@/definitions/displays/enum";
import {
  DisplayStep,
  Step,
  StepIdentifierEnum,
  PartialWorkbook,
  Workbook,
  WorkbookStep,
} from "@/definitions";
import {
  Button,
  Callout,
  Colors,
  Icon,
  Menu,
  MenuItem,
  Popover,
  Section,
  Text,
} from "@blueprintjs/core";
import {
  BarChartComponent,
  LineChartComponent,
  ScatterPlotComponent,
  TableComponent,
  MapComponent,
} from "@/components/charts";
import { ErrorDisplay } from "@/components/error-display";
import DisplayEditor from "../../step-editors/display/display-editor";
import Loading from "@/app/loading";
import { useState } from "react";
import { useObjectDefinition } from "@/data/use-object-definition";
import { useValidatePipelineAndWorkbook } from "@/data/use-pipeline";
import * as _ from "lodash";

export default function DisplayStep({
  editable,
  step,
  stepIndex,
  fullPipeline,
  setPipeline,
  disabled,
}: {
  editable?: boolean;
  step: DisplayStep;
  stepIndex: number;
  fullPipeline: Workbook | PartialWorkbook;
  setPipeline: (pipeline: Workbook | PartialWorkbook) => void;
  disabled: boolean;
}) {
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Pipeline with only the steps up to and including the step prior to this step
  const inputPipeline = {
    from: fullPipeline.from,
    steps: _.slice(fullPipeline.steps, 0, stepIndex),
  };

  // Synthetic pipeline created by appending the steps of this step to the input pipeline steps
  const branchPipeline = {
    ...inputPipeline,
    steps: [...inputPipeline.steps, ...step.steps],
  };

  // Output schema for the branchPipeline
  const {
    data: branchSchema,
    error: branchSchemaError,
    isLoading: isLoadingBranchSchema,
  } = useValidatePipelineAndWorkbook(branchPipeline);

  const {
    data: baseObjectDefinition,
    isLoading: isLoadingBaseObjectDefinition,
    error: baseObjectDefinitionError,
  } = useObjectDefinition(fullPipeline.from);

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

  if (isLoadingBranchSchema || isLoadingBaseObjectDefinition) {
    return <Loading />;
  }

  if (
    branchSchemaError ||
    !branchSchema ||
    baseObjectDefinitionError ||
    !baseObjectDefinition
  ) {
    return (
      <ErrorDisplay
        title="Unexpected error"
        description={
          branchSchemaError
            ? branchSchemaError.message
            : baseObjectDefinitionError.message
        }
      />
    );
  }

  function deleteStep() {
    const newSteps = [...fullPipeline.steps];
    newSteps.splice(stepIndex, 1);
    setPipeline({
      ...fullPipeline,
      steps: newSteps,
    });
  }

  function updateEditedStep(newStep: WorkbookStep, index: number) {
    setIsEditing(false);
    const newSteps: WorkbookStep[] = _.update(
      [...fullPipeline.steps],
      index,
      () => newStep,
    );
    setPipeline({ ...fullPipeline, steps: newSteps });
  }

  function renderTitle() {
    return (
      <div className="items-center">
        <div className="flex flex-row items-center">
          <div className="flex flex-col">
            <Text className="text-xl grow-0">{step.display.title}</Text>
            {!!step.display.description && (
              <Text className="bp5-text-muted text-md">
                {step.display.description}
              </Text>
            )}
          </div>
          {!branchSchema!.success && (
            <Popover
              content={
                <div className="p-1">
                  <Callout
                    intent="warning"
                    icon="warning-sign"
                    title="This display contains invalid steps"
                  />
                </div>
              }
              interactionKind="hover"
              placement="right"
            >
              <div className="flex flex-row items-center p-1 ml-2 border rounded-sm cursor-pointer border-bluprint-border-gray">
                <Icon
                  className="mr-1"
                  icon="warning-sign"
                  color={Colors.ORANGE3}
                />
                <Text>Invalid display</Text>
              </div>
            </Popover>
          )}
        </div>
      </div>
    );
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
              onClick={() => deleteStep()}
            />
          </Menu>
        }
        placement="bottom"
      >
        <Button alignText="left" rightIcon="caret-down" text="Options" />
      </Popover>
    );
  }

  // Render the chart based on the chart type
  function renderChart() {
    switch (step.display.configuration.chartType) {
      case ChartIdentifierEnum.LineChart:
        return (
          <LineChartComponent
            configuration={step.display.configuration}
            // Removes display steps from the pipeline
            pipeline={{
              ...branchPipeline,
              steps: _.filter(
                branchPipeline.steps,
                (step: WorkbookStep) =>
                  step.type !== StepIdentifierEnum.Display,
              ) as Step[],
            }}
          />
        );
      case ChartIdentifierEnum.BarChart:
        return (
          <BarChartComponent
            configuration={step.display.configuration}
            // Removes display steps from the pipeline
            pipeline={{
              ...branchPipeline,
              steps: _.filter(
                branchPipeline.steps,
                (step: WorkbookStep) =>
                  step.type !== StepIdentifierEnum.Display,
              ) as Step[],
            }}
          />
        );
      case ChartIdentifierEnum.ScatterPlot:
        return (
          <ScatterPlotComponent
            configuration={step.display.configuration}
            // Removes display steps from the pipeline
            pipeline={{
              ...branchPipeline,
              steps: _.filter(
                branchPipeline.steps,
                (step: WorkbookStep) =>
                  step.type !== StepIdentifierEnum.Display,
              ) as Step[],
            }}
          />
        );
      case ChartIdentifierEnum.Table:
        return (
          <TableComponent
            // Removes display steps from the pipeline
            pipeline={{
              ...branchPipeline,
              steps: _.filter(
                branchPipeline.steps,
                (step: WorkbookStep) =>
                  step.type !== StepIdentifierEnum.Display,
              ) as Step[],
            }}
          />
        );
      case ChartIdentifierEnum.Map:
        return (
          <MapComponent
            configuration={step.display.configuration}
            pipeline={{
              ...branchPipeline,
              steps: _.filter(
                branchPipeline.steps,
                (step: WorkbookStep) =>
                  step.type !== StepIdentifierEnum.Display,
              ) as Step[],
            }}
          />
        );
    }
  }

  // Render the display based on the display type
  function renderContent() {
    if (branchSchema!.success) {
      switch (step.display.displayType) {
        case DisplayIdentifierEnum.Chart:
          return renderChart();
      }
    }
  }

  return (
    <>
      {isEditing ? (
        <DisplayEditor
          step={step}
          stepIndex={stepIndex}
          inputPipeline={inputPipeline}
          branchPipeline={branchPipeline}
          baseObjectDefinition={baseObjectDefinition}
          updateStep={updateEditedStep}
          setIsEditing={setIsEditing}
        />
      ) : (
        <Section
          className={`flex-none w-full my-2 rounded-sm ${
            !branchSchema.success ? "border-2 border-error" : ""
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
