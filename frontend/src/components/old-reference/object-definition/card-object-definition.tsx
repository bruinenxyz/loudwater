import { useObjectDefinition } from "@/data/use-object-definition";
import { Card, H6, IconName } from "@blueprintjs/core";
import SquareIcon, { SquareIconSize } from "../../icon/square-icon";
import _ from "lodash";
import Loading from "@/app/loading";
import { ErrorDisplay } from "../../error-display";

interface CardObjectDefinitionProps {
  id: string;
  onClick?: () => void;
}

const CardObjectDefinition = (props: CardObjectDefinitionProps) => {
  const {
    data: objectDefinition,
    isLoading,
    error,
  } = useObjectDefinition(props.id);

  // const { data: countResult } = useObjectQuery(
  //   objectDefinition,
  //   ? {
  //       from: objectDefinition.id as string,
  //       groupBy: {
  //         aggregate: {
  //           field: objectDefinition.primary_key_property as string,
  //           type: "count" as QueryAggregateType,
  //         },
  //       },]
  //     }
  //   : null,
  // );

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <ErrorDisplay
        title="Cannot get object definition"
        description={error.message}
      />
    );
  }

  return (
    <Card className="cursor-pointer bp5-elevation-2" onClick={props.onClick}>
      <div className="flex row ">
        <div>
          <SquareIcon
            icon={(objectDefinition!.icon as IconName) || "cube"}
            color={(objectDefinition!.color as string) || "gray"}
            size={SquareIconSize.STANDARD}
          />
        </div>
        <div className="w-full ml-2">
          <div className="flex justify-between space-x-2 row">
            <H6>{objectDefinition?.name}</H6>
            {/* {countResult && !countResult.error && (
              <Tag minimal>{formatNumber(countResult["0"]["count_id"])}</Tag>
            )} */}
          </div>
          <p>{objectDefinition?.description}</p>
        </div>
      </div>
    </Card>
  );
};
export default CardObjectDefinition;
