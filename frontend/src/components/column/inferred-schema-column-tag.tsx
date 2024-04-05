"use client";
import { InferredSchemaColumn } from "@/definitions";
import { IconName, Tag, Text } from "@blueprintjs/core";
import SquareIcon, { SquareIconSize } from "@/components/icon/square-icon";
import { useTable } from "@/data/use-tables";

export default function InferredSchemaColumnTag({
  column,
  action,
}: {
  column: InferredSchemaColumn;
  action?: () => void;
}) {
  const {
    data: table,
    isLoading: isLoadingTable,
    error: tableError,
  } = useTable(column.table);

  if (tableError && column.table !== "aggregate") {
    return null;
  }

  return (
    <Tag
      minimal={true}
      intent={"none"}
      className={`h-fit w-fit ${
        !!action ? "cursor-pointer" : "cursor-default "
      } ${isLoadingTable ? "bp5-skeleton" : ""}`}
      onClick={action}
    >
      <div className="flex flex-row items-center gap-1 py-1">
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
        <Text className="font-normal text-md">{column.name}</Text>
        {column.relation && (
          <Text className="ml-1 font-normal">{`(${column.relation.as})`}</Text>
        )}
      </div>
    </Tag>
  );
}
