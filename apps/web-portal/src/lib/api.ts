const API_BASE = process.env.API_BASE_URL || "http://localhost:8080";

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${path}`);
  }
  return (await res.json()) as T;
}

export type CaseItem = {
  id: number;
  caseNo: string;
  caseType: string;
  courtCode: string;
  tribunalCode: string;
  caseStatus: string;
};

export type TaskItem = {
  id: number;
  taskNo: string;
  caseId: number;
  caseNo: string;
  docType: string;
  partyName: string;
  currentStatus: string;
  legalDeadlineAt: string;
};

export type AttemptItem = {
  id: number;
  taskId: number;
  attemptNo: number;
  channelType: string;
  providerName: string;
  sendStatus: string;
  receiptStatus: string;
  failureCode: string | null;
};

export type StrategyItem = {
  id: number;
  strategyName: string;
  caseType: string;
  channelSequence: string;
  retryMaxTimes: number;
  enabledFlag: boolean;
};

export type EvidenceItem = {
  id: number;
  taskId: number;
  attemptId: number | null;
  evidenceType: string;
  hashSha256: string;
  createdAt: string;
};
