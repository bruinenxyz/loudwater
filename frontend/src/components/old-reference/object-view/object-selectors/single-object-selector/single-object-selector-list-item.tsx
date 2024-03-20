"use client";
import SquareIcon, { SquareIconSize } from "@/components/icon/square-icon";
import { ObjectDefinition } from "@/definitions/object-definition";
import { IconName, MenuItem, Text } from "@blueprintjs/core";

export default function SingleObjectSelectorListItem({
  object,
  objectDefinition,
  selectedObject,
  handleClick,
}: {
  object: any;
  objectDefinition: ObjectDefinition;
  selectedObject: any | null;
  handleClick: any;
}) {
  function renderObject() {
    return (
      <div className="flex flex-row items-center justify-between w-full">
        <div className="flex flex-row items-center ">
          <div className="mr-2">
            <SquareIcon
              icon={objectDefinition.icon as IconName}
              color={objectDefinition.color}
              size={SquareIconSize.SMALL}
            />
          </div>
          <Text className="cursor-pointer bp5-text-muted">
            {object[objectDefinition.primary_key_property]}
          </Text>
        </div>
        <Text
          className="ml-3 font-semibold cursor-pointer max-w-4/5"
          ellipsize={true}
        >
          {objectDefinition.title_property
            ? object[objectDefinition.title_property]
            : object[objectDefinition.primary_key_property]}
        </Text>
      </div>
    );
  }

  return (
    <MenuItem
      key={object[objectDefinition.primary_key_property || "id"]}
      roleStructure="listoption"
      selected={
        !!(
          selectedObject &&
          selectedObject[objectDefinition.primary_key_property] ===
            object[objectDefinition.primary_key_property]
        )
      }
      shouldDismissPopover={true}
      text={renderObject()}
      onClick={handleClick}
    />
  );
}
