"use client";
import { ObjectDefinition, PartialWorkbook, Workbook } from "@/definitions";
import {
  Button,
  Section,
  Spinner,
  SpinnerSize,
  Tab,
  Tabs,
} from "@blueprintjs/core";
import { ErrorDisplay } from "@/components/error-display";
import { WorkbookPipelineEditor } from "..";
import WorkbookDataView from "./workbook-data-view";
import WorkbookPermissionsView from "./workbook-permissions-view";
import { useValidatePipelineAndWorkbook } from "@/data/use-pipeline";
import { useState } from "react";
import { DisplayStepCreator } from "@/components/old-reference/pipeline-step-managers";
import WorkbookDisplayChartStep from "../workbook-display-chart-step/workbook-display-chart-step";

enum SectionTabEnum {
  STEPS = "STEPS",
  TABLE = "TABLE",
  PERMISSIONS = "PERMISSIONS",
  CHARTS = "CHARTS",
}

export default function WorkbookDataStepView({
  workbook,
  baseObjectDefinition,
}: {
  workbook: Workbook;
  baseObjectDefinition: ObjectDefinition;
}) {
  const [currentSectionTab, setCurrentSectionTab] = useState<SectionTabEnum>(
    SectionTabEnum.STEPS,
  );

  const {
    data: schema,
    isLoading: isLoadingSchema,
    error: schemaError,
  } = useValidatePipelineAndWorkbook(workbook);

  if (isLoadingSchema || !workbook) {
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
            <WorkbookPipelineEditor
              workbook={workbook}
              setWorkbook={(workbook: Workbook | PartialWorkbook) => {}}
              editable={false}
            />
          </div>
        );
      case SectionTabEnum.TABLE:
        return (
          <div className="flex-auto p-2 overflow-y-auto">
            <WorkbookDataView
              workbook={workbook}
              workbookValid={schema!.success}
              baseObjectDefinition={baseObjectDefinition}
            />
          </div>
        );
      case SectionTabEnum.CHARTS:
        return (
          <div className="flex-auto p-2 overflow-y-auto">
            <WorkbookDisplayChartStep workbook={workbook} />
          </div>
        );
      case SectionTabEnum.PERMISSIONS:
        return (
          <div className="h-[calc(100%-61px)] p-3 overflow-y-auto">
            <WorkbookPermissionsView workbook={workbook} />
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
                text="Workbook steps"
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
            id={SectionTabEnum.CHARTS}
            title={
              <Button
                className="bp5-minimal"
                icon="timeline-bar-chart"
                text="Charts"
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
