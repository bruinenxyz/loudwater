import { ObjectPropertyTypeEnum } from "@/definitions";

export const mapColumnTypeToPropertyType = (
  ColumnType: string,
): ObjectPropertyTypeEnum => {
  switch (ColumnType) {
    case "BIGINT":
    case "HUGEINT":
    case "INTEGER":
    case "SMALLINT":
    case "TINYINT":
    case "UBIGINT":
    case "UINTEGER":
    case "USMALLINT":
    case "UTINYINT":
      return ObjectPropertyTypeEnum.number;
    case "BOOLEAN":
      return ObjectPropertyTypeEnum.boolean;
    case "DATE":
      return ObjectPropertyTypeEnum.date;
    case "DATETIME":
    case "TIMESTAMP":
    case "TIME":
    case "TIMESTAMP WITH TIME ZONE":
      return ObjectPropertyTypeEnum.datetime;
    case "DOUBLE":
    case "DECIMAL":
    case "REAL":
      return ObjectPropertyTypeEnum.float;
    default:
      return ObjectPropertyTypeEnum.string;
  }
};
