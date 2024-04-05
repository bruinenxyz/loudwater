"use client";
import {
  Pipeline,
  TakeStep,
  Step,
  StepIdentifierEnum,
} from "@/definitions/pipeline";
import {
  Button,
  ButtonGroup,
  Divider,
  Menu,
  MenuItem,
  NumericInput,
  Popover,
  Section,
  Text,
} from "@blueprintjs/core";
import { NewStepSelection } from "../query-builder";
import Loading from "@/app/loading";
import { ErrorDisplay } from "@/components/error-display";
import InvalidStepPopover from "../invalid-step-popover";
import { useEffect } from "react";
import { useField } from "@/utils/use-field";
import { usePipelineSchema } from "@/data/use-user-query";
import * as _ from "lodash";

interface TakeStepProps {
  index: number;
  step: TakeStep | null;
  pipeline: Pipeline;
  setPipeline: (value: Pipeline) => void;
  edit: boolean;
  setEditStepIndex: (value: number | null) => void;
  setNewStepType: (value: NewStepSelection | null) => void;
  create?: boolean;
}

export default function TakeStepComponent({
  index,
  step,
  pipeline,
  setPipeline,
  edit,
  setEditStepIndex,
  setNewStepType,
  create,
}: TakeStepProps) {
  const offset = useField<number | undefined>(undefined);
  const limit = useField<number | undefined>(undefined, {
    valueTransformer: (value) => {
      return value === 0 ? 1 : value;
    },
  });

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
      offset.onValueChange(step.offset);
      limit.onValueChange(step.limit);
    } else {
      offset.onValueChange(undefined);
      limit.onValueChange(undefined);
    }
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
      return <Text className="text-xl grow-0">Take:</Text>;
    } else if (inputSchema && !inputSchema.success) {
      return (
        <div className="flex flex-row items-center">
          <Text className="text-xl grow-0">Take:</Text>
          <ButtonGroup
            minimal={true}
            vertical={false}
            className="flex flex-row items-center gap-2 ml-3"
          >
            <div className="flex flex-row items-center">
              <Text className="text-base font-normal">limit</Text>
              <Text className="ml-2 font-bold">{step.limit}</Text>
            </div>
            <Divider className="h-3.5" />
            <div className="flex flex-row items-center">
              <Text className="text-base font-normal">offset</Text>
              <Text className="ml-2 font-bold">{step.offset}</Text>
            </div>
          </ButtonGroup>
        </div>
      );
    } else if (schema && !schema.success) {
      return (
        <div className="flex flex-row items-center">
          <Text className="text-xl grow-0">Take:</Text>
          <InvalidStepPopover errors={schema!.error.issues} />
        </div>
      );
    } else {
      return (
        <div className="flex flex-row items-center">
          <Text className="text-xl grow-0">Take:</Text>
          <ButtonGroup
            minimal={true}
            vertical={false}
            className="flex flex-row items-center gap-2 ml-3"
          >
            <div className="flex flex-row items-center">
              <Text className="text-base font-normal">limit</Text>
              <Text className="ml-2 font-bold">{step.limit}</Text>
            </div>
            <Divider className="h-3.5" />
            <div className="flex flex-row items-center">
              <Text className="text-base font-normal">offset</Text>
              <Text className="ml-2 font-bold">{step.offset}</Text>
            </div>
          </ButtonGroup>
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
            disabled={limit.value === undefined || offset.value === undefined}
            text="Add step"
            onClick={() => {
              setNewStepType(null);
              const newStep = {
                type: StepIdentifierEnum.Take,
                limit: limit.value,
                offset: offset.value,
              } as TakeStep;
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
              disabled={limit.value === undefined || offset.value === undefined}
              text="Confirm step"
              onClick={() => {
                const updatedStep = {
                  type: StepIdentifierEnum.Take,
                  limit: limit.value,
                  offset: offset.value,
                } as TakeStep;
                const newSteps: Step[] = [...pipeline.steps];
                newSteps.splice(index, 1, updatedStep as Step);
                setPipeline({ ...pipeline, steps: newSteps });
              }}
            />
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
      return (
        <div className="flex flex-row gap-3 mx-3 my-2">
          <NumericInput
            placeholder="limit"
            allowNumericCharactersOnly={true}
            min={1}
            {...limit}
          />
          <NumericInput
            placeholder="offset"
            allowNumericCharactersOnly={true}
            min={0}
            {...offset}
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
