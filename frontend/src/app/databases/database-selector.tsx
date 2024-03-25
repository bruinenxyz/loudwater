import React, { useState } from "react";
import { H6, Menu, MenuDivider, MenuItem } from "@blueprintjs/core";
import { useSelectedDatabase } from "@/stores";
import { useDatabases } from "@/data/use-database";
import AddDatabase from "@/app/databases/add-database";
import { useRouter } from "next/navigation";
const DatabaseSelector = ({ selectedDatabase, setSelectedDatabase }: any) => {
  const {
    data: databases,
    isLoading: isLoadingDatabases,
    error: databasesError,
    mutate: mutateDatabases,
  } = useDatabases();

  const [isOpen, setIsOpen] = useState(false);
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
    </>
  );
};

export default DatabaseSelector;
