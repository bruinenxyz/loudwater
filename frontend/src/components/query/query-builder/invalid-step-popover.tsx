"use client";
import { Callout, Colors, Icon, Popover, Text } from "@blueprintjs/core";
import * as _ from "lodash";

export default function InvalidStepPopover({ errors }: { errors: any[] }) {
  return (
    <Popover
      content={
        <div className="p-1">
          <Callout
            intent="warning"
            icon="warning-sign"
            title="This step is invalid"
          >
            {_.map(errors, (error: any, index: number) => {
              return (
                <Text key={index}>
                  {index + 1}. {error.message}
                </Text>
              );
            })}
          </Callout>
        </div>
      }
      interactionKind="hover"
      placement="right"
    >
      <div className="flex flex-row items-center p-1 ml-2 border rounded-sm cursor-pointer border-bluprint-border-gray">
        <Icon className="mr-1" icon="warning-sign" color={Colors.ORANGE3} />
        <Text>Invalid step</Text>
      </div>
    </Popover>
  );
}
