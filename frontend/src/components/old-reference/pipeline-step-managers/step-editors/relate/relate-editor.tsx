"use client";
import { ObjectDefinition, ObjectRelation } from "@/definitions";
import {
  InferredSchemaProperty,
  InferSchemaOutput,
  InferSchemaOutputSuccess,
  RelateStep,
  StepIdentifierEnum,
  WorkbookStep,
} from "@/definitions";
import { Button, Section, Text } from "@blueprintjs/core";
import { ErrorDisplay } from "@/components/error-display";
import InvalidStepPopover from "../../invalid-step-popover";
import RelationSelector from "../../step-creators/relate/relation-selector/relation-selector";
import Loading from "@/app/loading";
import { useEffect, useState } from "react";
import {
  useMultiObjectRelations,
  useObjectRelations,
} from "@/data/use-relation";
import * as _ from "lodash";

export default function RelateEditor({
  baseObjectDefinition,
  step,
  stepIndex,
  updateStep,
  schema,
  inputSchema,
  setIsEditing,
}: {
  baseObjectDefinition: ObjectDefinition;
  step: RelateStep;
  stepIndex: number;
  updateStep: (step: WorkbookStep, index: number) => void;
  schema: InferSchemaOutput;
  inputSchema: InferSchemaOutputSuccess;
  setIsEditing: (value: boolean) => void;
}) {
  // State for invalid selected relation
  const [invalidSelected, setInvalidSelected] = useState<string | null>(null);
  // State for valid selected relation
  const [selected, setSelected] = useState<ObjectRelation | null>(null);

  // Get pipeline base object definition relations
  const {
    data: baseRelations,
    error: baseRelationsError,
    isLoading: isLoadingBaseRelations,
  } = useObjectRelations(baseObjectDefinition.id);

  // Get relations for all object definitions already the pipeline
  const {
    data: additionalRelations,
    error: additionalRelationsError,
    isLoading: isLoadingAdditionalRelations,
  } = useMultiObjectRelations(inputSchema.data.relations);

  // Update selected valid/invalid relation when base relations or additional relations change
  useEffect(() => {
    if (baseRelations && additionalRelations) {
      const availableProperties = _.map(
        inputSchema.data.properties,
        (property: InferredSchemaProperty) => property.api_path,
      );
      const validBaseRelations = _.filter(
        baseRelations!,
        (relation: ObjectRelation) =>
          _.includes(availableProperties, relation.base_key),
      );
      const validAdditionalRelations = _.filter(
        additionalRelations!,
        (relation: ObjectRelation) =>
          _.includes(availableProperties, relation.base_key),
      );
      const validRelations = _.concat(
        validBaseRelations,
        validAdditionalRelations,
      );
      const uniqueValidRelations = _.uniqBy(
        validRelations,
        "object_definition_id",
      );
      const targetObjectRelation = _.find(
        uniqueValidRelations,
        (relation: ObjectRelation) => relation.api_path === step.relation,
      );
      if (!!targetObjectRelation) {
        setSelected(targetObjectRelation);
      } else {
        setInvalidSelected(step.relation);
      }
    }
  }, [baseRelations, additionalRelations]);

  if (isLoadingBaseRelations || isLoadingAdditionalRelations) {
    return <Loading />;
  }

  if (baseRelationsError || additionalRelationsError) {
    return (
      <ErrorDisplay
        title="Unexpected error"
        description={
          baseRelationsError
            ? baseRelationsError.message
            : additionalRelationsError.message
        }
      />
    );
  }

  function renderRightElement() {
    return (
      <div className="flex flex-row">
        <Button
          alignText="left"
          disabled={!selected}
          text="Save"
          onClick={() =>
            updateStep(
              {
                type: StepIdentifierEnum.Relate,
                relation: selected!.api_path,
              } as RelateStep,
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
        !!invalidSelected && !selected ? "border-2 border-error" : ""
      }`}
      title={
        !invalidSelected || !!selected ? (
          <Text className="text-xl">Relate</Text>
        ) : (
          <div className="items-center">
            <div className="flex flex-row items-center">
              <Text className="text-xl grow-0">Relate:</Text>
              <InvalidStepPopover errors={schema!.error.issues} />
            </div>
          </div>
        )
      }
      rightElement={renderRightElement()}
    >
      {!!invalidSelected && !selected && (
        <div className="flex flex-row mx-3 mt-2">
          <div className="flex flex-row items-center h-4">
            <Text className="text-md">Invalid relation:</Text>
            <div className="flex flex-row items-center h-4 p-1 ml-2 rounded bg-error">
              <Text className={`text-bluprint-text-light cursor-default`}>
                {invalidSelected}
              </Text>
            </div>
          </div>
        </div>
      )}
      <div className="mx-3 my-2">
        <RelationSelector
          baseObjectDefinition={baseObjectDefinition}
          schema={inputSchema.data}
          selected={selected}
          setSelected={setSelected}
        />
      </div>
    </Section>
  );
}
