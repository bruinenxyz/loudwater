"use client";
import { ObjectRelation } from "@/definitions";
import { IconName, MenuItem } from "@blueprintjs/core";
import Loading from "@/app/loading";
import { ErrorDisplay } from "@/components/error-display";
import SquareIcon, { SquareIconSize } from "@/components/icon/square-icon";
import { useObjectDefinition } from "@/data/use-object-definition";

export default function RelationSelectorListItem({
  relation,
  handleClick,
  selected,
}: {
  relation: ObjectRelation;
  handleClick: any;
  selected: ObjectRelation | null;
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
    <MenuItem
      key={relation.api_name}
      roleStructure="listoption"
      icon={
        <SquareIcon
          icon={(objectDefinition.icon as IconName) || ("cube" as IconName)}
          color={objectDefinition.color || "gray"}
          size={SquareIconSize.SMALL}
        />
      }
      selected={!!selected && selected.api_name === relation.api_name}
      shouldDismissPopover={true}
      text={relation.name ? relation.name : objectDefinition.name}
      onClick={handleClick}
    />
  );
}
