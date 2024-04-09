"use client";
import { Relation } from "@/definitions";
import {
  Button,
  Card,
  Icon,
  IconName,
  Menu,
  MenuItem,
  Popover,
  Tag,
  Text,
} from "@blueprintjs/core";
import { ErrorDisplay } from "../error-display";
import SquareIcon, { SquareIconSize } from "../icon/square-icon";
import { useTable } from "@/data/use-tables";

export default function RelationCard({
  relation,
  setDeleteRelation,
}: {
  relation: Relation;
  setDeleteRelation: (relation: Relation | null) => void;
}) {
  const {
    data: table1,
    isLoading: isLoadingTable1,
    error: table1Error,
  } = useTable(relation.table_1);
  const {
    data: table2,
    isLoading: isLoadingTable2,
    error: table2Error,
  } = useTable(relation.table_2);
  const {
    data: joinTable,
    isLoading: isLoadingJoinTable,
    error: joinTableError,
  } = useTable(relation?.join_table);

  if (
    table1Error ||
    table2Error ||
    (joinTableError && relation.type === "many_to_many")
  ) {
    return (
      <Card>
        <ErrorDisplay
          description={table1Error || table2Error || joinTableError}
        />
      </Card>
    );
  }

  if (!table1 || !table2 || (!joinTable && relation.type === "many_to_many")) {
    return null;
  }

  function getRelationIcon(): IconName {
    switch (relation.type) {
      case "many_to_many":
        return "many-to-many" as IconName;
      case "one_to_many":
        return "one-to-many" as IconName;
      case "one_to_one":
      default:
        return "one-to-one" as IconName;
    }
  }

  return (
    <Card
      className={`${isLoadingTable1 || isLoadingTable2 || isLoadingJoinTable ? "bp5-skeleton" : ""} flex flex-row justify-between items-center`}
    >
      <div className="flex flex-row items-center gap-1">
        <Tag
          className="py-1 "
          minimal
          icon={
            <SquareIcon
              icon={table1!.icon as IconName}
              color={table1!.color}
              size={SquareIconSize.SMALL}
            />
          }
        >
          <div className="flex flex-row items-center gap-1">
            <Text className="font-bold text-md">{table1!.name}</Text>
            <Text className="font-normal text-md">{relation.column_1}</Text>
          </div>
        </Tag>
        <Icon icon={getRelationIcon()} color="gray" />
        <Tag
          className="py-1 "
          minimal
          icon={
            <SquareIcon
              icon={table2!.icon as IconName}
              color={table2!.color}
              size={SquareIconSize.SMALL}
            />
          }
        >
          <div className="flex flex-row items-center gap-1">
            <Text className="font-bold text-md">{table2!.name}</Text>
            <Text className="font-normal text-md">{relation.column_2}</Text>
          </div>
        </Tag>
        {relation.type === "many_to_many" && joinTable && (
          <>
            <Text className="mx-1">via</Text>
            <Tag
              className="py-1 "
              minimal
              icon={
                <SquareIcon
                  icon={joinTable.icon as IconName}
                  color={joinTable.color}
                  size={SquareIconSize.SMALL}
                />
              }
            >
              <div className="flex flex-row items-center gap-1">
                <Text className="font-bold text-md">{joinTable.name}</Text>
                <Text className="font-normal text-md">
                  {relation.join_column_1}
                </Text>
                <Icon icon="many-to-many" color="gray" />
                <Text className="font-normal text-md">
                  {relation.join_column_2}
                </Text>
              </div>
            </Tag>
          </>
        )}
      </div>
      <div className="flex flex-row items-center gap-2">
        {relation.generated ? (
          <Tag>Database</Tag>
        ) : (
          <Button
            icon="trash"
            minimal
            onClick={() => setDeleteRelation(relation)}
          >
            Delete
          </Button>
        )}
      </div>
    </Card>
  );
}
