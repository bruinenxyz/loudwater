"use client";
import {
  Button,
  Card,
  Divider,
  Elevation,
  Spinner,
  SpinnerSize,
  Text,
} from "@blueprintjs/core";

export default function LargeCard({
  title,
  subtitle,
  leftIcon,
  rightElement,
  rightAlert,
  bottomPanel,
  action,
  actionButtonTitle,
  interactive,
  isLoading,
}: {
  title: string | React.ReactElement;
  subtitle?: string;
  leftIcon?: React.ReactElement;
  rightElement?: React.ReactElement;
  rightAlert?: React.ReactElement;
  bottomPanel?: React.ReactElement;
  action?: () => void;
  actionButtonTitle?: string;
  interactive?: boolean; // defaults to false
  isLoading?: boolean; // defaults to false
}) {
  if (isLoading) {
    return (
      <Card
        className="flex flex-col p-2"
        interactive={false}
        elevation={Elevation.ZERO}
      >
        <div className="flex flex-col space-y-2">
          <div className="flex flex-row items-center w-full space-x-2">
            <div className="w-5 h-5 bp5-skeleton" />
            <div className="w-full h-4 bp5-skeleton" />
          </div>
          <div className="w-3/4 h-3 bp5-skeleton" />
          <div className="w-1/2 h-3 bp5-skeleton" />
        </div>
      </Card>
    );
  }

  return (
    <Card
      className="flex flex-col p-2"
      interactive={!!interactive} // interactive can be undefined and we want to default to false
      onClick={action && !!interactive ? action : undefined} // interactive can be undefined and we want to default to false
      elevation={Elevation.ZERO}
    >
      <div className="flex flex-row justify-between">
        <div className={`flex flex-row min-w-0`}>
          {leftIcon && <div className="mr-2">{leftIcon}</div>}
          <div className="min-w-0">
            <Text
              className="mb-0 cursor-default bp5-heading"
              ellipsize={true}
              tagName="h6"
            >
              {title}
            </Text>
            {subtitle && (
              <Text className="cursor-default bp5-text-muted" ellipsize={true}>
                {subtitle}
              </Text>
            )}
          </div>
        </div>
        <div className="pl-2">
          <div className="flex flex-row items-center justify-end mr-2">
            {rightAlert && <div className="mr-3">{rightAlert}</div>}
            {rightElement && <div>{rightElement}</div>}
          </div>
          {!bottomPanel && action && !interactive && (
            <div className="flex flex-col items-end justify-end mt-2">
              <Button
                minimal={true}
                intent="primary"
                rightIcon="caret-right"
                className="py-0 h-fit"
                onClick={action}
                text={actionButtonTitle}
              />
            </div>
          )}
        </div>
      </div>
      {bottomPanel && (
        <div className="flex flex-col flex-grow max-w-full">
          <Divider className="my-2" />
          <div className="flex flex-row items-center justify-between w-full h-full">
            {bottomPanel}
            {action && !interactive && (
              <div className="flex flex-row items-end justify-end">
                <Button
                  minimal={true}
                  intent="primary"
                  rightIcon="caret-right"
                  onClick={action}
                  text={actionButtonTitle}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
