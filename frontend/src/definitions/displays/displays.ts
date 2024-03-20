import * as z from "zod";
import { ChartSchema } from "./charts/charts";

export const DisplayConfigSchema = z.discriminatedUnion("displayType", [
  ChartSchema,
]);

export type DisplayConfig = z.infer<typeof DisplayConfigSchema>;
