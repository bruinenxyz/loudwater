"use client";
import {
  InferSchemaOutputSuccess,
  InferredSchemaColumn,
  Pipeline,
  SelectStep,
  Step,
  StepIdentifierEnum,
} from "@/definitions/pipeline";
import {
  Button,
  Menu,
  MenuItem,
  Popover,
  Section,
  Text,
} from "@blueprintjs/core";
import { NewStepSelection } from "../query-builder";
import Loading from "@/app/loading";
import { ErrorDisplay } from "@/components/error-display";
import MultiColumnSelector from "@/components/column-selectors/multi-column-selector/multi-column-selector";
import InferredSchemaColumnTag from "@/components/column/inferred-schema-column-tag";
import InvalidStepPopover from "../invalid-step-popover";
import { useEffect, useState } from "react";
import { usePipelineSchema } from "@/data/use-user-query";
import * as _ from "lodash";

interface SelectStepProps {
  index: number;
  step: SelectStep | null;
  pipeline: Pipeline;
  setPipeline: (value: Pipeline) => void;
  edit: boolean;
  setEditStepIndex: (value: number | null) => void;
  setNewStepType: (value: NewStepSelection | null) => void;
  create?: boolean;
}

export default function SelectStepComponent({
  index,
  step,
  pipeline,
  setPipeline,
  edit,
  setEditStepIndex,
  setNewStepType,
  create,
}: SelectStepProps) {
  const [selected, setSelected] = useState<InferredSchemaColumn[]>(
    !!step ? step.select : [],
  );

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
    if (step) {
      setSelected(step.select);
    } else {
      setSelected([]);
    }
  }, [step]);

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
      return <Text className="text-xl grow-0">Select:</Text>;
    } else if (inputSchema && !inputSchema.success) {
      return (
        <div className="flex flex-row items-center">
          <Text className="text-xl grow-0">Select:</Text>
          <div className="flex flex-row flex-wrap gap-1 mx-2 grow">
            {_.map(
              step.select,
              (column: InferredSchemaColumn, index: number) => {
                return <InferredSchemaColumnTag key={index} column={column} />;
              },
            )}
          </div>
        </div>
      );
    } else if (schema && !schema.success) {
      return (
        <div className="flex flex-row items-center">
          <Text className="text-xl grow-0">Select:</Text>
          <InvalidStepPopover errors={schema!.error.issues} />
        </div>
      );
    } else {
      return (
        <div className="flex flex-row items-center">
          <Text className="text-xl grow-0">Select:</Text>
          <div className="flex flex-row flex-wrap gap-1 mx-2 grow">
            {_.map(
              step.select,
              (column: InferredSchemaColumn, index: number) => {
                return <InferredSchemaColumnTag key={index} column={column} />;
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
            disabled={selected.length === 0}
            text="Add step"
            onClick={() => {
              setNewStepType(null);
              const newStep = {
                type: StepIdentifierEnum.Select,
                select: selected,
              } as SelectStep;
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
          <Button
            alignText="left"
            disabled={selected.length === 0}
            text="Confirm step"
            onClick={() => {
              const updatedStep = {
                type: StepIdentifierEnum.Select,
                select: selected,
              } as SelectStep;
              const newSteps: Step[] = [...pipeline.steps];
              newSteps.splice(index, 1, updatedStep as Step);
              setPipeline({ ...pipeline, steps: newSteps });
            }}
          />
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
        <MultiColumnSelector
          className="mx-3 my-2"
          selected={selected}
          setSelected={setSelected}
          items={successInputSchema.data.columns}
        />
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
