import { notFound } from "next/navigation";
import { LanguageSwitcher } from "@/components/language-switcher";
import { defaultLocale, isValidLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionary";

type Props = {
  params: {
    locale: string;
  };
};

export default function LocaleHome({ params }: Props) {
  const locale = params.locale || defaultLocale;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const dict = getDictionary(locale);

  return (
    <main className="container">
      <section className="hero">
        <article className="panel">
          <span className="badge">{dict.header.status}</span>
          <h1>{dict.header.title}</h1>
          <p className="subtitle">{dict.header.subtitle}</p>

          <div className="kpi-grid">
            <div className="kpi-item">
              <div>{dict.kpi.pending}</div>
              <div className="kpi-value">126</div>
            </div>
            <div className="kpi-item">
              <div>{dict.kpi.success}</div>
              <div className="kpi-value">89</div>
            </div>
            <div className="kpi-item">
              <div>{dict.kpi.warning}</div>
              <div className="kpi-value">11</div>
            </div>
          </div>
        </article>

        <aside className="panel">
          <LanguageSwitcher locale={locale} />
          <h2 style={{ marginTop: 18 }}>{dict.list.title}</h2>
          <div className="card-list">
            <div className="card-row">
              <span>{dict.list.one}</span>
              <span className="tag">P1</span>
            </div>
            <div className="card-row">
              <span>{dict.list.two}</span>
              <span className="tag">P1</span>
            </div>
            <div className="card-row">
              <span>{dict.list.three}</span>
              <span className="tag">P2</span>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
