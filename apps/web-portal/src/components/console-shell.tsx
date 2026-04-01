import Link from "next/link";
import { ReactNode } from "react";
import { AppLocale } from "@/i18n/config";
import { Dictionary } from "@/i18n/dictionary";
import { LanguageSwitcher } from "@/components/language-switcher";

type NavKey = "dashboard" | "cases" | "tasks" | "strategies" | "evidence" | "exceptions" | "audit";

type Props = {
  locale: AppLocale;
  dict: Dictionary;
  active: NavKey;
  title: string;
  subtitle: string;
  children: ReactNode;
};

const navOrder: { key: NavKey; path: string }[] = [
  { key: "dashboard", path: "" },
  { key: "cases", path: "/cases" },
  { key: "tasks", path: "/tasks" },
  { key: "strategies", path: "/strategies" },
  { key: "evidence", path: "/evidence" },
  { key: "exceptions", path: "/exceptions" },
  { key: "audit", path: "/audit" }
];

export function ConsoleShell({ locale, dict, active, title, subtitle, children }: Props) {
  return (
    <div className="system-shell">
      <header className="topbar">
        <div className="topbar-brand">
          <div className="brand-emblem">法</div>
          <div>
            <div className="topbar-title">{dict.platform.name}</div>
            <div className="topbar-sub">{dict.platform.org}</div>
          </div>
        </div>

        <div className="topbar-right">
          <LanguageSwitcher locale={locale} path={active === "dashboard" ? "" : `/${active}`} />
          <div className="user-chip">审判业务用户</div>
          <Link href={`/${locale}/logout`} className="ghost-btn">退出</Link>
        </div>
      </header>

      <div className="main-container">
        <aside className="console-sidebar">
          <div className="nav-section-title">Core</div>
          <nav className="nav-list">
            {navOrder.slice(0, 3).map((item) => (
              <Link
                key={item.key}
                href={`/${locale}${item.path}`}
                className={`nav-item ${active === item.key ? "active" : ""}`}
              >
                {dict.nav[item.key]}
              </Link>
            ))}
          </nav>

          <div className="nav-section-title">Governance</div>
          <nav className="nav-list">
            {navOrder.slice(3).map((item) => (
              <Link
                key={item.key}
                href={`/${locale}${item.path}`}
                className={`nav-item ${active === item.key ? "active" : ""}`}
              >
                {dict.nav[item.key]}
              </Link>
            ))}
          </nav>
        </aside>

        <section className="console-main">
          <header className="console-header">
            <div>
              <h1>{title}</h1>
              <p className="subtitle">{subtitle}</p>
            </div>
          </header>

          <div className="console-content">{children}</div>
        </section>
      </div>
    </div>
  );
}
