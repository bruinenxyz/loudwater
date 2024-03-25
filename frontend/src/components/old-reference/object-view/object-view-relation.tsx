"use client";
import { OperatorsEnum, StepIdentifierEnum } from "@/definitions/pipeline";
import { Button, Card, NonIdealState } from "@blueprintjs/core";
import CardSection from "../cards/card-section";
import ObjectCard from "./object-card";
import { useObject, useRelatedObjects } from "@/data/use-object";
import { useObjectDefinition } from "@/data/use-object-definition";
import { useRouter } from "next/navigation";
import * as _ from "lodash";
import Loading from "@/app/loading";
import { ErrorDisplay } from "../../error-display";
import { ViewType } from "@/utils/constants";

interface ObjectViewRelationProps {
  relationId: string;
  objectDefinitionId: string;
  instanceId: string;
}

const ObjectViewRelation = (props: ObjectViewRelationProps) => {
  const router = useRouter();
  const {
    data: objectDefinition,
    error: objectDefinitionError,
    isLoading: isLoadingObjectDefinition,
  } = useObjectDefinition(props.objectDefinitionId);
  const {
    data: relatedObjects,
    relatedObjectDefinition,
    objectRelation,
    isLoading: isLoadingRelatedObjects,
    error: relatedObjectsError,
  } = useRelatedObjects({
    instanceId: props.instanceId,
    objectDefinitionId: props.objectDefinitionId,
    relationId: props.relationId,
  });

  const { data: instance } = useObject(
    props.objectDefinitionId,
    props.instanceId,
  );

  if (
    isLoadingRelatedObjects ||
    isLoadingObjectDefinition ||
    !objectDefinition ||
    !objectRelation
  ) {
    return <Loading />;
  }

  if (objectDefinitionError || relatedObjectsError) {
    return (
      <ErrorDisplay
        title="Unexpected error"
        description={(objectDefinitionError || relatedObjectsError).message}
      />
    );
  }

  const handleOpenInWorkbookClick = () => {
    const pipeline = {
      from: objectDefinition.id,
      steps: [
        {
          type: StepIdentifierEnum.Filter,
          logicalOperator: "and",
          conditions: [
            {
              property: objectDefinition.primary_key_property || "id",
              operator: OperatorsEnum.equal,
              value: instance[objectDefinition.primary_key_property || "id"],
            },
          ],
        },
        { type: StepIdentifierEnum.Relate, relation: objectRelation.api_name },
      ],
    };
    router.push(
      `/view/workbooks/create/?basePipeline=${encodeURIComponent(
        JSON.stringify(pipeline),
      )}`,
    );
  };

  function renderCards() {
    if (!!relatedObjects && !!relatedObjects.length) {
      return _.map(relatedObjects, (objectInstance) => {
        return (
          <ObjectCard
            size="small"
            instance={objectInstance}
            objectDefinitionId={relatedObjectDefinition!.id}
            action={() => {
              const newPath = `/view/blueprints/${
                relatedObjectDefinition!.id
              }/object/${
                objectInstance[relatedObjectDefinition!.primary_key_property]
              }`;
              router.push(newPath);
            }}
            actionButtonTitle="View"
          />
        );
      });
    } else {
      const card = (
        <Card className="flex flex-row items-center p-3">
          <NonIdealState
            layout="vertical"
            title="No related objects"
            description={`The selected object does not have any ${
              objectRelation!.name ? objectRelation!.name : "Untitled relation"
            } related objects.`}
          />
        </Card>
      );
      return [card];
    }
  }

  return (
    <CardSection
      className="max-h-[500px]"
      title={objectRelation.name ? objectRelation.name : "Untitled relation"}
      cards={renderCards()}
      rightElement={
        <Button
          minimal={true}
          icon="briefcase"
          onClick={handleOpenInWorkbookClick}
        >
          Open in workbook
        </Button>
      }
      viewType={ViewType.LIST}
      bounded={true}
    />
  );
};

export default ObjectViewRelation;
