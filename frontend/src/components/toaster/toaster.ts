import { OverlayToaster, Position } from "@blueprintjs/core";

/** Singleton toaster instance. Create separate instances for different options. */
export const AppToaster = (container?: HTMLElement) =>
  OverlayToaster.createAsync(
    {
      position: Position.BOTTOM_RIGHT,
    },
    { container: container },
  );
