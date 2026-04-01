import { notFound } from "next/navigation";
import { ConsoleShell } from "@/components/console-shell";
import { apiGet, CaseItem, EvidenceItem, TaskItem } from "@/lib/api";
import { applyCaseScope, applyTaskScope, requireSession } from "@/lib/access-control";
import { AppLocale, isValidLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionary";

export default async function EvidencePage({ params }: { params: { locale: string } }) {
  if (!isValidLocale(params.locale)) {
    notFound();
  }

  const locale = params.locale as AppLocale;
  const dict = getDictionary(locale);
  const session = requireSession(locale);
  const allCases = await apiGet<CaseItem[]>("/api/cases").catch(() => []);
  const allTasks = await apiGet<TaskItem[]>("/api/tasks").catch(() => []);
  const scopedCases = applyCaseScope(allCases, session);
  const scopedTasks = applyTaskScope(allTasks, scopedCases);
  const evidenceGroups = await Promise.all(
    scopedTasks.slice(0, 20).map((t) => apiGet<EvidenceItem[]>(`/api/evidence?taskId=${t.id}`).catch(() => []))
  );
  const evidence = evidenceGroups.flat();

  return (
    <ConsoleShell locale={locale} dict={dict} active="evidence" title={dict.nav.evidence} subtitle="哈希存证、送达回执与归档凭证统一展示">
      <section className="panel">
        <div className="card-list">
          {evidence.map((e) => (
            <div className="card-row" key={e.id}>
              <span>task#{e.taskId} / {e.evidenceType}</span>
              <span>{e.hashSha256.slice(0, 16)}...</span>
            </div>
          ))}
          {evidence.length === 0 && <div className="card-row"><span>{dict.common.empty}</span></div>}
        </div>
      </section>
    </ConsoleShell>
  );
}
