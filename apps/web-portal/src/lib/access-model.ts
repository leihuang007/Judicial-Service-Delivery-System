import { AppLocale } from "@/i18n/config";

export type DemoAccountId = "account1" | "account2";

export type CourtLevel = "HIGH" | "INTERMEDIATE" | "BASIC";

export type CourtNode = {
  code: string;
  nameZh: string;
  nameEn: string;
  level: CourtLevel;
  parentCode?: string;
};

export type DemoAccount = {
  id: DemoAccountId;
  username: string;
  password: string;
  displayNameZh: string;
  displayNameEn: string;
  defaultLocale: AppLocale;
  allowedRootCourts: string[];
};

export const COURTS: CourtNode[] = [
  {
    code: "JS-HIGH",
    nameZh: "江苏省高级人民法院",
    nameEn: "Jiangsu High People's Court",
    level: "HIGH"
  },
  {
    code: "JS-NJ-MID",
    nameZh: "南京市中级人民法院",
    nameEn: "Nanjing Intermediate People's Court",
    level: "INTERMEDIATE",
    parentCode: "JS-HIGH"
  },
  {
    code: "JS-SZ-MID",
    nameZh: "苏州市中级人民法院",
    nameEn: "Suzhou Intermediate People's Court",
    level: "INTERMEDIATE",
    parentCode: "JS-HIGH"
  },
  {
    code: "JS-NJ-GL-BASIC",
    nameZh: "南京市鼓楼区人民法院",
    nameEn: "Gulou District People's Court, Nanjing",
    level: "BASIC",
    parentCode: "JS-NJ-MID"
  },
  {
    code: "JS-NJ-JY-BASIC",
    nameZh: "南京市建邺区人民法院",
    nameEn: "Jianye District People's Court, Nanjing",
    level: "BASIC",
    parentCode: "JS-NJ-MID"
  },
  {
    code: "JS-SZ-GS-BASIC",
    nameZh: "苏州市姑苏区人民法院",
    nameEn: "Gusu District People's Court, Suzhou",
    level: "BASIC",
    parentCode: "JS-SZ-MID"
  },
  {
    code: "JS-SZ-SIP-BASIC",
    nameZh: "苏州工业园区人民法院",
    nameEn: "SIP People's Court, Suzhou",
    level: "BASIC",
    parentCode: "JS-SZ-MID"
  }
];

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: "account1",
    username: "account1",
    password: "demo123",
    displayNameZh: "账号1（中文演示）",
    displayNameEn: "Account 1 (Chinese Demo)",
    defaultLocale: "zh-CN",
    allowedRootCourts: ["JS-NJ-MID"]
  },
  {
    id: "account2",
    username: "account2",
    password: "demo123",
    displayNameZh: "账号2（英文演示）",
    displayNameEn: "Account 2 (English Demo)",
    defaultLocale: "en-US",
    allowedRootCourts: ["JS-SZ-MID"]
  }
];
