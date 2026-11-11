import { createClient } from "@/lib/supabase/client";

const DEFAULTS = {
  profile: null,
  plan: null,
  tracking: { weightLog: [], history: [] },
  session: { sets: {} },
  chat: [],
};

// Carrega (ou cria) a linha do usuário.
export async function loadState() {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;

  let { data, error } = await sb
    .from("app_data")
    .select("profile, plan, tracking, session, chat")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("loadState:", error.message);
    return { ...DEFAULTS };
  }
  if (!data) {
    // Fallback caso o trigger de criação ainda não tenha rodado.
    await sb.from("app_data").insert({ user_id: user.id });
    return { ...DEFAULTS };
  }
  return {
    profile: data.profile ?? null,
    plan: data.plan ?? null,
    tracking: data.tracking ?? DEFAULTS.tracking,
    session: data.session ?? DEFAULTS.session,
    chat: data.chat ?? [],
  };
}

// Grava só os campos alterados (upsert pela PK user_id).
export async function patchState(patch) {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return;
  const { error } = await sb
    .from("app_data")
    .upsert({ user_id: user.id, ...patch }, { onConflict: "user_id" });
  if (error) console.error("patchState:", error.message);
}

export async function signOut() {
  const sb = createClient();
  await sb.auth.signOut();
}

// Chama o coach via rota server-side (chave da Anthropic fica no servidor).
export async function askCoach(messages, system) {
  const res = await fetch("/api/coach", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, system }),
  });
  if (!res.ok) throw new Error("coach indisponível");
  const data = await res.json();
  return data.text || "";
}
