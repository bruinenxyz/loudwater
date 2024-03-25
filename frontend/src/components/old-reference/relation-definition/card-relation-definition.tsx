import { useRouter } from "next/navigation";

import { useRelation } from "@/data/use-relation";
import { Card, H6, Icon, IconSize } from "@blueprintjs/core";

import { SmallObjectDefinition } from "../object-definition";
import Loading from "@/app/loading";
import { ErrorDisplay } from "../../error-display";

interface CardRelationDefinitionProps {
  id: string;
}

const CardRelationDefinition = (props: CardRelationDefinitionProps) => {
  const { data: relationDefinition, isLoading, error } = useRelation(props.id);
  const router = useRouter();

  if (isLoading) {
    return <Loading />;
  }

  if (error || !relationDefinition) {
    return (
      <ErrorDisplay title="Cannot load relation" description={error.message} />
    );
  }

  return (
    <Card
      className="py-2 m-1"
      interactive
      elevation={1}
      onClick={() =>
        router.push(`/ontology/relation-definition/${relationDefinition.id}`)
      }
    >
      <H6>
        {relationDefinition.name_1} - {relationDefinition.name_2}
      </H6>
      <div className="flex items-center mt-2 space-x-2 row">
        <SmallObjectDefinition id={relationDefinition.object_definition_id_1} />
        <Icon
          size={IconSize.STANDARD}
          icon={relationDefinition.type}
          color="gray"
        />
        <SmallObjectDefinition id={relationDefinition.object_definition_id_2} />
      </div>
    </Card>
  );
};

export default CardRelationDefinition;
