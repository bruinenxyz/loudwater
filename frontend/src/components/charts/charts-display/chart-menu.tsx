import { Chart } from "@/definitions/displays/charts/charts";
import { Button, Menu, MenuItem, Popover } from "@blueprintjs/core";

export function ChartMenu({
  chartIndex,
  charts,
  setCharts,
  setIsChartEditing,
}: {
  chartIndex: number;
  charts: Chart[];
  setCharts: (charts: Chart[]) => void;
  setIsChartEditing: (isChartEditing: boolean) => void;
}) {
  return (
    <Popover
      placement="bottom-start"
      content={
        <Menu className="flex flex-col">
          <MenuItem
            icon="edit"
            text="Edit chart"
            onClick={() => {
              setIsChartEditing(true);
            }}
          />
          <MenuItem
            icon="trash"
            text="Delete chart"
            onClick={() => {
              //Delete chart with index out of charts
              setCharts(charts.filter((_, i) => i !== chartIndex));
            }}
          />
        </Menu>
      }
    >
      <Button
        className="ml-3"
        alignText="left"
        rightIcon="caret-down"
        text="Options"
      />
    </Popover>
  );
}
