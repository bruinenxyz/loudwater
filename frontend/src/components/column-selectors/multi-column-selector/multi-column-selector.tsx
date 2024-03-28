"use client";
import { HydratedTable } from "@/definitions";
import { InferredSchemaColumn } from "@/definitions/pipeline";
import { MenuItem } from "@blueprintjs/core";
import { ItemRenderer, MultiSelect } from "@blueprintjs/select";
import Loading from "@/app/loading";
import { ErrorDisplay } from "@/components/error-display";
import MultiColumnSelectorTag from "./multi-column-selector-tag";
import MultiColumnSelectorListItem from "./multi-column-selector-list-item";
import { useSelectedDatabase } from "@/stores";
import { useTables } from "@/data/use-tables";
import * as _ from "lodash";

export default function MultiColumnSelector({
  className,
  selected,
  setSelected,
  items,
}: {
  className?: string;
  selected: InferredSchemaColumn[];
  setSelected: (columns: InferredSchemaColumn[]) => void;
  items: InferredSchemaColumn[];
}) {
  const [selectedDatabase, setSelectedDatabase] = useSelectedDatabase();
  const {
    data: tables,
    isLoading: isLoadingTables,
    error: tablesError,
  } = useTables(selectedDatabase.id);

  if (isLoadingTables) {
    return <Loading />;
  }

  if (tablesError || !tables) {
    return <ErrorDisplay description={tablesError} />;
  }

  const filterColumns = (query: string, column: InferredSchemaColumn) =>
    column.name.toLowerCase().includes(query.toLowerCase());

  const renderColumn: ItemRenderer<InferredSchemaColumn> = (
    column: InferredSchemaColumn,
    { handleClick, modifiers },
  ) => {
    const table = _.find(
      tables,
      (table: HydratedTable) => table.id === column.table,
    );
    return (
      <MultiColumnSelectorListItem
        key={`${column.table}.${column.name}`}
        column={column}
        table={table}
        handleClick={handleClick}
        selected={selected}
      />
    );
  };

  const selectColumn = (column: InferredSchemaColumn) => {
    if (
      selected.find(
        (selectedCol: { name: string; table: string }) =>
          selectedCol.name === column.name &&
          selectedCol.table === column.table,
      )
    ) {
      setSelected([
        ...selected.filter(
          (selectedCol: { name: string; table: string }) =>
            selectedCol.name !== column.name &&
            selectedCol.table !== column.table,
        ),
      ]);
    } else {
      setSelected([...selected, column]);
    }
  };

  const removeColumn = (column: InferredSchemaColumn) => {
    setSelected([
      ...selected.filter(
        (selectedCol: { name: string; table: string }) =>
          selectedCol.name !== column.name &&
          selectedCol.table !== column.table,
      ),
    ]);
  };

  const renderTag = (column: InferredSchemaColumn) => {
    const table = _.find(
      tables,
      (table: HydratedTable) => table.id === column.table,
    );
    return <MultiColumnSelectorTag column={column} table={table} />;
  };

  const noResults = (
    <MenuItem disabled={true} text="No results." roleStructure="listoption" />
  );

  return (
    <MultiSelect
      className={className}
      items={items}
      selectedItems={selected}
      itemPredicate={filterColumns}
      itemRenderer={renderColumn}
      onItemSelect={selectColumn}
      onRemove={removeColumn}
      onClear={() => setSelected([])}
      tagRenderer={renderTag}
      noResults={noResults}
    />
  );
}
