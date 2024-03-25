"use client";
import { ObjectDefinition } from "@/definitions";
import { Pipeline, PartialPipeline } from "@/definitions/pipeline";
import {
  Button,
  Section,
  Spinner,
  SpinnerSize,
  Tab,
  Tabs,
} from "@blueprintjs/core";
import PipelinePermissionsView from "./pipeline-permissions-view";
import PipelineEditor from "../pipeline-editor/pipeline-editor";
import PipelineDataView from "./pipeline-data-view";
import { ErrorDisplay } from "@/components/error-display";
import { useValidatePipelineAndWorkbook } from "@/data/use-pipeline";
import { useState } from "react";

enum SectionTabEnum {
  STEPS = "STEPS",
  TABLE = "TABLE",
  PERMISSIONS = "PERMISSIONS",
}

export default function PipelineDataStepView({
  pipeline,
  baseObjectDefinition,
}: {
  pipeline: Pipeline;
  baseObjectDefinition: ObjectDefinition;
}) {
  const [currentSectionTab, setCurrentSectionTab] = useState<SectionTabEnum>(
    SectionTabEnum.STEPS,
  );

  const {
    data: schema,
    isLoading: isLoadingSchema,
    error: schemaError,
  } = useValidatePipelineAndWorkbook(pipeline);

  if (isLoadingSchema || !pipeline) {
    return (
      <div className="flex flex-col items-center justify-center mx-3 mt-4">
        <Spinner size={SpinnerSize.STANDARD} />
      </div>
    );
  }

  if (schemaError || !schema) {
    return (
      <ErrorDisplay
        title="Unexpected error"
        description={schemaError.message}
      />
    );
  }

  function renderSectionContent() {
    switch (currentSectionTab) {
      case SectionTabEnum.STEPS:
        return (
          <div className="flex-auto p-2 overflow-y-auto">
            <PipelineEditor
              pipeline={pipeline}
              setPipeline={(pipeline: Pipeline | PartialPipeline) => {}}
              editable={false}
            />
          </div>
        );
      case SectionTabEnum.TABLE:
        return (
          <div className="flex-auto p-2 overflow-y-auto">
            <PipelineDataView
              pipeline={pipeline}
              pipelineValid={schema!.success}
              baseObjectDefinition={baseObjectDefinition}
            />
          </div>
        );
      case SectionTabEnum.PERMISSIONS:
        return (
          <div className="h-[calc(100%-61px)] p-3 overflow-y-auto">
            <PipelinePermissionsView pipeline={pipeline} />
          </div>
        );
    }
  }

  return (
    <Section
      className="flex flex-col h-full col-span-3"
      title={
        <Tabs
          animate
          selectedTabId={currentSectionTab}
          className="h-[41px]"
          id="section-tabs"
          key="horizontal"
          renderActiveTabPanelOnly={true}
          onChange={(tabId: SectionTabEnum) => setCurrentSectionTab(tabId)}
        >
          <Tab
            id={SectionTabEnum.STEPS}
            title={
              <Button
                className="bp5-minimal"
                icon="diagram-tree"
                text="Pipeline steps"
              />
            }
          />
          <Tab
            id={SectionTabEnum.TABLE}
            title={
              <Button
                className="bp5-minimal"
                icon="th-filtered"
                text="Results table"
              />
            }
          />
          <Tab
            id={SectionTabEnum.PERMISSIONS}
            title={
              <Button className="bp5-minimal" icon="lock" text="Permissions" />
            }
          />
        </Tabs>
      }
    >
      {renderSectionContent()}
    </Section>
  );
}
