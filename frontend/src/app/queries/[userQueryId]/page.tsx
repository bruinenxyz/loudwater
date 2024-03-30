"use client";
import Loading from "@/app/loading";
import { ErrorDisplay } from "@/components/error-display";
import QueryEditor from "@/components/query/query-editor";
import { QueryHeader } from "@/components/query/query-header";
import QueryParameters, {
  Parameter,
} from "@/components/query/query-parameters";
import Table from "@/components/table/table";
import {
  useUpdateUserQuery,
  useUserQuery,
  useUserQueryResults,
} from "@/data/use-user-query";
import { Button, Callout } from "@blueprintjs/core";
import * as _ from "lodash";
import React, { useEffect, useState } from "react";

interface UserQueryPageProps {
  params: {
    userQueryId: string;
  };
}

const Page: React.FC<UserQueryPageProps> = ({ params: { userQueryId } }) => {
  const [sqlQuery, setSqlQuery] = useState("");
  const {
    data: userQuery,
    isLoading: isLoadingUserQuery,
    error: userQueryError,
  } = useUserQuery(userQueryId);
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [savedParameters, setSavedParameters] = useState<Parameter[]>([]);

  useEffect(() => {
    setSqlQuery(userQuery?.sql || "");
    setParameters(userQuery?.parameters || []);
  }, [userQuery, setSqlQuery, setParameters]);

  const {
    data: results,
    isLoading: isLoadingResults,
    error: resultsError,
  } = useUserQueryResults(userQueryId, userQuery?.sql, savedParameters);

  const handleSaveQuery = () => {
    setSavedParameters(parameters);
    updateUserQueryTrigger({ sql: sqlQuery, parameters: parameters });
  };

  const { trigger: updateUserQueryTrigger, isMutating: isUpdatingUserQuery } =
    useUpdateUserQuery(userQueryId);

  if (isLoadingUserQuery) {
    return <Loading />;
  }

  if (userQueryError) {
    return (
      <ErrorDisplay
        title="An unexpected error occurred"
        description={userQueryError.message}
      />
    );
  }

  let resultsErrorMessage;
  if (resultsError) {
    // If the backend sent back a specific error message, use that instead of the generic error
    if (resultsError && resultsError.response && resultsError.response.data) {
      const errorData = JSON.parse(resultsError.response.data);
      if (errorData.message) {
        resultsErrorMessage = _.capitalize(errorData.message);
      }
    }
  }

  return (
    <div className="flex flex-col h-full">
      <QueryHeader query={userQuery} />
      <QueryParameters parameters={parameters} setParameters={setParameters} />
      <QueryEditor value={sqlQuery} onChange={setSqlQuery} />
      <div className="flex flex-row items-center">
        <Button
          className="my-2 mr-2 w-fit "
          loading={isUpdatingUserQuery}
          disabled={isLoadingResults || isUpdatingUserQuery}
          onClick={handleSaveQuery}
        >
          Save and run
        </Button>
      </div>
      <Callout
        className="my-2"
        intent="danger"
        title="Error running query"
        hidden={resultsError === undefined}
      >
        {resultsErrorMessage || resultsError?.message}
      </Callout>
      <Table
        results={results}
        isLoadingResults={isLoadingResults}
        resultsError={undefined}
      />
    </div>
  );
};

export default Page;
