"use client";

import { useEffect, useMemo, useState } from "react";
import { COURTS, DemoAccountId, DEMO_ACCOUNTS } from "@/lib/access-model";

type Props = {
  locale: string;
  submitAction: (formData: FormData) => Promise<void>;
  errorMessage?: string;
};

function getAllowedCourts(accountId: DemoAccountId) {
  const account = DEMO_ACCOUNTS.find((a) => a.id === accountId);
  if (!account) {
    return [];
  }

  const roots = account.allowedRootCourts;
  const queue = [...roots];
  const codes: string[] = [];

  while (queue.length > 0) {
    const code = queue.shift();
    if (!code) {
      continue;
    }
    codes.push(code);
    const children = COURTS.filter((c) => c.parentCode === code).map((c) => c.code);
    queue.push(...children);
  }

  return COURTS.filter((c) => codes.includes(c.code));
}

export function LoginForm({ locale, submitAction, errorMessage }: Props) {
  const defaultAccount: DemoAccountId = locale === "en-US" ? "account2" : "account1";
  const [accountId, setAccountId] = useState<DemoAccountId>(defaultAccount);

  const courtOptions = useMemo(() => getAllowedCourts(accountId), [accountId]);
  const [courtCode, setCourtCode] = useState("");

  useEffect(() => {
    if (courtOptions.length > 0) {
      setCourtCode(courtOptions[0].code);
    }
  }, [accountId]);

  return (
    <form action={submitAction}>
      <label className="field">
        <span>{locale === "zh-CN" ? "测试账号" : "Demo Account"}</span>
        <select name="accountId" value={accountId} onChange={(e) => setAccountId(e.target.value as DemoAccountId)}>
          {DEMO_ACCOUNTS.map((a) => (
            <option value={a.id} key={a.id}>
              {locale === "zh-CN" ? a.displayNameZh : a.displayNameEn}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>{locale === "zh-CN" ? "账号" : "Username"}</span>
        <input name="username" value={accountId} readOnly />
      </label>

      <label className="field">
        <span>{locale === "zh-CN" ? "密码" : "Password"}</span>
        <input name="password" type="password" value="demo123" readOnly />
      </label>

      <label className="field">
        <span>{locale === "zh-CN" ? "法院" : "Court"}</span>
        <select name="courtCode" value={courtCode} onChange={(e) => setCourtCode(e.target.value)}>
          {courtOptions.map((c) => (
            <option key={c.code} value={c.code}>
              {locale === "zh-CN" ? c.nameZh : c.nameEn}
            </option>
          ))}
        </select>
      </label>

      {errorMessage ? <p className="subtitle" style={{ color: "#d64545" }}>{errorMessage}</p> : null}

      <button className="primary-btn" type="submit">
        {locale === "zh-CN" ? "登录并进入工作台" : "Sign in"}
      </button>
    </form>
  );
}
