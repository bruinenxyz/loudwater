"use client";
import { CleanDatabase, Relation } from "@/definitions";
import { Card, CardList, Icon, Text } from "@blueprintjs/core";
import Loading from "@/app/loading";
import { ErrorDisplay } from "@/components/error-display";
import RelationCard from "@/components/relation/relation-card";
import CreateRelation from "@/components/relation/create-relation";
import EditRelation from "@/components/relation/edit-relation";
import DeleteRelation from "@/components/relation/delete-relation";
import { useRelations } from "@/data/use-relations";
import { useState } from "react";
import * as _ from "lodash";

export default function DatabaseRelations({
  database,
}: {
  database: CleanDatabase;
}) {
  const [createRelationToggle, setCreateRelationToggle] =
    useState<boolean>(false);
  const [editRelation, setEditRelation] = useState<Relation | null>(null);
  const [deleteRelation, setDeleteRelation] = useState<Relation | null>(null);
  const {
    data: relations,
    isLoading: isLoadingRelations,
    error: relationsError,
  } = useRelations(database.id);

  if (isLoadingRelations) {
    return <Loading />;
  }

  if (relationsError) {
    return <ErrorDisplay description={relationsError.message} />;
  }

  return (
    <CardList className="h-full overflow-y-auto">
      <Card
        className="cursor-pointer"
        onClick={() => setCreateRelationToggle(true)}
      >
        <div className="flex flex-row items-center gap-1 ml-1">
          <Icon icon="new-object" intent="success" />
          <Text className="text-success">New Relation</Text>
        </div>
      </Card>
      {_.map(relations, (relation: Relation) => (
        <RelationCard
          key={relation.id}
          relation={relation}
          setEditRelation={setEditRelation}
          setDeleteRelation={setDeleteRelation}
        />
      ))}
      <CreateRelation
        selectedDatabase={database}
        isOpen={createRelationToggle}
        setIsOpen={setCreateRelationToggle}
      />
      <EditRelation relation={editRelation} setRelation={setEditRelation} />
      <DeleteRelation
        relation={deleteRelation}
        setRelation={setDeleteRelation}
      />
    </CardList>
  );
}
