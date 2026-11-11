import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const COACH_SYSTEM =
  "Você é o Coach do app TreinoCerto, um assistente de academia em português do Brasil. " +
  "Ajude com técnica de exercícios, ajustes de treino e orientações gerais de alimentação para quem treina. " +
  "Seja prático, direto e motivador, em poucos parágrafos. " +
  "Você NÃO é médico, nutricionista nem farmacêutico. Para MEDICAÇÃO, suplementos, doses, lesões, dores persistentes ou condições de saúde, " +
  "dê apenas informação geral e oriente a procurar um profissional (médico, farmacêutico, nutricionista ou educador físico). " +
  "Nunca recomende doses ou remédios específicos, dietas extremas ou jejum prolongado. Incentive metas saudáveis e sustentáveis.";

export async function POST(request) {
  // Só usuários logados podem usar a IA (protege sua cota de API).
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "não autenticado" }, { status: 401 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY ausente no servidor" }, { status: 500 });
  }

  const { messages, system } = await request.json();

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: system || COACH_SYSTEM,
      messages: messages || [],
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    return NextResponse.json({ error: "falha na IA", detail }, { status: 502 });
  }

  const data = await res.json();
  const text = (data.content || [])
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();

  return NextResponse.json({ text });
}
