import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type AuthOAuth = {
  getAuthorizationDetails: (id: string) => Promise<{ data: any; error: any }>;
  approveAuthorization: (id: string) => Promise<{ data: any; error: any }>;
  denyAuthorization: (id: string) => Promise<{ data: any; error: any }>;
};

function oauthApi(): AuthOAuth {
  return (supabase.auth as unknown as { oauth: AuthOAuth }).oauth;
}

const wrap: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#1A1612",
  color: "#FAF7F2",
  fontFamily: "'DM Sans', system-ui, sans-serif",
  padding: 24,
};
const card: React.CSSProperties = {
  maxWidth: 480,
  width: "100%",
  background: "#221C17",
  border: "1px solid rgba(250,247,242,0.08)",
  borderRadius: 16,
  padding: 32,
};
const h1: React.CSSProperties = { fontFamily: "'Playfair Display', serif", fontSize: 24, margin: "0 0 12px" };
const btnPrimary: React.CSSProperties = {
  background: "#C8523A", color: "#FAF7F2", border: "none", borderRadius: 10,
  padding: "12px 18px", fontSize: 15, fontWeight: 600, cursor: "pointer", flex: 1,
};
const btnSecondary: React.CSSProperties = {
  background: "transparent", color: "#FAF7F2", border: "1px solid rgba(250,247,242,0.2)",
  borderRadius: 10, padding: "12px 18px", fontSize: 15, cursor: "pointer", flex: 1,
};

export default function OAuthConsent() {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) return setError("Missing authorization_id");
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const next = window.location.pathname + window.location.search;
        window.location.href = "/?authRedirect=" + encodeURIComponent(next);
        return;
      }
      const { data, error } = await oauthApi().getAuthorizationDetails(authorizationId);
      if (!active) return;
      if (error) return setError(error.message ?? String(error));
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) { window.location.href = immediate; return; }
      setDetails(data);
    })();
    return () => { active = false; };
  }, [authorizationId]);

  async function decide(approve: boolean) {
    setBusy(true);
    const api = oauthApi();
    const { data, error } = approve
      ? await api.approveAuthorization(authorizationId)
      : await api.denyAuthorization(authorizationId);
    if (error) { setBusy(false); return setError(error.message ?? String(error)); }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) { setBusy(false); return setError("No redirect returned by the authorization server."); }
    window.location.href = target;
  }

  if (error) return (
    <div style={wrap}><div style={card}>
      <h1 style={h1}>Couldn't load this request</h1>
      <p style={{ opacity: 0.8 }}>{error}</p>
    </div></div>
  );
  if (!details) return (
    <div style={wrap}><div style={card}><p>Loading…</p></div></div>
  );

  const clientName = details.client?.name ?? "An app";
  return (
    <div style={wrap}>
      <div style={card}>
        <h1 style={h1}>Connect {clientName} to Pookie & I</h1>
        <p style={{ opacity: 0.85, lineHeight: 1.5 }}>
          This lets <strong>{clientName}</strong> use Pookie & I as you — reading your profile
          and session history, and updating your display name.
        </p>
        <p style={{ opacity: 0.6, fontSize: 13, marginTop: 12 }}>
          This does not bypass this app's permissions or backend policies.
        </p>
        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          <button disabled={busy} style={btnSecondary} onClick={() => decide(false)}>Cancel</button>
          <button disabled={busy} style={btnPrimary} onClick={() => decide(true)}>Approve</button>
        </div>
      </div>
    </div>
  );
}