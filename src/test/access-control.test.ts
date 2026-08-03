import { describe, it, expect, beforeAll } from "vitest";
import { createClient } from "@supabase/supabase-js";

const URL = import.meta.env.VITE_SUPABASE_URL as string;
const KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

/**
 * Automated access-control checks.
 * These run against the live backend with an anonymous (signed-out) client and
 * assert that private user data is never readable or writable.
 */
const anon = createClient(URL, KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const OTHER_USER_ID = "00000000-0000-0000-0000-0000000000ff";

function blocked(res: { data: unknown; error: unknown }) {
  // Either the request errors (permission denied / RLS) or it returns no rows.
  return !!res.error || (Array.isArray(res.data) && res.data.length === 0);
}

describe("signed-out access is blocked", () => {
  beforeAll(() => {
    expect(URL, "VITE_SUPABASE_URL must be set").toBeTruthy();
    expect(KEY, "VITE_SUPABASE_PUBLISHABLE_KEY must be set").toBeTruthy();
  });

  it("cannot read profiles", async () => {
    expect(blocked(await anon.from("profiles").select("id, display_name").limit(5))).toBe(true);
  });

  it("cannot read another user's profile by id", async () => {
    expect(blocked(await anon.from("profiles").select("id").eq("id", OTHER_USER_ID))).toBe(true);
  });

  it("cannot read session history", async () => {
    expect(blocked(await anon.from("session_history").select("id, partner_name").limit(5))).toBe(true);
  });

  it("cannot read another user's session history", async () => {
    expect(blocked(await anon.from("session_history").select("id").eq("user_id", OTHER_USER_ID))).toBe(true);
  });

  it("cannot read player stats", async () => {
    expect(blocked(await anon.from("player_stats").select("user_id, total_points").limit(5))).toBe(true);
  });

  it("cannot read device sessions", async () => {
    expect(blocked(await anon.from("user_sessions").select("id, device_label").limit(5))).toBe(true);
  });

  it("cannot write a profile", async () => {
    const res = await anon.from("profiles").insert({ id: OTHER_USER_ID, display_name: "hacker" });
    expect(res.error).toBeTruthy();
  });

  it("cannot write session history for another user", async () => {
    const res = await anon.from("session_history").insert({ user_id: OTHER_USER_ID, partner_name: "hacker" });
    expect(res.error).toBeTruthy();
  });

  it("cannot revoke another user's device session", async () => {
    const res = await anon.from("user_sessions").update({ revoked: true }).eq("user_id", OTHER_USER_ID).select();
    expect(blocked(res)).toBe(true);
  });

  it("cannot read avatar files of another user", async () => {
    const res = await anon.storage.from("avatars").download(`${OTHER_USER_ID}/avatar.jpg`);
    expect(res.error).toBeTruthy();
  });
});

describe("display name validation rules", () => {
  const NAME_RE = /^[\p{L}\p{N}][\p{L}\p{N} ._'\-]*$/u;
  const check = (raw: string) => {
    const v = raw.trim().replace(/\s+/g, " ");
    return v.length >= 2 && v.length <= 30 && NAME_RE.test(v);
  };

  it("accepts normal names", () => {
    expect(check("Ana Maria")).toBe(true);
    expect(check("pookie_01")).toBe(true);
  });

  it("rejects empty, short, long and illegal characters", () => {
    expect(check("")).toBe(false);
    expect(check("a")).toBe(false);
    expect(check("x".repeat(31))).toBe(false);
    expect(check("<script>")).toBe(false);
    expect(check("_leading")).toBe(false);
  });
});
