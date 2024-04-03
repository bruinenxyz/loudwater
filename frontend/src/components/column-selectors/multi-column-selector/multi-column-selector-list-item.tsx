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
      <div className="flex flex-row items-center gap-1 my-1">
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
        {table ? <Text className="font-bold text-md">{table.name}</Text> : null}
        <Text className="text-md">{column.name}</Text>
        {column.relation && (
          <Text className="ml-1">{`(${column.relation.as})`}</Text>
        )}
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
            selectedCol.table === column.table &&
            selectedCol.relation?.as === column.relation?.as,
        )
      }
      shouldDismissPopover={false}
      text={renderContent()}
      onClick={handleClick}
    />
  );
}
