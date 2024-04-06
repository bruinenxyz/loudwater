"use client";
import {
  InferSchemaOutputSuccess,
  Pipeline,
  RelateStep,
  Step,
  StepIdentifierEnum,
} from "@/definitions/pipeline";
import {
  HydratedTable,
  InferredSchemaColumn,
  InferredSchemaRelation,
  Relation,
} from "@/definitions";
import {
  Button,
  Icon,
  InputGroup,
  Menu,
  MenuItem,
  Popover,
  Section,
  Text,
} from "@blueprintjs/core";
import { ItemRenderer, Select } from "@blueprintjs/select";
import Loading from "@/app/loading";
import { ErrorDisplay } from "@/components/error-display";
import { NewStepSelection } from "../../query-builder";
import InvalidStepPopover from "../../invalid-step-popover";
import InferredSchemaColumnTag from "@/components/column/inferred-schema-column-tag";
import SingleColumnSelector from "@/components/column-selectors/single-column-selector/single-column-selector";
import RelationItemContent from "./relation-item-content";
import { makeApiName } from "@/utils/make-friendly";
import { useSelectedDatabase } from "@/stores";
import { usePipelineSchema } from "@/data/use-user-query";
import { useTables } from "@/data/use-tables";
import { useRelations } from "@/data/use-relations";
import { useEffect, useState } from "react";
import { useField } from "@/utils/use-field";
import * as _ from "lodash";

interface RelateStepProps {
  index: number;
  step: RelateStep | null;
  pipeline: Pipeline;
  setPipeline: (value: Pipeline) => void;
  edit: boolean;
  setEditStepIndex: (value: number | null) => void;
  setNewStepType: (value: NewStepSelection | null) => void;
  create?: boolean;
}

export interface RelationItem {
  originTable: HydratedTable;
  relatedTable: HydratedTable;
  relation: Relation;
}

export default function RelateStepComponent({
  index,
  step,
  pipeline,
  setPipeline,
  edit,
  setEditStepIndex,
  setNewStepType,
  create,
}: RelateStepProps) {
  const [selectedDatabase] = useSelectedDatabase();
  const [selected, setSelected] = useState<RelationItem | null>(null);
  const asField = useField<string>("");
  const [joinColumn, setJoinColumn] = useState<InferredSchemaColumn | null>(
    null,
  );
  const [asInUse, setAsInUse] = useState<boolean>(false);
  const [isAsWarningOpen, setIsAsWarningOpen] = useState<boolean>(false);

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

  const {
    data: tables,
    isLoading: isLoadingTables,
    error: tablesError,
  } = useTables(selectedDatabase.id);

  const {
    data: relations,
    isLoading: isLoadingRelations,
    error: relationsError,
  } = useRelations(selectedDatabase.id);

  useEffect(() => {
    resetFields();
  }, [step, tables, relations]);

  useEffect(() => {
    if (inputSchema && inputSchema.success && asField.value) {
      testAsValueInUse(asField.value);
    }
  }, [inputSchema]);

  function resetFields() {
    if (step && relations && tables) {
      const relation = _.find(
        relations,
        (relation) => relation.id === step.relation.relation,
      );
      const relatedTable = _.find(
        tables,
        (table) => table.id === step.relation.table,
      );
      const originTable = _.find(
        tables,
        (table) =>
          table.id !== step.relation.table &&
          (relation?.table_1 === table.id || relation?.table_2 === table.id),
      );
      if (relation && originTable && relatedTable) {
        setSelected({ relation, originTable, relatedTable });
        asField.onValueChange(step.relation.as);
        setJoinColumn(step.relation.on);
      } else {
        setSelected(null);
        asField.onValueChange("");
        setJoinColumn(null);
      }
    } else {
      setSelected(null);
      asField.onValueChange("");
      setJoinColumn(null);
    }
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

  function handleAsChange(newValue: string) {
    const cleanedAs = makeApiName(newValue);
    testAsValueInUse(cleanedAs);
    asField.onValueChange(cleanedAs);
  }

  function canSubmit() {
    if (!inputSchema || !inputSchema.success) {
      return false;
    }
    const successInputSchema = inputSchema as InferSchemaOutputSuccess;
    return (
      selected !== null &&
      !!asField.value &&
      !asInUse &&
      joinColumn !== null &&
      !!_.find(
        successInputSchema.data.columns,
        (column: InferredSchemaColumn) => _.isEqual(column, joinColumn),
      )
    );
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
      schemaError ||
      isLoadingTables ||
      isLoadingRelations
    ) {
      return <Text className="text-xl grow-0">Relate:</Text>;
    } else if (inputSchema && !inputSchema.success) {
      const relatedTable = _.find(
        tables,
        (table) => table.id === step!.relation.table,
      );
      const relation = _.find(
        relations,
        (relation) => relation.id === step!.relation.relation,
      );
      const originTable = _.find(
        tables,
        (table) =>
          table.id !== step!.relation.table &&
          (relation?.table_1 === table.id || relation?.table_2 === table.id),
      );
      if (relatedTable && relation && originTable) {
        return (
          <div className="flex flex-row items-center">
            <Text className="text-xl grow-0">Relate:</Text>
            <div className="flex flex-row flex-wrap items-center gap-2 mx-2 grow">
              <RelationItemContent
                item={{
                  relation,
                  relatedTable,
                  originTable,
                }}
              />
              <div className="flex flex-row items-center gap-2 flex-nowrap">
                <Text className="font-normal flex-nowrap">on</Text>
                <InferredSchemaColumnTag column={step!.relation.on} />
              </div>
              <div className="flex flex-row items-center gap-2 flex-nowrap">
                <Text className="flex-nowrap">as</Text>
                <Text className="font-bold flex-nowrap">
                  {step!.relation.as}
                </Text>
              </div>
            </div>
          </div>
        );
      }
    } else if (schema && !schema.success) {
      return (
        <div className="flex flex-row items-center">
          <Text className="text-xl grow-0">Relate:</Text>
          <InvalidStepPopover errors={schema!.error.issues} />
        </div>
      );
    } else {
      const relatedTable = _.find(
        tables,
        (table) => table.id === step!.relation.table,
      );
      const relation = _.find(
        relations,
        (relation) => relation.id === step!.relation.relation,
      );
      const originTable = _.find(
        tables,
        (table) =>
          table.id !== step!.relation.table &&
          (relation?.table_1 === table.id || relation?.table_2 === table.id),
      );
      if (relatedTable && relation && originTable) {
        return (
          <div className="flex flex-row items-center">
            <Text className="text-xl grow-0">Relate:</Text>
            <div className="flex flex-row flex-wrap items-center gap-2 mx-2 grow">
              <RelationItemContent
                item={{
                  relation,
                  relatedTable,
                  originTable,
                }}
              />
              <div className="flex flex-row items-center gap-2 flex-nowrap">
                <Text className="font-normal flex-nowrap">on</Text>
                <InferredSchemaColumnTag column={step!.relation.on} />
              </div>
              <div className="flex flex-row items-center gap-2 flex-nowrap">
                <Text className="font-normal flex-nowrap">as</Text>
                <Text className="font-bold flex-nowrap">
                  {step!.relation.as}
                </Text>
              </div>
            </div>
          </div>
        );
      }
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
              const successInputSchema =
                inputSchema as InferSchemaOutputSuccess;
              setNewStepType(null);
              const newStep = {
                type: StepIdentifierEnum.Relate,
                relation: {
                  table: selected!.relatedTable.id,
                  relation: selected!.relation.id,
                  as: asField.value,
                  on: joinColumn,
                },
                inputSchema: successInputSchema.data.columns,
              } as RelateStep;
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
                const successInputSchema =
                  inputSchema as InferSchemaOutputSuccess;
                const updatedStep = {
                  type: StepIdentifierEnum.Relate,
                  relation: {
                    table: selected!.relatedTable.id,
                    relation: selected!.relation.id,
                    as: asField.value,
                    on: joinColumn,
                  },
                  inputSchema: successInputSchema.data.columns,
                } as RelateStep;
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

  const renderRelationItem: ItemRenderer<RelationItem> = (
    relationItem,
    { handleClick, modifiers },
  ) => {
    return (
      <MenuItem
        key={`${relationItem.relation.id}.${relationItem.relatedTable.id}`}
        text={<RelationItemContent item={relationItem} />}
        onClick={handleClick}
        selected={_.isEqual(relationItem, selected)}
      />
    );
  };

  function selectRelationItem(item: RelationItem) {
    if (_.isEqual(item, selected)) {
      setSelected(null);
      setJoinColumn(null);
    } else {
      setSelected(item);
      const successInputSchema = inputSchema as InferSchemaOutputSuccess;
      const targetColumnName =
        item.relation.table_1 === item.originTable.id
          ? item.relation.column_1
          : item.relation.column_2;
      const availableColumns: InferredSchemaColumn[] = _.filter(
        successInputSchema.data.columns,
        (column: InferredSchemaColumn) =>
          column.table === item.originTable.id &&
          column.name === targetColumnName,
      );
      if (availableColumns.length === 1) {
        setJoinColumn(availableColumns[0]);
      } else {
        setJoinColumn(null);
      }
    }
  }

  function selectJoinColumn(column: InferredSchemaColumn) {
    if (_.isEqual(column, joinColumn)) {
      setJoinColumn(null);
    } else {
      setJoinColumn(column);
    }
  }

  function renderContent() {
    if (
      isLoadingSchema ||
      isLoadingInputSchema ||
      isLoadingTables ||
      isLoadingRelations
    ) {
      return (
        <div className="flex flex-row justify-center my-1 h-fit">
          <Loading />
        </div>
      );
    } else if (schemaError || inputSchemaError) {
      return <ErrorDisplay description={schemaError || inputSchemaError} />;
    } else if (!inputSchema!.success || !tables || !relations) {
      return null;
    } else if (edit || create || !step) {
      const successInputSchema = inputSchema as InferSchemaOutputSuccess;
      const items: RelationItem[] = [];
      _.forEach(tables, (table: HydratedTable) => {
        // Get the relations that are connected to the table
        const relationsForTable = _.filter(
          relations,
          (relation: Relation) =>
            relation.table_1 === table.id || relation.table_2 === table.id,
        );
        // Iterate over the relations and check if the other table & key in the relation are in the schema
        for (const relation of relationsForTable) {
          const originTableId =
            relation.table_1 === table.id ? relation.table_2 : relation.table_1;
          const originTableColumn =
            relation.table_1 === table.id
              ? relation.column_2
              : relation.column_1;
          const originTable = _.find(
            tables,
            (table) => table.id === originTableId,
          );
          if (
            _.find(
              successInputSchema.data.columns,
              (column) =>
                column.name === originTableColumn &&
                column.table === originTableId,
            )
          ) {
            items.push({
              relation,
              relatedTable: table,
              originTable: originTable!,
            });
          }
        }
      });
      return (
        <div className="flex flex-row flex-wrap items-center gap-2 px-3 py-2">
          <Select<RelationItem>
            items={items}
            itemRenderer={renderRelationItem}
            onItemSelect={selectRelationItem}
          >
            <Button rightIcon="double-caret-vertical">
              <RelationItemContent item={selected} />
            </Button>
          </Select>
          {!!selected ? (
            <div className="flex flex-row items-center gap-2 flex-nowrap">
              <Text className="flex-nowrap">on</Text>
              <SingleColumnSelector
                disabled={false}
                items={_.filter(
                  successInputSchema.data.columns,
                  (column: InferredSchemaColumn) =>
                    column.table === selected.originTable.id &&
                    column.name ===
                      (selected.relation.table_1 === selected.originTable.id
                        ? selected.relation.column_1
                        : selected.relation.column_2),
                )}
                selected={joinColumn}
                onColumnSelect={selectJoinColumn}
              />
            </div>
          ) : null}
          <div className="flex flex-row items-center flex-nowrap">
            <InputGroup
              id="as-input"
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
