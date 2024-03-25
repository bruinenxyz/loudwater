import { ItemRenderer, Select } from "@blueprintjs/select";
import { MenuItem, Button } from "@blueprintjs/core";
import { OperatorsSchema, Operators } from "@/definitions/query";
import _ from "lodash";

export default function OperatorSelector({
  className,
  disabled,
  selected,
  setSelected,
  setValueType,
  setPropertyB,
}: {
  className?: string;
  disabled?: boolean;
  selected: Operators | "";
  setSelected: any;
  setValueType: any;
  setPropertyB: any;
}) {
  const operators = _.values(OperatorsSchema.enum);

  const renderComparisonOperator: ItemRenderer<any> = (
    operator: Operators,
    { handleClick, modifiers },
  ) => {
    return (
      <MenuItem
        roleStructure="listoption"
        selected={selected === operator}
        shouldDismissPopover={true}
        text={operator.replace(/_/g, " ")}
        onClick={handleClick}
      />
    );
  };

  const selectComparisonOperator = (operator: Operators) => {
    if (selected === operator) {
      setSelected("");
    } else {
      setSelected(operator);
    }
    if (
      OperatorsSchema.enum.isNull === operator ||
      OperatorsSchema.enum.isNotNull === operator
    ) {
      setValueType("");
      setPropertyB(null);
    }
  };

  return (
    <Select
      className={className}
      disabled={disabled ?? false}
      items={operators}
      itemRenderer={renderComparisonOperator}
      filterable={false}
      onItemSelect={selectComparisonOperator}
      noResults={
        <MenuItem
          disabled={true}
          text="No results."
          roleStructure="listoption"
        />
      }
    >
      <Button
        text={selected ? selected.replace(/_/g, " ") : "Operator"}
        disabled={disabled ?? false}
        rightIcon="double-caret-vertical"
      />
    </Select>
  );
}
