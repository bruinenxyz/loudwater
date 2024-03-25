import * as z from "zod";
import { DisplayIdentifierEnum } from "../enum";

export const MapType = z.enum(["points", "lines"]);

export enum MapIdentifierEnum {
  Points = "points",
  Lines = "lines",
}

export const MapIdentifierSchema = z.nativeEnum(MapIdentifierEnum);
export type MapIdentifier = z.infer<typeof MapIdentifierSchema>;

export const PointsMapSchema = z.object({
  mapType: z.literal(MapIdentifierEnum.Points),
  latitudeKey: z.string(),
  longitudeKey: z.string(),
  color: z.string().optional(),
  icon: z.string().optional(),
  titleKey: z.string().optional(),
  descriptionKey: z.string().optional(),
});
export type PointsMap = z.infer<typeof PointsMapSchema>;

export const LinesMapSchema = z.object({
  mapType: z.literal(MapIdentifierEnum.Lines),
});
export type LinesMap = z.infer<typeof LinesMapSchema>;

export const MapConfigurationSchema = z.discriminatedUnion("mapType", [
  PointsMapSchema,
  LinesMapSchema,
]);

export type MapConfiguration = z.infer<typeof MapConfigurationSchema>;

export const MapSchema = z.object({
  displayType: z.literal(DisplayIdentifierEnum.Map),
  title: z.string(),
  description: z.string().optional(),
  configuration: MapConfigurationSchema,
});

export type Map = z.infer<typeof MapSchema>;
