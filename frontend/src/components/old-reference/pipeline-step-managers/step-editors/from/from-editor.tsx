"use client";
import { ObjectDefinition, PartialWorkbook, Workbook } from "@/definitions";
import { Button, Section, Spinner, SpinnerSize, Text } from "@blueprintjs/core";
import NewBaseObjectDefinitionDialog from "./new-base-object-definition-dialog";
import { ErrorDisplay } from "@/components/error-display";
import { ObjectDefinitionSelector } from "@/components/old-reference/object-definition";
import { useObjectDefinitions } from "@/data/use-object-definition";
import { useState } from "react";

export default function FromEditor({
  currentObjectDefinition,
  setPipeline,
  setIsEditing,
}: {
  currentObjectDefinition: ObjectDefinition;
  setPipeline: (pipeline: Workbook | PartialWorkbook) => void;
  setIsEditing: (toggle: boolean) => void;
}) {
  const [selected, setSelected] = useState<ObjectDefinition | null>(
    currentObjectDefinition,
  );
  const [addStepToggle, setAddStepToggle] = useState<boolean>(false);

  const {
    data: objectDefinitions,
    isLoading: isLoadingObjectDefinitions,
    error: objectDefinitionError,
  } = useObjectDefinitions();

  if (objectDefinitionError) {
    return (
      <ErrorDisplay
        title="Unexpected error"
        description={objectDefinitionError.message}
      />
    );
  }

  function renderContent() {
    if (isLoadingObjectDefinitions) {
      return <Spinner size={SpinnerSize.SMALL} />;
    }
    return (
      <div className="flex flex-row items-center">
        <Text className="mr-3 text-xl">From</Text>
        <ObjectDefinitionSelector
          items={objectDefinitions!}
          selected={selected}
          setSelected={setSelected}
        />
        {addStepToggle && (
          <NewBaseObjectDefinitionDialog
            newObjectDefinition={selected!}
            setPipeline={setPipeline}
            setAddStepToggle={setAddStepToggle}
            setIsEditing={setIsEditing}
          />
        )}
      </div>
    );
  }

  return (
    <Section
      className="flex-none w-full mb-2 rounded-sm"
      title={renderContent()}
      rightElement={
        <div className="flex flex-row">
          <Button
            alignText="left"
            disabled={!selected}
            text="Add step"
            onClick={() => {
              if (selected!.id !== currentObjectDefinition.id) {
                setAddStepToggle(true);
              } else {
                setIsEditing(false);
              }
            }}
          />
          <Button
            className="ml-2"
            alignText="left"
            text="Cancel"
            onClick={() => setIsEditing(false)}
          />
        </div>
      }
    />
  );
}
