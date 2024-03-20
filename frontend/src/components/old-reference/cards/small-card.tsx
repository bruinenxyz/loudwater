"use client";
import { Card, Icon, Spinner, SpinnerSize, Text } from "@blueprintjs/core";

export default function SmallCard({
  title,
  subtitle,
  leftIcon,
  rightAlert,
  listPanel,
  action,
  interactive,
  isLoading,
}: {
  title: string | React.ReactElement;
  subtitle?: string;
  leftIcon?: React.ReactElement;
  rightAlert?: React.ReactElement;
  listPanel?: React.ReactElement;
  action?: () => void;
  interactive?: boolean; // defaults to true
  isLoading?: boolean; // defaults to false
}) {
  if (isLoading) {
    return (
      <Card className="flex flex-row items-center p-2" interactive={false}>
        <div className="flex flex-row items-center w-full space-x-2">
          <div className="w-5 h-5 bp5-skeleton" />
          <div className="w-full h-4 bp5-skeleton" />
        </div>
      </Card>
    );
  }

  return (
    <Card
      className="flex flex-row items-center justify-between p-2"
      interactive={action && interactive !== false} // interactive can be undefined and we want to default to true
      onClick={action && interactive !== false ? action : undefined} // interactive can be undefined and we want to default to true
    >
      <div className="flex flex-col min-w-0">
        <div className="flex flex-row items-center min-w-0">
          <div
            className={`flex flex-row items-center ${
              !!subtitle ? "max-w-3/4" : ""
            }`}
          >
            {leftIcon && <div className="mr-2">{leftIcon}</div>}
            <Text
              className={`font-semibold ${
                action && interactive !== false
                  ? "cursor-pointer"
                  : "cursor-default"
              }`}
              ellipsize={true}
            >
              {title}
            </Text>
          </div>
          {subtitle && (
            <Text
              className={`bp5-text-muted ml-3  ${
                action && interactive !== false
                  ? "cursor-pointer"
                  : "cursor-default"
              }`}
              ellipsize={true}
            >
              {subtitle}
            </Text>
          )}
        </div>
        {listPanel && <>{listPanel}</>}
      </div>
      <div className={`flex flex-row justify-end items-center ml-2`}>
        {rightAlert && <div className="mr-3">{rightAlert}</div>}
        {action && interactive !== false && (
          <Icon className="bp5-text-muted" icon="chevron-right" />
        )}
      </div>
    </Card>
  );
}
