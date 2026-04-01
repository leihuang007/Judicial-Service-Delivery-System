import { notFound } from "next/navigation";
import { ConsoleShell } from "@/components/console-shell";
import { apiGet, StrategyItem } from "@/lib/api";
import { requireSession } from "@/lib/access-control";
import { AppLocale, isValidLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionary";

export default async function StrategiesPage({ params }: { params: { locale: string } }) {
  if (!isValidLocale(params.locale)) {
    notFound();
  }

  const locale = params.locale as AppLocale;
  const dict = getDictionary(locale);
  requireSession(locale);
  const strategies = await apiGet<StrategyItem[]>("/api/strategies").catch(() => []);

  return (
    <ConsoleShell locale={locale} dict={dict} active="strategies" title={dict.nav.strategies} subtitle="配置不同案由和时限策略，统一重试规则">
      <section className="panel">
        <div className="card-list">
          {strategies.map((s) => (
            <div className="card-row" key={s.id}>
              <span>{s.strategyName} / {s.channelSequence} / retry {s.retryMaxTimes}</span>
              <span className="tag">{s.enabledFlag ? "ENABLED" : "DISABLED"}</span>
            </div>
          ))}
          {strategies.length === 0 && <div className="card-row"><span>{dict.common.empty}</span></div>}
        </div>
      </section>
    </ConsoleShell>
  );
}
