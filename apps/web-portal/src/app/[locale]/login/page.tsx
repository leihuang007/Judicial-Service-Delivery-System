import { notFound, redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { getDictionary } from "@/i18n/dictionary";
import { isValidLocale } from "@/i18n/config";
import { getSession, signIn } from "@/lib/access-control";

type Props = { params: { locale: string }; searchParams?: { error?: string } };

export default function LoginPage({ params, searchParams }: Props) {
  if (!isValidLocale(params.locale)) {
    notFound();
  }

  const locale = params.locale;
  const dict = getDictionary(locale);
  const session = getSession();

  if (session) {
    redirect(`/${session.locale}`);
  }

  async function loginAction(formData: FormData) {
    "use server";
    const username = String(formData.get("username") || "").trim();
    const password = String(formData.get("password") || "").trim();
    const courtCode = String(formData.get("courtCode") || "").trim();
    const result = signIn(username, password, courtCode);
    if (!result) {
      redirect(`/${locale}/login?error=1`);
    }
    redirect(`/${result.locale}`);
  }

  return (
    <main className="login-shell">
      <section className="login-promo">
        <div className="promo-badge">Court Gov Tech</div>
        <h1>{dict.platform.name}</h1>
        <p>{dict.login.subtitle}</p>
        <div className="promo-points">
          <div>全程留痕证据链</div>
          <div>多渠道智能送达</div>
          <div>统一审计追踪</div>
        </div>
      </section>

      <section className="login-pane">
        <div className="panel login-card">
          <h2>{dict.login.title}</h2>
          <p className="subtitle">{dict.login.hint}</p>
          <LoginForm
            locale={locale}
            submitAction={loginAction}
            errorMessage={searchParams?.error ? (locale === "zh-CN" ? "账号、密码或法院权限不匹配" : "Invalid account, password, or court scope") : undefined}
          />
        </div>
      </section>
    </main>
  );
}
