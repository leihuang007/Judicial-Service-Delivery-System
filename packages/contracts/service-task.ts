export type ServiceTaskStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "DELIVERED_PENDING_CONFIRM"
  | "EFFECTIVE"
  | "FAILED_NEED_REMEDY"
  | "REMEDY_IN_PROGRESS"
  | "ARCHIVED";

export interface ServiceTaskSummary {
  id: string;
  caseNo: string;
  partyName: string;
  status: ServiceTaskStatus;
  legalDeadlineAt: string;
}
