import Link from "next/link";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ConsoleShell } from "@/components/console-shell";
import { AppLocale, isValidLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionary";
import { apiGet, AttemptItem, CaseItem, EvidenceItem, TaskItem } from "@/lib/api";
import { applyCaseScope, applyTaskScope, requireSession } from "@/lib/access-control";
import { displayDocType, displayTaskStatus } from "@/lib/cn-format";
import { postApi } from "@/lib/server-api";

type Props = {
  params: { locale: string; id: string };
};

export default async function TaskDetailPage({ params }: Props) {
  if (!isValidLocale(params.locale)) {
    notFound();
  }

  const locale = params.locale as AppLocale;
  const isZh = locale === "zh-CN";
  const dict = getDictionary(locale);
  const session = requireSession(locale);
  const taskId = Number(params.id);

  const task = await apiGet<TaskItem>(`/api/tasks/${taskId}`).catch(() => null);
  if (!task) {
    notFound();
  }

  const allCases = await apiGet<CaseItem[]>("/api/cases").catch(() => []);
  const scopedCases = applyCaseScope(allCases, session);
  const visibleTaskIds = new Set(applyTaskScope([task], scopedCases).map((t) => t.id));
  if (!visibleTaskIds.has(task.id)) {
    notFound();
  }

  const attempts = await apiGet<AttemptItem[]>(`/api/channels/tasks/${taskId}/attempts`).catch(() => []);
  const evidence = await apiGet<EvidenceItem[]>(`/api/evidence?taskId=${taskId}`).catch(() => []);

  async function evaluateAction() {
    "use server";
    await postApi(`/api/orchestration/tasks/${taskId}/evaluate`);
    revalidatePath(`/${locale}/tasks/${taskId}`);
    revalidatePath(`/${locale}/tasks`);
    revalidatePath(`/${locale}`);
  }

  async function reportAction() {
    "use server";
    await postApi(`/api/orchestration/tasks/${taskId}/report`);
    revalidatePath(`/${locale}/tasks/${taskId}`);
    revalidatePath(`/${locale}/evidence`);
  }

  async function archiveAction() {
    "use server";
    await postApi(`/api/orchestration/tasks/${taskId}/archive`);
    revalidatePath(`/${locale}/tasks/${taskId}`);
    revalidatePath(`/${locale}/tasks`);
  }

  return (
    <ConsoleShell
      locale={locale}
      dict={dict}
      active="tasks"
      title={`${dict.nav.tasks} #${task.taskNo}`}
      subtitle={isZh ? "办理动作与证据链同屏可见" : "Actions and evidence chain in one view"}
    >
      <section className="dual-grid">
        <article className="panel">
          <h3>{isZh ? "任务信息" : "Task Information"}</h3>
          <div className="card-list">
            <div className="card-row"><span>{isZh ? "案号" : "Case No."}</span><span>{task.caseNo}</span></div>
            <div className="card-row"><span>{isZh ? "文书类型" : "Document Type"}</span><span>{displayDocType(task.docType, locale)}</span></div>
            <div className="card-row"><span>{isZh ? "当事人" : "Party"}</span><span>{task.partyName}</span></div>
            <div className="card-row"><span>{isZh ? "当前状态" : "Current Status"}</span><span className="tag">{displayTaskStatus(task.currentStatus, locale)}</span></div>
            <div className="card-row"><span>{isZh ? "法定截止" : "Legal Deadline"}</span><span>{new Date(task.legalDeadlineAt).toLocaleString(isZh ? "zh-CN" : "en-US")}</span></div>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
            <form action={evaluateAction}><button className="primary-btn btn-inline" type="submit">{isZh ? "判定状态" : "Evaluate"}</button></form>
            <form action={reportAction}><button className="primary-btn btn-inline" type="submit">{isZh ? "生成报告" : "Generate Report"}</button></form>
            <form action={archiveAction}><button className="primary-btn btn-inline" type="submit">{isZh ? "归档任务" : "Archive"}</button></form>
            <Link href={`/${locale}/tasks`} className="ghost-btn">{isZh ? "返回任务列表" : "Back to Tasks"}</Link>
          </div>
        </article>

        <article className="panel">
          <h3>{isZh ? "送达尝试" : "Delivery Attempts"}</h3>
          <div className="card-list">
            {attempts.map((a) => (
              <div className="card-row" key={a.id}>
                <span>#{a.attemptNo} {a.channelType} / {a.providerName}</span>
                <span className="tag">{isZh && a.receiptStatus === "DELIVERED" ? "已送达" : isZh && a.receiptStatus === "UNDELIVERED" ? "未送达" : a.receiptStatus}</span>
              </div>
            ))}
            {attempts.length === 0 && <div className="card-row">{dict.common.empty}</div>}
          </div>
        </article>
      </section>

      <section className="panel">
        <h3>{isZh ? "证据记录" : "Evidence"}</h3>
        <div className="card-list">
          {evidence.map((e) => (
            <div className="card-row" key={e.id}>
              <span>{e.evidenceType} / {isZh ? "尝试#" : "attempt#"}{e.attemptId ?? "-"}</span>
              <span>{e.hashSha256.slice(0, 20)}...</span>
            </div>
          ))}
          {evidence.length === 0 && <div className="card-row">{dict.common.empty}</div>}
        </div>
      </section>
    </ConsoleShell>
  );
}
