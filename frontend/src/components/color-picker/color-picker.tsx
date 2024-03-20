import { ItemRenderer, Select } from "@blueprintjs/select";
import { Colors } from "./colors";
import _ from "lodash";
import { Button, MenuItem } from "@blueprintjs/core";

interface ColorPickerProps {
  className?: string;
  value?: string;
  onValueChange: (value: string) => void;
}

const Swatch = (props: { color: string }) => {
  return (
    <div
      style={{
        backgroundColor: props.color,
        border: "1px solid #ccc",
        borderRadius: "2px",
        width: "20px",
        height: "20px",
      }}
    ></div>
  );
};

const ColorPicker = (props: ColorPickerProps) => {
  const colorRenderer: ItemRenderer<[string, any]> = (
    item,
    { handleClick, modifiers },
  ) => {
    const handleSelect = (color: string) => {
      props.onValueChange(color);
      // @ts-ignore Purposeful noop to work around submenus
      handleClick();
    };
    return (
      <MenuItem
        active={modifiers.active}
        key={item[0]}
        text={item[0]}
        labelElement={<Swatch color={_.values(item[1])[0]} />}
      >
        {_.map(item[1], (color) => {
          return (
            <MenuItem
              key={color}
              text={color}
              onClick={() => handleSelect(color)}
              labelElement={<Swatch color={color} />}
            ></MenuItem>
          );
        })}
      </MenuItem>
    );
  };

  return (
    <div className={props.className}>
      {/**Purposeful noop to work around submenus */}
      <Select<[string, any]>
        filterable={false}
        items={_.toPairs(Colors)}
        itemRenderer={colorRenderer}
        onItemSelect={() => {}}
        resetOnQuery={false}
      >
        <Button
          fill
          icon={
            props.value ? (
              <div
                style={{
                  backgroundColor: props.value,
                  width: "20px",
                  height: "20px",
                }}
              ></div>
            ) : null
          }
          rightIcon="double-caret-vertical"
        >
          {props.value}
        </Button>
      </Select>
    </div>
  );
};

export default ColorPicker;
