import { notFound } from "next/navigation";
import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ConsoleShell } from "@/components/console-shell";
import { apiGet, AttemptItem, CaseItem, TaskItem } from "@/lib/api";
import { requireSession, toCourtCodesQuery } from "@/lib/access-control";
import { displayDocType, displayTaskStatus, isZhLocale } from "@/lib/cn-format";
import { AppLocale, isValidLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionary";
import { postApi } from "@/lib/server-api";

export default async function TasksPage({
  params,
  searchParams
}: {
  params: { locale: string };
  searchParams?: { status?: string; q?: string; page?: string; caseId?: string; template?: string };
}) {
  if (!isValidLocale(params.locale)) {
    notFound();
  }

  const locale = params.locale as AppLocale;
  const dict = getDictionary(locale);
  const session = requireSession(locale);
  const courtCodes = toCourtCodesQuery(session);
  const cases = await apiGet<CaseItem[]>(`/api/cases?courtCodes=${courtCodes}`).catch(() => []);
  const tasks = await apiGet<TaskItem[]>(`/api/tasks?courtCodes=${courtCodes}`).catch(() => []);
  const status = searchParams?.status?.trim() || "";
  const q = searchParams?.q?.trim().toLowerCase() || "";
  const template = searchParams?.template?.trim() || "";
  const preferredCaseId = Number(searchParams?.caseId || "0");
  const defaultCaseId = cases.some((c) => c.id === preferredCaseId)
    ? preferredCaseId
    : (cases[0]?.id ?? 0);
  const page = Math.max(1, Number(searchParams?.page || "1"));
  const pageSize = 10;
  const isZh = isZhLocale(locale);

  const nowMs = Date.now();
  const pending = tasks.filter((t) => t.currentStatus === "PENDING").length;
  const inProgress = tasks.filter((t) => t.currentStatus === "IN_PROGRESS").length;
  const effective = tasks.filter((t) => t.currentStatus === "EFFECTIVE").length;
  const overdue = tasks.filter((t) => {
    const statusDone = t.currentStatus === "EFFECTIVE" || t.currentStatus === "ARCHIVED";
    return !statusDone && new Date(t.legalDeadlineAt).getTime() < nowMs;
  }).length;

  const templateDefaults: Record<string, { docType: string; partyName: string; deadlineDays: number; dossier: string }> = {
    summons: {
      docType: "SUMMONS",
      partyName: isZh ? "王某（被告）" : "Defendant Wang",
      deadlineDays: 7,
      dossier: isZh
        ? "案情摘要: 民事纠纷一审排期开庭，需向被告送达开庭传票。\n建议渠道: 短信+电子邮件\n紧急程度: 中"
        : "Summary: Civil trial hearing scheduled; summon defendant.\nSuggested channels: SMS + Email\nPriority: medium"
    },
    judgment: {
      docType: "JUDGMENT",
      partyName: isZh ? "李某（当事人）" : "Party Li",
      deadlineDays: 3,
      dossier: isZh
        ? "案情摘要: 一审判决已作出，需在法定期限内完成判决书送达。\n建议渠道: 邮寄+公告补充\n紧急程度: 高"
        : "Summary: First-instance judgment issued; serve within legal timeline.\nSuggested channels: Postal + Public notice\nPriority: high"
    },
    notice: {
      docType: "NOTICE",
      partyName: isZh ? "张某（申请人）" : "Applicant Zhang",
      deadlineDays: 5,
      dossier: isZh
        ? "案情摘要: 程序性通知送达，需完成签收留痕。\n建议渠道: 短信\n紧急程度: 低"
        : "Summary: Procedural notice service with receipt evidence.\nSuggested channels: SMS\nPriority: low"
    }
  };

  const selectedTemplate = templateDefaults[template] || templateDefaults.summons;
  const defaultDeadline = new Date(Date.now() + selectedTemplate.deadlineDays * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 16);

  async function createTaskAction(formData: FormData) {
    "use server";
    const caseId = Number(formData.get("caseId") || "0");
    const docType = String(formData.get("docType") || "").trim();
    const partyName = String(formData.get("partyName") || "").trim();
    const legalDeadlineAtRaw = String(formData.get("legalDeadlineAt") || "").trim();

    const nextSession = requireSession(locale);
    const nextCourtCodes = toCourtCodesQuery(nextSession);
    const scopedCases = await apiGet<CaseItem[]>(`/api/cases?courtCodes=${nextCourtCodes}`).catch(() => []);
    if (!scopedCases.some((c) => c.id === caseId)) {
      throw new Error("Selected case is out of scope");
    }

    const created = await postApi("/api/tasks", {
      caseId,
      docType,
      partyName,
      legalDeadlineAt: new Date(legalDeadlineAtRaw).toISOString()
    });

    revalidatePath(`/${locale}/tasks`);
    revalidatePath(`/${locale}`);
    redirect(`/${locale}/tasks/${created.id}`);
  }

  const filtered = tasks.filter((t) => {
    const statusMatch = !status || t.currentStatus === status;
    const keyword = `${t.taskNo} ${t.caseNo} ${t.partyName} ${t.docType}`.toLowerCase();
    const qMatch = !q || keyword.includes(q);
    return statusMatch && qMatch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageNum = Math.min(page, totalPages);
  const pageItems = filtered.slice((pageNum - 1) * pageSize, pageNum * pageSize);

  const lanes = [
    { key: "PENDING", title: isZh ? "待启动" : "Pending" },
    { key: "IN_PROGRESS", title: isZh ? "进行中" : "In Progress" },
    { key: "FAILED_NEED_REMEDY", title: isZh ? "待补救" : "Need Remedy" },
    { key: "EFFECTIVE", title: isZh ? "已生效" : "Effective" }
  ] as const;

  return (
    <ConsoleShell
      locale={locale}
      dict={dict}
      active="tasks"
      title={dict.nav.tasks}
      subtitle={isZh ? "参考案件受理工作台重构: 建单、调度、回执、归档一屏协同" : "Redesigned command center for create, dispatch, receipt, and archive"}
    >
      <section className="panel task-hero-panel">
        <div className="task-hero-head">
          <div>
            <h3>{isZh ? "送达任务指挥舱" : "Delivery Command Center"}</h3>
            <p className="subtitle">{isZh ? "覆盖建单、催办、回执、异常、归档的全流程管理" : "Manage full lifecycle from intake to archive"}</p>
          </div>
          <div className="task-hero-badges">
            <span className="hero-badge">{isZh ? "分域隔离" : "Scoped Access"}</span>
            <span className="hero-badge">{isZh ? "状态可追溯" : "Traceable Status"}</span>
            <span className="hero-badge">SLA</span>
          </div>
        </div>
        <div className="task-kpi-grid">
          <div className="task-kpi-card">
            <div className="kpi-label">{isZh ? "待启动" : "Pending"}</div>
            <div className="kpi-number">{pending}</div>
          </div>
          <div className="task-kpi-card">
            <div className="kpi-label">{isZh ? "进行中" : "In Progress"}</div>
            <div className="kpi-number">{inProgress}</div>
          </div>
          <div className="task-kpi-card">
            <div className="kpi-label">{isZh ? "已生效" : "Effective"}</div>
            <div className="kpi-number">{effective}</div>
          </div>
          <div className="task-kpi-card alert">
            <div className="kpi-label">{isZh ? "已逾期" : "Overdue"}</div>
            <div className="kpi-number">{overdue}</div>
          </div>
        </div>
      </section>

      <section className="panel intake-studio">
        <div className="intake-left">
          <h3>{isZh ? "智能建单工位" : "Smart Intake Studio"}</h3>
          <p className="subtitle">{isZh ? "参考案件受理自动提取工作流: 先看案情摘要，再生成送达任务。" : "Inspired by auto-extraction intake flow."}</p>
          <div className="template-actions">
            <Link className={`ghost-btn ${template === "summons" ? "active-soft" : ""}`} href={`/${locale}/tasks?template=summons&caseId=${defaultCaseId}`}>{isZh ? "模板: 传票" : "Template: Summons"}</Link>
            <Link className={`ghost-btn ${template === "notice" ? "active-soft" : ""}`} href={`/${locale}/tasks?template=notice&caseId=${defaultCaseId}`}>{isZh ? "模板: 通知" : "Template: Notice"}</Link>
            <Link className={`ghost-btn ${template === "judgment" ? "active-soft" : ""}`} href={`/${locale}/tasks?template=judgment&caseId=${defaultCaseId}`}>{isZh ? "模板: 判决" : "Template: Judgment"}</Link>
          </div>
          <div className="dossier-box">
            <div className="dossier-title">{isZh ? "案情摘要提取区" : "Dossier Extraction Preview"}</div>
            <pre>{selectedTemplate.dossier}</pre>
          </div>
        </div>
        <div className="intake-right">
          <h3>{isZh ? "创建送达任务" : "Create Delivery Task"}</h3>
          <form action={createTaskAction} className="card-list" style={{ marginTop: 10 }}>
            <label className="field">
              <span>{isZh ? "关联案件" : "Case"}</span>
              <select name="caseId" defaultValue={String(defaultCaseId)} required>
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>{c.caseNo}</option>
                ))}
              </select>
            </label>
            <div className="dual-grid" style={{ marginTop: 0 }}>
              <label className="field" style={{ marginTop: 0 }}>
                <span>{isZh ? "文书类型" : "Document Type"}</span>
                <select name="docType" defaultValue={selectedTemplate.docType} required>
                  <option value="SUMMONS">{isZh ? "传票" : "Summons"}</option>
                  <option value="NOTICE">{isZh ? "通知书" : "Notice"}</option>
                  <option value="JUDGMENT">{isZh ? "判决书" : "Judgment"}</option>
                  <option value="RULING">{isZh ? "裁定书" : "Ruling"}</option>
                </select>
              </label>
              <label className="field" style={{ marginTop: 0 }}>
                <span>{isZh ? "法定截止时间" : "Legal Deadline"}</span>
                <input name="legalDeadlineAt" type="datetime-local" defaultValue={defaultDeadline} required />
              </label>
            </div>
            <label className="field">
              <span>{isZh ? "送达对象" : "Party Name"}</span>
              <input name="partyName" defaultValue={selectedTemplate.partyName} placeholder={isZh ? "请输入当事人姓名" : "Enter party name"} required />
            </label>
            <div className="action-buttons">
              <button className="primary-btn btn-inline" type="submit">{isZh ? "创建任务" : "Create Task"}</button>
              <Link href={`/${locale}/cases/${defaultCaseId || ""}`} className="ghost-btn">{isZh ? "查看案件详情" : "View Case"}</Link>
            </div>
          </form>
        </div>
      </section>

      <section className="panel">
        <h3>{isZh ? "状态看板" : "Status Board"}</h3>
        <div className="task-board">
          {lanes.map((lane) => {
            const items = tasks.filter((t) => t.currentStatus === lane.key).slice(0, 4);
            return (
              <div className="task-lane" key={lane.key}>
                <div className="task-lane-head">
                  <span>{lane.title}</span>
                  <span>{tasks.filter((t) => t.currentStatus === lane.key).length}</span>
                </div>
                <div className="task-lane-list">
                  {items.map((t) => (
                    <Link href={`/${locale}/tasks/${t.id}`} className="task-lane-item" key={t.id}>
                      <strong>{t.taskNo}</strong>
                      <span>{t.partyName}</span>
                    </Link>
                  ))}
                  {items.length === 0 && <div className="task-lane-empty">{dict.common.empty}</div>}
                </div>
              </div>
            );
          })}
        </div>
      </section>

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
  const overdue = new Date(task.legalDeadlineAt).getTime() < Date.now() && task.currentStatus !== "EFFECTIVE" && task.currentStatus !== "ARCHIVED";

  return (
    <div className="task-table-row">
      <div className="task-main">
        <div>
          <strong>{task.taskNo}</strong>
          <span className={`status-pill ${overdue ? "danger" : ""}`}>{displayTaskStatus(task.currentStatus, locale)}</span>
        </div>
        <div className="subtitle">{task.caseNo} / {displayDocType(task.docType, locale)} / {task.partyName}</div>
      </div>
      <div className="task-meta">
        <span>{isZh ? "尝试" : "Attempts"}: {attempts.length}</span>
        <span>{isZh ? "截止" : "Deadline"}: {new Date(task.legalDeadlineAt).toLocaleString(isZh ? "zh-CN" : "en-US")}</span>
      </div>
      <div>
        <Link href={`/${locale}/tasks/${task.id}`} className="ghost-btn">{isZh ? "进入办理" : "Open"}</Link>
      </div>
    </div>
  );
}
