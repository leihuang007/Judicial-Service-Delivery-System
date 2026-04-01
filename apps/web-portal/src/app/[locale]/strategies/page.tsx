import { apiGet, StrategyItem } from "@/lib/api";

export default async function StrategiesPage() {
  const strategies = await apiGet<StrategyItem[]>('/api/strategies').catch(() => []);

  return (
    <main className="container">
      <section className="panel">
        <h1>Strategies</h1>
        <p className="subtitle">送达策略配置</p>
        <div className="card-list">
          {strategies.map((s) => (
            <div className="card-row" key={s.id}>
              <span>{s.strategyName} / {s.channelSequence} / retry {s.retryMaxTimes}</span>
              <span className="tag">{s.enabledFlag ? "ENABLED" : "DISABLED"}</span>
            </div>
          ))}
          {strategies.length === 0 && <div className="card-row"><span>No strategies yet.</span></div>}
        </div>
      </section>
    </main>
  );
}
