"use client";
import { Chart } from "@/definitions/displays/charts/charts";
import { Button, Divider, Section, Text } from "@blueprintjs/core";
import ChartEditor from "./chart-editor/chart-editor";
import Loading from "@/app/loading";
import { ErrorDisplay } from "@/components/error-display";
import { NewStepSelection } from "@/components/old-reference/workbook";
import { useState } from "react";
import * as _ from "lodash";

export default function DisplayChartEditor({
  index,
  charts,
  setChart,
  onSave,
  onCancel,
  columns,
  isUpdatingUserQuery = false,
  isSaveable = false,
}: {
  index?: number;
  charts?: Chart[];
  setChart: (chart: Chart | null) => void;
  onSave: () => void;
  onCancel: () => void;
  columns: any[];
  isUpdatingUserQuery?: boolean;
  isSaveable?: boolean;
}) {
  return (
    <Section
      className="flex-none w-full my-2 rounded-sm"
      title={<Text className="text-xl">Chart</Text>}
      rightElement={
        <div className="flex flex-row">
          <Button
            alignText="left"
            disabled={!isSaveable}
            text="Save"
            intent="primary"
            loading={isUpdatingUserQuery}
            onClick={() => {
              if (!isUpdatingUserQuery) onSave();
            }}
          />
          <Button
            className="ml-2"
            alignText="left"
            text="Cancel"
            onClick={() => {
              onCancel();
            }}
          />
        </div>
      }
    >
      <div className="p-3">
        <>
          <ChartEditor
            columns={columns}
            setChart={setChart}
            chart={charts?.[index!] ?? null}
          />
        </>
      </div>
    </Section>
  );
}
