import { notFound } from "next/navigation";
import { ConsoleShell } from "@/components/console-shell";
import { apiGet, CaseItem, TaskItem } from "@/lib/api";
import { requireSession, toCourtCodesQuery } from "@/lib/access-control";
import { AppLocale, isValidLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionary";

type AuditItem = {
  id: number;
  actionType: string;
  actor: string;
  resourceType: string;
  resourceId: string;
  actionTime: string;
};

export default async function AuditPage({ params }: { params: { locale: string } }) {
  if (!isValidLocale(params.locale)) {
    notFound();
  }

  const locale = params.locale as AppLocale;
  const dict = getDictionary(locale);
  const session = requireSession(locale);
  const courtCodes = toCourtCodesQuery(session);
  const scopedCases = await apiGet<CaseItem[]>(`/api/cases?courtCodes=${courtCodes}`).catch(() => []);
  const scopedTasks = await apiGet<TaskItem[]>(`/api/tasks?courtCodes=${courtCodes}`).catch(() => []);
  const scopedTaskIds = new Set(scopedTasks.map((t) => t.id));
  const scopedCaseIds = new Set(scopedCases.map((c) => c.id));
  const logs = await apiGet<AuditItem[]>("/api/audit/recent").catch(() => []);
  const filteredLogs = logs.filter((l) => {
    const resourceId = Number(l.resourceId);
    if (l.resourceType === "CASE") {
      return scopedCaseIds.has(resourceId);
    }
    if (l.resourceType === "SERVICE_TASK" || l.resourceType === "TASK_EVALUATION") {
      return scopedTaskIds.has(resourceId);
    }
    return true;
  });

  return (
    <ConsoleShell locale={locale} dict={dict} active="audit" title={dict.nav.audit} subtitle="关键写操作与状态变更按时间可追踪">
      <section className="panel">
        <div className="card-list">
          {filteredLogs.map((l) => (
            <div className="card-row" key={l.id}>
              <span>{l.actionType} / {l.resourceType}#{l.resourceId}</span>
              <span>{l.actionTime}</span>
            </div>
          ))}
          {filteredLogs.length === 0 && <div className="card-row"><span>{dict.common.empty}</span></div>}
        </div>
      </section>
    </ConsoleShell>
  );
}
