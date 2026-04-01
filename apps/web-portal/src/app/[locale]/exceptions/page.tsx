import { apiGet } from "@/lib/api";

type ExceptionItem = {
  id: number;
  taskId: number;
  level: string;
  code: string;
  status: string;
  note: string;
};

export default async function ExceptionsPage() {
  const tickets = await apiGet<ExceptionItem[]>('/api/orchestration/exceptions/open').catch(() => []);

  return (
    <main className="container">
      <section className="panel">
        <h1>Exceptions</h1>
        <p className="subtitle">异常工单工作台</p>
        <div className="card-list">
          {tickets.map((t) => (
            <div className="card-row" key={t.id}>
              <span>task#{t.taskId} / {t.level} / {t.code}</span>
              <span className="tag">{t.status}</span>
            </div>
          ))}
          {tickets.length === 0 && <div className="card-row"><span>No open exceptions.</span></div>}
        </div>
      </section>
    </main>
  );
}
