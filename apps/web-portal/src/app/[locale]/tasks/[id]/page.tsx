import Link from "next/link";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ConsoleShell } from "@/components/console-shell";
import { AppLocale, isValidLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionary";
import { apiGet, AttemptItem, CaseItem, EvidenceItem, TaskEventItem, TaskItem } from "@/lib/api";
import { applyTaskScope, requireSession, toCourtCodesQuery } from "@/lib/access-control";
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
  const courtCodes = toCourtCodesQuery(session);

  const task = await apiGet<TaskItem>(`/api/tasks/${taskId}`).catch(() => null);
  if (!task) {
    notFound();
  }

  const scopedCases = await apiGet<CaseItem[]>(`/api/cases?courtCodes=${courtCodes}`).catch(() => []);
  const visibleTaskIds = new Set(applyTaskScope([task], scopedCases).map((t) => t.id));
  if (!visibleTaskIds.has(task.id)) {
    notFound();
  }

  const attempts = await apiGet<AttemptItem[]>(`/api/channels/tasks/${taskId}/attempts`).catch(() => []);
  const evidence = await apiGet<EvidenceItem[]>(`/api/evidence?taskId=${taskId}`).catch(() => []);
  const events = await apiGet<TaskEventItem[]>(`/api/tasks/${taskId}/events`).catch(() => []);
  const isOverdue = new Date(task.legalDeadlineAt).getTime() < Date.now() && task.currentStatus !== "EFFECTIVE" && task.currentStatus !== "ARCHIVED";

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

  async function dispatchAction(formData: FormData) {
    "use server";
    const channelType = String(formData.get("channelType") || "SMS").trim().toUpperCase();
    const receiver = String(formData.get("receiver") || "").trim();
    const content = String(formData.get("content") || "").trim();
    await postApi("/api/channels/dispatch", {
      taskId,
      channelType,
      receiver,
      content
    });
    revalidatePath(`/${locale}/tasks/${taskId}`);
    revalidatePath(`/${locale}/tasks`);
    revalidatePath(`/${locale}/evidence`);
  }

  async function callbackAction(formData: FormData) {
    "use server";
    const attemptId = Number(formData.get("attemptId") || "0");
    const channelType = String(formData.get("channelType") || "sms").trim().toLowerCase();
    const receiptStatus = String(formData.get("receiptStatus") || "DELIVERED").trim().toUpperCase();
    await postApi(`/api/channels/callbacks/${channelType}`, {
      attemptId,
      receiptStatus,
      failureCode: receiptStatus === "UNDELIVERED" ? "DELIVERY_FAILED" : null,
      failureMessage: receiptStatus === "UNDELIVERED" ? "Manual callback indicates delivery failed." : null
    });
    revalidatePath(`/${locale}/tasks/${taskId}`);
    revalidatePath(`/${locale}/tasks`);
  }

  return (
    <ConsoleShell
      locale={locale}
      dict={dict}
      active="tasks"
      title={`${dict.nav.tasks} #${task.taskNo}`}
      subtitle={isZh ? "流程驾驶舱: 调度、回执、判定、报告、归档" : "Flow cockpit: dispatch, receipt, evaluate, report, archive"}
    >
      <section className="panel task-hero-panel">
        <div className="task-hero-head">
          <div>
            <h3>{isZh ? "任务流程驾驶舱" : "Task Flow Cockpit"}</h3>
            <p className="subtitle">{task.caseNo} / {task.partyName}</p>
          </div>
          <div className="task-hero-badges">
            <span className={`hero-badge ${isOverdue ? "danger" : ""}`}>{isOverdue ? (isZh ? "已逾期" : "Overdue") : (isZh ? "时限正常" : "On Time")}</span>
            <span className="hero-badge">{displayTaskStatus(task.currentStatus, locale)}</span>
          </div>
        </div>
        <div className="workflow-steps">
          {[
            "PENDING",
            "IN_PROGRESS",
            "FAILED_NEED_REMEDY",
            "EFFECTIVE",
            "ARCHIVED"
          ].map((step, idx) => {
            const order = ["PENDING", "IN_PROGRESS", "FAILED_NEED_REMEDY", "EFFECTIVE", "ARCHIVED"];
            const currentIdx = order.indexOf(task.currentStatus);
            const stepIdx = order.indexOf(step);
            const state = stepIdx < currentIdx ? "completed" : stepIdx === currentIdx ? "active" : "";
            return (
              <div className={`workflow-step ${state}`} key={step}>
                <div className="step-dot">{idx + 1}</div>
                <div>{displayTaskStatus(step, locale)}</div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="dual-grid">
        <article className="panel task-command-panel">
          <h3>{isZh ? "任务信息" : "Task Information"}</h3>
          <div className="card-list">
            <div className="card-row"><span>{isZh ? "案号" : "Case No."}</span><span>{task.caseNo}</span></div>
            <div className="card-row"><span>{isZh ? "文书类型" : "Document Type"}</span><span>{displayDocType(task.docType, locale)}</span></div>
            <div className="card-row"><span>{isZh ? "当事人" : "Party"}</span><span>{task.partyName}</span></div>
            <div className="card-row"><span>{isZh ? "当前状态" : "Current Status"}</span><span className="tag">{displayTaskStatus(task.currentStatus, locale)}</span></div>
            <div className="card-row"><span>{isZh ? "法定截止" : "Legal Deadline"}</span><span>{new Date(task.legalDeadlineAt).toLocaleString(isZh ? "zh-CN" : "en-US")}</span></div>
          </div>

          <div className="action-buttons" style={{ marginTop: 14 }}>
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
        <h3>{isZh ? "生命周期事件" : "Lifecycle Events"}</h3>
        <div className="timeline-list">
          {events.map((evt) => (
            <div className="timeline-item" key={evt.id}>
              <div className="timeline-dot" />
              <div>
                <div className="timeline-title">
                  {evt.eventType}
                  {evt.fromStatus || evt.toStatus ? ` (${evt.fromStatus ?? "-"} -> ${evt.toStatus ?? "-"})` : ""}
                </div>
                <div className="subtitle">{evt.eventNote || "-"}</div>
              </div>
              <div className="subtitle">{new Date(evt.createdAt).toLocaleString(isZh ? "zh-CN" : "en-US")}</div>
            </div>
          ))}
          {events.length === 0 && <div className="card-row">{dict.common.empty}</div>}
        </div>
      </section>

      <section className="panel">
        <h3>{isZh ? "发起送达尝试" : "Dispatch Attempt"}</h3>
        <form action={dispatchAction} className="card-list" style={{ marginTop: 10 }}>
          <div className="dual-grid" style={{ marginTop: 0 }}>
            <label className="field" style={{ marginTop: 0 }}>
              <span>{isZh ? "渠道" : "Channel"}</span>
              <select name="channelType" defaultValue="SMS" required>
                <option value="SMS">SMS</option>
                <option value="EMAIL">Email</option>
                <option value="POSTAL">Postal</option>
                <option value="NOTARY">Notary</option>
              </select>
            </label>
            <label className="field" style={{ marginTop: 0 }}>
              <span>{isZh ? "接收地址" : "Receiver"}</span>
              <input name="receiver" placeholder={isZh ? "手机号/邮箱/地址" : "Phone/Email/Address"} required />
            </label>
          </div>
          <label className="field" style={{ marginTop: 0 }}>
            <span>{isZh ? "送达内容" : "Content"}</span>
            <input name="content" placeholder={isZh ? "请输入送达文书摘要" : "Document summary"} required />
          </label>
          <div>
            <button className="primary-btn btn-inline" type="submit">{isZh ? "发起送达" : "Dispatch"}</button>
          </div>
        </form>
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

      <section className="panel">
        <h3>{isZh ? "回执更新" : "Receipt Update"}</h3>
        <div className="card-list">
          {attempts.map((a) => (
            <div className="card-row" key={`cb-${a.id}`} style={{ gap: 10, flexWrap: "wrap" }}>
              <span>#{a.attemptNo} {a.channelType} / {a.receiptStatus}</span>
              <div style={{ display: "flex", gap: 8 }}>
                <form action={callbackAction}>
                  <input type="hidden" name="attemptId" value={String(a.id)} />
                  <input type="hidden" name="channelType" value={a.channelType.toLowerCase()} />
                  <input type="hidden" name="receiptStatus" value="DELIVERED" />
                  <button className="ghost-btn" type="submit">{isZh ? "标记已送达" : "Mark Delivered"}</button>
                </form>
                <form action={callbackAction}>
                  <input type="hidden" name="attemptId" value={String(a.id)} />
                  <input type="hidden" name="channelType" value={a.channelType.toLowerCase()} />
                  <input type="hidden" name="receiptStatus" value="UNDELIVERED" />
                  <button className="ghost-btn" type="submit">{isZh ? "标记未送达" : "Mark Undelivered"}</button>
                </form>
              </div>
            </div>
          ))}
          {attempts.length === 0 && <div className="card-row">{dict.common.empty}</div>}
        </div>
      </section>
    </ConsoleShell>
  );
}
