export enum SchemaAssociationCardinalityTypes {
  ONE_TO_ONE = "ONE_TO_ONE",
  ONE_TO_MANY = "ONE_TO_MANY",
  MANY_TO_ONE = "MANY_TO_ONE",
  MANY_TO_MANY = "MANY_TO_MANY"
}

export const SCHEMA_ASSOCIATION_CARDINALITY_TYPES_KEYS: Array<string> = Object.values(SchemaAssociationCardinalityTypes);
