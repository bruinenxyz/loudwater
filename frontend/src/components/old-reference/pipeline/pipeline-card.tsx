"use client";
import { InferredSchemaProperty, Pipeline } from "@/definitions/pipeline";
import {
  Button,
  Callout,
  Colors,
  Icon,
  IconSize,
  Popover,
  Text,
} from "@blueprintjs/core";
import { BaseCard } from "@/components/old-reference/cards";
import { InferredSchemaPropertyTag } from "@/components/old-reference/properties";
import {
  useFavoritePipeline,
  useValidatePipelineAndWorkbook,
} from "@/data/use-pipeline";
import { useAuth } from "@clerk/clerk-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import * as _ from "lodash";

export default function PipelineCard({
  size,
  pipeline,
  rightElement,
  action,
  actionButtonTitle,
  interactive,
}: {
  size: "large" | "small";
  pipeline: Pipeline;
  rightElement?: React.ReactElement;
  action?: () => void;
  actionButtonTitle?: string;
  interactive?: boolean;
}) {
  const router = useRouter();
  const { userId, isLoaded: isUserLoaded } = useAuth();
  const [propertiesToggle, setPropertiesToggle] = useState(false);

  const {
    data: pipelineSchema,
    isLoading,
    error,
  } = useValidatePipelineAndWorkbook(pipeline);
  const { trigger: toggleFavorite, isMutating: isFavoriting } =
    useFavoritePipeline(pipeline.id);

  if (isLoading || !isUserLoaded) {
    return (
      <BaseCard
        size={size}
        title={pipeline.name ? pipeline.name : ""}
        isLoading={true}
      />
    );
  }

  if (error || !pipelineSchema) {
    return null; // TODO: error handling
  }

  function handleEditPipelineClick() {
    const newPath = `/view/pipelines/${pipeline.id}/edit`;
    router.push(newPath);
  }

  function renderBottomPanel() {
    return (
      <div className="flex flex-col">
        <div
          className="flex flex-row items-center hover:cursor-pointer"
          onClick={() => setPropertiesToggle(!propertiesToggle)}
        >
          <Text className="mr-1 bp5-text-muted">Schema properties</Text>
          <Icon
            icon={propertiesToggle ? "chevron-down" : "chevron-right"}
            size={IconSize.STANDARD}
            color="gray"
          />
        </div>
        {propertiesToggle && (
          <div className="flex flex-row flex-wrap gap-2 mt-2 h-fit">
            {_.map(
              pipelineSchema!.data.properties,
              (property: InferredSchemaProperty, index: number) => {
                return (
                  <InferredSchemaPropertyTag key={index} property={property} />
                );
              },
            )}
          </div>
        )}
      </div>
    );
  }

  function renderListPanel() {
    return (
      <div className="flex flex-row items-center gap-2 mt-1 overflow-hidden grow h-fit">
        {_.map(
          pipelineSchema!.data.properties,
          (property: InferredSchemaProperty, index: number) => {
            return (
              <div className="w-fit">
                <InferredSchemaPropertyTag key={index} property={property} />
              </div>
            );
          },
        )}
      </div>
    );
  }

  return (
    <BaseCard
      size={size}
      title={
        <div className="flex flex-row items-center">
          {pipeline.name}
          <Button
            minimal
            className="ml-1"
            icon={
              _.includes(pipeline.favorited_by, userId) ? "star" : "star-empty"
            }
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite();
            }}
          />
        </div>
      }
      subtitle={pipeline.description ? pipeline.description : undefined}
      bottomPanel={pipelineSchema.success ? renderBottomPanel() : undefined}
      listPanel={pipelineSchema.success ? renderListPanel() : undefined}
      rightElement={rightElement}
      rightAlert={
        !pipelineSchema.success ? (
          <Popover
            content={
              <Callout intent="warning" title="Pipeline contains invalid steps">
                <div className="flex flex-col"></div>
                <Text>
                  Please edit the pipeline to view and fix the errors.
                </Text>
                <div className="flex flex-row justify-end mt-2">
                  <Button
                    minimal={true}
                    intent="primary"
                    rightIcon="caret-right"
                    onClick={handleEditPipelineClick}
                  >
                    Edit pipeline
                  </Button>
                </div>
              </Callout>
            }
            interactionKind="hover"
            placement="top"
          >
            <Icon icon="warning-sign" color={Colors.ORANGE3} />
          </Popover>
        ) : undefined
      }
      action={action}
      actionButtonTitle={actionButtonTitle}
      interactive={interactive}
    />
  );
}
