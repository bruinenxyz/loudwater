import { ObjectProperty } from "@/definitions";
import { IconName, Props, Text } from "@blueprintjs/core";
import SquareIcon, { SquareIconSize } from "../../icon/square-icon";

interface SpanObjectPropertyProps extends Props {
  property: ObjectProperty;
  icon?: string;
  color: string;
}

const SpanObjectProperty = (props: SpanObjectPropertyProps) => {
  return (
    <div className={`flex row ${props.className}`}>
      {props.icon && (
        <SquareIcon
          icon={props.icon as IconName}
          color={props.color}
          size={SquareIconSize.SMALL}
        />
      )}
      <Text className="ml-2">{props.property.name}</Text>
    </div>
  );
};

export default SpanObjectProperty;
