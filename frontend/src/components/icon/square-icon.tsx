import { Icon, IconProps, IconSize } from "@blueprintjs/core";
import _ from "lodash";

export enum SquareIconSize {
  SMALL = 20,
  MEDIUM = 25,
  STANDARD = 30,
  LARGE = 40,
}

interface SquareIconProps extends Omit<Partial<IconProps>, "color"> {
  size?: SquareIconSize;
  color?: string | null | undefined;
}

const SquareIcon = (props: SquareIconProps) => {
  let sizes = {
    height: 20,
    width: 20,
    iconSize: IconSize.STANDARD,
  };
  switch (props.size) {
    case SquareIconSize.SMALL:
      sizes = {
        height: 20,
        width: 20,
        iconSize: IconSize.STANDARD,
      };
      break;
    case SquareIconSize.MEDIUM:
      sizes = {
        height: 25,
        width: 25,
        iconSize: IconSize.STANDARD,
      };
      break;
    case SquareIconSize.STANDARD:
      sizes = {
        height: 30,
        width: 30,
        iconSize: IconSize.STANDARD,
      };
      break;
    case SquareIconSize.LARGE:
      sizes = {
        height: 40,
        width: 40,
        iconSize: IconSize.LARGE,
      };
      break;
  }
  const padding = (sizes.height - sizes.iconSize) / 2;
  return (
    <div
      className={`${props.className} rounded-sm`}
      style={{
        backgroundColor: props.color || "gray",
        height: sizes.height,
        width: sizes.width,
      }}
    >
      <Icon
        {...props}
        icon={props.icon || "cube"}
        color="white"
        tagName="div"
        style={{ margin: padding, verticalAlign: "top" }}
        size={sizes.iconSize}
      />
    </div>
  );
};

export default SquareIcon;
