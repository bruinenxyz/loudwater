"use client";
import {
  Button,
  Card,
  CardList,
  NonIdealState,
  Section,
  Text,
} from "@blueprintjs/core";
import Link from "next/link";
import AddDatabase from "./add-database";
import Loading from "../loading";
import { ErrorDisplay } from "@/components/error-display";
import { useDatabases } from "@/data/use-database";
import { useEffect, useState } from "react";
import * as _ from "lodash";
import { CleanDatabase } from "@/definitions";

export default function DatabasesList() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const {
    data: databases,
    isLoading: isLoadingDatabases,
    error: databasesError,
    mutate: mutateDatabases,
  } = useDatabases();

  const [filteredDatabases, setFilteredDatabases] = useState<CleanDatabase[]>(
    [],
  );

  useEffect(() => {
    setFilteredDatabases(
      databases?.filter((database) => !database.deleted_at) || [],
    );
  }, [databases]);

  const renderDatabases = () => {
    if (isLoadingDatabases) {
      return <Loading />;
    }

    if (databasesError || !databases) {
      return (
        <ErrorDisplay
          title="Unexpected error"
          description={databasesError?.message}
        />
      );
    }

    if (filteredDatabases && filteredDatabases?.length < 1) {
      return (
        <NonIdealState
          title="No items"
          description={
            <div>You haven&rsquo;t connected any databases yet.</div>
          }
          icon="error"
          action={
            <AddDatabase
              mutateDatabases={mutateDatabases}
              databases={filteredDatabases}
              isOpen={isOpen}
              setIsOpen={setIsOpen}
              displayButton={true}
            />
          }
        />
      );
    }

    return (
      <CardList bordered className="h-full max-h-full overflow-auto">
        {_.map(filteredDatabases, (database: any) => {
          return (
            <Card
              key={database.id}
              className="flex flex-row justify-between"
              interactive
              elevation={0}
            >
              <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                <Text>{database.name}</Text>
                <Text className="bp5-text-muted">{database.schema}</Text>
              </div>
              <div>
                <Link href={`/databases/${database.id}`}>
                  <Button icon="chevron-right" />
                </Link>
              </div>
            </Card>
          );
        })}
      </CardList>
    );
  };

  if (databasesError) {
    return (
      <ErrorDisplay
        title="Unexpected error"
        description={databasesError?.message}
      />
    );
  }

  return (
    <Section
      elevation={0}
      title="Connected Databases"
      className="flex flex-col"
      rightElement={
        <AddDatabase
          mutateDatabases={mutateDatabases}
          databases={filteredDatabases || []}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          displayButton={true}
        />
      }
    >
      {renderDatabases()}
    </Section>
  );
}
