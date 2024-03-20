import { QuerySummary, QueryColumnSummary } from "@/definitions/query";
import { mapColumnTypeToPropertyType } from "@/utils/column-type-convert";
import { Text, SectionCard, Tag, ProgressBar } from "@blueprintjs/core";

export type QuerySummaryProps = {
  querySummary: QuerySummary;
};

export const QuerySummaryComponent: React.FC<QuerySummaryProps> = ({
  querySummary,
}) => {
  const renderQueryColumnSummary = (queryColumnSummary: QueryColumnSummary) => {
    const {
      column_name,
      column_type,
      avg,
      std,
      min,
      max,
      null_percentage,
      approx_unique,
      count,
    } = queryColumnSummary;

    const isNumberColumn = avg !== null;
    const uniquePercentage = approx_unique / count;
    const nullPercentage = parseFloat(null_percentage);
    const formattedColumnType = mapColumnTypeToPropertyType(column_type);

    if (isNumberColumn) {
      return (
        <SectionCard padded>
          <Text tagName="span" className="font-bold">
            {column_name}
          </Text>
          <Tag className="ml-2" minimal>
            {formattedColumnType}
          </Tag>

          <div className="grid grid-cols-2 mt-3">
            <Text tagName="span" className="font-bold">
              {(nullPercentage * 100).toFixed(2)}% Null
            </Text>
            <div className="flex items-center">
              <ProgressBar
                className="bp5-intent-primary"
                animate={false}
                stripes={false}
                value={nullPercentage}
              />
            </div>
            <Text tagName="span" className="font-bold">
              Min
            </Text>
            <span>{min}</span>
            <Text tagName="span" className="font-bold">
              Max
            </Text>
            <span>{max}</span>
          </div>
        </SectionCard>
      );
    }

    return (
      <SectionCard padded>
        <Text tagName="span" className="font-bold">
          {column_name}
        </Text>
        <Tag className="ml-2" minimal>
          {formattedColumnType}
        </Tag>

        <div className="grid grid-cols-2 mt-3">
          <Text tagName="span" className="font-bold">
            {(uniquePercentage * 100).toFixed(2)}% Unique
          </Text>
          <div className="flex items-center">
            <ProgressBar
              className="bp5-intent-primary"
              animate={false}
              stripes={false}
              value={uniquePercentage}
            />
          </div>
          <Text tagName="span" className="font-bold">
            {(nullPercentage * 100).toFixed(2)}% Null
          </Text>
          <div className="flex items-center">
            <ProgressBar
              className="bp5-intent-primary"
              animate={false}
              stripes={false}
              value={nullPercentage}
            />
          </div>
        </div>
      </SectionCard>
    );
  };

  return (
    <>
      {querySummary.map((queryColumnSummary: QueryColumnSummary) =>
        renderQueryColumnSummary(queryColumnSummary),
      )}
    </>
  );
};
