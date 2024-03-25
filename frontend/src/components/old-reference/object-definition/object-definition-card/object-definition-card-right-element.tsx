"use client";
import { ObjectDefinition } from "@/definitions";
import { ActionTypeEnum } from "@/definitions/action";
import { Icon, Menu, MenuItem, Popover, Tag, Colors } from "@blueprintjs/core";
import { useObjectActionPermission } from "@/hooks/permissions.hook";
import { useObjectDefinitionActionsAllowed } from "@/data/use-object-definition";
import Loading from "@/app/loading";

export default function ObjectDefinitionCardRightElement({
  objectDefinition,
  viewBlueprint,
  openInWorkbook,
  addObject,
}: {
  objectDefinition: ObjectDefinition;
  viewBlueprint: ({
    objectDefinition,
  }: {
    objectDefinition: ObjectDefinition;
  }) => void;
  openInWorkbook: ({
    objectDefinition,
  }: {
    objectDefinition: ObjectDefinition;
  }) => void;
  addObject: ({
    objectDefinition,
  }: {
    objectDefinition: ObjectDefinition;
  }) => void;
}) {
  const hasObjectCreatePermission = useObjectActionPermission(
    objectDefinition.id,
    ActionTypeEnum.Create,
  );
  const { data: allowsActions, isLoading: isLoadingAllowsActions } =
    useObjectDefinitionActionsAllowed(objectDefinition.id);

  if (isLoadingAllowsActions) {
    return <Loading />;
  }

  return (
    <Popover
      content={
        <Menu>
          <MenuItem
            icon="search"
            text="View blueprint"
            onClick={() => viewBlueprint({ objectDefinition })}
          />
          <MenuItem
            icon="briefcase"
            text="Open in workbook"
            onClick={() => openInWorkbook({ objectDefinition })}
          />
          {allowsActions && (
            <MenuItem
              icon="insert"
              disabled={!hasObjectCreatePermission}
              text="Add object"
              onClick={() => addObject({ objectDefinition })}
            />
          )}
        </Menu>
      }
      interactionKind="click"
      placement="bottom"
    >
      <Icon icon="cog" color="gray" className="cursor-pointer" />
    </Popover>
  );
}
