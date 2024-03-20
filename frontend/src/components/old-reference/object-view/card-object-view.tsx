import { Card, H6 } from "@blueprintjs/core";
import _ from "lodash";
import { ObjectDefinition } from "@/definitions";
import SquareIcon, { SquareIconSize } from "../../icon/square-icon";
import { useViewNavigation } from "@/utils/get-routes";
import { useRouter } from "next/navigation";

interface CardObjectViewProps {
  objectDefinition: ObjectDefinition;
  instance: any;
  numPropertiesToDisplay?: number;
  onClick?: () => void;
}

const CardObjectView = (props: CardObjectViewProps) => {
  const numPropertiesToDisplay = props.numPropertiesToDisplay || 0;
  const prominentProps = _.filter(props.objectDefinition.properties, {
    display: "prominent",
  });
  const normalProps = _.filter(props.objectDefinition.properties, {
    display: "normal",
  });

  const displayedProps = Math.max(
    numPropertiesToDisplay - prominentProps.length,
    0,
  );

  const router = useRouter();
  const { getObjectViewPath } = useViewNavigation();

  const remainingProps = normalProps.length - displayedProps;

  const getProminentProperties = () => {
    return _.map(prominentProps, (property) => {
      return (
        <div>
          <span>
            <span className="bp5-text-muted">{property.name}:</span>{" "}
            {props.instance[property.api_name]}
          </span>
        </div>
      );
    });
  };

  const getNormalProperties = () => {
    return _.map(_.take(normalProps, displayedProps), (property) => {
      return (
        <div>
          <span>
            <span className="bp5-text-muted">{property.name}:</span>{" "}
            {props.instance[property.api_name]}
          </span>
        </div>
      );
    });
  };

  const handleClick = () => {
    if (props.onClick) {
      props.onClick();
    }
    router.push(
      getObjectViewPath({
        objectDefinitionId: props.objectDefinition.id,
        objectId: props.instance[
          props.objectDefinition.primary_key_property
        ] as string,
      }),
    );
  };

  return (
    <Card interactive onClick={handleClick}>
      <div className="flex row">
        <div className="mr-2">
          <SquareIcon
            icon={props.objectDefinition.icon}
            color={props.objectDefinition.color}
            size={SquareIconSize.STANDARD}
          />
        </div>
        <div>
          <H6>
            {props.objectDefinition.title_property
              ? props.instance[props.objectDefinition.title_property]
              : props.instance[props.objectDefinition.primary_key_property]}
          </H6>
          {getProminentProperties()}
          {getNormalProperties()}
          {remainingProps > 0 && (
            <div>
              <span>... {remainingProps} additional properties</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default CardObjectView;
