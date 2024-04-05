"use client";
import {
  Pipeline,
  SelectStep,
  AggregateStep,
  RelateStep,
  TakeStep,
  FilterStep,
  Step,
  StepIdentifier,
  StepIdentifierEnum,
} from "@/definitions/pipeline";
import { Button, NonIdealState, Section } from "@blueprintjs/core";
import Loading from "@/app/loading";
import { ErrorDisplay } from "@/components/error-display";
import StepTypeSelector from "./step-type-selector";
import FromStepComponent from "./steps/from-step";
import SelectStepComponent from "./steps/select-step";
import AggregateStepComponent from "./steps/aggregate-step";
import RelateStepComponent from "./steps/relate/relate-step";
import TakeStepComponent from "./steps/take-step";
import FilterStepComponent from "./steps/filter/filter-step";
import { usePipelineSchema } from "@/data/use-user-query";
import { useState, useEffect } from "react";
import * as _ from "lodash";

interface QueryBuilderProps {
  pipeline: Pipeline;
  setPipeline: (value: Pipeline) => void;
  className?: string;
}

export type NewStepSelection = {
  stepType: StepIdentifier;
  index: number;
};

export default function QueryBuilder({
  pipeline,
  setPipeline,
  className,
}: QueryBuilderProps) {
  const [newStepType, setNewStepType] = useState<NewStepSelection | null>(null);
  const [editStepIndex, setEditStepIndex] = useState<number | null>(
    pipeline.from ? null : -1,
  );
  const [validationErrorIndex, setValidationErrorIndex] = useState<
    number | null
  >(null);

  const {
    data: schema,
    isLoading: isLoadingSchema,
    error: schemaError,
  } = usePipelineSchema(pipeline);

  useEffect(() => {
    setNewStepType(null);
    setEditStepIndex(pipeline.from ? null : -1);
  }, [pipeline]);

  useEffect(() => {
    if (schema) {
      if (schema.success) {
        setValidationErrorIndex(null);
      } else if (typeof schema.error !== "string") {
        setValidationErrorIndex(schema.error.issues[0].path[0]);
      }
    }
  }, [schema]);

  if (isLoadingSchema) {
    return (
      <Section className={className}>
        <Loading />
      </Section>
    );
  }

  if (schemaError) {
    return (
      <Section className={className}>
        <ErrorDisplay description={schemaError} />
      </Section>
    );
  }

  function renderStep(
    stepType: StepIdentifier,
    step: Step | null,
    index: number,
    create?: boolean,
  ) {
    switch (stepType) {
      case StepIdentifierEnum.Select:
        return (
          <SelectStepComponent
            key={create ? "new step" : index}
            index={index}
            step={step ? (step as SelectStep) : step}
            pipeline={pipeline}
            setPipeline={setPipeline}
            edit={editStepIndex === index}
            setEditStepIndex={setEditStepIndex}
            setNewStepType={setNewStepType}
            create={create}
          />
        );
      case StepIdentifierEnum.Aggregate:
        return (
          <AggregateStepComponent
            key={create ? "new step" : index}
            index={index}
            step={step ? (step as AggregateStep) : step}
            pipeline={pipeline}
            setPipeline={setPipeline}
            edit={editStepIndex === index}
            setEditStepIndex={setEditStepIndex}
            setNewStepType={setNewStepType}
            create={create}
          />
        );
      case StepIdentifierEnum.Relate:
        return (
          <RelateStepComponent
            key={create ? "new step" : index}
            index={index}
            step={step ? (step as RelateStep) : step}
            pipeline={pipeline}
            setPipeline={setPipeline}
            edit={editStepIndex === index}
            setEditStepIndex={setEditStepIndex}
            setNewStepType={setNewStepType}
            create={create}
          />
        );
      case StepIdentifierEnum.Take:
        return (
          <TakeStepComponent
            index={index}
            step={step ? (step as TakeStep) : step}
            pipeline={pipeline}
            setPipeline={setPipeline}
            edit={editStepIndex === index}
            setEditStepIndex={setEditStepIndex}
            setNewStepType={setNewStepType}
            create={create}
          />
        );
      case StepIdentifierEnum.Filter:
        return (
          <FilterStepComponent
            index={index}
            step={step ? (step as FilterStep) : step}
            pipeline={pipeline}
            setPipeline={setPipeline}
            edit={editStepIndex === index}
            setEditStepIndex={setEditStepIndex}
            setNewStepType={setNewStepType}
            create={create}
          />
        );
      case StepIdentifierEnum.Order:
      case StepIdentifierEnum.Derive:
        return (
          <Section className="flex-none w-full py-2 rounded-sm">
            <NonIdealState
              title="This step is still in development"
              description={<div>This step isn&rsquo;t available yet. </div>}
              icon="build"
              layout="horizontal"
              action={
                <Button text="Close" onClick={() => setNewStepType(null)} />
              }
            />
          </Section>
        );
    }
  }

  function renderSteps() {
    return (
      <>
        {_.map(pipeline.steps, (step: Step, index: number) => {
          return (
            <>
              {newStepType && newStepType.index === index ? (
                renderStep(newStepType.stepType, null, newStepType.index, true)
              ) : (
                <StepTypeSelector
                  key={`selector-${index}`}
                  index={index}
                  setNewStepType={setNewStepType}
                  disabled={
                    newStepType !== null ||
                    editStepIndex !== null ||
                    (validationErrorIndex !== null &&
                      validationErrorIndex < index)
                  }
                />
              )}
              {renderStep(step.type, step, index)}
            </>
          );
        })}
        {newStepType && newStepType.index === pipeline.steps.length ? (
          renderStep(newStepType.stepType, null, newStepType.index, true)
        ) : (
          <StepTypeSelector
            index={pipeline.steps.length}
            setNewStepType={setNewStepType}
            disabled={
              newStepType !== null ||
              editStepIndex !== null ||
              (validationErrorIndex !== null &&
                validationErrorIndex <= pipeline.steps.length)
            }
          />
        )}
      </>
    );
  }

  return (
    <Section className={className}>
      <FromStepComponent
        key="from"
        pipeline={pipeline}
        setPipeline={setPipeline}
        editStepIndex={editStepIndex}
        setEditStepIndex={setEditStepIndex}
        newStepType={newStepType}
      />
      {pipeline.from && renderSteps()}
    </Section>
  );
}
