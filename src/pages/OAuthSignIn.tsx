import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

function safeNext(raw: string | null): string {
  if (!raw) return "/";
  try {
    const decoded = decodeURIComponent(raw);
    if (!decoded.startsWith("/") || decoded.startsWith("//")) return "/";
    return decoded;
  } catch { return "/"; }
}

const wrap: React.CSSProperties = {
  minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
  background: "#1A1612", color: "#FAF7F2", fontFamily: "'DM Sans', system-ui, sans-serif", padding: 24,
};
const card: React.CSSProperties = {
  maxWidth: 420, width: "100%", background: "#221C17",
  border: "1px solid rgba(250,247,242,0.08)", borderRadius: 16, padding: 32,
};
const h1: React.CSSProperties = { fontFamily: "'Playfair Display', serif", fontSize: 22, margin: "0 0 6px" };
const input: React.CSSProperties = {
  width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid rgba(250,247,242,0.15)",
  background: "#1A1612", color: "#FAF7F2", fontSize: 15, marginTop: 8, boxSizing: "border-box",
};
const btnPrimary: React.CSSProperties = {
  background: "#C8523A", color: "#FAF7F2", border: "none", borderRadius: 10,
  padding: "12px 18px", fontSize: 15, fontWeight: 600, cursor: "pointer", width: "100%", marginTop: 12,
};
const btnGoogle: React.CSSProperties = {
  ...btnPrimary, background: "#FAF7F2", color: "#1A1612",
  display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
};

export default function OAuthSignIn() {
  const [params] = useSearchParams();
  const next = useMemo(() => safeNext(params.get("next")), [params]);
  const returnUrl = useMemo(() => window.location.origin + next, [next]);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) window.location.href = next;
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) window.location.href = next;
    });
    return () => sub.subscription.unsubscribe();
  }, [next]);

  async function google() {
    setErr(null);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: returnUrl });
    if (result.error) setErr(String(result.error.message ?? result.error));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr(null); setBusy(true);
    const { error } = mode === "signin"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: returnUrl } });
    setBusy(false);
    if (error) setErr(error.message);
  }

  return (
    <div style={wrap}>
      <div style={card}>
        <h1 style={h1}>Sign in to continue</h1>
        <p style={{ opacity: 0.7, fontSize: 14, marginTop: 0 }}>
          You need to sign in to approve this connection.
        </p>
        <button style={btnGoogle} onClick={google}>
          <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.9 32.4 29.4 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.7 2.9l5.7-5.7C33.8 6.4 29.1 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.3-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.9 19 12.5 24 12.5c2.9 0 5.6 1.1 7.7 2.9l5.7-5.7C33.8 6.4 29.1 4.5 24 4.5 16.3 4.5 9.7 8.9 6.3 14.7z"/><path fill="#4CAF50" d="M24 43.5c5 0 9.6-1.9 13.1-5l-6.1-5c-2 1.4-4.4 2.2-7 2.2-5.4 0-9.9-3.1-11.4-7.5l-6.5 5C9.6 39.1 16.2 43.5 24 43.5z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.5l6.1 5C40.7 35.1 43.5 30 43.5 24c0-1.2-.1-2.3-.4-3.5z"/></svg>
          Continue with Google
        </button>
        <div style={{ opacity: 0.5, textAlign: "center", margin: "20px 0 8px", fontSize: 12 }}>OR</div>
        <form onSubmit={submit}>
          <input style={input} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email"/>
          <input style={input} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete={mode === "signin" ? "current-password" : "new-password"}/>
          <button style={btnPrimary} type="submit" disabled={busy}>{mode === "signin" ? "Sign in" : "Create account"}</button>
        </form>
        <button
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          style={{ background: "none", border: "none", color: "#C8523A", cursor: "pointer", marginTop: 12, fontSize: 14 }}>
          {mode === "signin" ? "Need an account? Sign up" : "Have an account? Sign in"}
        </button>
        {err && <p style={{ color: "#ff8f7a", fontSize: 13, marginTop: 12 }}>{err}</p>}
      </div>
    </div>
  );
}