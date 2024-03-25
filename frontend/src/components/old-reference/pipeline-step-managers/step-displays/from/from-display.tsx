"use client";
import { ObjectDefinition, PartialWorkbook, Workbook } from "@/definitions";
import {
  Text,
  Icon,
  Section,
  Button,
  IconName,
  IconSize,
} from "@blueprintjs/core";
import DataPreview from "../data-preview";
import FromEditor from "../../step-editors/from/from-editor";
import SquareIcon, { SquareIconSize } from "@/components/icon/square-icon";
import { useState } from "react";

type FromDisplayProps = {
  objectDefinition: ObjectDefinition;
  editable?: boolean;
  setPipeline?: (pipeline: Workbook | PartialWorkbook) => void;
};

export default function FromDisplay({
  objectDefinition,
  editable,
  setPipeline,
}: FromDisplayProps) {
  const [viewDataToggle, setViewDataToggle] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  function renderTitle() {
    return (
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-row items-center">
          <Text className="text-xl">From:</Text>
          <Button
            className="ml-2 bg-white border border-bluprint-border-gray"
            // TODO: add onClick to open object definition drawer
          >
            <div className="flex flex-row items-center">
              <SquareIcon
                icon={
                  (objectDefinition.icon as IconName) || ("cube" as IconName)
                }
                color={objectDefinition.color || "gray"}
                size={SquareIconSize.SMALL}
              />
              <div className="flex flex-row items-center ml-2">
                <Text className="text-md">{objectDefinition.name}</Text>
              </div>
            </div>
          </Button>
        </div>
      </div>
    );
  }

  function renderRightElement() {
    return (
      <Button icon="edit" text="Edit step" onClick={() => setIsEditing(true)} />
    );
  }

  function renderContent() {
    return (
      <div className="w-full px-3 py-1">
        <div
          className="flex flex-row items-center text-sm hover:cursor-pointer"
          onClick={() => setViewDataToggle(!viewDataToggle)}
        >
          {viewDataToggle ? (
            <>
              <Text className="mr-1">Hide data</Text>
              <Icon icon="chevron-down" size={IconSize.LARGE} />
            </>
          ) : (
            <>
              <Text className="mr-1">View data</Text>
              <Icon icon="chevron-right" size={IconSize.LARGE} />
            </>
          )}
        </div>
        {viewDataToggle && (
          <DataPreview pipeline={{ from: objectDefinition.id, steps: [] }} />
        )}
      </div>
    );
  }

  return (
    <>
      {isEditing && editable && setPipeline ? (
        <FromEditor
          currentObjectDefinition={objectDefinition}
          setIsEditing={setIsEditing}
          setPipeline={setPipeline}
        />
      ) : (
        <Section
          className="flex-none w-full mb-2 rounded-sm"
          title={renderTitle()}
          rightElement={editable ? renderRightElement() : undefined}
        >
          {renderContent()}
        </Section>
      )}
    </>
  );
}
