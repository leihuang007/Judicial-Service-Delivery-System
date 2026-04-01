import { apiGet } from "@/lib/api";

type AuditItem = {
  id: number;
  actionType: string;
  actor: string;
  resourceType: string;
  resourceId: string;
  actionTime: string;
};

export default async function AuditPage() {
  const logs = await apiGet<AuditItem[]>('/api/audit/recent').catch(() => []);

  return (
    <main className="container">
      <section className="panel">
        <h1>Audit Logs</h1>
        <p className="subtitle">最近 200 条审计日志</p>
        <div className="card-list">
          {logs.map((l) => (
            <div className="card-row" key={l.id}>
              <span>{l.actionType} / {l.resourceType}#{l.resourceId}</span>
              <span>{l.actionTime}</span>
            </div>
          ))}
          {logs.length === 0 && <div className="card-row"><span>No audit logs yet.</span></div>}
        </div>
      </section>
    </main>
  );
}
