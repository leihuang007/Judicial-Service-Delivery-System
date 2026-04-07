import Link from "next/link";
import { notFound } from "next/navigation";
import { ConsoleShell } from "@/components/console-shell";
import { apiGet, CaseItem } from "@/lib/api";
import { displayCaseStatus, displayCaseType, displayCourt } from "@/lib/cn-format";
import { AppLocale, isValidLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionary";
import { requireSession, toCourtCodesQuery } from "@/lib/access-control";

export default async function CasesPage({
  params,
  searchParams
}: {
  params: { locale: string };
  searchParams?: { q?: string; status?: string; page?: string };
}) {
  if (!isValidLocale(params.locale)) {
    notFound();
  }

  const locale = params.locale as AppLocale;
  const dict = getDictionary(locale);
  const session = requireSession(locale);
  const courtCodes = toCourtCodesQuery(session);
  const cases = await apiGet<CaseItem[]>(`/api/cases?courtCodes=${courtCodes}`).catch(() => []);
  const q = searchParams?.q?.trim().toLowerCase() || "";
  const status = searchParams?.status?.trim() || "";
  const page = Math.max(1, Number(searchParams?.page || "1"));
  const pageSize = 10;
  const isZh = locale === "zh-CN";

  const filtered = cases.filter((c) => {
    const keyword = `${c.caseNo} ${c.caseType} ${c.courtCode} ${c.tribunalCode}`.toLowerCase();
    const qMatch = !q || keyword.includes(q);
    const statusMatch = !status || c.caseStatus === status;
    return qMatch && statusMatch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageNum = Math.min(page, totalPages);
  const pageItems = filtered.slice((pageNum - 1) * pageSize, pageNum * pageSize);

  return (
    <ConsoleShell
      locale={locale}
      dict={dict}
      active="cases"
      title={dict.nav.cases}
      subtitle={isZh ? "按案号、案由、状态统一检索与追踪" : "Unified search by case number, cause, and status"}
    >
      <section className="panel">
        <form className="filter-row" method="get">
          <input name="q" defaultValue={q} placeholder={isZh ? "案号/案由/法院" : "Case No./Cause/Court"} />
          <input name="status" defaultValue={status} placeholder={isZh ? "状态 (如 REGISTERED)" : "Status (e.g. REGISTERED)"} />
          <button className="primary-btn btn-inline" type="submit">{isZh ? "筛选" : "Filter"}</button>
        </form>
      </section>

      <section className="panel">
        <div className="card-list">
          {pageItems.map((c) => (
            <div className="card-row" key={c.id}>
              <span>{c.caseNo} / {displayCaseType(c.caseType, locale)} / {displayCourt(c.courtCode, locale)} / {displayCaseStatus(c.caseStatus, locale)}</span>
              <span>
                <Link href={`/${locale}/cases/${c.id}`}>{dict.common.detail}</Link>
              </span>
            </div>
          ))}
          {pageItems.length === 0 && <div className="card-row"><span>{dict.common.empty}</span></div>}
        </div>

        <div className="pager-row">
          <Link href={`/${locale}/cases?page=${Math.max(1, pageNum - 1)}&status=${status}&q=${encodeURIComponent(q)}`}>{isZh ? "上一页" : "Prev"}</Link>
          <span>{isZh ? `第 ${pageNum} / ${totalPages} 页` : `Page ${pageNum} / ${totalPages}`}</span>
          <Link href={`/${locale}/cases?page=${Math.min(totalPages, pageNum + 1)}&status=${status}&q=${encodeURIComponent(q)}`}>{isZh ? "下一页" : "Next"}</Link>
        </div>
      </section>
    </ConsoleShell>
  );
}
