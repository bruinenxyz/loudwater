"use client";
import { ScatterPlot } from "@/definitions/displays/charts/charts";
import { useEffect, useRef, useState } from "react";

import {
  CartesianGrid,
  Label,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
} from "recharts";

const X_LABEL_OFFSET = -10;
const CHART_HEIGHT = 450;
const CHART_MARGIN = {
  top: 20,
  bottom: -1 * X_LABEL_OFFSET + 15,
  right: 20,
  left: -5,
};

export default function ScatterPlotComponent({
  configuration,
  data,
}: {
  configuration: ScatterPlot;
  data: any[];
}) {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const [chartWidth, setChartWidth] = useState<number | null>(null);

  const handleResize = () => {
    if (chartRef.current) {
      const parentWidth = chartRef.current.clientWidth;
      setChartWidth(parentWidth);
    }
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
