import { OverlayToaster, Position } from "@blueprintjs/core";

/** Singleton toaster instance. Create separate instances for different options. */
export const AppToaster = OverlayToaster.createAsync({
  position: Position.BOTTOM_RIGHT,
});
