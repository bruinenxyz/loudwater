"use client";
import { InferredSchemaProperty } from "@/definitions/pipeline";
import { ItemRenderer, MultiSelect } from "@blueprintjs/select";
import MultiPropertySelectorListItem from "./multi-property-selector-list-item";
import { MenuItem } from "@blueprintjs/core";
import MultiPropertySelectorTag from "./multi-property-selector-tag";

export default function MultiPropertySelector({
  className,
  selected,
  setSelected,
  items,
}: {
  className?: string;
  selected: InferredSchemaProperty[];
  setSelected: (properties: InferredSchemaProperty[]) => void;
  items: InferredSchemaProperty[];
}) {
  const filterProperties = (query: string, property: any) =>
    property.name.toLowerCase().includes(query.toLowerCase());

  const renderProperty: ItemRenderer<InferredSchemaProperty> = (
    property: InferredSchemaProperty,
    { handleClick, modifiers },
  ) => {
    return (
      <MultiPropertySelectorListItem
        key={property.api_path}
        property={property}
        handleClick={handleClick}
        selected={selected}
      />
    );
  };

  const selectProperty = (property: InferredSchemaProperty) => {
    if (
      selected.find(
        (selectedProperty: any) =>
          selectedProperty.api_path === property.api_path,
      )
    ) {
      setSelected([
        ...selected.filter(
          (selectedProperty: any) =>
            selectedProperty.api_path !== property.api_path,
        ),
      ]);
    } else {
      setSelected([...selected, property]);
    }
  };

  const removeProperty = (property: InferredSchemaProperty) => {
    setSelected([
      ...selected.filter(
        (selectedProp: any) => selectedProp.api_path !== property.api_path,
      ),
    ]);
  };

  const renderTag = (property: InferredSchemaProperty) => {
    return <MultiPropertySelectorTag property={property} />;
  };

  const noResults = (
    <MenuItem disabled={true} text="No results." roleStructure="listoption" />
  );

  return (
    <MultiSelect
      className={className}
      items={items}
      selectedItems={selected}
      itemPredicate={filterProperties}
      itemRenderer={renderProperty}
      onItemSelect={selectProperty}
      onRemove={removeProperty}
      onClear={() => setSelected([])}
      tagRenderer={renderTag}
      noResults={noResults}
    />
  );
}
