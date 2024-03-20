"use client";
import {
  AggregateStep,
  AggregationOperations,
  InferredSchemaProperty,
  Pipeline,
  StepIdentifierEnum,
  PartialPipeline,
  PartialWorkbook,
  Workbook,
  WorkbookStep,
} from "@/definitions";
import {
  Button,
  Icon,
  InputGroup,
  MenuItem,
  Popover,
  Section,
  Text,
} from "@blueprintjs/core";
import { ItemRenderer, Select } from "@blueprintjs/select";
import NewStepSelection from "../new-step-selection";
import { ErrorDisplay } from "@/components/error-display";
import MultiPropertySelector from "@/components/old-reference/property-selectors/multi-property-selector/multi-property-selector";
import SinglePropertySelector from "@/components/old-reference/property-selectors/single-property-selector/single-property-selector";
import { makeApiName } from "@/utils/make-friendly";
import { useValidatePipelineAndWorkbook } from "@/data/use-pipeline";
import { useField } from "@/utils/use-field";
import { useEffect, useState } from "react";
import * as _ from "lodash";
import Loading from "@/app/loading";

export default function AggregateStepCreator({
  fullPipeline,
  index,
  setNewStepType,
  addStepToPipeline,
}: {
  fullPipeline: Workbook | Pipeline | PartialPipeline | PartialWorkbook;
  index: number;
  setNewStepType: (newStepObj: NewStepSelection | null) => void;
  addStepToPipeline: (newStep: WorkbookStep, index: number) => void;
}) {
  const [selectedOperation, setSelectedOperation] =
    useState<AggregationOperations | null>(null);
  const [selectedProperty, setSelectedProperty] =
    useState<InferredSchemaProperty | null>(null);
  const asField = useField<string>("", {
    valueTransformer: makeApiName,
    valueTester: testAsValueInUse,
  });
  const [asInUse, setAsInUse] = useState<boolean>(false);
  const [group, setGroup] = useState<InferredSchemaProperty[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const partialPipeline = {
    ...fullPipeline,
    steps: fullPipeline.steps.slice(0, index),
  };

  useEffect(() => {
    setGroup([]);
  }, [selectedProperty]);

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

  function testAsValueInUse(value: string) {
    const usedApiNames = _.map(
      schema!.data.properties,
      (property: InferredSchemaProperty) => property.api_name,
    );
    const usedApiPaths = _.map(
      schema!.data.properties,
      (property: InferredSchemaProperty) => property.api_path,
    );
    setAsInUse(
      _.includes(usedApiNames, value) || _.includes(usedApiPaths, value),
    );
  }

  const renderOperation: ItemRenderer<AggregationOperations> = (
    operation: AggregationOperations,
    { handleClick, modifiers },
  ) => {
    return (
      <MenuItem
        key={operation}
        roleStructure="listoption"
        selected={operation === selectedOperation}
        text={operation}
        onClick={handleClick}
      />
    );
  };

  function selectOperation(selection: AggregationOperations) {
    if (selectedOperation && selection === selectedOperation) {
      setSelectedOperation(null);
    } else {
      setSelectedOperation(selection);
    }
  }

  return (
    <Section
      className="flex-none w-full mt-2 rounded-sm"
      title={<Text className="text-xl">Aggregate</Text>}
      rightElement={
        <div className="flex flex-row">
          <Button
            alignText="left"
            disabled={
              selectedOperation === null ||
              selectedProperty === null ||
              !asField.value ||
              asInUse
            }
            text="Add step"
            onClick={() =>
              addStepToPipeline(
                {
                  type: StepIdentifierEnum.Aggregate,
                  group: _.map(
                    group,
                    (property: InferredSchemaProperty) => property.api_path,
                  ),
                  operation: selectedOperation,
                  property: selectedProperty!.api_path,
                  as: asField.value,
                } as AggregateStep,
                index,
              )
            }
          />
          <Button
            className="ml-2"
            alignText="left"
            text="Cancel step"
            onClick={() => {
              setNewStepType(null);
            }}
          />
        </div>
      }
    >
      <div className="flex flex-col mx-3 my-2">
        <div className="flex flex-row">
          <Select<AggregationOperations>
            filterable={false}
            items={["sum", "count", "average", "min", "max"]}
            itemRenderer={renderOperation}
            onItemSelect={selectOperation}
          >
            <Button
              rightIcon="double-caret-vertical"
              text={selectedOperation ? selectedOperation : "Select operation"}
            />
          </Select>
          <SinglePropertySelector
            className="ml-3"
            selectedProperty={selectedProperty}
            setSelectedProperty={setSelectedProperty}
            items={schema!.data.properties}
          />
          <div className="flex flex-row items-center">
            <InputGroup
              id="as-input"
              className="ml-3"
              {...asField}
              autoFocus={false}
              placeholder="as"
              intent={asInUse ? "danger" : "none"}
            />
            {asInUse && (
              <Popover
                isOpen={isOpen}
                placement="right"
                content={
                  <div className="mx-2 my-1">
                    <Text>Name is already in use</Text>
                  </div>
                }
              >
                <Icon
                  className="ml-2 cursor-pointer"
                  icon="warning-sign"
                  intent="danger"
                  onMouseEnter={() => setIsOpen(true)}
                  onMouseLeave={() => setIsOpen(false)}
                />
              </Popover>
            )}
          </div>
        </div>
        {selectedProperty && (
          <div className="flex flex-row items-center w-full mt-2">
            <Text className="whitespace-nowrap grow-0">Group by</Text>
            <MultiPropertySelector
              className="ml-2 grow"
              selected={group}
              setSelected={setGroup}
              items={_.filter(
                schema!.data.properties,
                (property: InferredSchemaProperty) =>
                  property.api_path !== selectedProperty.api_path,
              )}
            />
          </div>
        )}
      </div>
    </Section>
  );
}
