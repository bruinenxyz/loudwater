import { ObjectDefinition } from "@/definitions";
import { Button, IconName, MenuItem, Text } from "@blueprintjs/core";
import { ItemRenderer, Select } from "@blueprintjs/select";
import SquareIcon, { SquareIconSize } from "../../icon/square-icon";

export default function ObjectDefinitionSelector({
  items,
  selected,
  setSelected,
  className,
}: {
  items: ObjectDefinition[];
  selected: ObjectDefinition | null;
  setSelected: (objectDefinition: ObjectDefinition | null) => void;
  className?: string;
}) {
  const filterObjectDefinitions = (
    query: string,
    objectDefinition: ObjectDefinition,
  ) => objectDefinition.name.toLowerCase().includes(query.toLowerCase());

  const renderObjectDefinition: ItemRenderer<ObjectDefinition> = (
    objectDefinition: ObjectDefinition,
    { handleClick, modifiers },
  ) => {
    return (
      <MenuItem
        key={objectDefinition.id}
        roleStructure="listoption"
        icon={
          <SquareIcon
            icon={(objectDefinition.icon as IconName) || ("cube" as IconName)}
            color={objectDefinition.color || "gray"}
            size={SquareIconSize.SMALL}
          />
        }
        selected={!!selected && selected.id === objectDefinition.id}
        shouldDismissPopover={true}
        text={objectDefinition!.name}
        onClick={handleClick}
      />
    );
  };

  function selectObjectDefinition(selection: ObjectDefinition) {
    if (selected && selection.id === selected.id) {
      setSelected(null);
    } else {
      setSelected(selection);
    }
  }

  const noResults = (
    <MenuItem disabled={true} text="No results." roleStructure="listoption" />
  );

  return (
    <Select
      items={items}
      itemPredicate={filterObjectDefinitions}
      itemRenderer={renderObjectDefinition}
      onItemSelect={selectObjectDefinition}
      noResults={noResults}
    >
      <Button
        rightIcon="double-caret-vertical"
        className={className}
        text={
          selected ? (
            <div className="flex flex-row items-center">
              <SquareIcon
                icon={(selected.icon as IconName) || ("cube" as IconName)}
                color={selected.color || "gray"}
                size={SquareIconSize.SMALL}
              />
              <Text className="ml-1">{selected.name}</Text>
            </div>
          ) : (
            "Select blueprint"
          )
        }
      />
    </Select>
  );
}
