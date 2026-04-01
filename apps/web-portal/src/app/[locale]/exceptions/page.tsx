import { notFound } from "next/navigation";
import { ConsoleShell } from "@/components/console-shell";
import { apiGet, CaseItem, TaskItem } from "@/lib/api";
import { applyCaseScope, applyTaskScope, requireSession } from "@/lib/access-control";
import { AppLocale, isValidLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionary";

type ExceptionItem = {
  id: number;
  taskId: number;
  level: string;
  code: string;
  status: string;
  note: string;
};

export default async function ExceptionsPage({ params }: { params: { locale: string } }) {
  if (!isValidLocale(params.locale)) {
    notFound();
  }

  const locale = params.locale as AppLocale;
  const dict = getDictionary(locale);
  const session = requireSession(locale);
  const allCases = await apiGet<CaseItem[]>("/api/cases").catch(() => []);
  const allTasks = await apiGet<TaskItem[]>("/api/tasks").catch(() => []);
  const scopedCases = applyCaseScope(allCases, session);
  const scopedTaskIds = new Set(applyTaskScope(allTasks, scopedCases).map((t) => t.id));
  const tickets = await apiGet<ExceptionItem[]>("/api/orchestration/exceptions/open").catch(() => []);
  const filteredTickets = tickets.filter((t) => scopedTaskIds.has(t.taskId));

  return (
    <ConsoleShell locale={locale} dict={dict} active="exceptions" title={dict.nav.exceptions} subtitle="逾期、退回、失败任务集中办理">
      <section className="panel">
        <div className="card-list">
          {filteredTickets.map((t) => (
            <div className="card-row" key={t.id}>
              <span>task#{t.taskId} / {t.level} / {t.code}</span>
              <span className="tag">{t.status}</span>
            </div>
          ))}
          {filteredTickets.length === 0 && <div className="card-row"><span>{dict.common.empty}</span></div>}
        </div>
      </section>
    </ConsoleShell>
  );
}
