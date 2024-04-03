"use client";
import { InferredSchemaColumn } from "@/definitions/pipeline";
import { Tag, Popover, Text, IconName } from "@blueprintjs/core";
import SquareIcon, { SquareIconSize } from "@/components/icon/square-icon";
import { HydratedTable } from "@/definitions";

export default function MultiColumnSelectorTag({
  column,
  table,
}: {
  column: InferredSchemaColumn;
  table?: HydratedTable;
}) {
  return (
    <Tag key={`${column.table}.${column.name}`} className="cursor-default">
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
        <div className="flex flex-row items-center py-1 ml-1 w-fit">
          {table ? <Text className="mr-1">{table.name}</Text> : null}
          <Text className="font-bold">{column.name}</Text>
          {column.relation && (
            <Text className="ml-1">{`(${column.relation.as})`}</Text>
          )}
        </div>
      </div>
    </Tag>
  );
}
