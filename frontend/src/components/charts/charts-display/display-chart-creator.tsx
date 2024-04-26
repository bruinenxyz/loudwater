"use client";
import { Chart } from "@/definitions/displays/charts/charts";
import { Button, Divider, Section, Text } from "@blueprintjs/core";
import ChartCreator from "./chart-creator/chart-creator";
import Loading from "@/app/loading";
import { ErrorDisplay } from "@/components/error-display";
import { NewStepSelection } from "@/components/old-reference/workbook";
import { useState } from "react";
import * as _ from "lodash";

export default function DisplayChartCreator({
  index,
  setIsAddingChart,
  addToCharts,
  columns,
}: {
  index?: number;
  addToCharts: (charts: Chart | null) => void;
  setIsAddingChart: (isAddingChart: boolean) => void;
  columns: any[];
}) {
  const [chart, setChart] = useState<Chart | null>(null);

  return (
    <Section
      className="flex-none w-full mt-2 rounded-sm"
      title={<Text className="text-xl">Chart</Text>}
      rightElement={
        <div className="flex flex-row">
          <Button
            alignText="left"
            disabled={!chart}
            text="Add chart"
            onClick={() => {
              addToCharts(chart);
              setIsAddingChart(false);
            }}
          />
          <Button
            className="ml-2"
            alignText="left"
            text="Cancel"
            onClick={() => {
              setIsAddingChart(false);
            }}
          />
        </div>
      }
    >
      <div className="p-3">
        <>
          <ChartCreator columns={columns} setChart={setChart} />
        </>
      </div>
    </Section>
  );
}
