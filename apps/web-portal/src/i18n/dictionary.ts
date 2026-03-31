import enUS from "./messages/en-US.json";
import zhCN from "./messages/zh-CN.json";
import { AppLocale } from "./config";

export type Dictionary = typeof zhCN;

const dictionaries: Record<AppLocale, Dictionary> = {
  "zh-CN": zhCN,
  "en-US": enUS
};

export function getDictionary(locale: AppLocale): Dictionary {
  return dictionaries[locale];
}
