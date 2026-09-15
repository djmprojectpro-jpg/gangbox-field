import * as SecureStore from "expo-secure-store";
import { apiBase } from "./theme";

const TOKEN_KEY = "gangbox.session";

export async function getToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function setToken(token: string | null): Promise<void> {
  if (token) await SecureStore.setItemAsync(TOKEN_KEY, token);
  else await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function signInEmail(email: string, password: string): Promise<void> {
  const base = apiBase();
  if (!base) throw new Error("Enter your Gangbox shop URL first.");
  const res = await fetch(`${base}/api/auth/sign-in/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim(), password }),
  });
  const token = res.headers.get("set-auth-token");
  const body = (await res.json().catch(() => ({}))) as {
    token?: string;
    session?: { token?: string };
    error?: { message?: string };
  };
  if (!res.ok) throw new Error(body.error?.message ?? "Sign-in failed");
  const next = token || body.token || body.session?.token;
  if (!next) throw new Error("No session token returned. Check Better Auth bearer on the shop.");
  await setToken(next);
}

export async function signOut(): Promise<void> {
  const base = apiBase();
  const token = await getToken();
  if (base && token) {
    await fetch(`${base}/api/auth/sign-out`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => null);
  }
  await setToken(null);
}
