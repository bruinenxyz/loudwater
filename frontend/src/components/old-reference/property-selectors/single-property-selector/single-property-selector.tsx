"use client";
import { InferredSchemaProperty } from "@/definitions/pipeline";
import { Button, MenuItem } from "@blueprintjs/core";
import { ItemRenderer, Select } from "@blueprintjs/select";
import SinglePropertySelectorButtonProperty from "./single-property-selector-button-property";
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
  selectedProperty: InferredSchemaProperty | null;
  setSelectedProperty: (property: InferredSchemaProperty | null) => void;
  items: InferredSchemaProperty[];
  popoverTargetProps?: any;
  disabled?: boolean;
}) {
  const filterProperties = (query: string, property: InferredSchemaProperty) =>
    property.name.toLowerCase().includes(query.toLowerCase());

  const renderProperty: ItemRenderer<InferredSchemaProperty> = (
    property: InferredSchemaProperty,
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

  function selectProperty(selection: InferredSchemaProperty) {
    if (selectedProperty && selection.api_path === selectedProperty.api_path) {
      setSelectedProperty(null);
    } else {
      setSelectedProperty(selection);
    }
  }

  const noResults = (
    <MenuItem disabled={true} text="No results." roleStructure="listoption" />
  );

  return (
    <Select<InferredSchemaProperty>
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
        text={
          selectedProperty ? (
            <SinglePropertySelectorButtonProperty property={selectedProperty} />
          ) : (
            "Select property"
          )
        }
      />
    </Select>
  );
}
