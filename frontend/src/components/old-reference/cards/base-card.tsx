"use client";
import React from "react";
import LargeCard from "./large-card";
import SmallCard from "./small-card";

export default function BaseCard({
  size,
  title,
  subtitle,
  leftIcon,
  rightElement,
  rightAlert,
  bottomPanel,
  listPanel,
  action,
  actionButtonTitle,
  interactive,
  isLoading,
}: {
  size: "large" | "small";
  title: string | React.ReactElement;
  subtitle?: string;
  leftIcon?: React.ReactElement;
  rightElement?: React.ReactElement;
  rightAlert?: React.ReactElement;
  bottomPanel?: React.ReactElement;
  listPanel?: React.ReactElement;
  action?: () => void;
  actionButtonTitle?: string;
  interactive?: boolean;
  isLoading?: boolean;
}) {
  switch (size) {
    case "large":
      return (
        <LargeCard
          title={title}
          subtitle={subtitle}
          leftIcon={leftIcon}
          rightElement={rightElement}
          rightAlert={rightAlert}
          bottomPanel={bottomPanel}
          action={action}
          actionButtonTitle={actionButtonTitle}
          interactive={interactive}
          isLoading={isLoading}
        />
      );
    case "small":
      return (
        <SmallCard
          title={title}
          subtitle={subtitle}
          leftIcon={leftIcon}
          rightAlert={rightAlert}
          listPanel={listPanel}
          action={action}
          interactive={interactive}
          isLoading={isLoading}
        />
      );
  }
}
