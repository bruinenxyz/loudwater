import { Colors, Divider, Icon, Popover, Text } from "@blueprintjs/core";

interface PipelineValidationErrorPopoverProps {
  target?: JSX.Element;
  contentTitle?: string;
}

const PipelineValidationErrorPopover = (
  props: PipelineValidationErrorPopoverProps,
) => {
  const { target, contentTitle } = props;

  return (
    <Popover
      content={
        <div className="flex flex-col">
          <div className="flex items-center gap-1 p-1">
            <Icon icon="warning-sign" color={Colors.ORANGE3} size={14} />
            <Text className="bp5-text-small">{contentTitle}</Text>
          </div>
        </div>
      }
      interactionKind="hover"
      placement="top"
    >
      {target || <Icon icon="warning-sign" color={Colors.ORANGE3} />}
    </Popover>
  );
};

export default PipelineValidationErrorPopover;
