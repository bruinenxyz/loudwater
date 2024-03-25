"use client";
import { ObjectRelation } from "@/definitions";
import { IconName, Text } from "@blueprintjs/core";
import Loading from "@/app/loading";
import { ErrorDisplay } from "@/components/error-display";
import SquareIcon, { SquareIconSize } from "@/components/icon/square-icon";
import { useObjectDefinition } from "@/data/use-object-definition";

export default function RelationSelectorButtonProperty({
  relation,
}: {
  relation: ObjectRelation;
}) {
  const {
    data: objectDefinition,
    isLoading: isLoadingObjectDefinition,
    error: objectDefinitionError,
  } = useObjectDefinition(relation.object_definition_id);

  if (isLoadingObjectDefinition) {
    return <Loading />;
  }

  if (objectDefinitionError || !objectDefinition) {
    return (
      <ErrorDisplay
        title="Unexpected error"
        description={objectDefinitionError.message}
      />
    );
  }

  return (
    <div className="flex flex-row items-center">
      <SquareIcon
        icon={(objectDefinition.icon as IconName) || ("cube" as IconName)}
        color={objectDefinition.color || "gray"}
        size={SquareIconSize.SMALL}
      />
      <Text className="ml-1">
        {relation.name ? relation.name : objectDefinition.name}
      </Text>
    </div>
  );
}
