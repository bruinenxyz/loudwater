"use client";
import { Chart, ScatterPlot } from "@/definitions/displays/charts/charts";
import { Callout, Section } from "@blueprintjs/core";
import { useEffect, useRef, useState } from "react";

import {
  CartesianGrid,
  Label,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
} from "recharts";
import { ChartMenu } from "../charts-display/chart-menu";
import DisplayChartEditor from "../charts-display/display-chart-editor";

const X_LABEL_OFFSET = -10;
const CHART_HEIGHT = 450;
const CHART_MARGIN = {
  top: 20,
  bottom: -1 * X_LABEL_OFFSET + 15,
  right: 20,
  left: -5,
};

export default function ScatterPlotComponent({
  chartIndex,
  charts,
  setCharts,
  data,
}: {
  chartIndex: number;
  charts: Chart[];
  setCharts: (charts: Chart[]) => void;
  data: any[];
}) {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const [chartWidth, setChartWidth] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const configuration = charts[chartIndex].configuration as ScatterPlot;
  const [chart, setChart] = useState<Chart | null>(null);
  const [errorMessage, setErrorMessage] = useState<JSX.Element | null>(null);
  const columns = Object.keys(data[0]);

  const handleResize = () => {
    if (chartRef.current) {
      const parentWidth = chartRef.current.clientWidth;
      setChartWidth(parentWidth);
    }
  };

  const handleSaveEditedChart = (chart: Chart) => {
    const newCharts = [...charts];
    newCharts[chartIndex] = chart;
    setCharts(newCharts);
    setIsEditing(false);
  };

  useEffect(() => {
    if (data) {
      handleResize();
    }
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (data) {
      handleResize();
      setErrorMessage(renderErrorMessage());
    }
  }, [data]);

  function renderChart() {
    return (
      <div ref={chartRef} className="w-full">
        {!!chartWidth && (
          <ScatterChart
            height={CHART_HEIGHT}
            width={chartWidth}
            margin={CHART_MARGIN}
          >
            {configuration.showGraph && (
              <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
            )}
            <XAxis dataKey={configuration.xAxisKey}>
              <Label offset={X_LABEL_OFFSET} position="insideBottom">
                {configuration.xAxisKey}
              </Label>
            </XAxis>
            <YAxis dataKey={configuration.yAxisKey}>
              <Label offset={20} angle={-90} position="insideLeft">
                {configuration.yAxisKey}
              </Label>
            </YAxis>
            <Scatter name="A school" data={data} fill={configuration.color} />
          </ScatterChart>
        )}
      </div>
    );
  }

  function renderErrorMessage() {
    if (!columns.includes(configuration.xAxisKey)) {
      return (
        <Callout className="m-2" intent="danger" title="Error loading chart">
          {`xAxisKey: Could not find column "${configuration.xAxisKey}".`}
        </Callout>
      );
    }

    if (!columns.includes(configuration.yAxisKey)) {
      return (
        <Callout className="m-2" intent="danger" title="Error loading chart">
          {`yAxisKey: Could not find column "${configuration.yAxisKey}".`}
        </Callout>
      );
    }

    return null;
  }

  return (
    <>
      {isEditing ? (
        <DisplayChartEditor
          index={chartIndex}
          charts={charts}
          setChart={setChart}
          columns={columns}
          onSave={() => handleSaveEditedChart(chart!)}
          onCancel={() => setIsEditing(false)}
          isSaveable={chart != null}
        />
      ) : (
        <Section
          className={`flex-none w-full my-2 rounded-sm`}
          title={charts[chartIndex].title}
          rightElement={
            <ChartMenu
              chartIndex={chartIndex}
              charts={charts}
              setCharts={setCharts}
              setIsChartEditing={setIsEditing}
            />
          }
        >
          {errorMessage ?? renderChart()}
        </Section>
      )}
    </>
  );
}
