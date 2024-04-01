import SquareIcon from "@/components/icon/square-icon";
import { HydratedTable } from "@/definitions";
import { Button, IconName, MenuItem } from "@blueprintjs/core";
import { ItemRenderer, Select } from "@blueprintjs/select";

interface SingleTableSelectorProps {
  className?: string;
  items: HydratedTable[];
  selected: HydratedTable | null;
  onTableSelect: (table: HydratedTable) => void;
}

export default function SingleTableSelector({
  className,
  items,
  selected,
  onTableSelect,
}: SingleTableSelectorProps) {
  const renderTableItem: ItemRenderer<HydratedTable> = (
    table,
    { handleClick, modifiers },
  ) => (
    <MenuItem
      key={table.id}
      icon={<SquareIcon icon={table.icon as IconName} color={table.color} />}
      text={table.name}
      onClick={handleClick}
      selected={selected?.id === table.id}
    />
  );

  return (
    <Select<HydratedTable>
      className={className}
      items={items}
      itemRenderer={renderTableItem}
      onItemSelect={onTableSelect}
    >
      <Button
        rightIcon="double-caret-vertical"
        icon={
          selected ? (
            <SquareIcon
              icon={selected.icon as IconName}
              color={selected.color}
            />
          ) : undefined
        }
      >
        {selected ? selected.name : "Select a table"}
      </Button>
    </Select>
  );
}
