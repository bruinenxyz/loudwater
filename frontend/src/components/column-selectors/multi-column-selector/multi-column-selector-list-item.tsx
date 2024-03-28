"use client";
import { InferredSchemaColumn } from "@/definitions/pipeline";
import { IconName, MenuItem, Text } from "@blueprintjs/core";
import SquareIcon, { SquareIconSize } from "@/components/icon/square-icon";
import { ErrorDisplay } from "@/components/error-display";
import Loading from "@/app/loading";
import { HydratedTable } from "@/definitions";

export default function MultiColumnSelectorListItem({
  column,
  table,
  handleClick,
  selected,
}: {
  column: InferredSchemaColumn;
  table?: HydratedTable;
  handleClick: any;
  selected: InferredSchemaColumn[];
}) {
  function renderContent() {
    return (
      <div className="flex flex-row items-center w-fit">
        {table ? (
          <SquareIcon
            icon={table.icon as IconName}
            color={table.color}
            size={SquareIconSize.SMALL}
          />
        ) : (
          <SquareIcon
            icon="function"
            color="gray"
            size={SquareIconSize.SMALL}
          />
        )}
        <div className="flex flex-row items-center py-1 ml-2 w-fit">
          {table ? <Text className="mr-1">{table.name}</Text> : null}
          <Text className="font-bold">{column.name}</Text>
        </div>
      </div>
    );
  }

  return (
    <MenuItem
      key={`${column.table}.${column.name}`}
      roleStructure="listoption"
      selected={
        !!selected.find(
          (selectedCol: InferredSchemaColumn) =>
            selectedCol.name === column.name &&
            selectedCol.table === column.table,
        )
      }
      shouldDismissPopover={false}
      text={renderContent()}
      onClick={handleClick}
    />
  );
}
