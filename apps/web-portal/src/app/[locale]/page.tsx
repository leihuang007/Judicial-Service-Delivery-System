import { notFound } from "next/navigation";
import Link from "next/link";
import { ConsoleShell } from "@/components/console-shell";
import { AppLocale, isValidLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionary";
import { apiGet, CaseItem, TaskItem } from "@/lib/api";
import { requireSession, toCourtCodesQuery } from "@/lib/access-control";

type Props = {
  params: {
    locale: string;
  };
};

export default async function LocaleHome({ params }: Props) {
  if (!isValidLocale(params.locale)) {
    notFound();
  }

  const locale = params.locale as AppLocale;
  const dict = getDictionary(locale);
  const session = requireSession(locale);
  const courtCodes = toCourtCodesQuery(session);
  const tasks = await apiGet<TaskItem[]>(`/api/tasks?courtCodes=${courtCodes}`).catch(() => []);
  const cases = await apiGet<CaseItem[]>(`/api/cases?courtCodes=${courtCodes}`).catch(() => []);

  const pending = tasks.filter((t) => t.currentStatus !== "EFFECTIVE" && t.currentStatus !== "ARCHIVED").length;
  const effective = tasks.filter((t) => t.currentStatus === "EFFECTIVE").length;
  const alerts = tasks.filter((t) => {
    const hours = (new Date(t.legalDeadlineAt).getTime() - Date.now()) / 36e5;
    return hours > 0 && hours <= 24;
  }).length;

  const isZh = locale === "zh-CN";
  const labels = {
    actions: isZh ? "快捷操作" : "Quick Actions",
    createTask: isZh ? "创建送达任务" : "Create Task",
    runEvaluate: isZh ? "批量状态评估" : "Batch Evaluate",
    exportReport: isZh ? "导出送达报表" : "Export Report",
    trends: isZh ? "业务趋势" : "Business Trends",
    workflow: isZh ? "送达流程进度" : "Delivery Workflow",
    ledger: isZh ? "案件办理台账" : "Case Ledger",
    step1: isZh ? "案件登记" : "Case Intake",
    step2: isZh ? "策略编排" : "Strategy",
    step3: isZh ? "渠道送达" : "Channel Dispatch",
    step4: isZh ? "回执判定" : "Receipt Evaluation",
    step5: isZh ? "证据归档" : "Evidence Archive",
    tableCase: isZh ? "案号" : "Case No.",
    tableType: isZh ? "案由" : "Type",
    tableStatus: isZh ? "状态" : "Status",
    tableAction: isZh ? "操作" : "Action",
    process: isZh ? "办理" : "Open"
  };

  return (
    <ConsoleShell
      locale={locale}
      dict={dict}
      active="dashboard"
      title={dict.dashboard.title}
      subtitle={dict.dashboard.subtitle}
    >
      <section className="panel page-top-actions">
        <div className="section-row-title">{labels.actions}</div>
        <div className="action-buttons">
          <Link className="btn btn-primary" href={`/${locale}/tasks`}>{labels.createTask}</Link>
          <Link className="btn btn-secondary" href={`/${locale}/tasks`}>{labels.runEvaluate}</Link>
          <Link className="btn btn-secondary" href={`/${locale}/audit`}>{labels.exportReport}</Link>
        </div>
      </section>

      <section className="kpi-grid">
        <article className="kpi-item">
          <div>{dict.dashboard.kpiPending}</div>
          <div className="kpi-value">{pending}</div>
          <div className="kpi-trend trend-up">+12.4%</div>
        </article>
        <article className="kpi-item">
          <div>{dict.dashboard.kpiEffective}</div>
          <div className="kpi-value">{effective}</div>
          <div className="kpi-trend trend-up">+6.2%</div>
        </article>
        <article className="kpi-item">
          <div>{dict.dashboard.kpiAlert}</div>
          <div className="kpi-value" style={{ color: "var(--warn)" }}>{alerts}</div>
          <div className="kpi-trend trend-down">-3.1%</div>
        </article>
      </section>

      <section className="dual-grid">
        <article className="panel">
          <h3>{labels.trends}</h3>
          <div className="card-list">
            {tasks.slice(0, 6).map((t) => (
              <div className="card-row" key={t.id}>
                <span>{t.taskNo} / {t.partyName}</span>
                <span className="tag">{t.currentStatus}</span>
              </div>
            ))}
            {tasks.length === 0 && <div className="card-row">{dict.common.empty}</div>}
          </div>
        </article>

        <article className="panel">
          <h3>{labels.workflow}</h3>
          <div className="workflow-steps">
            <div className="workflow-step completed"><div className="step-dot">1</div><div>{labels.step1}</div></div>
            <div className="workflow-step completed"><div className="step-dot">2</div><div>{labels.step2}</div></div>
            <div className="workflow-step active"><div className="step-dot">3</div><div>{labels.step3}</div></div>
            <div className="workflow-step"><div className="step-dot">4</div><div>{labels.step4}</div></div>
            <div className="workflow-step"><div className="step-dot">5</div><div>{labels.step5}</div></div>
          </div>
        </article>
      </section>

      <section className="panel">
        <h3>{labels.ledger}</h3>
        <div className="table-wrap">
          <table className="biz-table">
            <thead>
              <tr>
                <th>{labels.tableCase}</th>
                <th>{labels.tableType}</th>
                <th>{labels.tableStatus}</th>
                <th>{labels.tableAction}</th>
              </tr>
            </thead>
            <tbody>
              {cases.slice(0, 8).map((c) => (
                <tr key={c.id}>
                  <td>{c.caseNo}</td>
                  <td>{c.caseType}</td>
                  <td><span className="tag">{c.caseStatus}</span></td>
                  <td><Link href={`/${locale}/cases/${c.id}`}>{labels.process}</Link></td>
                </tr>
              ))}
              {cases.length === 0 && (
                <tr>
                  <td colSpan={4}>{dict.common.empty}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </ConsoleShell>
  );
}
