import { MenuDivider, MenuItem, Text } from "@blueprintjs/core";
import {
  useDatabaseSchemas,
  useDatabases,
  useUpdateDatabase,
} from "@/data/use-database";
import AddDatabase from "@/app/databases/add-database";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const DatabaseSelector = ({
  selectedDatabase,
  setSelectedDatabase,
  selectedSchema,
  setSelectedSchema,
}: any) => {
  const {
    data: databases,
    isLoading: isLoadingDatabases,
    error: databasesError,
    mutate: mutateDatabases,
  } = useDatabases();

  const { data: databaseSchemas } = useDatabaseSchemas(selectedDatabase?.id);

  const { trigger: updateDatabase, isMutating: isUpdatingDatabase } =
    useUpdateDatabase(selectedDatabase?.id);

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setSelectedSchema(undefined);
  }, [selectedDatabase]);

  const handleUpdateDatabaseSchema = async (schema: string) => {
    await updateDatabase({
      schema: schema,
    });
    setSelectedSchema(schema);
    setSelectedDatabase({ ...selectedDatabase, schema: schema });

    router.push("/");
  };

  const router = useRouter();
  if (isLoadingDatabases || !databases) {
    return <MenuItem text="loading databases" className="bp5-skeleton" />;
  }
  return (
    <>
      <MenuItem
        text={selectedDatabase ? selectedDatabase.name : "Select a database"}
        popoverProps={{ usePortal: true }}
      >
        {databases.map((db) => (
          <MenuItem
            key={db.id}
            text={db.name}
            roleStructure="listoption"
            onClick={() => setSelectedDatabase(db)}
            selected={selectedDatabase?.id === db.id}
          />
        ))}
        <MenuDivider />
        <MenuItem
          text="Add database"
          roleStructure="listoption"
          intent="success"
          icon="add"
          onClick={() => {
            setIsOpen(true);
          }}
        />
        <MenuItem
          text="Manage databases"
          roleStructure="listoption"
          icon="database"
          onClick={() => {
            router.push("/databases");
          }}
        />
      </MenuItem>
      <AddDatabase
        databases={databases}
        mutateDatabases={mutateDatabases}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        displayButton={false}
      />
      {databaseSchemas && (
        <MenuItem
          text={
            selectedSchema ? (
              <Text className="bp5-text-muted">{selectedSchema}</Text>
            ) : (
              "Select a schema"
            )
          }
          popoverProps={{ usePortal: true }}
        >
          {databaseSchemas?.map((schema) => (
            <MenuItem
              key={schema}
              text={schema}
              roleStructure="listoption"
              onClick={() => handleUpdateDatabaseSchema(schema)}
              selected={selectedSchema === schema}
            />
          ))}
        </MenuItem>
      )}
    </>
  );
};

export default DatabaseSelector;
