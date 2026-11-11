import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// URL pública do site. Atrás de proxy (Render, Docker), request.url traz o
// endereço interno do container (ex.: 0.0.0.0:10000), então não dá para usar
// a origem dele no redirect.
function publicOrigin(request, fallback) {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, "");
  }
  const host = request.headers.get("x-forwarded-host");
  if (host) {
    const proto = request.headers.get("x-forwarded-proto") ?? "https";
    return `${proto}://${host}`;
  }
  return fallback;
}

// Para onde o Supabase redireciona após o login social.
// Troca o "code" pela sessão e manda o usuário para o app.
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const site = publicOrigin(request, origin);
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next") ?? "/";
  // Só caminhos internos (evita redirecionar para outro domínio).
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/";

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${site}${next}`);
    }
  }
  return NextResponse.redirect(`${site}/?erro=auth`);
}
