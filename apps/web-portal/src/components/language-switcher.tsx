import Link from "next/link";
import { AppLocale, locales } from "@/i18n/config";

type Props = {
  locale: AppLocale;
};

export function LanguageSwitcher({ locale }: Props) {
  return (
    <div className="language-switch" aria-label="language switch">
      {locales.map((item) => (
        <Link key={item} href={`/${item}`} className={item === locale ? "active" : ""}>
          {item}
        </Link>
      ))}
    </div>
  );
}
