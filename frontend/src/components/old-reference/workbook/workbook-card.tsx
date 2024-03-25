"use client";
import {
  InferredSchemaProperty,
  StepIdentifierEnum,
  Workbook,
  WorkbookStep,
} from "@/definitions";
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
import { useState } from "react";
import { useValidatePipelineAndWorkbook } from "@/data/use-pipeline";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/clerk-react";
import { useFavoriteWorkbook } from "@/data/use-workbook";
import * as _ from "lodash";

export default function WorkbookCard({
  size,
  workbook,
  rightElement,
  action,
  actionButtonTitle,
  interactive,
}: {
  size: "large" | "small";
  workbook: Workbook;
  rightElement?: React.ReactElement;
  action?: () => void;
  actionButtonTitle?: string;
  interactive?: boolean;
}) {
  const router = useRouter();
  const { userId, isLoaded: isUserLoaded } = useAuth();
  const [propertiesToggle, setPropertiesToggle] = useState(false);

  const {
    data: workbookSchema,
    isLoading,
    error,
  } = useValidatePipelineAndWorkbook(workbook);
  const { trigger: toggleFavorite, isMutating: isFavoriting } =
    useFavoriteWorkbook(workbook.id);

  const displayCount = _.filter(
    workbook.steps,
    (step: WorkbookStep) => step.type === StepIdentifierEnum.Display,
  ).length;

  if (isLoading) {
    return (
      <BaseCard
        size={size}
        title={workbook.name ? workbook.name : ""}
        isLoading={true}
      />
    );
  }

  if (error || !workbookSchema) {
    return null; // TODO: error handling
  }

  function handleEditWorkbookClick() {
    const newPath = `/view/workbooks/${workbook.id}/edit`;
    router.push(newPath);
  }

  function renderBottomPanel() {
    return (
      <div className="flex flex-col">
        <Text className="mb-1 cursor-default bp5-text-muted">{`${displayCount} display${
          displayCount !== 1 ? "s" : ""
        }`}</Text>
        {workbookSchema!.success ? (
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
                  workbookSchema!.data.properties,
                  (property: InferredSchemaProperty, index: number) => {
                    return (
                      <InferredSchemaPropertyTag
                        key={index}
                        property={property}
                      />
                    );
                  },
                )}
              </div>
            )}
          </div>
        ) : undefined}
      </div>
    );
  }

  function renderListPanel() {
    return (
      <div className="flex flex-row items-center gap-2 mt-1 overflow-hidden grow h-fit">
        {_.map(
          workbookSchema!.data.properties,
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
          {workbook.name}
          <Button
            minimal
            className="ml-1"
            icon={
              _.includes(workbook.favorited_by, userId) ? "star" : "star-empty"
            }
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite();
            }}
          />
        </div>
      }
      subtitle={workbook.description ? workbook.description : undefined}
      bottomPanel={renderBottomPanel()}
      listPanel={workbookSchema.success ? renderListPanel() : undefined}
      rightElement={rightElement}
      rightAlert={
        !workbookSchema.success ? (
          <Popover
            content={
              <Callout intent="warning" title="Workbook contains invalid steps">
                <div className="flex flex-col"></div>
                <Text>
                  Please edit the workbook to view and fix the errors.
                </Text>
                <div className="flex flex-row justify-end mt-2">
                  <Button
                    minimal={true}
                    intent="primary"
                    rightIcon="caret-right"
                    onClick={handleEditWorkbookClick}
                  >
                    Edit workbook
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
