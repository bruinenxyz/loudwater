"use client";
import {
  AggregateStep,
  AggregationOperations,
  InferSchemaOutputSuccess,
  InferredSchemaColumn,
  InferredSchemaRelation,
  Pipeline,
  Step,
  StepIdentifierEnum,
} from "@/definitions";
import {
  Button,
  Icon,
  IconSize,
  InputGroup,
  Menu,
  MenuItem,
  Popover,
  Section,
  Tag,
  Text,
} from "@blueprintjs/core";
import { ItemRenderer, Select } from "@blueprintjs/select";
import Loading from "@/app/loading";
import { ErrorDisplay } from "@/components/error-display";
import { NewStepSelection } from "../query-builder";
import InvalidStepPopover from "../invalid-step-popover";
import MultiColumnSelector from "@/components/column-selectors/multi-column-selector/multi-column-selector";
import SingleColumnSelector from "@/components/column-selectors/single-column-selector/single-column-selector";
import InferredSchemaColumnTag from "@/components/column/inferred-schema-column-tag";
import SquareIcon, { SquareIconSize } from "@/components/icon/square-icon";
import { makeApiName } from "@/utils/make-friendly";
import { usePipelineSchema } from "@/data/use-user-query";
import { useState, useEffect } from "react";
import { useField } from "@/utils/use-field";
import * as _ from "lodash";

interface AggregateStepProps {
  index: number;
  step: AggregateStep | null;
  pipeline: Pipeline;
  setPipeline: (value: Pipeline) => void;
  edit: boolean;
  setEditStepIndex: (value: number | null) => void;
  setNewStepType: (value: NewStepSelection | null) => void;
  create?: boolean;
}

export default function AggregateStepComponent({
  index,
  step,
  pipeline,
  setPipeline,
  edit,
  setEditStepIndex,
  setNewStepType,
  create,
}: AggregateStepProps) {
  const [selectedOperation, setSelectedOperation] =
    useState<AggregationOperations | null>(!!step ? step.operation : null);
  const [selectedColumn, setSelectedColumn] =
    useState<InferredSchemaColumn | null>(!!step ? step.column : null);
  const asField = useField<string>(!!step ? step.as : "", {
    valueTransformer: makeApiName,
  });
  const [group, setGroup] = useState<InferredSchemaColumn[]>(
    !!step ? step.group : [],
  );
  const [asInUse, setAsInUse] = useState<boolean>(false);
  const [isAsWarningOpen, setIsAsWarningOpen] = useState<boolean>(false);
  const [viewGroupByToggle, setViewGroupByToggle] = useState<boolean>(false);

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

  useEffect(() => {
    if (inputSchema && asField.value) {
      testAsValueInUse(asField.value);
    }
  }, [inputSchema]);

  function resetFields() {
    if (step) {
      setSelectedOperation(step.operation);
      setSelectedColumn(step.column);
      asField.onValueChange(step.as);
      setGroup(step.group);
    } else {
      setSelectedOperation(null);
      setSelectedColumn(null);
      asField.onValueChange("");
      setGroup([]);
    }
  }

  function canSubmit() {
    return (
      selectedOperation !== null &&
      selectedColumn !== null &&
      !!asField.value &&
      !asInUse
    );
  }

  function getAdditionalClasses() {
    if (inputSchema && !inputSchema.success) {
      return "border-2 border-gold";
    } else if (schema && !schema.success) {
      return "border-2 border-error";
    }
  }

  function handleAsChange(newValue: string) {
    const cleanedAs = makeApiName(newValue);
    testAsValueInUse(cleanedAs);
    asField.onValueChange(cleanedAs);
  }

  function testAsValueInUse(value: string) {
    const successInputSchema = inputSchema as InferSchemaOutputSuccess;
    const usedColumnNames = _.map(
      successInputSchema.data.columns,
      (column: InferredSchemaColumn) => column.name,
    );
    const usedRelationNames = _.map(
      successInputSchema.data.relations,
      (relation: InferredSchemaRelation) => relation.as,
    );
    setAsInUse(
      _.includes(usedColumnNames, value) ||
        _.includes(usedRelationNames, value),
    );
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
      return <Text className="text-xl grow-0">Aggregate:</Text>;
    } else if (inputSchema && !inputSchema.success) {
      return (
        <div className="flex flex-row items-center">
          <Text className="text-xl grow-0">Aggregate:</Text>
          <div className="flex flex-row flex-wrap items-center ml-3 grow h-fit">
            <Text className="mr-2 flex-nowrap ">{step.operation}</Text>
            <InferredSchemaColumnTag column={step.column} />
            <Text className="mr-2 font-normal flex-nowrap">as</Text>
            <Tag
              minimal={true}
              intent={"none"}
              className={`w-fit cursor-default`}
            >
              <div className="flex flex-row items-center w-fit">
                <SquareIcon
                  icon="function"
                  color="gray"
                  size={SquareIconSize.SMALL}
                />
                <Text className="py-1 ml-1 font-normal flex-nowrap">
                  {step.as}
                </Text>
              </div>
            </Tag>
          </div>
        </div>
      );
    } else if (schema && !schema.success) {
      return (
        <div className="flex flex-row items-center">
          <Text className="text-xl grow-0">Aggregate:</Text>
          <InvalidStepPopover errors={schema!.error.issues} />
        </div>
      );
    } else {
      return (
        <div className="flex flex-row items-center">
          <Text className="text-xl grow-0">Aggregate:</Text>
          <div className="flex flex-row flex-wrap items-center ml-3 gap-y-1 grow h-fit">
            <Text className="mr-2 flex-nowrap ">{step.operation}</Text>
            <InferredSchemaColumnTag column={step.column} />
            <Text className="mx-2 font-normal flex-nowrap">as</Text>
            <Tag
              minimal={true}
              intent={"none"}
              className={`w-fit  cursor-default `}
            >
              <div className="flex flex-row items-center w-fit">
                <SquareIcon
                  icon="function"
                  color="gray"
                  size={SquareIconSize.SMALL}
                />
                <Text className="py-1 ml-1 font-normal flex-nowrap">
                  {step.as}
                </Text>
              </div>
            </Tag>
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
            disabled={!canSubmit()}
            text="Add step"
            onClick={() => {
              setNewStepType(null);
              const newStep = {
                type: StepIdentifierEnum.Aggregate,
                column: selectedColumn,
                operation: selectedOperation,
                as: asField.value,
                group: group,
              } as AggregateStep;
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
              disabled={!canSubmit()}
              text="Confirm step"
              onClick={() => {
                const updatedStep = {
                  type: StepIdentifierEnum.Aggregate,
                  column: selectedColumn,
                  operation: selectedOperation,
                  as: asField.value,
                  group: group,
                } as AggregateStep;
                const newSteps: Step[] = [...pipeline.steps];
                newSteps.splice(index, 1, updatedStep as Step);
                setPipeline({ ...pipeline, steps: newSteps });
              }}
            />{" "}
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
                text={
                  selectedOperation ? selectedOperation : "Select operation"
                }
              />
            </Select>
            <SingleColumnSelector
              className="ml-3"
              disabled={false}
              selected={selectedColumn}
              onColumnSelect={setSelectedColumn}
              items={successInputSchema.data.columns}
            />
            <div className="flex flex-row items-center">
              <InputGroup
                id="as-input"
                className="ml-3"
                value={asField.value}
                onChange={(e) => handleAsChange(e.target.value)}
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
          {selectedColumn && (
            <div className="flex flex-row items-center w-full mt-2">
              <Text className="whitespace-nowrap grow-0">Group by</Text>
              <MultiColumnSelector
                className="ml-2 grow"
                selected={group}
                setSelected={setGroup}
                items={_.filter(
                  successInputSchema.data.columns,
                  (column: InferredSchemaColumn) =>
                    !_.isEqual(column, selectedColumn),
                )}
              />
            </div>
          )}
        </div>
      );
    } else if (step.group.length > 0) {
      return (
        <div className="w-full border-b border-bluprint-border-gray">
          <div className="my-1 ml-3">
            <div
              className="flex flex-row items-center text-sm hover:cursor-pointer"
              onClick={() => setViewGroupByToggle(!viewGroupByToggle)}
            >
              {viewGroupByToggle ? (
                <>
                  <Text className="mr-1">
                    Hide &quot;group by&quot; columns
                  </Text>
                  <Icon icon="chevron-down" size={IconSize.LARGE} />
                </>
              ) : (
                <>
                  <Text className="mr-1">
                    View &quot;group by&quot; columns
                  </Text>
                  <Icon icon="chevron-right" size={IconSize.LARGE} />
                </>
              )}
            </div>
            {viewGroupByToggle && (
              <div className="flex flex-row flex-wrap gap-1 my-2 grow">
                {_.map(
                  step.group,
                  (column: InferredSchemaColumn, index: number) => (
                    <InferredSchemaColumnTag key={index} column={column} />
                  ),
                )}
              </div>
            )}
          </div>
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
