import { z } from "zod";

export enum ObjectPropertyTypeEnum {
  string = "string",
  number = "number",
  boolean = "boolean",
  date = "date",
  datetime = "datetime",
  float = "float",
}
export const ObjectPropertyTypeEnumSchema = z.nativeEnum(
  ObjectPropertyTypeEnum,
);

// ENUMS:
export const queryLogicalOperators = ["and", "or", "xor"] as const;
export const FilterLogicalOperatorsEnumSchema = z.enum(["and", "or", "xor"]);
export type FilterLogicalOperators = z.infer<
  typeof FilterLogicalOperatorsEnumSchema
>;

export enum OperatorsEnum {
  equal = "==",
  notEqual = "!=",
  greaterThan = ">",
  lessThan = "<",
  greaterThanOrEqual = ">=",
  lessThanOrEqual = "<=",
  like = "like",
  notLike = "not_like",
  isNull = "is_null",
  isNotNull = "is_not_null",
}
export const OperatorsEnumSchema = z.nativeEnum(OperatorsEnum);
export type Operators = z.infer<typeof OperatorsEnumSchema>;

export const AggregationOperationsEnumSchema = z.enum([
  "sum",
  "count",
  "average",
  "min",
  "max",
]);
export type AggregationOperations = z.infer<
  typeof AggregationOperationsEnumSchema
>;

export enum StepIdentifierEnum {
  Select = "select",
  Aggregate = "aggregate",
  Derive = "derive",
  Relate = "relate",
  Filter = "filter",
  Order = "order",
  Take = "take",
}
export const StepIdentifierEnumSchema = z.nativeEnum(StepIdentifierEnum);
export type StepIdentifier = z.infer<typeof StepIdentifierEnumSchema>;

// STEPS:
// Select Step
export const SelectStepSchema = z.object({
  type: z.literal(StepIdentifierEnum.Select),
  select: z.array(z.object({ name: z.string(), table: z.string() })).nonempty(),
});
export type SelectStep = z.infer<typeof SelectStepSchema>;

// Aggregate Step
export const AggregateStepSchema = z.object({
  type: z.literal(StepIdentifierEnum.Aggregate),
  group: z.array(z.object({ name: z.string(), table: z.string() })),
  operation: AggregationOperationsEnumSchema,
  property: z.string(),
  as: z.string(),
});
export type AggregateStep = z.infer<typeof AggregateStepSchema>;

// Generic condition schema with property, operator, and value
export const ConditionSchema = z.object({
  property: z.string(),
  operator: OperatorsEnumSchema,
  value: z.union([z.string(), z.number(), z.boolean(), z.undefined()]),
});
export type Condition = z.infer<typeof ConditionSchema>;

// Filter Step
export const FilterConditionSchema = ConditionSchema;
export type FilterCondition = z.infer<typeof FilterConditionSchema>;

export const FilterStepSchema = z.object({
  type: z.literal(StepIdentifierEnum.Filter),
  logicalOperator: z.enum(["and", "or", "xor"]),
  conditions: z.array(FilterConditionSchema).nonempty(),
});
export type FilterStep = z.infer<typeof FilterStepSchema>;

// Derive Step
export enum DeriveStepTypeEnum {
  Case = "case",
  Cast = "cast",
  Interpolate = "interpolate",
  Substring = "substring",
  Upper = "upper",
  Lower = "lower",
  Numeric = "numeric",
}
export const DeriveStepTypeSchema = z.nativeEnum(DeriveStepTypeEnum);
export type DeriveStepType = z.infer<typeof DeriveStepTypeSchema>;

// Case Derive Step
export const CaseConditionSchema = ConditionSchema.extend({
  result: z.any(),
});
export type CaseCondition = z.infer<typeof CaseConditionSchema>;

export const DeriveStepCaseSchema = z.object({
  type: z.literal(DeriveStepTypeEnum.Case),
  cases: z.array(CaseConditionSchema).nonempty(),
  default: z.any(),
  propertyType: ObjectPropertyTypeEnumSchema,
});
export type DeriveStepCase = z.infer<typeof DeriveStepCaseSchema>;

// Cast Derive Step
export const DeriveStepCastSchema = z.object({
  type: z.literal(DeriveStepTypeEnum.Cast),
  property: z.string(),
  to: ObjectPropertyTypeEnumSchema,
});
export type DeriveStepCast = z.infer<typeof DeriveStepCastSchema>;

// Interpolate Derive Step
export const DeriveStepInterpolateSchema = z.object({
  type: z.literal(DeriveStepTypeEnum.Interpolate),
  statement: z.string(),
});
export type DeriveStepInterpolate = z.infer<typeof DeriveStepInterpolateSchema>;

// Substring Derive Step
export const DeriveStepSubstringSchema = z.object({
  type: z.literal(DeriveStepTypeEnum.Substring),
  property: z.string(),
  start: z.number().int().positive(),
  length: z.number().int().positive(),
});
export type DeriveStepSubstring = z.infer<typeof DeriveStepSubstringSchema>;

// Upper Derive Step
export const DeriveStepUpperSchema = z.object({
  type: z.literal(DeriveStepTypeEnum.Upper),
  property: z.string(),
});
export type DeriveStepUpper = z.infer<typeof DeriveStepUpperSchema>;

// Lower Derive Step
export const DeriveStepLowerSchema = z.object({
  type: z.literal(DeriveStepTypeEnum.Lower),
  property: z.string(),
});
export type DeriveStepLower = z.infer<typeof DeriveStepLowerSchema>;

// Numeric Derive Step
export const DeriveStepNumericSchema = z.object({
  type: z.literal(DeriveStepTypeEnum.Numeric),
  statement: z.string().nonempty(),
});
export type DeriveStepNumeric = z.infer<typeof DeriveStepNumericSchema>;

// Derive Step
export const DerivePropertySchema = z.object({
  derive: z.discriminatedUnion("type", [
    DeriveStepCaseSchema,
    DeriveStepCastSchema,
    DeriveStepInterpolateSchema,
    DeriveStepLowerSchema,
    DeriveStepSubstringSchema,
    DeriveStepUpperSchema,
    DeriveStepNumericSchema,
  ]),
  as: z.string(),
  description: z.union([z.string(), z.undefined()]),
});
export type DeriveProperty = z.infer<typeof DerivePropertySchema>;

export const DeriveStepSchema = z.object({
  type: z.literal(StepIdentifierEnum.Derive),
  properties: z.array(DerivePropertySchema).nonempty(),
});
export type DeriveStep = z.infer<typeof DeriveStepSchema>;

// Order Step
export const OrderPropertySchema = z.object({
  property: z.string(),
  direction: z.enum(["asc", "desc"]),
});
export type OrderProperty = z.infer<typeof OrderPropertySchema>;

export const OrderStepSchema = z.object({
  type: z.literal(StepIdentifierEnum.Order),
  order: z.array(OrderPropertySchema).nonempty(),
});
export type OrderStep = z.infer<typeof OrderStepSchema>;

// Take Step
export const TakeStepSchema = z.object({
  type: z.literal(StepIdentifierEnum.Take),
  limit: z.number(),
  offset: z.number(),
});
export type TakeStep = z.infer<typeof TakeStepSchema>;

// Relate Step
export const RelateStepSchema = z.object({
  type: z.literal(StepIdentifierEnum.Relate),
  relation: z.string(),
});
export type RelateStep = z.infer<typeof RelateStepSchema>;

// BASE STEP SCHEMA:
export const StepSchema = z.discriminatedUnion("type", [
  SelectStepSchema,
  AggregateStepSchema,
  DeriveStepSchema,
  FilterStepSchema,
  OrderStepSchema,
  TakeStepSchema,
  RelateStepSchema,
]);
export type Step = z.infer<typeof StepSchema>;

export const PipelineSchema = z.object({
  from: z.string(),
  steps: z.array(StepSchema),
});
export type Pipeline = z.infer<typeof PipelineSchema>;

// SCHEMA INFERENCE:
export const InferredSchemaPropertySchema = z.object({
  api_name: z.string(),
  api_path: z.string(),
  type: ObjectPropertyTypeEnumSchema,
  name: z.string(),
  description: z.string(),
  object_definition_id: z.string().optional(),
  relation_name: z.string().optional(), // Name of the relation used to bring the property into the pipeline, only present if the property exists on a relation
});
export type InferredSchemaProperty = z.infer<
  typeof InferredSchemaPropertySchema
>;

// A relation used in a pipeline. Includes the API path to the relation from the base object defintiion and the object definition ID of the related object defintion
export const InferredSchemaRelationSchema = z.object({
  api_path: z.string(),
  object_definition_id: z.string(),
  relation_name: z.string(),
});
export type InferredSchemaRelation = z.infer<
  typeof InferredSchemaRelationSchema
>;

// Includes a list of inferred pipeline output properties and the relations used in the pipeline
export const InferredSchemaSchema = z.object({
  relations: z.array(InferredSchemaRelationSchema),
  properties: z.array(InferredSchemaPropertySchema),
});
export type InferredSchema = z.infer<typeof InferredSchemaSchema>;

export const InferSchemaOutputSuccessSchema = z.object({
  success: z.literal(true),
  data: InferredSchemaSchema,
});
export type InferSchemaOutputSuccess = z.infer<
  typeof InferSchemaOutputSuccessSchema
>;

export const InferSchemaOutputErrorSchema = z.object({
  success: z.literal(false),
  error: z.any(),
});
export type InferSchemaOutputError = z.infer<
  typeof InferSchemaOutputErrorSchema
>;

export const InferSchemaOutputSchema = z.discriminatedUnion("success", [
  InferSchemaOutputSuccessSchema,
  InferSchemaOutputErrorSchema,
]);
export type InferSchemaOutput = z.infer<typeof InferSchemaOutputSchema>;

// STEP VALIDATION:
export const StepValidationOutputSuccessSchema = z.object({
  success: z.literal(true),
  data: StepSchema,
});
export type StepValidationOutputSuccess = z.infer<
  typeof StepValidationOutputSuccessSchema
>;

export const StepValidationOutputErrorSchema = z.object({
  success: z.literal(false),
  error: z.any(),
});
export type StepValidationOutputError = z.infer<
  typeof StepValidationOutputErrorSchema
>;

export const StepValidationOutputSchema = z.discriminatedUnion("success", [
  StepValidationOutputSuccessSchema,
  StepValidationOutputErrorSchema,
]);
export type StepValidationOutput = z.infer<typeof StepValidationOutputSchema>;

export const ValidateStepDtoSchema = z.object({
  step: StepSchema,
  inputSchema: InferredSchemaSchema,
});
export type ValidateStepDto = z.infer<typeof ValidateStepDtoSchema>;

export const CtxIssueSchema = z.object({
  code: z.string(),
  message: z.string(),
  path: z.array(z.string()),
});
export type CtxIssue = z.infer<typeof CtxIssueSchema>;
