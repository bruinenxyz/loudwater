"use client";
import { Icon, IconName, Tag, Text } from "@blueprintjs/core";
import { RelationItem } from "./relate-step";
import SquareIcon, { SquareIconSize } from "@/components/icon/square-icon";

export default function RelationItemContent({
  item,
}: {
  item: RelationItem | null;
}) {
  function getRelationIcon(item: RelationItem) {
    switch (item.relation.type) {
      case "one_to_one":
        return "one-to-one";
      case "many_to_many":
        return "many-to-many";
      case "one_to_many":
        if (item.relation.table_1 === item.originTable.id) {
          return "one-to-many";
        } else {
          return "many-to-one";
        }
    }
  }

  if (item) {
    const originKey =
      item.relation.table_1 === item.originTable.id
        ? item.relation.column_1
        : item.relation.column_2;
    const relatedKey =
      item.relation.table_1 === item.relatedTable.id
        ? item.relation.column_1
        : item.relation.column_2;
    return (
      <div className="flex flex-row flex-wrap items-center gap-2">
        <Tag
          className="flex flex-row items-center py-1"
          minimal
          icon={
            <SquareIcon
              icon={item.relatedTable.icon as IconName}
              color={item.relatedTable.color}
              size={SquareIconSize.SMALL}
            />
          }
        >
          <Text className="font-bold text-md">{item.relatedTable.name}</Text>
        </Tag>
        <Text className="font-normal flex-nowrap">via</Text>
        <div className="flex flex-row items-center gap-1">
          <Tag
            className="py-1 "
            minimal
            icon={
              <SquareIcon
                icon={item.originTable.icon as IconName}
                color={item.originTable.color}
                size={SquareIconSize.SMALL}
              />
            }
          >
            <div className="flex flex-row items-center gap-1">
              <Text className="font-bold text-md">{item.originTable.name}</Text>
              <Text className="font-normal text-md">{originKey}</Text>
            </div>
          </Tag>
          <Icon icon={getRelationIcon(item) as IconName} color="gray" />
          <Tag
            className="py-1 "
            minimal
            icon={
              <SquareIcon
                icon={item.relatedTable.icon as IconName}
                color={item.relatedTable.color}
                size={SquareIconSize.SMALL}
              />
            }
          >
            <div className="flex flex-row items-center gap-1">
              <Text className="font-bold text-md">
                {item.relatedTable.name}
              </Text>
              <Text className="font-normal text-md">{relatedKey}</Text>
            </div>
          </Tag>
        </div>
      </div>
    );
  }
  return "Select a table";
}
