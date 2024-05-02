"use client";
import { MenuItem, Text } from "@blueprintjs/core";
export default function SinglePropertySelectorListItem({
  property,
  selectedProperty,
  handleClick,
}: {
  property: string;
  selectedProperty: string | null;
  handleClick: any;
}) {
  function renderProperty() {
    return (
      <div className="flex flex-row items-center w-fit">
        <div className="flex flex-row items-center py-1 ml-2 w-fit">
          <Text className="font-bold">{property}</Text>
        </div>
      </div>
    );
  }

  return (
    <MenuItem
      key={property}
      roleStructure="listoption"
      selected={!!(selectedProperty && selectedProperty === property)}
      shouldDismissPopover={true}
      text={renderProperty()}
      onClick={handleClick}
    />
  );
}
