"use client";
import {
  AggregateStep,
  AggregationOperations,
  InferredSchemaProperty,
  InferSchemaOutput,
  InferSchemaOutputSuccess,
  StepIdentifierEnum,
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
import {
  MultiPropertySelector,
  SinglePropertySelector,
} from "@/components/old-reference/property-selectors";
import InvalidStepPopover from "../../invalid-step-popover";
import InvalidPropertyTag from "../invalid-property-tag";
import AggregatePropertyInGroupTag from "./aggregate-property-in-group-tag";
import { useState } from "react";
import { makeApiName } from "@/utils/make-friendly";
import { useField } from "@/utils/use-field";
import * as _ from "lodash";

export default function AggregateEditor({
  step,
  stepIndex,
  updateStep,
  schema,
  inputSchema,
  setIsEditing,
}: {
  step: AggregateStep;
  stepIndex: number;
  updateStep: (step: WorkbookStep, index: number) => void;
  schema: InferSchemaOutput;
  inputSchema: InferSchemaOutputSuccess;
  setIsEditing: (value: boolean) => void;
}) {
  //
  // "AGGREGATION OPERATION" State
  const [selectedOperation, setSelectedOperation] =
    useState<AggregationOperations | null>(step.operation);

  //
  // "AGGREGATION PROPERTY" States
  const initialSelectedProperty = _.find(
    inputSchema.data.properties,
    (property: InferredSchemaProperty) => property.api_path === step.property,
  );
  // State for the selected property
  const [selectedProperty, setSelectedProperty] =
    useState<InferredSchemaProperty | null>(
      initialSelectedProperty ? initialSelectedProperty : null,
    );
  // State for the selected property if it is invalid
  const [invalidSelectedProperty, setInvalidSelectedProperty] = useState<
    string | null
  >(initialSelectedProperty ? null : step.property);

  //
  // "AS" States
  const usedApiNames = _.map(
    inputSchema.data.properties,
    (property: InferredSchemaProperty) => property.api_name,
  );
  const usedApiPaths = _.map(
    inputSchema.data.properties,
    (property: InferredSchemaProperty) => property.api_path,
  );
  const asField = useField<string>(step.as, {
    valueTransformer: makeApiName,
    valueTester: testAsValueInUse,
  });
  const [asInUse, setAsInUse] = useState<boolean>(
    _.includes(usedApiNames, step.as) || _.includes(usedApiPaths, step.as),
  );
  const [isAsWarningOpen, setIsAsWarningOpen] = useState<boolean>(false);

  //
  // "GROUP BY" States
  const initialGroupProperties = getInitialGroupProperties();
  // State for the valid group properties
  const [group, setGroup] = useState<InferredSchemaProperty[]>(
    initialGroupProperties.valid,
  );
  // State for the invalid group properties
  const [invalidGroup, setInvalidGroup] = useState<string[]>(
    initialGroupProperties.invalid,
  );
  const [
    isAggregatePropertyInGroupWarningOpen,
    setIsAggregatePropertyInGroupWarningOpen,
  ] = useState<boolean>(false);

  // Get the initial group properties from the input schema
  function getInitialGroupProperties() {
    const availablePropertyPaths = _.map(
      inputSchema.data.properties,
      (property: InferredSchemaProperty) => property.api_path,
    );
    const [validGroupProperties, invalidGroupProperties] = _.partition(
      step.group,
      (propertyApiPath: string) =>
        _.includes(availablePropertyPaths, propertyApiPath),
    );
    return {
      valid: _.map(
        validGroupProperties,
        (propertyApiPath: string) =>
          _.find(
            inputSchema.data.properties,
            (property: InferredSchemaProperty) =>
              property.api_path === propertyApiPath,
          ) as InferredSchemaProperty,
      ),
      invalid: invalidGroupProperties,
    };
  }

  // Test if the "as" value is already in use in the pipeline
  function testAsValueInUse(value: string) {
    setAsInUse(
      _.includes(usedApiNames, value) || _.includes(usedApiPaths, value),
    );
  }

  // Remove an invalid group property
  function removeInvalidGroupProperty(selectedIndex: number) {
    setInvalidGroup(
      _.filter(invalidGroup, (value, index) => index !== selectedIndex),
    );
  }

  // Test if the step is invalid by checking if the selected property is invalid,
  // if the "as" value is in use, if there are any invalid group properties,
  // and if the selected property is included in the group properties
  function stepInvalid() {
    return !!(
      invalidSelectedProperty ||
      (asField.value === step.as &&
        (_.includes(usedApiNames, step.as) ||
          _.includes(usedApiPaths, step.as))) ||
      !!invalidGroup.length ||
      _.find(
        group,
        (property: InferredSchemaProperty) =>
          property.api_path === selectedProperty!.api_path,
      )
    );
  }

  function renderRightElement() {
    return (
      <div className="flex flex-row">
        <Button
          alignText="left"
          disabled={
            selectedOperation === null ||
            selectedProperty === null ||
            !asField.value ||
            asInUse ||
            stepInvalid()
          }
          text="Save"
          onClick={() =>
            updateStep(
              {
                type: StepIdentifierEnum.Aggregate,
                operation: selectedOperation!,
                property: selectedProperty!.api_path,
                as: asField.value,
                group: [
                  ..._.map(
                    group,
                    (property: InferredSchemaProperty) => property.api_path,
                  ),
                  ...invalidGroup,
                ],
              } as AggregateStep,
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

  function selectProperty(property: InferredSchemaProperty | null) {
    setSelectedProperty(property);
    if (!property && !initialSelectedProperty) {
      setInvalidSelectedProperty(step.property);
    } else {
      setInvalidSelectedProperty(null);
    }
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

  function renderAggregationPropertyTag() {
    const aggregationPropertyInGroup = _.find(
      group,
      (property: InferredSchemaProperty) =>
        property.api_path === selectedProperty!.api_path,
    );
    if (aggregationPropertyInGroup) {
      return (
        <Popover
          isOpen={isAggregatePropertyInGroupWarningOpen}
          placement="right"
          content={
            <div className="mx-2 my-1">
              <Text>
                The property being aggregated cannot be used to &quot;group
                by&quot;
              </Text>
            </div>
          }
        >
          <AggregatePropertyInGroupTag
            key={invalidGroup.length}
            property={aggregationPropertyInGroup.api_path}
            removeProperty={() => {
              setGroup(
                _.filter(
                  group,
                  (property: InferredSchemaProperty) =>
                    property.api_path !== aggregationPropertyInGroup.api_path,
                ),
              );
            }}
            setIsOpen={setIsAggregatePropertyInGroupWarningOpen}
          />
        </Popover>
      );
    } else {
      return <></>;
    }
  }

  return (
    <Section
      className={`flex-none w-full my-2 rounded-sm ${
        stepInvalid() ? "border-2 border-error" : ""
      }`}
      title={
        !stepInvalid() ? (
          <Text className="text-xl">Aggregate</Text>
        ) : (
          <div className="items-center">
            <div className="flex flex-row items-center">
              <Text className="text-xl grow-0">Aggregate:</Text>
              <InvalidStepPopover errors={schema.error.issues} />
            </div>
          </div>
        )
      }
      rightElement={renderRightElement()}
    >
      <div className="flex flex-col mx-3 my-2">
        {invalidSelectedProperty && (
          <div className="mb-2">
            <div className="flex flex-row items-center h-4">
              <Text className="text-md">Invalid aggregation property:</Text>
              <div className="flex flex-row items-center h-4 p-1 ml-2 rounded bg-error">
                <Text className={`text-bluprint-text-light cursor-default`}>
                  {invalidSelectedProperty}
                </Text>
              </div>
            </div>
          </div>
        )}
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
            setSelectedProperty={selectProperty}
            items={inputSchema.data.properties}
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
                isOpen={isAsWarningOpen}
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
                  onMouseEnter={() => setIsAsWarningOpen(true)}
                  onMouseLeave={() => setIsAsWarningOpen(false)}
                />
              </Popover>
            )}
          </div>
        </div>
        {selectedProperty && (
          <>
            {(!!invalidGroup.length ||
              _.find(
                group,
                (property: InferredSchemaProperty) =>
                  property.api_path === selectedProperty!.api_path,
              )) && (
              <div className="flex flex-row mt-2">
                <div className="flex flex-row items-center h-4">
                  <Text className="text-md">Invalid group properties:</Text>
                </div>
                <div className="flex flex-row flex-wrap gap-1 mx-2 grow">
                  {_.map(invalidGroup, (apiPath: string, index: number) => {
                    return (
                      <InvalidPropertyTag
                        key={index}
                        property={apiPath}
                        index={index}
                        removeProperty={removeInvalidGroupProperty}
                      />
                    );
                  })}
                  {renderAggregationPropertyTag()}
                </div>
              </div>
            )}
            <div className="flex flex-row items-center w-full mt-2">
              <Text className="whitespace-nowrap grow-0">Group by</Text>
              <MultiPropertySelector
                className="ml-2 grow"
                selected={_.filter(
                  group,
                  (property: InferredSchemaProperty) =>
                    property.api_path !== selectedProperty.api_path,
                )}
                setSelected={setGroup}
                items={_.filter(
                  inputSchema.data.properties,
                  (property: InferredSchemaProperty) =>
                    property.api_path !== selectedProperty.api_path,
                )}
              />
            </div>
          </>
        )}
      </div>
    </Section>
  );
}
