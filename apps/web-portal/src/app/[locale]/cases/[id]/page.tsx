import Link from "next/link";
import { notFound } from "next/navigation";
import { ConsoleShell } from "@/components/console-shell";
import { AppLocale, isValidLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionary";
import { apiGet, CaseItem, TaskItem } from "@/lib/api";
import { applyTaskScope, requireCaseInScope, requireSession, toCourtCodesQuery } from "@/lib/access-control";
import {
  displayCaseStatus,
  displayCaseType,
  displayCourt,
  displayDocType,
  displayTaskStatus,
  displayTribunal
} from "@/lib/cn-format";

type Props = {
  params: { locale: string; id: string };
};

export default async function CaseDetailPage({ params }: Props) {
  if (!isValidLocale(params.locale)) {
    notFound();
  }

  const locale = params.locale as AppLocale;
  const isZh = locale === "zh-CN";
  const dict = getDictionary(locale);
  const session = requireSession(locale);
  const courtCodes = toCourtCodesQuery(session);
  const id = Number(params.id);

  const caseItem = await apiGet<CaseItem>(`/api/cases/${id}`).catch(() => null);
  if (!caseItem) {
    notFound();
  }
  requireCaseInScope(caseItem, session);

  const tasks = await apiGet<TaskItem[]>(`/api/tasks?courtCodes=${courtCodes}`).catch(() => []);
  const related = applyTaskScope(tasks, [caseItem]).filter((t) => t.caseId === id);

  return (
    <ConsoleShell
      locale={locale}
      dict={dict}
      active="cases"
      title={`${dict.nav.cases} #${caseItem.caseNo}`}
      subtitle={isZh ? "案件主数据与送达任务联动视图" : "Case master data and delivery task linkage"}
    >
      <section className="dual-grid">
        <article className="panel">
          <h3>{isZh ? "案件基本信息" : "Case Overview"}</h3>
          <div className="card-list">
            <div className="card-row"><span>{isZh ? "案号" : "Case No."}</span><span>{caseItem.caseNo}</span></div>
            <div className="card-row"><span>{isZh ? "案由" : "Cause"}</span><span>{displayCaseType(caseItem.caseType, locale)}</span></div>
            <div className="card-row"><span>{isZh ? "受理法院" : "Court"}</span><span>{displayCourt(caseItem.courtCode, locale)}</span></div>
            <div className="card-row"><span>{isZh ? "承办法庭" : "Tribunal"}</span><span>{displayTribunal(caseItem.tribunalCode, locale)}</span></div>
            <div className="card-row"><span>{isZh ? "立案时间" : "Accepted At"}</span><span>{caseItem.acceptedAt ? new Date(caseItem.acceptedAt).toLocaleString(isZh ? "zh-CN" : "en-US") : "-"}</span></div>
            <div className="card-row"><span>{isZh ? "案件状态" : "Case Status"}</span><span className="tag">{displayCaseStatus(caseItem.caseStatus, locale)}</span></div>
          </div>
        </article>

        <article className="panel">
          <h3>{isZh ? "关联送达任务" : "Related Delivery Tasks"}</h3>
          <div className="card-list">
            {related.map((t) => (
              <div className="card-row" key={t.id}>
                <span>{t.taskNo} / {displayDocType(t.docType, locale)} / {t.partyName} / {displayTaskStatus(t.currentStatus, locale)}</span>
                <Link href={`/${locale}/tasks/${t.id}`}>{isZh ? "办理" : "Open"}</Link>
              </div>
            ))}
            {related.length === 0 && <div className="card-row">{dict.common.empty}</div>}
          </div>
        </article>
      </section>

      <section className="panel">
        <Link href={`/${locale}/tasks?caseId=${caseItem.id}`} className="primary-btn btn-inline" style={{ marginRight: 8 }}>
          {isZh ? "基于本案新建送达任务" : "Create Task for This Case"}
        </Link>
        <Link href={`/${locale}/cases`} className="ghost-btn">{isZh ? "返回案件台账" : "Back to Cases"}</Link>
      </section>
    </ConsoleShell>
  );
}
