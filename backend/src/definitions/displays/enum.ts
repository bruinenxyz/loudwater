import * as z from "zod";
export const DisplayType = z.enum(["chart", "map"]);

export enum DisplayIdentifierEnum {
  Chart = "chart",
  Map = "map",
}
export const DisplayIdentifierSchema = z.nativeEnum(DisplayIdentifierEnum);
export type DisplayIdentifier = z.infer<typeof DisplayIdentifierSchema>;
