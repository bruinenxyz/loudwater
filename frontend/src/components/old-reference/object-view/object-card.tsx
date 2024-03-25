"use client";
import { ObjectProperty, ObjectPropertyDisplayEnum } from "@/definitions";
import {
  Divider,
  Icon,
  IconName,
  IconSize,
  Popover,
  Text,
} from "@blueprintjs/core";
import SquareIcon, { SquareIconSize } from "../../icon/square-icon";
import { BaseCard } from "@/components/old-reference/cards";
import { useObjectDefinition } from "@/data/use-object-definition";
import { getFormattedDateStrings } from "@/utils/value-format";
import { useState } from "react";
import * as _ from "lodash";

export default function ObjectCard({
  size,
  instance,
  objectDefinitionId,
  rightElement,
  rightAlert,
  action,
  actionButtonTitle,
  interactive,
}: {
  size: "large" | "small";
  instance: any;
  objectDefinitionId: string;
  rightElement?: React.ReactElement;
  rightAlert?: React.ReactElement;
  action?: () => void;
  actionButtonTitle?: string;
  interactive?: boolean;
}) {
  const [propertiesToggle, setPropertiesToggle] = useState(false);

  const {
    data: objectDefinition,
    isLoading,
    error,
  } = useObjectDefinition(objectDefinitionId);

  if (isLoading) {
    return <BaseCard size={size} title={""} isLoading={true} />;
  }

  if (error || !objectDefinition) {
    return null; // TODO: error handling
  }

  function renderPropertyValue(property: ObjectProperty) {
    if (property.type === "date" || property.type === "datetime") {
      const { localString, utcString } = getFormattedDateStrings(
        instance[property.api_name],
      );
      return (
        <div className="max-w-full min-w-0 ml-2 shirnk">
          <Popover
            content={
              <div className="p-1">
                <Text className=" bp5-text-muted">{utcString}</Text>
              </div>
            }
            interactionKind="hover"
            placement="top"
          >
            <Text className="w-full overflow-hidden line-clamp-1">
              {localString}
            </Text>
          </Popover>
        </div>
      );
    } else {
      return (
        <Text className="max-w-full min-w-0 ml-2 overflow-hidden shirnk line-clamp-1">
          {instance[property.api_name]}
        </Text>
      );
    }
  }

  function renderBottomPanel() {
    const [prominentProperties, regularProperties] = _.partition(
      _.values(objectDefinition!.properties),
      (property: ObjectProperty) =>
        property.display &&
        property.display === ObjectPropertyDisplayEnum.PROMINENT,
    );
    return (
      <div className="flex flex-col min-w-0">
        {_.map(
          prominentProperties,
          (property: ObjectProperty, index: number) => {
            return (
              <>
                <div key={index} className="flex flex-row items-center">
                  <Text
                    className="bp5-text-muted w-fit shrink-0 flex-nowrap"
                    ellipsize
                  >
                    {property.name}:
                  </Text>
                  {renderPropertyValue(property)}
                </div>
                <Divider className="my-2" />
              </>
            );
          },
        )}
        {regularProperties.length > 0 && (
          <>
            <div
              className="flex flex-row items-center hover:cursor-pointer"
              onClick={() => setPropertiesToggle(!propertiesToggle)}
            >
              <Text className="mr-1 bp5-text-muted">{`${
                regularProperties.length
              } additional propert${
                regularProperties.length === 1 ? "y" : "ies"
              }`}</Text>
              <Icon
                icon={propertiesToggle ? "chevron-down" : "chevron-right"}
                size={IconSize.STANDARD}
                color="gray"
              />
            </div>
            {propertiesToggle && (
              <div className="flex flex-col mt-1 h-fit">
                {_.map(
                  regularProperties,
                  (property: ObjectProperty, index: number) => {
                    return (
                      <div
                        key={index}
                        className="flex flex-row items-center max-w-full min-w-0"
                      >
                        <Text
                          className="bp5-text-muted w-fit shrink-0 flex-nowrap"
                          ellipsize
                        >
                          {property.name}:
                        </Text>
                        {renderPropertyValue(property)}
                      </div>
                    );
                  },
                )}
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <BaseCard
      size={size}
      title={
        objectDefinition.title_property
          ? instance[objectDefinition.title_property]
          : instance[objectDefinition.primary_key_property]
      }
      subtitle={`${instance[objectDefinition.primary_key_property]}`}
      leftIcon={
        objectDefinition.icon ? (
          <SquareIcon
            icon={objectDefinition.icon as IconName}
            color={objectDefinition.color}
            size={SquareIconSize.STANDARD}
          />
        ) : undefined
      }
      bottomPanel={renderBottomPanel()}
      rightElement={rightElement}
      rightAlert={rightAlert}
      action={action}
      actionButtonTitle={actionButtonTitle}
      interactive={interactive}
    />
  );
}
