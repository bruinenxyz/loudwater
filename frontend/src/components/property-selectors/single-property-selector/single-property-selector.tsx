"use client";
import { Button, MenuItem } from "@blueprintjs/core";
import { ItemRenderer, Select } from "@blueprintjs/select";
import SinglePropertySelectorListItem from "./single-property-selector-list-item";
export default function SinglePropertySelector({
  className,
  selectedProperty,
  setSelectedProperty,
  items,
  popoverTargetProps,
  disabled,
}: {
  className?: string;
  selectedProperty: string | null;
  setSelectedProperty: (property: string | null) => void;
  items: string[];
  popoverTargetProps?: any;
  disabled?: boolean;
}) {
  const filterProperties = (query: string, property: string) =>
    property.toLowerCase().includes(query.toLowerCase());

  const renderProperty: ItemRenderer<string> = (
    property: string,
    { handleClick, modifiers },
  ) => {
    return (
      <SinglePropertySelectorListItem
        property={property}
        selectedProperty={selectedProperty}
        handleClick={handleClick}
      />
    );
  };

  function selectProperty(selection: string) {
    if (selectedProperty && selection === selectedProperty) {
      setSelectedProperty(null);
    } else {
      setSelectedProperty(selection);
    }
  }

  const noResults = (
    <MenuItem disabled={true} text="No results." roleStructure="listoption" />
  );

  return (
    <Select
      className={className}
      popoverTargetProps={popoverTargetProps}
      disabled={disabled}
      items={items}
      itemPredicate={filterProperties}
      itemRenderer={renderProperty}
      onItemSelect={selectProperty}
      noResults={noResults}
    >
      <Button
        rightIcon="double-caret-vertical"
        disabled={disabled}
        text={selectedProperty ? selectedProperty : "Select property"}
      />
    </Select>
  );
}
