"use client";
import { Pipeline } from "@/definitions/pipeline";
import {
  Button,
  Callout,
  Divider,
  Drawer,
  NonIdealState,
  Tab,
  Tabs,
  Text,
} from "@blueprintjs/core";
import Loading from "@/app/loading";
import { ErrorDisplay } from "@/components/error-display";
import QueryHeader from "@/components/query/query-header";
import QueryBuilder from "@/components/query/query-builder/query-builder";
import QueryEditor from "@/components/query/query-editor";
import QueryParameters, {
  Parameter,
} from "@/components/query/query-parameters";
import Table from "@/components/table/table";
import OverwriteSQLDialog from "@/components/query/overwrite-sql-dialog";
import {
  useParsePipeline,
  usePipelineSchema,
  useUpdateUserQuery,
  useUserQuery,
  useUserQueryResults,
} from "@/data/use-user-query";
import { convertToCSV } from "@/utils/csv-converter";
import { toSnakeCase } from "@/utils/strings";
import React, { useEffect, useRef, useState } from "react";
import * as _ from "lodash";
import ChartDisplay from "@/components/charts/charts-display/chart-display";
import { convertToColumns } from "@/utils/convert-to-columns";

interface UserQueryPageProps {
  params: {
    userQueryId: string;
  };
}

enum QueryTabEnum {
  SQL = "sql",
  PIPELINE = "pipeline",
}

enum QueryDisplayEnum {
  TABLE = "table",
  CHART = "chart",
}

const Page: React.FC<UserQueryPageProps> = ({ params: { userQueryId } }) => {
  const [queryTab, setQueryTab] = useState<QueryTabEnum>(QueryTabEnum.SQL);
  const [queryDislayTab, setQueryDisplayTab] = useState<QueryDisplayEnum>(
    QueryDisplayEnum.TABLE,
  );
  const [sqlQuery, setSqlQuery] = useState<string>("");
  const [pipeline, setPipeline] = useState<Pipeline>({ from: "", steps: [] });
  const [pipelineSQLDivergence, setPipelineSQLDivergence] =
    useState<boolean>(false);
  const {
    data: userQuery,
    isLoading: isLoadingUserQuery,
    error: userQueryError,
  } = useUserQuery(userQueryId);
  // TODO: likely want to refactor this to account for stages changes vs saved changes
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [savedParameters, setSavedParameters] = useState<Parameter[]>([]);
  const [queryTime, setQueryTime] = useState<number>(0);

  useEffect(() => {
    setSqlQuery(userQuery?.sql || "");
    setParameters(userQuery?.parameters || []);
  }, [userQuery, setSqlQuery, setParameters]);

  const {
    data: results,
    trigger: runQuery,
    isMutating: isLoadingResults,
    error: resultsError,
  } = useUserQueryResults(userQueryId, userQuery?.sql, savedParameters);

  useEffect(() => {
    if (isLoadingResults) {
      const timer = setInterval(() => {
        setQueryTime((prevTime) => prevTime + 100);
      }, 100);

      return () => {
        clearInterval(timer);
      };
    }
  }, [isLoadingResults]);

  const {
    data: pipelineSchema,
    isLoading: isLoadingPipelineSchema,
    error: pipelineSchemaError,
  } = usePipelineSchema(pipeline);

  const handleDownloadCSV = () => {
    const csvData = convertToCSV(results.rows);
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = toSnakeCase(userQuery?.name) + ".csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const { trigger: updateUserQueryTrigger, isMutating: isUpdatingUserQuery } =
    useUpdateUserQuery(userQueryId);

  const { trigger: parsePipelineTrigger, isMutating: isParsingPipeline } =
    useParsePipeline();

  useEffect(() => {
    if (userQuery) {
      setSqlQuery(userQuery?.sql || "");
      if (userQuery.pipeline) {
        setPipeline(userQuery.pipeline);
      }
    }
  }, [userQuery, setSqlQuery, setPipeline]);

  async function handleSaveQuery() {
    setSavedParameters(parameters);
    setQueryTime(0);
    if (queryTab === QueryTabEnum.SQL) {
      await updateUserQueryTrigger({ sql: sqlQuery, parameters: parameters });
      await runQuery();
    } else {
      const pipelineSQL = await parsePipelineTrigger(pipeline);
      if (pipelineSQL.sql === sqlQuery) {
        updateUserQueryTrigger({ pipeline: pipeline, parameters: parameters });
      } else {
        setPipelineSQLDivergence(true);
      }
    }
  }

  function getQueryTimerMessage(): string {
    const queryTimeInSeconds = queryTime / 1000;
    if (isLoadingResults) {
      return `Running in ${queryTimeInSeconds} seconds...`;
    } else {
      if (resultsError) return `Failed in ${queryTimeInSeconds} seconds.`;
      if (results) return `Succeeded in ${queryTimeInSeconds} seconds.`;
    }

    return "";
  }

  if (isLoadingUserQuery || isLoadingPipelineSchema) {
    return <Loading />;
  }

  if (userQueryError || pipelineSchemaError) {
    return (
      <ErrorDisplay
        title="An unexpected error occurred"
        description={userQueryError || pipelineSchemaError}
      />
    );
  }

  let resultsErrorMessage = "";
  if (resultsError) {
    // If the backend sent back a specific error message, use that instead of the generic error
    if (resultsError && resultsError.response && resultsError.response.data) {
      const errorData = JSON.parse(resultsError.response.data);
      if (errorData.message) {
        resultsErrorMessage = _.capitalize(errorData.message);
      }
    }
  }

  function renderTabContent() {
    return (
      <>
        {queryDislayTab === QueryDisplayEnum.TABLE ? (
          <>
            <Callout
              className="mb-2"
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
          </>
        ) : (
          <ChartDisplay data={results.rows} />
        )}
      </>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <QueryHeader query={userQuery} />
      <div className="flex flex-row flex-1 overflow-auto ">
        <div className="flex flex-col w-1/2 h-full px-1 pb-[1px]">
          <Divider className="mt-2 mb-0" />
          <div className="flex flex-row items-center justify-between mt-1 mb-2">
            <Tabs
              animate
              selectedTabId={queryTab}
              id="section-tabs"
              key="horizontal"
              renderActiveTabPanelOnly={true}
              onChange={(tabId: QueryTabEnum) => setQueryTab(tabId)}
            >
              <Tab
                id={QueryTabEnum.SQL}
                title={
                  <Button className="bp5-minimal" icon="code" text="SQL" />
                }
              />
              <Tab
                id={QueryTabEnum.PIPELINE}
                title={
                  <Button
                    className="bp5-minimal"
                    icon="form"
                    text="Query Builder"
                  />
                }
              />
            </Tabs>
            <div className="flex flex-row items-center">
              <Button
                className="mt-1 mr-1 w-fit"
                loading={isUpdatingUserQuery || isLoadingResults}
                disabled={
                  isLoadingResults ||
                  isUpdatingUserQuery ||
                  (queryTab === QueryTabEnum.PIPELINE &&
                    !pipelineSchema!.success)
                }
                onClick={handleSaveQuery}
              >
                Save and run
              </Button>
              <Button
                className="mt-1 mr-1 w-fit"
                disabled={isLoadingResults || isUpdatingUserQuery}
                onClick={handleDownloadCSV}
              >
                Download as CSV
              </Button>
              <OverwriteSQLDialog
                userQueryId={userQueryId}
                pipeline={pipeline}
                isDivergent={pipelineSQLDivergence}
                setIsDivergent={setPipelineSQLDivergence}
                runQuery={runQuery}
              />
            </div>
          </div>
          {queryTab === QueryTabEnum.SQL ? (
            <>
              <QueryParameters
                parameters={parameters}
                setParameters={setParameters}
              />
              <Text className="mb-1"> {getQueryTimerMessage()} </Text>
              <QueryEditor value={sqlQuery} onChange={setSqlQuery} />
            </>
          ) : (
            <QueryBuilder
              className="flex flex-col h-full p-2 overflow-y-auto gap-y-2"
              pipeline={pipeline}
              setPipeline={setPipeline}
            />
          )}
        </div>
        <div className="flex flex-col w-1/2 h-full pr-1 pt-2 pb-[1px]">
          <Tabs
            className="mt-1 mb-2"
            animate
            selectedTabId={queryDislayTab}
            id="section-tabs"
            key="horizontal"
            renderActiveTabPanelOnly={true}
            onChange={(tabId: QueryDisplayEnum) => setQueryDisplayTab(tabId)}
          >
            <Tab
              id={QueryDisplayEnum.TABLE}
              title={
                <Button
                  className="bp5-minimal"
                  icon="panel-table"
                  text="Table"
                />
              }
            />
            <Tab
              id={QueryDisplayEnum.CHART}
              title={
                <Button className="bp5-minimal" icon="chart" text="Charts" />
              }
            />
          </Tabs>
          {!results ? (
            <NonIdealState icon="issue" title="No results" />
          ) : (
            renderTabContent()
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
