import { NextRequest, NextResponse } from "next/server";
import { isValidLocale } from "@/i18n/config";

export async function GET(_request: NextRequest, context: { params: { locale: string } }) {
  const locale = context.params.locale;
  const targetLocale = isValidLocale(locale) ? locale : "zh-CN";
  const response = NextResponse.redirect(new URL(`/${targetLocale}/login`, _request.url));
  response.cookies.delete("jsds_session");
  return response;
}
