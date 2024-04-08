"use client";
import { Relation } from "@/definitions";
import {
  Button,
  Callout,
  Dialog,
  DialogBody,
  DialogFooter,
  Divider,
  Icon,
  IconName,
  Tag,
  Text,
} from "@blueprintjs/core";
import SquareIcon, { SquareIconSize } from "../icon/square-icon";
import { ErrorDisplay } from "../error-display";
import { useDeleteRelation } from "@/data/use-relations";
import { mutate } from "swr";
import { useTable } from "@/data/use-tables";
import Loading from "@/app/loading";

export default function DeleteRelation({
  relation,
  setRelation,
}: {
  relation: Relation | null;
  setRelation: (relation: Relation | null) => void;
}) {
  const { isMutating, trigger: deleteRelation } = useDeleteRelation(
    relation ? relation.id : undefined,
  );
  const {
    data: table1,
    isLoading: isLoadingTable1,
    error: table1Error,
  } = useTable(relation?.table_1);
  const {
    data: table2,
    isLoading: isLoadingTable2,
    error: table2Error,
  } = useTable(relation?.table_2);
  const {
    data: joinTable,
    isLoading: isLoadingJoinTable,
    error: joinTableError,
  } = useTable(relation?.join_table ?? undefined);

  async function submitDelete() {
    await deleteRelation();
    mutate(`/relations/db/${relation!.database_id}`);
    setRelation(null);
  }

  function getRelationIcon(): IconName {
    switch (relation!.type) {
      case "many_to_many":
        return "many-to-many" as IconName;
      case "one_to_many":
        return "one-to-many" as IconName;
      case "one_to_one":
      default:
        return "one-to-one" as IconName;
    }
  }

  function renderDialogContent() {
    if (
      table1Error ||
      table2Error ||
      (joinTableError && relation!.type === "many_to_many")
    ) {
      return (
        <DialogBody>
          <ErrorDisplay
            description={table1Error || table2Error || joinTableError}
          />
        </DialogBody>
      );
    } else if (isLoadingTable1 || isLoadingTable2 || isLoadingJoinTable) {
      return (
        <DialogBody>
          <Loading />
        </DialogBody>
      );
    } else if (isMutating) {
      return (
        <DialogBody>
          <div className="flex flex-col items-center gap-2">
            <Loading />
            <Text>Deleting relation...</Text>
          </div>
        </DialogBody>
      );
    } else if (
      !table1 ||
      !table2 ||
      (!joinTable && relation!.type === "many_to_many")
    ) {
      return null;
    } else {
      return (
        <>
          <DialogBody>
            <div className="flex flex-col gap-1">
              <div className="flex flex-row items-center gap-1 ">
                <Tag
                  className="py-1 "
                  minimal
                  icon={
                    <SquareIcon
                      icon={table1!.icon as IconName}
                      color={table1!.color}
                      size={SquareIconSize.SMALL}
                    />
                  }
                >
                  <div className="flex flex-row items-center gap-1">
                    <Text className="font-bold text-md">{table1!.name}</Text>
                    <Text className="font-normal text-md">
                      {relation!.column_1}
                    </Text>
                  </div>
                </Tag>
                <Icon icon={getRelationIcon()} color="gray" />
                <Tag
                  className="py-1 "
                  minimal
                  icon={
                    <SquareIcon
                      icon={table2!.icon as IconName}
                      color={table2!.color}
                      size={SquareIconSize.SMALL}
                    />
                  }
                >
                  <div className="flex flex-row items-center gap-1">
                    <Text className="font-bold text-md">{table2!.name}</Text>
                    <Text className="font-normal text-md">
                      {relation!.column_2}
                    </Text>
                  </div>
                </Tag>
              </div>
              {relation!.type === "many_to_many" && joinTable && (
                <div className="flex flex-row items-center gap-2 ">
                  <Text className="ml-1">via</Text>
                  <Tag
                    className="py-1 "
                    minimal
                    icon={
                      <SquareIcon
                        icon={joinTable.icon as IconName}
                        color={joinTable.color}
                        size={SquareIconSize.SMALL}
                      />
                    }
                  >
                    <div className="flex flex-row items-center gap-1">
                      <Text className="font-bold text-md">
                        {joinTable.name}
                      </Text>
                      <Text className="font-normal text-md">
                        {relation!.join_column_1}
                      </Text>
                      <Icon icon="many-to-many" color="gray" />
                      <Text className="font-normal text-md">
                        {relation!.join_column_2}
                      </Text>
                    </div>
                  </Tag>
                </div>
              )}
            </div>
            <Divider className="my-2" />
            <Callout
              intent="warning"
              icon="warning-sign"
              title="Relation deletion is permanent"
            >
              To confirm deletion, please click &quot;Delete&quot; below.
            </Callout>
          </DialogBody>
          <DialogFooter
            actions={
              <Button
                intent="danger"
                text="Delete"
                onClick={() => submitDelete()}
              />
            }
          />
        </>
      );
    }
  }

  return (
    <Dialog
      isOpen={relation !== null}
      isCloseButtonShown
      title="Delete relation"
      onClose={() => {
        setRelation(null);
      }}
    >
      {renderDialogContent()}
    </Dialog>
  );
}
