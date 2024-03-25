"use client";

import { Icon, NonIdealState, NonIdealStateIconSize } from "@blueprintjs/core";

export default function Error() {
  return (
    <NonIdealState
      icon={<Icon icon="error" size={NonIdealStateIconSize.STANDARD} />}
      iconSize={NonIdealStateIconSize.STANDARD}
      title="An unexpected error occurred."
      description="Please try again."
      layout="vertical"
      className="flex items-center justify-center h-screen"
    />
  );
}
