import { GET_DB_RECORD_AUDIT_LOGS_REQUEST } from "./constants";
import { SchemaEntity } from "@d19n/models/dist/schema-manager/schema/schema.entity";


export function getRecordAuditLogs(params: { schema: SchemaEntity, recordId: string }) {
  return {
    type: GET_DB_RECORD_AUDIT_LOGS_REQUEST,
    params,
  }
}

