"use client";

import { Spinner, SpinnerSize } from "@blueprintjs/core";

export default function Loading() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <Spinner size={SpinnerSize.STANDARD} />
    </div>
  );
}
