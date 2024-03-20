import { Tag, Colors, Tooltip } from "@blueprintjs/core";

export default function RealtimeBadge() {
  return (
    <>
      <Tooltip content="Realtime source: data is up-to-date and allows writeback!">
        <Tag
          className="mx-2 font-medium cursor-help"
          style={{
            backgroundColor: Colors.GREEN5,
            color: Colors.GREEN1,
            fontSize: "13px",
          }}
        >
          Realtime
        </Tag>
      </Tooltip>
    </>
  );
}
