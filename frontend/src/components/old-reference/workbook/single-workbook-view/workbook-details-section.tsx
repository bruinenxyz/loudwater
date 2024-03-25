import Loading from "@/app/loading";
import { ErrorDisplay } from "@/components/error-display";
import { QuerySummaryComponent } from "@/components/old-reference/query-summary";
import { useValidatePipelineAndWorkbook } from "@/data/use-pipeline";
import { Section, SectionCard } from "@blueprintjs/core";
import { Workbook } from "@/definitions";
import { Text } from "@blueprintjs/core";
import { useWorkbookSummary } from "@/data/use-workbook";

export type WorkbookDetailsSectionProps = {
  workbookId: string;
  workbook: Workbook;
};

export const WorkbookDetailsSection: React.FC<WorkbookDetailsSectionProps> = ({
  workbookId,
  workbook,
}) => {
  const { data, isLoading, error } = useWorkbookSummary(workbookId);
  const { data: schema, error: schemaError } =
    useValidatePipelineAndWorkbook(workbook);
  const workbookError =
    schemaError || (!schema?.success && schema?.error.issues[0]);

  const renderDetails = () => {
    if (error || workbookError) {
      return (
        <ErrorDisplay
          title="Cannot load Workbook details"
          description={
            workbookError ? (
              <div>
                <Text>The workbook is invalid.</Text>
                <Text>{workbookError.message}</Text>
              </div>
            ) : (
              error.message
            )
          }
        />
      );
    }

    if (isLoading || !data) {
      return <Loading />;
    }

    return (
      <SectionCard className="overflow-auto">
        <QuerySummaryComponent querySummary={data} />
      </SectionCard>
    );
  };

  return (
    <Section elevation={0} title="Details" className="flex flex-col">
      {renderDetails()}
    </Section>
  );
};
