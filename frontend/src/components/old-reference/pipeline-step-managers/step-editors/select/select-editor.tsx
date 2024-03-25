"use client";
import {
  InferredSchemaProperty,
  InferSchemaOutput,
  InferSchemaOutputSuccess,
  SelectStep,
  StepIdentifierEnum,
  WorkbookStep,
} from "@/definitions";
import { Button, Section, Text } from "@blueprintjs/core";
import InvalidStepPopover from "@/components/old-reference/pipeline-step-managers/invalid-step-popover";
import { MultiPropertySelector } from "@/components/old-reference/property-selectors";
import InvalidPropertyTag from "../invalid-property-tag";
import { useEffect, useState } from "react";
import * as _ from "lodash";

export default function SelectEditor({
  step,
  stepIndex,
  updateStep,
  schema,
  inputSchema,
  setIsEditing,
}: {
  step: SelectStep;
  stepIndex: number;
  updateStep: (step: WorkbookStep, index: number) => void;
  schema: InferSchemaOutput;
  inputSchema: InferSchemaOutputSuccess;
  setIsEditing: (value: boolean) => void;
}) {
  // State for invalid selected properties
  const [invalidSelected, setInvalidSelected] = useState<string[]>([]);

  // State for valid selected properties
  const [selected, setSelected] = useState<InferredSchemaProperty[]>([]);

  // Update selected properties & invalid properties when input schema loads
  useEffect(() => {
    if (inputSchema && inputSchema.success) {
      const availablePropertyPaths = _.map(
        inputSchema.data.properties,
        (property: InferredSchemaProperty) => property.api_path,
      );
      const [validSelectedProperties, invalidSelectedProperties] = _.partition(
        step.select,
        (propertyApiPath: string) =>
          _.includes(availablePropertyPaths, propertyApiPath),
      );
      setInvalidSelected(invalidSelectedProperties);
      setSelected(
        _.map(
          validSelectedProperties,
          (propertyApiPath: string) =>
            _.find(
              inputSchema.data.properties,
              (property: InferredSchemaProperty) =>
                property.api_path === propertyApiPath,
            ) as InferredSchemaProperty,
        ),
      );
    }
  }, [inputSchema]);

  function removeProperty(selectedIndex: number) {
    setInvalidSelected(
      _.filter(invalidSelected, (value, index) => index !== selectedIndex),
    );
  }

  function renderRightElement() {
    return (
      <div className="flex flex-row">
        <Button
          alignText="left"
          disabled={!selected.length}
          text="Save"
          onClick={() =>
            updateStep(
              {
                type: StepIdentifierEnum.Select,
                select: [
                  ..._.map(
                    selected,
                    (property: InferredSchemaProperty) => property.api_path,
                  ),
                  ...invalidSelected,
                ],
              } as SelectStep,
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
        invalidSelected.length ? "border-2 border-error" : ""
      }`}
      title={
        !invalidSelected.length ? (
          <Text className="text-xl">Select</Text>
        ) : (
          <div className="items-center">
            <div className="flex flex-row items-center">
              <Text className="text-xl grow-0">Select:</Text>
              <InvalidStepPopover errors={schema!.error.issues} />
            </div>
          </div>
        )
      }
      rightElement={renderRightElement()}
    >
      {!!invalidSelected.length && (
        <div className="flex flex-row mx-3 mt-2">
          <div className="flex flex-row items-center h-4">
            <Text className="text-md">Invalid properties:</Text>
          </div>
          <div className="flex flex-row flex-wrap gap-1 mx-2 grow">
            {_.map(invalidSelected, (property: string, index: number) => {
              return (
                <InvalidPropertyTag
                  key={index}
                  property={property}
                  index={index}
                  removeProperty={removeProperty}
                />
              );
            })}
          </div>
        </div>
      )}
      <MultiPropertySelector
        className="mx-3 my-2"
        items={inputSchema!.data.properties}
        selected={selected}
        setSelected={setSelected}
      />
    </Section>
  );
}
