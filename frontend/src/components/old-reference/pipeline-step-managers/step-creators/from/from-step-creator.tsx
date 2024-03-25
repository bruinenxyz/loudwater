"use client";
import { ObjectDefinition, PartialWorkbook } from "@/definitions";
import { Button, Section, Spinner, SpinnerSize, Text } from "@blueprintjs/core";
import { ErrorDisplay } from "@/components/error-display";
import { ObjectDefinitionSelector } from "@/components/old-reference/object-definition";
import { useObjectDefinitions } from "@/data/use-object-definition";
import { useState } from "react";

export default function FromStepCreator({
  setPipeline,
}: {
  setPipeline: (pipeline: PartialWorkbook) => void;
}) {
  const [selected, setSelected] = useState<ObjectDefinition | null>(null);

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
      </div>
    );
  }

  return (
    <Section
      className="flex-none w-full rounded-sm"
      title={renderContent()}
      rightElement={
        <div className="flex flex-row">
          <Button
            alignText="left"
            disabled={!selected}
            text="Add step"
            onClick={() => setPipeline({ from: selected!.id, steps: [] })}
          />
        </div>
      }
    />
  );
}
