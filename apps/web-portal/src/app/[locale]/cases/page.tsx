import Link from "next/link";
import { apiGet, CaseItem } from "@/lib/api";

export default async function CasesPage({ params }: { params: { locale: string } }) {
  const cases = await apiGet<CaseItem[]>('/api/cases').catch(() => []);

  return (
    <main className="container">
      <section className="panel">
        <h1>Cases</h1>
        <p className="subtitle">案件主数据清单</p>
        <div className="card-list">
          {cases.map((c) => (
            <div className="card-row" key={c.id}>
              <span>{c.caseNo} / {c.caseType} / {c.caseStatus}</span>
              <span>
                <Link href={`/${params.locale}/tasks?caseId=${c.id}`}>View Tasks</Link>
              </span>
            </div>
          ))}
          {cases.length === 0 && <div className="card-row"><span>No cases yet.</span></div>}
        </div>
      </section>
    </main>
  );
}
