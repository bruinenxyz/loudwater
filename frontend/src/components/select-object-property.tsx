import { ObjectProperties, ObjectProperty } from "@/definitions";
import { Button, MenuItem } from "@blueprintjs/core";
import { ItemRenderer, Select, SelectProps } from "@blueprintjs/select";
import _ from "lodash";

interface SelectObjectPropetyProps {
  properties?: ObjectProperties;
  onValueChange: (property: ObjectProperty) => void;
  value?: ObjectProperty;
  selectProps: Partial<SelectProps<ObjectProperty>>;
}

const SelectObjectPropety = (props: SelectObjectPropetyProps) => {
  const propertyRenderer: ItemRenderer<ObjectProperty> = (
    property,
    { handleClick, modifiers },
  ) => {
    return (
      <MenuItem
        role="listoption"
        active={modifiers.active}
        selected={true}
        key={property.id}
        onClick={handleClick}
        text={property.name}
      />
    );
  };

  return (
    <Select<ObjectProperty>
      {...props.selectProps}
      items={_.values(props.properties)}
      onItemSelect={props.onValueChange}
      itemRenderer={propertyRenderer}
    >
      <Button disabled={props.selectProps?.disabled} fill>
        {props.value?.name || "Select property"}
      </Button>
    </Select>
  );
};
export default SelectObjectPropety;
