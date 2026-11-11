"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Dumbbell, Loader2 } from "lucide-react";

const C = { bg: "#13161B", card: "#20252E", line: "#323A47", text: "#EEF1F5", mut: "#8B93A1", mut2: "#5E6675", amber: "#FF8A3D" };
const display = { fontFamily: "'Space Grotesk', system-ui, sans-serif" };
const body = { fontFamily: "'Inter', system-ui, sans-serif" };

export default function Login() {
  const [busy, setBusy] = useState(null);
  const signIn = async (provider) => {
    setBusy(provider);
    const sb = createClient();
    const site = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    await sb.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${site}/auth/callback` },
    });
  };

  return (
    <div style={{ background: C.bg, minHeight: "100vh", ...body }} className="flex flex-col items-center justify-center px-6">
      <div style={{ maxWidth: 380 }} className="w-full text-center">
        <div style={{ background: C.amber }} className="rounded-2xl w-16 h-16 mx-auto flex items-center justify-center mb-4">
          <Dumbbell size={32} color={C.bg} />
        </div>
        <h1 style={{ color: C.text, ...display }} className="text-3xl font-bold">TreinoCerto</h1>
        <p style={{ color: C.mut, ...body }} className="text-sm mt-2 mb-8">Seu treino guiado, evolução e coach de IA. Entre para salvar tudo na sua conta.</p>

        <button onClick={() => signIn("google")} disabled={busy}
          style={{ background: "#fff", color: "#1f1f1f", ...body }}
          className="w-full rounded-2xl py-3.5 font-semibold flex items-center justify-center gap-3 mb-3">
          {busy === "google" ? <Loader2 size={18} className="an-spin" /> : <GoogleIcon />} Continuar com Google
        </button>

        <button onClick={() => signIn("apple")} disabled={busy}
          style={{ background: "#000", color: "#fff", border: `1px solid ${C.line}`, ...body }}
          className="w-full rounded-2xl py-3.5 font-semibold flex items-center justify-center gap-3">
          {busy === "apple" ? <Loader2 size={18} className="an-spin" /> : <AppleIcon />} Continuar com Apple
        </button>

        <p style={{ color: C.mut2, ...body }} className="text-xs mt-8 leading-relaxed">
          Ferramenta de orientação — não substitui educador físico ou médico.
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.6 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.8 6.1C12.2 13.2 17.6 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.1 5.3-4.6 7l7.1 5.5c4.1-3.8 6.2-9.4 6.2-17z" />
      <path fill="#FBBC05" d="M10.4 28.7c-.5-1.4-.8-2.9-.8-4.7s.3-3.3.8-4.7l-7.8-6.1C1 16.3 0 20 0 24s1 7.7 2.6 10.8l7.8-6.1z" />
      <path fill="#34A853" d="M24 48c6.2 0 11.5-2.1 15.3-5.6l-7.1-5.5c-2 1.4-4.6 2.2-8.2 2.2-6.4 0-11.8-3.7-13.6-9.8l-7.8 6.1C6.5 42.6 14.6 48 24 48z" />
    </svg>
  );
}
function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.4 12.6c0-2.6 2.1-3.9 2.2-3.9-1.2-1.8-3.1-2-3.8-2-1.6-.2-3.1 .9-3.9 .9-.8 0-2-.9-3.3-.9-1.7 0-3.3 1-4.2 2.5-1.8 3.1-.5 7.7 1.3 10.2 .9 1.2 1.9 2.6 3.2 2.5 1.3-.1 1.8-.8 3.3-.8 1.5 0 2 .8 3.3 .8 1.4 0 2.3-1.2 3.1-2.5 .7-1 .9-2 1-2.1-.1 0-2.5-1-2.5-3.7zM14 4.8c.7-.9 1.2-2.1 1-3.3-1 0-2.3 .7-3 1.5-.7 .8-1.3 2-1.1 3.2 1.2 .1 2.4-.6 3.1-1.4z" />
    </svg>
  );
}
