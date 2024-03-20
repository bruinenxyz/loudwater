import { Button, Icon, IconName, MenuItem, Text } from "@blueprintjs/core";
import _ from "lodash";
import IconList from "./icons";
import { ItemPredicate, ItemRenderer, Select } from "@blueprintjs/select";

interface IconPickerProps {
  onValueChange: (value: IconName) => void;
  value?: IconName;
}

const IconPicker = (props: IconPickerProps) => {
  const itemRender: ItemRenderer<IconName> = (
    item: IconName,
    { handleClick, modifiers },
  ) => {
    return (
      <MenuItem
        active={modifiers.active}
        selected={item === props.value}
        text={
          <div className="flex flex-col w-full">
            <Icon icon={item} />
            <Text ellipsize className="max-w-full mt-1">
              {item}
            </Text>
          </div>
        }
        onClick={handleClick}
      />
    );
  };

  const filterIcon: ItemPredicate<string> = (
    query,
    icon,
    _index,
    exactMatch,
  ) => {
    const normalizedQuery = query.toLowerCase();

    if (exactMatch) {
      return icon === normalizedQuery;
    } else {
      return `${icon}`.indexOf(normalizedQuery) >= 0;
    }
  };
  return (
    <div>
      <Select<IconName>
        items={IconList}
        itemRenderer={itemRender}
        onItemSelect={props.onValueChange}
        itemPredicate={filterIcon}
        menuProps={{
          className: "grid grid-cols-3 gap-2",
        }}
        popoverProps={{
          minimal: true,
        }}
      >
        <Button icon={props.value} rightIcon="double-caret-vertical">
          {props.value}
        </Button>
      </Select>
    </div>
  );
};
export default IconPicker;
