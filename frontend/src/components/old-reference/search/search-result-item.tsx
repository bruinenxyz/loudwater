"use client";
import { ObjectDefinition, StepIdentifierEnum } from "@/definitions";
import { ActionTypeEnum } from "@/definitions/action";
import {
  SearchHit,
  SearchResult,
  SearchResultError,
  SearchResultSuccess,
} from "@/definitions/search";
import {
  Button,
  Icon,
  Intent,
  Menu,
  MenuItem,
  NonIdealState,
  Popover,
  Tag,
} from "@blueprintjs/core";
import { ErrorDisplay } from "../../error-display";
import Loading from "@/app/loading";
import { CardSection } from "../cards";
import ObjectCard from "../object-view/object-card";
import { isObjectDefinitionId } from "./search.utils";
import { useQuery } from "@/data/use-query";
import { useObjectActionPermission } from "@/hooks/permissions.hook";
import { usePathname, useRouter } from "next/navigation";
import React, { HtmlHTMLAttributes, useState } from "react";
import * as _ from "lodash";
import { useObjectDefinitionActionsAllowed } from "@/data/use-object-definition";
import RealtimeBadge from "../badges/realtime-badge";
import { ViewType } from "@/utils/constants";
import QueryTableView from "../query/query-table-view";

export type SearchResultProps = HtmlHTMLAttributes<HTMLDivElement> & {
  searchResult: SearchResult;
  isLoading?: boolean;
  objectDefinition: ObjectDefinition;
};

export const SearchResultComponent: React.FC<SearchResultProps> = ({
  className,
  searchResult,
  isLoading,
  objectDefinition,
}) => {
  const hasObjectCreatePermission = useObjectActionPermission(
    objectDefinition.id,
    ActionTypeEnum.Create,
  );
  const { data: allowsActions } = useObjectDefinitionActionsAllowed(
    objectDefinition.id,
  );

  const [viewType, setViewType] = useState(ViewType.LIST);
  const router = useRouter();
  const path = usePathname();
  const { error } = searchResult as SearchResultError;
  const { hits, request_params } = searchResult as SearchResultSuccess;
  const { collection_name } = request_params || {};

  // Get the actual count of objects
  const {
    data: countData,
    isLoading: isLoadingCount,
    error: countError,
  } = useQuery({
    from: objectDefinition.id,
    steps: [
      {
        type: StepIdentifierEnum.Aggregate,
        group: [],
        operation: "count",
        property: objectDefinition.primary_key_property || "id",
        as: "object_count",
      },
    ],
  });

  if (isLoadingCount) {
    return <Loading />;
  }

  if (countError || !countData) {
    return (
      <ErrorDisplay
        title="Unexpected error"
        description={countError.measage || null}
      />
    );
  }

  function openBlueprintInWorkbook() {
    const pipeline = {
      from: objectDefinition!.id,
      steps: [],
    };
    const newPath = `/view/workbooks/create/?basePipeline=${encodeURIComponent(
      JSON.stringify(pipeline),
    )}`;
    router.push(newPath);
  }

  function viewObject({ instance }: { instance: any }) {
    const instanceId = instance[objectDefinition!.primary_key_property || "id"];
    const instanceName =
      instance[
        objectDefinition?.title_property ||
          objectDefinition?.primary_key_property ||
          "id"
      ];
    const newPath = `/view/blueprints/${
      objectDefinition!.id
    }/object/${instanceId}`;
    router.push(newPath);
  }

  function openObjectInWorkbook({ instance }: { instance: any }) {
    const pipeline = {
      from: objectDefinition!.id,
      steps: [
        {
          type: StepIdentifierEnum.Filter,
          logicalOperator: "and",
          conditions: [
            {
              property: objectDefinition!.primary_key_property || "id",
              operator: "==",
              value: instance[objectDefinition!.primary_key_property || "id"],
            },
          ],
        },
      ],
    };
    const newPath = `/view/workbooks/create/?basePipeline=${encodeURIComponent(
      JSON.stringify(pipeline),
    )}`;
    router.push(newPath);
  }

  function addObject() {
    const newPath = `${path}/add-object`;
    router.push(newPath);
  }

  const handleObjectViewClick = (instance: any) => {
    const instanceId = instance[objectDefinition!.primary_key_property || "id"];
    const instanceName =
      instance[
        objectDefinition?.title_property ||
          objectDefinition?.primary_key_property ||
          "id"
      ];
    const newPath = `/view/blueprints/${
      objectDefinition!.id
    }/object/${instanceId}`;
    router.push(newPath);
  };

  function renderCards() {
    if (viewType === ViewType.TABLE) {
      let queryResults = _.map(hits, (hit: SearchHit) => {
        return hit.document;
      });
      return (
        <QueryTableView
          baseObjectDefinition={objectDefinition}
          queryResults={queryResults}
        />
      );
    }

    return _.map(
      hits,
      (searchObjectDefinitionHit: SearchHit, index: number) => {
        const instance = searchObjectDefinitionHit.document;

        return (
          <ObjectCard
            key={index}
            size={viewType === ViewType.LIST ? "small" : "large"}
            instance={instance}
            objectDefinitionId={objectDefinition!.id}
            rightElement={
              <Popover
                content={
                  <Menu>
                    <MenuItem
                      icon="search"
                      text="View object"
                      onClick={() => viewObject?.({ instance })}
                    />
                    <MenuItem
                      icon="briefcase"
                      text="Open in workbook"
                      onClick={() => openObjectInWorkbook?.({ instance })}
                    />
                  </Menu>
                }
                interactionKind="click"
                placement="bottom"
              >
                <Icon icon="cog" color="gray" className="cursor-pointer" />
              </Popover>
            }
            action={() => handleObjectViewClick(instance)}
            actionButtonTitle={"View"}
          />
        );
      },
    );
  }

  if (error) {
    return <></>;
  }

  if (isObjectDefinitionId(collection_name) && objectDefinition) {
    return (
      <CardSection
        className="min-h-0 grow"
        title={
          <span>
            {objectDefinition?.name}
            <Tag className="ml-2" intent={Intent.PRIMARY}>
              {countData[0].object_count}
            </Tag>
            {allowsActions && <RealtimeBadge />}
          </span>
        }
        cards={renderCards()}
        rightElement={
          <div className="flex flex-row items-center gap-2">
            <Button icon="briefcase" onClick={openBlueprintInWorkbook}>
              Open in workbook
            </Button>
            {allowsActions && (
              <Button
                icon="insert"
                disabled={!hasObjectCreatePermission}
                onClick={addObject}
              >
                Add object
              </Button>
            )}
          </div>
        }
        dislayViewTypes={[ViewType.GRID, ViewType.LIST, ViewType.TABLE]}
        viewType={viewType}
        setViewType={setViewType}
        emptyElement={<NonIdealState title="No search results" icon="search" />}
        bounded={false}
        isLoading={isLoading}
      />
    );
  }

  return <></>;
};
