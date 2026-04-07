import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { AppLocale } from "@/i18n/config";
import { CaseItem, TaskItem } from "@/lib/api";
import { COURTS, CourtNode, DemoAccountId, DEMO_ACCOUNTS } from "@/lib/access-model";

export type UserSession = {
  accountId: DemoAccountId;
  username: string;
  displayName: string;
  locale: AppLocale;
  selectedCourtCode: string;
  allowedCourtCodes: string[];
};

const SESSION_COOKIE = "jsds_session";

function getCourtByCode(code: string): CourtNode | undefined {
  return COURTS.find((c) => c.code === code);
}

function getDescendantCourts(rootCode: string): string[] {
  const queue = [rootCode];
  const result: string[] = [];
  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) {
      continue;
    }
    result.push(current);
    const children = COURTS.filter((c) => c.parentCode === current).map((c) => c.code);
    queue.push(...children);
  }
  return result;
}

function intersect(left: string[], right: string[]): string[] {
  const rightSet = new Set(right);
  return left.filter((item) => rightSet.has(item));
}

function getCourtName(code: string, locale: AppLocale): string {
  const court = getCourtByCode(code);
  if (!court) {
    return code;
  }
  return locale === "zh-CN" ? court.nameZh : court.nameEn;
}

function encodeSession(session: UserSession): string {
  return Buffer.from(JSON.stringify(session), "utf8").toString("base64");
}

function decodeSession(value: string): UserSession | null {
  try {
    const json = Buffer.from(value, "base64").toString("utf8");
    return JSON.parse(json) as UserSession;
  } catch {
    return null;
  }
}

export function getSession(): UserSession | null {
  const raw = cookies().get(SESSION_COOKIE)?.value;
  if (!raw) {
    return null;
  }
  return decodeSession(raw);
}

export function requireSession(locale: AppLocale): UserSession {
  const session = getSession();
  if (!session) {
    redirect(`/${locale}/login`);
  }
  if (session.locale !== locale) {
    redirect(`/${session.locale}`);
  }
  return session;
}

export function clearSession() {
  cookies().delete(SESSION_COOKIE);
}

export function signIn(username: string, password: string, selectedCourtCode: string): UserSession | null {
  const account = DEMO_ACCOUNTS.find((a) => a.username === username && a.password === password);
  if (!account) {
    return null;
  }

  const allowedByAccount = account.allowedRootCourts.flatMap((code) => getDescendantCourts(code));
  if (!allowedByAccount.includes(selectedCourtCode)) {
    return null;
  }

  const selectedScope = getDescendantCourts(selectedCourtCode);
  const allowedScope = intersect(selectedScope, allowedByAccount);
  const locale = account.defaultLocale;

  const session: UserSession = {
    accountId: account.id,
    username: account.username,
    displayName: locale === "zh-CN" ? account.displayNameZh : account.displayNameEn,
    locale,
    selectedCourtCode,
    allowedCourtCodes: allowedScope
  };

  cookies().set(SESSION_COOKIE, encodeSession(session), {
    httpOnly: true,
    sameSite: "lax",
    path: "/"
  });

  return session;
}

function mapCaseCourtToScopeCode(rawCourt: string): string | null {
  if (COURTS.some((c) => c.code === rawCourt)) {
    return rawCourt;
  }
  if (rawCourt.includes("南京市鼓楼区人民法院")) {
    return "JS-NJ-GL-BASIC";
  }
  if (rawCourt.includes("南京市建邺区人民法院") || rawCourt.includes("南京市秦淮区人民法院")) {
    return "JS-NJ-JY-BASIC";
  }
  if (rawCourt.includes("南京市中级人民法院")) {
    return "JS-NJ-MID";
  }
  if (rawCourt.includes("苏州市姑苏区人民法院")) {
    return "JS-SZ-GS-BASIC";
  }
  if (rawCourt.includes("苏州工业园区人民法院")) {
    return "JS-SZ-SIP-BASIC";
  }
  if (rawCourt.includes("苏州市中级人民法院") || rawCourt.includes("Suzhou Intermediate People's Court")) {
    return "JS-SZ-MID";
  }
  if (rawCourt.includes("江苏省高级人民法院")) {
    return "JS-HIGH";
  }
  return null;
}

export function canViewCase(c: CaseItem, session: UserSession): boolean {
  const scopeCode = mapCaseCourtToScopeCode(c.courtCode);
  if (!scopeCode) {
    return false;
  }
  return session.allowedCourtCodes.includes(scopeCode);
}

export function applyCaseScope(cases: CaseItem[], session: UserSession): CaseItem[] {
  return cases.filter((c) => canViewCase(c, session));
}

export function applyTaskScope(tasks: TaskItem[], visibleCases: CaseItem[]): TaskItem[] {
  const caseNoSet = new Set(visibleCases.map((c) => c.caseNo));
  return tasks.filter((t) => caseNoSet.has(t.caseNo));
}

export function getSessionCourtLabel(session: UserSession): string {
  return getCourtName(session.selectedCourtCode, session.locale);
}

export function requireCaseInScope(caseItem: CaseItem, session: UserSession): CaseItem {
  if (!canViewCase(caseItem, session)) {
    notFound();
  }
  return caseItem;
}

export function toCourtCodesQuery(session: UserSession): string {
  return encodeURIComponent(session.allowedCourtCodes.join(","));
}
