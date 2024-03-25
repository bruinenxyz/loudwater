import { ItemRenderer, Select } from "@blueprintjs/select";
import { MenuItem, Button } from "@blueprintjs/core";
import { ValueTypes, ValueTypesSchema } from "@/definitions/query";
import _ from "lodash";

export default function ValueSelector({
  className,
  selected,
  setSelected,
  setPropertyB,
}: {
  className?: string;
  selected: ValueTypes;
  setSelected: any;
  setPropertyB: any;
}) {
  const renderValueType: ItemRenderer<any> = (
    valueType: ValueTypes,
    { handleClick, modifiers },
  ) => {
    return (
      <MenuItem
        roleStructure="listoption"
        selected={selected === valueType}
        shouldDismissPopover={true}
        text={valueType.charAt(0).toUpperCase() + valueType.slice(1)}
        onClick={handleClick}
      />
    );
  };

  const selectValueType = (valueType: ValueTypes) => {
    setSelected(valueType);
    setPropertyB(null);
  };

  return (
    <Select
      className={className}
      items={_.values(ValueTypesSchema.enum)}
      itemRenderer={renderValueType}
      filterable={false}
      onItemSelect={selectValueType}
      noResults={
        <MenuItem
          disabled={true}
          text="No results."
          roleStructure="listoption"
        />
      }
    >
      <Button
        text={selected.charAt(0).toUpperCase() + selected.slice(1)}
        rightIcon="double-caret-vertical"
      />
    </Select>
  );
}
