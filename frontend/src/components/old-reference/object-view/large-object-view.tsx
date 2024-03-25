"use client";
import { OperatorsEnum, StepIdentifierEnum } from "@/definitions";
import { ActionTypeEnum } from "@/definitions/action";
import {
  Button,
  Card,
  Divider,
  Elevation,
  Icon,
  IconName,
  IconSize,
  Menu,
  MenuItem,
  Popover,
  Section,
  Text,
} from "@blueprintjs/core";
import SquareIcon, { SquareIconSize } from "@/components/icon/square-icon";
import Loading from "@/app/loading";
import ObjectViewRelation from "./object-view-relation";
import { useObjectRelations } from "@/data/use-relation";
import {
  useObjectDefinition,
  useObjectDefinitionActionsAllowed,
} from "@/data/use-object-definition";
import { useObjectActionPermission } from "@/hooks/permissions.hook";
import { useObject } from "@/data/use-object";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getFormattedDateStrings } from "@/utils/value-format";
import * as _ from "lodash";
import RealtimeBadge from "../badges/realtime-badge";

export default function LargeObjectView({
  objectDefinitionId,
  id,
  drawer,
}: {
  objectDefinitionId: string;
  id: string;
  drawer?: boolean;
}) {
  const hasObjectUpdatePermission = useObjectActionPermission(
    objectDefinitionId,
    ActionTypeEnum.Update,
  );
  const hasObjectDeletePermission = useObjectActionPermission(
    objectDefinitionId,
    ActionTypeEnum.Delete,
  );

  const router = useRouter();
  const [propertiesToggle, setPropertiesToggle] = useState<boolean>(false);

  const { data: objectDefinition, isLoading: isLoadingObjectDefinition } =
    useObjectDefinition(objectDefinitionId);
  const { data: instance, isLoading: isLoadingObject } = useObject(
    objectDefinitionId,
    id,
  );
  const { data: objectRelations, isLoading: isLoadingObjectRelations } =
    useObjectRelations(objectDefinitionId);
  const { data: allowsActions } =
    useObjectDefinitionActionsAllowed(objectDefinitionId);

  if (
    isLoadingObject ||
    isLoadingObjectRelations ||
    isLoadingObjectDefinition
  ) {
    return <Loading />;
  }

  const getProminentProperties = () => {
    const prominentProps = _.reduce(
      objectDefinition?.properties,
      (acc: any[], prop) => {
        if (prop.display === "prominent") {
          acc.push({
            ...prop,
            value: instance[prop.api_name],
          });
        }
        return acc;
      },
      [],
    );
    return prominentProps;
  };

  const getOtherProperties = () => {
    const otherProps = _.reduce(
      objectDefinition?.properties,
      (acc: any[], prop) => {
        if (prop.display === "normal") {
          acc.push({
            ...prop,
            value: instance[prop.api_name],
          });
        }
        return acc;
      },
      [],
    );
    return _.sortBy(otherProps, "name");
  };

  const handleViewObject = () => {
    const newPath = `/view/blueprints/${objectDefinitionId}/object/${id}`;
    router.push(newPath);
  };

  const handleOpenInWorkbook = () => {
    const pipeline = {
      from: objectDefinition!.id,
      steps: [
        {
          type: StepIdentifierEnum.Filter,
          logicalOperator: "and",
          conditions: [
            {
              property: objectDefinition!.primary_key_property,
              operator: OperatorsEnum.equal,
              value: instance[objectDefinition!.primary_key_property],
            },
          ],
        },
      ],
    };
    const newPath = `/view/workbooks/create/?basePipeline=${encodeURIComponent(
      JSON.stringify(pipeline),
    )}`;
    router.push(newPath);
  };

  const handleUpdateObject = () => {
    const newPath = `/view/blueprints/${objectDefinitionId}/object/${id}/update-object`;
    router.push(newPath);
  };

  const handleDeleteObject = () => {
    const newPath = `/view/blueprints/${objectDefinitionId}/object/${id}/delete-object`;
    router.push(newPath);
  };

  function renderHeader() {
    return (
      <div className="flex flex-row flex-grow items-center min-w-0">
        <SquareIcon
          icon={objectDefinition!.icon as IconName}
          color={objectDefinition!.color}
          size={SquareIconSize.STANDARD}
        />
        <Text
          className="min-w-0 ml-2 text-lg bp5-heading bp5-section-header-title"
          ellipsize
        >
          {objectDefinition?.title_property
            ? instance[objectDefinition.title_property]
            : instance[objectDefinition?.primary_key_property || "id"]}
        </Text>
        {allowsActions && <RealtimeBadge />}
      </div>
    );
  }

  function renderRightElement() {
    if (drawer) {
      return (
        <div className="flex flex-row items-center flex-none gap-3 ml-3">
          <div className="flex flex-row items-center">
            <Text className="mr-1 bp5-text-muted" ellipsize>
              {instance[objectDefinition?.primary_key_property || "id"]}
            </Text>
            <Button
              minimal={true}
              onClick={() => {
                navigator.clipboard.writeText(
                  instance[objectDefinition?.primary_key_property || "id"],
                );
              }}
            >
              <Icon icon="duplicate" color="gray" />
            </Button>
          </div>
          <Popover
            content={
              <Menu>
                <MenuItem
                  icon="search"
                  text="View object"
                  onClick={handleViewObject}
                />
                <MenuItem
                  icon="briefcase"
                  text="Open in workbook"
                  onClick={handleOpenInWorkbook}
                />
                {allowsActions && (
                  <>
                    <MenuItem
                      icon="edit"
                      disabled={!hasObjectUpdatePermission}
                      text="Update object"
                      onClick={handleUpdateObject}
                    />
                    <MenuItem
                      icon="trash"
                      disabled={!hasObjectDeletePermission}
                      text="Delete object"
                      onClick={handleDeleteObject}
                    />
                  </>
                )}
              </Menu>
            }
            interactionKind="click"
            placement="bottom"
          >
            <Button outlined minimal rightIcon="double-caret-vertical">
              Options
            </Button>
          </Popover>
        </div>
      );
    } else {
      return (
        <div className="flex flex-row items-center flex-none gap-2 ml-3">
          <div className="flex flex-row items-center">
            <Text className="mr-1 bp5-text-muted" ellipsize>
              {instance[objectDefinition?.primary_key_property || "id"]}
            </Text>
            <Button
              minimal={true}
              onClick={() => {
                navigator.clipboard.writeText(
                  instance[objectDefinition?.primary_key_property || "id"],
                );
              }}
            >
              <Icon icon="duplicate" color="gray" />
            </Button>
          </div>
          <Button
            outlined
            className="min-w-fit"
            icon="briefcase"
            text="Open in workbook"
            onClick={handleOpenInWorkbook}
          />
          {allowsActions && (
            <Popover
              content={
                <Menu>
                  <MenuItem
                    icon="edit"
                    disabled={!hasObjectUpdatePermission}
                    text="Update object"
                    onClick={handleUpdateObject}
                  />
                  <MenuItem
                    icon="trash"
                    disabled={!hasObjectDeletePermission}
                    text="Delete object"
                    onClick={handleDeleteObject}
                  />
                </Menu>
              }
              interactionKind="click"
              placement="bottom"
            >
              <Button outlined minimal rightIcon="double-caret-vertical">
                Options
              </Button>
            </Popover>
          )}
        </div>
      );
    }
  }

  function renderProminentValue(property: any) {
    if (property.type === "date" || property.type === "datetime") {
      const { localString, utcString } = getFormattedDateStrings(
        property.value,
      );
      return (
        <Popover
          content={
            <div className="p-1">
              <Text className=" bp5-text-muted">{utcString}</Text>
            </div>
          }
          interactionKind="hover"
          placement="top"
        >
          <Text ellipsize className="text-2xl font-bold">
            {localString}
          </Text>
        </Popover>
      );
    } else {
      return (
        <Text ellipsize className="text-2xl font-bold">
          {property.value}
        </Text>
      );
    }
  }

  function renderStandardValue(property: any) {
    if (property.type === "date" || property.type === "datetime") {
      const { localString, utcString } = getFormattedDateStrings(
        property.value,
      );
      return (
        <div className="w-4/5">
          <Popover
            content={
              <div className="p-1">
                <Text className=" bp5-text-muted">{utcString}</Text>
              </div>
            }
            interactionKind="hover"
            placement="top"
          >
            <Text className="w-full overflow-hidden line-clamp-6">
              {localString}
            </Text>
          </Popover>
        </div>
      );
    } else {
      return (
        <Text className="w-4/5 overflow-hidden line-clamp-6">
          {property.value}
        </Text>
      );
    }
  }

  function renderProminentProperties() {
    return _.map(getProminentProperties(), (property: any) => {
      return (
        <Card className="flex flex-col p-2 max-w-1/2 min-w-1/8 max-h-[80px]">
          <Text className="font-bold" ellipsize>
            {property.name}
          </Text>
          {renderProminentValue(property)}
        </Card>
      );
    });
  }
  function renderOtherProperties() {
    return _.map(getOtherProperties(), (property: any) => {
      return (
        <div className="flex flex-row w-full">
          <Text className="w-1/5 pr-2 bp5-text-muted" ellipsize>
            {property.name}
          </Text>
          {renderStandardValue(property)}
        </div>
      );
    });
  }

  function renderPropertiesToggle() {
    return (
      <>
        {propertiesToggle && <Divider className="mt-3" />}
        <div
          className="flex flex-row items-center my-2 hover:cursor-pointer"
          onClick={() => setPropertiesToggle(!propertiesToggle)}
        >
          <Text className="mr-1 bp5-text-muted">
            {propertiesToggle
              ? "Show less"
              : `${getOtherProperties().length} additional properties`}
          </Text>
          <Icon
            icon={propertiesToggle ? "chevron-up" : "chevron-right"}
            size={IconSize.STANDARD}
            color="gray"
          />
        </div>
      </>
    );
  }

  function renderRelations() {
    return (
      <div
        className={`grid grid-cols-2 gap-3 ${drawer ? "pb-2" : "pb-3"} mt-3`}
      >
        {_.map(objectRelations, (relation) => {
          return (
            <ObjectViewRelation
              instanceId={id}
              relationId={relation.id}
              objectDefinitionId={objectDefinitionId}
            />
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-row items-center justify-between h-[35px] w-full">
        {renderHeader()}
        {renderRightElement()}
      </div>
      <Section
        className="mt-2 h-fit"
        elevation={Elevation.ZERO}
        title="Properties"
      >
        <div className="px-3">
          <div className="flex flex-col gap-3">
            <div className="flex flex-row flex-wrap gap-2 mt-2">
              {renderProminentProperties()}
            </div>
            {propertiesToggle && (
              <div className="flex flex-col gap-2">
                {renderOtherProperties()}
              </div>
            )}
          </div>
          {!!getOtherProperties().length && renderPropertiesToggle()}
        </div>
      </Section>
      {!!objectRelations && !!objectRelations.length && renderRelations()}
    </div>
  );
}
