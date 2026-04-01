export function isZhLocale(locale: string): boolean {
  return locale === "zh-CN";
}

const CASE_STATUS_ZH: Record<string, string> = {
  REGISTERED: "已立案",
  IN_SERVICE: "送达中",
  CLOSED: "已结案"
};

const TASK_STATUS_ZH: Record<string, string> = {
  PENDING: "待送达",
  IN_PROGRESS: "送达中",
  EFFECTIVE: "送达有效",
  FAILED_NEED_REMEDY: "送达失败待补救",
  ARCHIVED: "已归档"
};

const DOC_TYPE_ZH: Record<string, string> = {
  NOTICE: "通知书",
  SUMMONS: "传票",
  JUDGMENT: "判决书",
  RULING: "裁定书"
};

const CASE_TYPE_ZH: Record<string, string> = {
  civil: "民事案件",
  enforcement: "执行案件"
};

export function displayCaseStatus(value: string, locale: string): string {
  if (!isZhLocale(locale)) {
    return value;
  }
  return CASE_STATUS_ZH[value] || value;
}

export function displayTaskStatus(value: string, locale: string): string {
  if (!isZhLocale(locale)) {
    return value;
  }
  return TASK_STATUS_ZH[value] || value;
}

export function displayDocType(value: string, locale: string): string {
  if (!isZhLocale(locale)) {
    return value;
  }
  return DOC_TYPE_ZH[value] || value;
}

export function displayCaseType(value: string, locale: string): string {
  if (!isZhLocale(locale)) {
    return value;
  }
  return CASE_TYPE_ZH[value] || value;
}

export function displayCourt(value: string, locale: string): string {
  if (!isZhLocale(locale)) {
    return value;
  }
  if (value.includes("人民法院")) {
    return value;
  }
  const map: Record<string, string> = {
    ZJ01: "浙江省杭州市中级人民法院",
    SH0115: "上海市浦东新区人民法院",
    BJ0105: "北京市朝阳区人民法院"
  };
  return map[value] || value;
}

export function displayTribunal(value: string, locale: string): string {
  if (!isZhLocale(locale)) {
    return value;
  }
  const map: Record<string, string> = {
    T01: "民事审判第一庭",
    T02: "民事审判第二庭",
    EXEC: "执行裁判庭"
  };
  return map[value] || value;
}
