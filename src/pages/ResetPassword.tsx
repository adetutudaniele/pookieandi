import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const ResetPassword = () => {
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.title = "Reset password · Pookie & I";
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setError("");
    setBusy(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (err) setError(err.message);
    else setDone(true);
  };

  return (
    <main className="min-h-[100dvh] flex items-center justify-center bg-background text-foreground p-6">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-semibold">Set a new password</h1>
        {done ? (
          <>
            <p className="text-muted-foreground">Your password has been updated.</p>
            <a className="underline text-primary" href="/">Back to Pookie &amp; I</a>
          </>
        ) : !ready ? (
          <p className="text-muted-foreground">
            Open this page from the reset link in your email to continue.
          </p>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New password"
                aria-label="New password"
                autoComplete="new-password"
                className="w-full rounded-md border border-border bg-card px-3 py-3 pr-16 text-base"
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
                aria-label={show ? "Hide password" : "Show password"}
              >
                {show ? "Hide" : "Show"}
              </button>
            </div>
            {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-md bg-primary px-4 py-3 text-primary-foreground disabled:opacity-60"
            >
              {busy ? "Saving…" : "Update password"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
};

export default ResetPassword;
