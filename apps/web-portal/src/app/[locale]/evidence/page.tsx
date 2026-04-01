import { apiGet, EvidenceItem } from "@/lib/api";

export default async function EvidencePage() {
  const samples = await Promise.all([
    apiGet<EvidenceItem[]>('/api/evidence?taskId=1').catch(() => []),
    apiGet<EvidenceItem[]>('/api/evidence?taskId=2').catch(() => [])
  ]);
  const evidence = [...samples[0], ...samples[1]];

  return (
    <main className="container">
      <section className="panel">
        <h1>Evidence</h1>
        <p className="subtitle">证据留痕记录</p>
        <div className="card-list">
          {evidence.map((e) => (
            <div className="card-row" key={e.id}>
              <span>task#{e.taskId} / {e.evidenceType}</span>
              <span>{e.hashSha256.slice(0, 16)}...</span>
            </div>
          ))}
          {evidence.length === 0 && <div className="card-row"><span>No evidence records yet.</span></div>}
        </div>
      </section>
    </main>
  );
}
