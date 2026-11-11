"use client";
// Convite para instalar o TreinoCerto como app (PWA).
// O Chrome emite `beforeinstallprompt` cedo, às vezes antes do React montar;
// por isso o layout guarda o evento em window.__promptInstalar e avisa com
// "prompt-instalar-pronto". Sem o evento (iPhone, Firefox, ou o Chrome ainda
// não liberou), mostramos o passo a passo manual de cada navegador.
import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";

const CHAVE_DISPENSA = "tc-instalar-dispensado";

function isInstalled() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

function dica() {
  const ua = navigator.userAgent;
  if (/iphone|ipad|ipod/i.test(ua)) return <>Toque em <Share size={12} style={{ verticalAlign: "-2px", display: "inline" }} /> na barra do Safari e depois em <b>Adicionar à Tela de Início</b>.</>;
  if (/android/i.test(ua)) return <>Abra o menu <b>⋮</b> do navegador e toque em <b>Instalar app</b> (ou "Adicionar à tela inicial").</>;
  if (/firefox|fxios/i.test(ua)) return <>O Firefox no computador não instala apps. Use o Chrome ou o Edge.</>;
  return <>Clique no ícone de instalar na barra de endereço, ou no menu <b>⋮</b> → <b>Instalar TreinoCerto</b>.</>;
}

export function useInstallPrompt() {
  const [evento, setEvento] = useState(null);
  const [instalado, setInstalado] = useState(true);
  useEffect(() => {
    setInstalado(isInstalled());
    if (window.__promptInstalar) setEvento(window.__promptInstalar);
    const aoPoder = (e) => { e.preventDefault(); window.__promptInstalar = e; setEvento(e); };
    const aoGuardado = () => setEvento(window.__promptInstalar);
    const aoInstalar = () => { window.__promptInstalar = null; setEvento(null); setInstalado(true); };
    window.addEventListener("beforeinstallprompt", aoPoder);
    window.addEventListener("prompt-instalar-pronto", aoGuardado);
    window.addEventListener("appinstalled", aoInstalar);
    return () => {
      window.removeEventListener("beforeinstallprompt", aoPoder);
      window.removeEventListener("prompt-instalar-pronto", aoGuardado);
      window.removeEventListener("appinstalled", aoInstalar);
    };
  }, []);
  const instalar = async () => {
    if (!evento) return false;
    evento.prompt();
    const r = await evento.userChoice;
    window.__promptInstalar = null;
    setEvento(null);
    return r?.outcome === "accepted";
  };
  return { evento, instalado, instalar };
}

/** Faixa de convite (celular). Some se já instalado ou dispensado. */
export function InstallBanner({ C, body }) {
  const { evento, instalado, instalar } = useInstallPrompt();
  const [dispensado, setDispensado] = useState(true);
  useEffect(() => {
    try { setDispensado(localStorage.getItem(CHAVE_DISPENSA) === "1"); } catch { setDispensado(false); }
  }, []);
  const dispensar = () => { try { localStorage.setItem(CHAVE_DISPENSA, "1"); } catch { /* privativo */ } setDispensado(true); };
  if (instalado || dispensado) return null;
  return (
    <div style={{ background: C.card, border: `1px solid ${C.line}`, ...body }} className="rounded-2xl p-3 mb-3 flex items-center gap-3">
      <div style={{ background: C.amber }} className="rounded-xl w-9 h-9 shrink-0 flex items-center justify-center"><Download size={18} color={C.bg} /></div>
      <div className="flex-1 min-w-0">
        <p style={{ color: C.text }} className="text-sm font-semibold">Instalar o TreinoCerto</p>
        <p style={{ color: C.mut }} className="text-xs leading-snug">{evento ? "Abre em tela cheia, direto da tela inicial, como um app." : dica()}</p>
      </div>
      {evento && <button onClick={async () => { if (await instalar()) dispensar(); }} style={{ background: C.amber, color: C.bg }} className="rounded-xl px-3 py-2 text-xs font-bold shrink-0">Instalar</button>}
      <button onClick={dispensar} style={{ color: C.mut2 }} aria-label="Dispensar" className="shrink-0"><X size={16} /></button>
    </div>
  );
}

/** Botão compacto (menu lateral no computador). */
export function InstallButton({ C, body }) {
  const { evento, instalado, instalar } = useInstallPrompt();
  const [ajuda, setAjuda] = useState(false);
  if (instalado) return null;
  return (
    <div>
      <button onClick={() => (evento ? instalar() : setAjuda((a) => !a))} style={{ background: C.card, color: C.text, border: `1px solid ${C.line}`, ...body }} className="w-full rounded-xl px-3 py-2.5 text-sm font-semibold flex items-center gap-2">
        <Download size={16} style={{ color: C.amber }} /> Instalar app
      </button>
      {ajuda && <p style={{ color: C.mut, ...body }} className="text-xs leading-snug mt-2 px-1">{dica()}</p>}
    </div>
  );
}
