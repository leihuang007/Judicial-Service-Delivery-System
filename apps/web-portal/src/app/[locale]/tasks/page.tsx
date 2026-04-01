import { notFound } from "next/navigation";
import Link from "next/link";
import { ConsoleShell } from "@/components/console-shell";
import { apiGet, AttemptItem, CaseItem, TaskItem } from "@/lib/api";
import { applyCaseScope, applyTaskScope, requireSession } from "@/lib/access-control";
import { displayDocType, displayTaskStatus, isZhLocale } from "@/lib/cn-format";
import { AppLocale, isValidLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionary";

export default async function TasksPage({
  params,
  searchParams
}: {
  params: { locale: string };
  searchParams?: { status?: string; q?: string; page?: string };
}) {
  if (!isValidLocale(params.locale)) {
    notFound();
  }

  const locale = params.locale as AppLocale;
  const dict = getDictionary(locale);
  const session = requireSession(locale);
  const allTasks = await apiGet<TaskItem[]>("/api/tasks").catch(() => []);
  const allCases = await apiGet<CaseItem[]>("/api/cases").catch(() => []);
  const scopedCases = applyCaseScope(allCases, session);
  const tasks = applyTaskScope(allTasks, scopedCases);
  const status = searchParams?.status?.trim() || "";
  const q = searchParams?.q?.trim().toLowerCase() || "";
  const page = Math.max(1, Number(searchParams?.page || "1"));
  const pageSize = 10;
  const isZh = isZhLocale(locale);

  const filtered = tasks.filter((t) => {
    const statusMatch = !status || t.currentStatus === status;
    const keyword = `${t.taskNo} ${t.caseNo} ${t.partyName} ${t.docType}`.toLowerCase();
    const qMatch = !q || keyword.includes(q);
    return statusMatch && qMatch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageNum = Math.min(page, totalPages);
  const pageItems = filtered.slice((pageNum - 1) * pageSize, pageNum * pageSize);

  return (
    <ConsoleShell
      locale={locale}
      dict={dict}
      active="tasks"
      title={dict.nav.tasks}
      subtitle={isZh ? "任务状态、截止时限与送达尝试一体化查看" : "Unified task status, deadlines, and attempts"}
    >
      <section className="panel">
        <form className="filter-row" method="get">
          <input name="q" defaultValue={q} placeholder={isZh ? "案号/任务号/当事人" : "Case No./Task No./Party"} />
          <select name="status" defaultValue={status}>
            <option value="">{isZh ? "全部状态" : "All Status"}</option>
            <option value="PENDING">{displayTaskStatus("PENDING", locale)}</option>
            <option value="IN_PROGRESS">{displayTaskStatus("IN_PROGRESS", locale)}</option>
            <option value="EFFECTIVE">{displayTaskStatus("EFFECTIVE", locale)}</option>
            <option value="FAILED_NEED_REMEDY">{displayTaskStatus("FAILED_NEED_REMEDY", locale)}</option>
            <option value="ARCHIVED">{displayTaskStatus("ARCHIVED", locale)}</option>
          </select>
          <button className="primary-btn btn-inline" type="submit">{isZh ? "筛选" : "Filter"}</button>
        </form>
      </section>

      <section className="panel">
        <div className="card-list">
          {pageItems.map((t) => (
            <TaskRow task={t} locale={locale} key={t.id} />
          ))}
          {pageItems.length === 0 && <div className="card-row"><span>{dict.common.empty}</span></div>}
        </div>

        <div className="pager-row">
          <Link href={`/${locale}/tasks?page=${Math.max(1, pageNum - 1)}&status=${status}&q=${encodeURIComponent(q)}`}>{isZh ? "上一页" : "Prev"}</Link>
          <span>{isZh ? `第 ${pageNum} / ${totalPages} 页` : `Page ${pageNum} / ${totalPages}`}</span>
          <Link href={`/${locale}/tasks?page=${Math.min(totalPages, pageNum + 1)}&status=${status}&q=${encodeURIComponent(q)}`}>{isZh ? "下一页" : "Next"}</Link>
        </div>
      </section>
    </ConsoleShell>
  );
}

async function TaskRow({ task, locale }: { task: TaskItem; locale: string }) {
  const isZh = isZhLocale(locale);
  const attempts = await apiGet<AttemptItem[]>(`/api/channels/tasks/${task.id}/attempts`).catch(() => []);

  return (
    <div className="card-row" style={{ display: "grid", gap: 6 }}>
      <div>
        <strong>{task.taskNo}</strong> / {displayDocType(task.docType, locale)} / {displayTaskStatus(task.currentStatus, locale)}
        <Link href={`/${locale}/tasks/${task.id}`} style={{ marginLeft: 12, color: "var(--primary)" }}>{isZh ? "办理" : "Open"}</Link>
      </div>
      <div className="subtitle">{task.partyName} - {isZh ? "截止" : "deadline"}: {new Date(task.legalDeadlineAt).toLocaleString(isZh ? "zh-CN" : "en-US")}</div>
      <div className="subtitle">{isZh ? `送达尝试: ${attempts.length}` : `Attempts: ${attempts.length}`}</div>
    </div>
  );
}
