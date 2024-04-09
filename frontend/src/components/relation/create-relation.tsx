"use client";
import {
  CreateRelationSchema,
  RelationTypeEnum,
  InferredSchemaColumn,
  HydratedTable,
  RelationType,
  CleanDatabase,
} from "@/definitions";
import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  Divider,
  MenuItem,
  Text,
} from "@blueprintjs/core";
import { ItemRenderer, Select } from "@blueprintjs/select";
import Loading from "@/app/loading";
import { ErrorDisplay } from "../error-display";
import SingleTableSelector from "../table/selectors/single-table-selector/single-table-selector";
import SingleColumnSelector from "../column-selectors/single-column-selector/single-column-selector";
import { useState } from "react";
import { useTables } from "@/data/use-tables";
import { useCreateRelation } from "@/data/use-relations";
import * as _ from "lodash";

interface CreateRelationProps {
  selectedDatabase: CleanDatabase;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function CreateRelation({
  selectedDatabase,
  isOpen,
  setIsOpen,
}: CreateRelationProps) {
  const [relationType, setRelationType] = useState<RelationType | null>(null);
  const [table1, setTable1] = useState<HydratedTable | null>(null);
  const [table2, setTable2] = useState<HydratedTable | null>(null);
  const [column1, setColumn1] = useState<InferredSchemaColumn | null>(null);
  const [column2, setColumn2] = useState<InferredSchemaColumn | null>(null);
  const [joinTable, setJoinTable] = useState<HydratedTable | null>(null);
  const [joinColumn1, setJoinColumn1] = useState<InferredSchemaColumn | null>(
    null,
  );
  const [joinColumn2, setJoinColumn2] = useState<InferredSchemaColumn | null>(
    null,
  );
  const { trigger, isMutating } = useCreateRelation(selectedDatabase.id);
  const {
    data: tables,
    isLoading: isLoadingTables,
    error: tablesError,
  } = useTables(selectedDatabase.id);

  function resetBaseFields() {
    setTable1(null);
    setTable2(null);
    setColumn1(null);
    setColumn2(null);
  }

  function resetJoinFields() {
    setJoinTable(null);
    setJoinColumn1(null);
    setJoinColumn2(null);
  }

  function canCreateRelation() {
    if (
      relationType === RelationTypeEnum.ManyToMany &&
      (!joinTable || !joinColumn1 || !joinColumn2)
    ) {
      return false;
    } else {
      const newRelation = {
        database_id: selectedDatabase.id,
        type: relationType,
        generated: false,
        table_1: table1?.id || undefined,
        column_1: column1?.name || undefined,
        table_2: table2?.id || undefined,
        column_2: column2?.name || undefined,
        join_table: joinTable?.id || undefined,
        join_column_1: joinColumn1?.name || undefined,
        join_column_2: joinColumn2?.name || undefined,
      };
      return CreateRelationSchema.safeParse(newRelation).success;
    }
  }

  async function handleCreateRelation() {
    const parsedRelation = CreateRelationSchema.parse({
      database_id: selectedDatabase.id,
      type: relationType,
      generated: false,
      table_1: table1?.id,
      column_1: column1?.name,
      table_2: table2?.id,
      column_2: column2?.name,
      join_table: joinTable?.id || undefined,
      join_column_1: joinColumn1?.name || undefined,
      join_column_2: joinColumn2?.name || undefined,
    });
    await trigger(parsedRelation);
    resetBaseFields();
    resetJoinFields();
    setRelationType(null);
    setIsOpen(false);
  }

  const renderRelationTypeItem: ItemRenderer<string> = (
    relType,
    { handleClick, modifiers },
  ) => (
    <MenuItem
      key={relType}
      text={relType.replace(/_/g, "-")}
      onClick={handleClick}
      selected={relType === relationType}
    />
  );

  function selectRelationType(relType: RelationType) {
    if (relType === relationType) {
      setRelationType(null);
      resetBaseFields();
    } else {
      setRelationType(relType);
    }
    resetJoinFields();
  }

  function selectTable1(table: HydratedTable) {
    if (table1?.id === table.id) {
      setTable1(null);
    } else {
      setTable1(table);
    }
    setColumn1(null);
  }

  function selectTable2(table: HydratedTable) {
    if (table2?.id === table.id) {
      setTable2(null);
    } else {
      setTable2(table);
    }
    setColumn2(null);
  }

  function selectJoinTable(table: HydratedTable) {
    if (joinTable?.id === table.id) {
      setJoinTable(null);
    } else {
      setJoinTable(table);
    }
    setJoinColumn1(null);
    setJoinColumn2(null);
  }

  function selectColumn1(column: InferredSchemaColumn) {
    if (column1?.name === column.name && column1?.table === column.table) {
      setColumn1(null);
    } else {
      setColumn1(column);
    }
  }

  function selectColumn2(column: InferredSchemaColumn) {
    if (column2?.name === column.name && column2?.table === column.table) {
      setColumn2(null);
    } else {
      setColumn2(column);
    }
  }

  function selectJoinColumn1(column: InferredSchemaColumn) {
    if (
      joinColumn1?.name === column.name &&
      joinColumn1?.table === column.table
    ) {
      setJoinColumn1(null);
    } else {
      setJoinColumn1(column);
    }
  }

  function selectJoinColumn2(column: InferredSchemaColumn) {
    if (
      joinColumn2?.name === column.name &&
      joinColumn2?.table === column.table
    ) {
      setJoinColumn2(null);
    } else {
      setJoinColumn2(column);
    }
  }

  function renderManyToManyFields() {
    if (relationType === RelationTypeEnum.ManyToMany) {
      const joinTableColumns = joinTable
        ? _.map(_.values(joinTable.external_columns), (column) => {
            return { ...column, table: joinTable.id };
          })
        : [];
      return (
        <>
          <Divider />
          <div className="flex flex-row items-center justify-between">
            <Text>Join Table</Text>
            <SingleTableSelector
              items={tables!}
              selected={joinTable}
              onTableSelect={selectJoinTable}
            />
          </div>
          <div className="flex flex-row items-center justify-between">
            <Text>Column 1</Text>
            <SingleColumnSelector
              disabled={!joinTable}
              items={joinTableColumns}
              selected={joinColumn1}
              onColumnSelect={selectJoinColumn1}
            />
          </div>
          <div className="flex flex-row items-center justify-between">
            <Text>Column 2</Text>
            <SingleColumnSelector
              disabled={!joinTable}
              items={joinTableColumns}
              selected={joinColumn2}
              onColumnSelect={selectJoinColumn2}
            />
          </div>
        </>
      );
    }

    return null;
  }

  function renderDialogContent() {
    if (isLoadingTables) {
      return <Loading />;
    } else if (tablesError || !tables) {
      return <ErrorDisplay description={tablesError} />;
    } else if (isMutating) {
      return (
        <div className="flex flex-col items-center justify-center m-3">
          <Loading />
          <Text className="mt-2">Creating relation...</Text>
        </div>
      );
    } else {
      return (
        <>
          <DialogBody>
            <div className="flex flex-col gap-2">
              <div className="flex flex-row items-center justify-between">
                <Text>Relation type</Text>
                <Select<RelationType>
                  items={_.values(RelationTypeEnum)}
                  itemRenderer={renderRelationTypeItem}
                  onItemSelect={selectRelationType}
                >
                  <Button rightIcon="double-caret-vertical">
                    {relationType
                      ? relationType.replace(/_/g, "-")
                      : "Select relation type"}
                  </Button>
                </Select>
              </div>
              <Divider />
              <div className="flex flex-row items-center justify-between">
                <Text>Table 1</Text>
                <SingleTableSelector
                  items={tables}
                  selected={table1}
                  onTableSelect={selectTable1}
                />
              </div>
              <div className="flex flex-row items-center justify-between">
                <Text>Column</Text>
                <SingleColumnSelector
                  disabled={!table1}
                  items={
                    table1
                      ? _.map(_.values(table1.external_columns), (column) => {
                          return { ...column, table: table1.id };
                        })
                      : []
                  }
                  selected={column1}
                  onColumnSelect={selectColumn1}
                />
              </div>
              <Divider />
              <div className="flex flex-row items-center justify-between">
                <Text>Table 2</Text>
                <SingleTableSelector
                  items={tables}
                  selected={table2}
                  onTableSelect={selectTable2}
                />
              </div>
              <div className="flex flex-row items-center justify-between">
                <Text>Column</Text>
                <SingleColumnSelector
                  disabled={!table2}
                  items={
                    table2
                      ? _.map(_.values(table2.external_columns), (column) => {
                          return { ...column, table: table2.id };
                        })
                      : []
                  }
                  selected={column2}
                  onColumnSelect={selectColumn2}
                />
              </div>
              {renderManyToManyFields()}
            </div>
          </DialogBody>
          <DialogFooter
            actions={
              <Button
                intent="primary"
                text="Create relation"
                disabled={!canCreateRelation()}
                onClick={handleCreateRelation}
              />
            }
          />
        </>
      );
    }
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={() => {
        resetBaseFields();
        resetJoinFields();
        setRelationType(null);
        setIsOpen(false);
      }}
      isCloseButtonShown
      title="Create a new relation"
    >
      {renderDialogContent()}
    </Dialog>
  );
}
