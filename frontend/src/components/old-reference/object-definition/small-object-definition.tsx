import { useObjectDefinition } from "@/data/use-object-definition";
import { Button, Icon, IconName, IconSize, Tag } from "@blueprintjs/core";
import SquareIcon, { SquareIconSize } from "../../icon/square-icon";
import { useRouter } from "next/navigation";

interface SmallObjectDefinitionProps {
  id: string;
  href?: string;
}

const SmallObjectDefinition = (props: SmallObjectDefinitionProps) => {
  const { data: objectDefinition, isLoading } = useObjectDefinition(props.id);
  const router = useRouter();

  if (!objectDefinition || isLoading) return null;
  return (
    <div
      className={`flex flex-row items-center ${
        props.href ? "cursor-pointer" : ""
      }`}
      onClick={props.href ? () => router.push(props.href!) : () => null}
    >
      <SquareIcon
        icon={(objectDefinition.icon as IconName) || "cube"}
        color={objectDefinition.color || "gray"}
        size={SquareIconSize.STANDARD}
        className="mr-2"
      />
      <b>{objectDefinition.name}</b>
    </div>
  );
};
export default SmallObjectDefinition;
