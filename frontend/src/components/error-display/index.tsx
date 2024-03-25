import React, { ReactElement } from "react";

import {
  Icon,
  IconName,
  MaybeElement,
  NonIdealState,
  NonIdealStateIconSize,
} from "@blueprintjs/core";

export type ErrorDisplayProps = {
  title?: string | ReactElement;
  description?: string | ReactElement;
  icon?: IconName | MaybeElement;
};

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  title,
  description,
  icon = "issue",
}) => {
  return (
    <NonIdealState
      icon={
        <Icon icon={icon} color="red" size={NonIdealStateIconSize.STANDARD} />
      }
      iconSize={NonIdealStateIconSize.STANDARD}
      title={title ? title : "An unexpected error occurred."}
      description={description ? description : "Please try again."}
      layout="vertical"
    />
  );
};
