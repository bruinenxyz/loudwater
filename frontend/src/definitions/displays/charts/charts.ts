import * as z from "zod";
import { DisplayIdentifierEnum } from "../enum";

export const ChartType = z.enum([
  "bar_chart",
  "scatter_plot",
  "line_chart",
  "table",
  "map",
]);

export enum ChartIdentifierEnum {
  BarChart = "bar_chart",
  ScatterPlot = "scatter_plot",
  LineChart = "line_chart",
  // Table = "table",
  // Map = "map",
}
export const ChartIdentifierSchema = z.nativeEnum(ChartIdentifierEnum);
export type ChartIdentifier = z.infer<typeof ChartIdentifierSchema>;

export const BarChartSchema = z.object({
  chartType: z.literal(ChartIdentifierEnum.BarChart),
  barKey: z.string(),
  xAxisKey: z.string(),
  color: z.string().default("gray"),
  showGraph: z.boolean().default(false),
});
export type BarChart = z.infer<typeof BarChartSchema>;

export const ScatterPlotSchema = z.object({
  chartType: z.literal(ChartIdentifierEnum.ScatterPlot),
  xAxisKey: z.string(),
  yAxisKey: z.string(),
  color: z.string().default("gray"),
  showGraph: z.boolean().default(false),
});
export type ScatterPlot = z.infer<typeof ScatterPlotSchema>;

export const LineChartSchema = z.object({
  chartType: z.literal(ChartIdentifierEnum.LineChart),
  lineKey: z.string(),
  xAxisKey: z.string(),
  color: z.string().default("gray"),
  showGraph: z.boolean().default(false),
});
export type LineChart = z.infer<typeof LineChartSchema>;

export const MapMarkersSchema = z.object({
  latitudeKey: z.string(),
  longitudeKey: z.string(),
  color: z.string().optional(),
});
export type MapMarkers = z.infer<typeof MapMarkersSchema>;

export const MapLinesSchema = z.object({
  originLatitudeKey: z.string(),
  originLongitudeKey: z.string(),
  destinationLatitudeKey: z.string(),
  destinationLongitudeKey: z.string(),
  geodesic: z.boolean().optional(),
  color: z.string().optional(),
});
export type MapLines = z.infer<typeof MapLinesSchema>;

export const ChartConfigurationSchema = z.discriminatedUnion("chartType", [
  LineChartSchema,
  BarChartSchema,
  ScatterPlotSchema,
]);

export type ChartConfiguration = z.infer<typeof ChartConfigurationSchema>;

export const ChartSchema = z.object({
  displayType: z.literal(DisplayIdentifierEnum.Chart),
  title: z.string(),
  description: z.string().optional(),
  configuration: ChartConfigurationSchema,
});

export type Chart = z.infer<typeof ChartSchema>;
