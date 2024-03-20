"use client";
import {
  ObjectDefinition,
  ObjectRelation,
  PartialPipeline,
  PartialWorkbook,
} from "@/definitions";
import {
  Pipeline,
  RelateStep,
  StepIdentifierEnum,
  Workbook,
  WorkbookStep,
} from "@/definitions";
import { Button, Section, Text } from "@blueprintjs/core";
import NewStepSelection from "../new-step-selection";
import RelationSelector from "./relation-selector/relation-selector";
import Loading from "@/app/loading";
import { ErrorDisplay } from "@/components/error-display";
import { useValidatePipelineAndWorkbook } from "@/data/use-pipeline";
import { useState } from "react";

export default function RelateStepCreator({
  fullPipeline,
  index,
  baseObjectDefinition,
  setNewStepType,
  addStepToPipeline,
}: {
  fullPipeline: Workbook | Pipeline | PartialPipeline | PartialWorkbook;
  index: number;
  baseObjectDefinition: ObjectDefinition;
  setNewStepType: (newStepObj: NewStepSelection | null) => void;
  addStepToPipeline: (newStep: WorkbookStep, index: number) => void;
}) {
  const [selected, setSelected] = useState<ObjectRelation | null>(null);

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

  function renderContent() {
    return (
      <div className="flex flex-row">
        <Text className="mr-3 text-xl">Relate</Text>
        <RelationSelector
          baseObjectDefinition={baseObjectDefinition}
          schema={schema!.data}
          selected={selected}
          setSelected={setSelected}
        />
      </div>
    );
  }

  return (
    <Section
      className="flex-none w-full mt-2 rounded-sm"
      title={renderContent()}
      rightElement={
        <div className="flex flex-row">
          <Button
            alignText="left"
            disabled={!selected}
            text="Add step"
            onClick={() =>
              addStepToPipeline(
                {
                  type: StepIdentifierEnum.Relate,
                  relation: selected!.api_path,
                } as RelateStep,
                index,
              )
            }
          />
          <Button
            className="ml-2"
            alignText="left"
            text="Cancel step"
            onClick={() => setNewStepType(null)}
          />
        </div>
      }
    />
  );
}
