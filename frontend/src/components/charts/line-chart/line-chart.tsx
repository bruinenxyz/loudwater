"use client";
import { useEffect, useRef, useState } from "react";

import { CartesianGrid, Label, Line, LineChart, XAxis, YAxis } from "recharts";

import { ErrorDisplay } from "@/components/error-display";
import { useQuery } from "@/data/use-query";
import { LineChart as LineChartType } from "@/definitions/displays/charts/charts";
import { Pipeline, PartialPipeline } from "@/definitions/pipeline";
import { Spinner, SpinnerSize } from "@blueprintjs/core";

const X_LABEL_OFFSET = -10;
const CHART_HEIGHT = 450;
const CHART_MARGIN = {
  top: 20,
  bottom: -1 * X_LABEL_OFFSET + 15,
  right: 20,
  left: -5,
};

export default function LineChartComponent({
  configuration,
  pipeline,
}: {
  configuration: LineChartType;
  pipeline: Pipeline | PartialPipeline;
}) {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const [chartWidth, setChartWidth] = useState<number | null>(null);
  const { data: data, isLoading: isLoading, error: error } = useQuery(pipeline);

  const handleResize = () => {
    if (chartRef.current) {
      const parentWidth = chartRef.current.clientWidth;
      setChartWidth(parentWidth);
    }
  };

  useEffect(() => {
    if (!isLoading) {
      handleResize();
    }
  }, [isLoading]);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center mx-3 my-4">
        <Spinner size={SpinnerSize.STANDARD} />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorDisplay title="Unexpected error" description={error.message} />
    );
  }

  return (
    <div ref={chartRef} className="w-full">
      {!!chartWidth && (
        <LineChart
          height={CHART_HEIGHT}
          width={chartWidth}
          margin={CHART_MARGIN}
          data={data}
        >
          <Line
            type="monotone"
            dataKey={configuration.lineKey}
            stroke={configuration.color}
            strokeWidth={3}
          />
          {configuration.showGraph && (
            <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
          )}
          <XAxis dataKey={configuration.xAxisKey}>
            <Label offset={X_LABEL_OFFSET} position="insideBottom">
              {configuration.xAxisKey}
            </Label>
          </XAxis>
          <YAxis>
            <Label offset={20} angle={-90} position="insideLeft">
              {configuration.lineKey}
            </Label>
          </YAxis>
        </LineChart>
      )}
    </div>
  );
}
