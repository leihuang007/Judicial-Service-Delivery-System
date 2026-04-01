import Link from "next/link";
import { AppLocale, locales } from "@/i18n/config";

type Props = {
  locale: AppLocale;
  path?: string;
};

export function LanguageSwitcher({ locale, path = "" }: Props) {
  return (
    <div className="language-switch" aria-label="language switch">
      {locales.map((item) => (
        <Link key={item} href={`/${item}${path}`} className={item === locale ? "active" : ""}>
          {item}
        </Link>
      ))}
    </div>
  );
}
