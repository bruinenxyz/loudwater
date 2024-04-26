import { Button, Divider, Section } from "@blueprintjs/core";
import { useState } from "react";
import DisplayChartCreator from "./display-chart-creator";
import {
  Chart,
  ChartIdentifierEnum,
  ChartSchema,
} from "@/definitions/displays/charts/charts";
import { BarChartComponent, LineChartComponent } from "..";
import ScatterPlotComponent from "../scatter-plot/scatter-plot";

export default function ChartDisplay({ data }: { data: any[] }) {
  const [isAddingChart, setIsAddingChart] = useState<boolean>(false);
  const [charts, setCharts] = useState<Chart[]>([]);
  const columns = Object.keys(data[0]);

  function addToCharts(chart: Chart | null) {
    if (!chart) return;

    setCharts([...charts, chart]);
  }

  function renderChart(chart: Chart){
    switch (chart.configuration.chartType) {
      case ChartIdentifierEnum.BarChart:
        return (
          <BarChartComponent
            configuration={chart.configuration}
            data={data}
          />
        );
      case ChartIdentifierEnum.LineChart:
        return (
          <LineChartComponent
            configuration={chart.configuration}
            data={data}
          />
        );
      case ChartIdentifierEnum.ScatterPlot:
        return (
          <ScatterPlotComponent
            configuration={chart.configuration}
            data={data}
          />
        );
      default:
        return <></>;
    }
  }

  function renderCharts() {
    const renderedCharts = [];

    for (const chart of charts) {
        const renderedChart = (
          <Section
            className={`flex-none w-full my-2 rounded-sm`}
            title={chart.title}
          >
            {renderChart(chart)}
          </Section>
        );

        renderedCharts.push(
          renderedChart
        );
    }
    
    return renderedCharts;
  }

  return (
    <>
      <div className="flex flex-col">
        {renderCharts()}
      </div>
      {isAddingChart ? (
        <DisplayChartCreator
          columns={columns}
          setIsAddingChart={setIsAddingChart}
          addToCharts={addToCharts}
        />
      ) : (
        <Button
          className="justify-center ml-2 text-md w-fit"
          text="Add chart"
          icon="plus"
          onClick={() => {
            setIsAddingChart(true);
          }}
        />
      )}
    </>
  );
}
