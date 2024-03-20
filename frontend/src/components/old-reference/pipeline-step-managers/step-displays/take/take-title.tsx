"use client";
import { TakeStep } from "@/definitions/pipeline";
import { ButtonGroup, Divider, Text } from "@blueprintjs/core";

export default function TakeTitle({ step }: { step: TakeStep }) {
  return (
    <ButtonGroup
      minimal={true}
      vertical={false}
      className="flex flex-row items-center gap-2 ml-3"
    >
      <div className="flex flex-row items-center">
        <Text className="text-base font-normal">limit</Text>
        <Text className="ml-2 font-bold">{step.limit}</Text>
      </div>
      <Divider className="h-3.5" />
      <div className="flex flex-row items-center">
        <Text className="text-base font-normal">offset</Text>
        <Text className="ml-2 font-bold">{step.offset}</Text>
      </div>
    </ButtonGroup>
  );
}
