import { Button } from "@blueprintjs/core";
import { useEffect, useState } from "react";
import DisplayChartEditor from "./display-chart-editor";
import {
  Chart,
  ChartIdentifierEnum,
} from "@/definitions/displays/charts/charts";
import { BarChartComponent, LineChartComponent } from "..";
import ScatterPlotComponent from "../scatter-plot/scatter-plot";
import { useUpdateUserQuery } from "@/data/use-user-query";
import { UserQuery } from "@/definitions";

export default function ChartDisplay({
  data,
  userQuery,
}: {
  data: any[];
  userQuery?: UserQuery;
}) {
  const [isAddingChart, setIsAddingChart] = useState<boolean>(false);
  const [charts, setCharts] = useState<Chart[]>(userQuery!.charts);
  const [createdChart, setCreatedChart] = useState<Chart | null>(null);
  const { trigger: updateUserQueryTrigger, isMutating: isUpdatingUserQuery } =
    useUpdateUserQuery(userQuery!.id);
  const columns = Object.keys(data[0]);

  useEffect(() => {
    updateUserQueryTrigger({
      charts: charts,
    });
  }, [charts]);

  function renderChart(chart: Chart, index: number) {
    switch (chart.configuration.chartType) {
      case ChartIdentifierEnum.BarChart:
        return (
          <BarChartComponent
            chartIndex={index}
            charts={charts}
            setCharts={setCharts}
            data={data}
          />
        );
      case ChartIdentifierEnum.LineChart:
        return (
          <LineChartComponent
            chartIndex={index}
            charts={charts}
            setCharts={setCharts}
            data={data}
          />
        );
      case ChartIdentifierEnum.ScatterPlot:
        return (
          <ScatterPlotComponent
            chartIndex={index}
            charts={charts}
            setCharts={setCharts}
            data={data}
          />
        );
      default:
        return <></>;
    }
  }

  function renderCharts() {
    const renderedCharts: JSX.Element[] = [];

    charts.forEach((chart, index) => {
      renderedCharts.push(renderChart(chart, index));
    });

    return renderedCharts;
  }

  return (
    <>
      <div>{renderCharts()}</div>
      {isAddingChart ? (
        <DisplayChartEditor
          columns={columns}
          onSave={() => {
            if (createdChart) {
              setCharts([...charts, createdChart]);
            }
            setIsAddingChart(false);
          }}
          onCancel={() => {
            setIsAddingChart(false);
          }}
          setChart={setCreatedChart}
          isUpdatingUserQuery={isUpdatingUserQuery}
          isSaveable={createdChart != null}
        />
      ) : (
        <Button
          className="justify-center text-md w-fit"
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
