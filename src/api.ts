import { getToken } from "./auth";
import { apiBase } from "./theme";

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const base = apiBase();
  if (!base) throw new Error("Set EXPO_PUBLIC_API_URL to your Gangbox shop URL.");
  const token = await getToken();
  const res = await fetch(`${base}/api/mobile/${path.replace(/^\//, "")}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });
  const body = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new Error(body.error ?? `HTTP ${res.status}`);
  return body;
}

export type FieldJob = {
  id: string;
  name: string;
  status: string;
  trade: string;
  city: string | null;
  state: string | null;
  address_line1: string | null;
  zip: string | null;
  scope_text: string;
  client_name: string | null;
  client_phone: string | null;
  client_email: string | null;
};

export type FieldEvent = {
  id: string;
  title: string;
  starts_at: string;
  project_name: string | null;
};

export function getSession() {
  return req<{ userId: string; role: string; companyName: string; companyPhone: string | null }>("session");
}

export function getToday() {
  return req<{
    companyName: string;
    role: string;
    jobs: FieldJob[];
    events: FieldEvent[];
  }>("today");
}

export function getJob(id: string) {
  return req<{
    job: FieldJob;
    photos: { id: string; tag: string; data_url: string }[];
  }>(`jobs/${id}`);
}

export function setJobStatus(id: string, status: string) {
  return req<{ ok: boolean }>(`jobs/${id}/status`, {
    method: "POST",
    body: JSON.stringify({ status }),
  });
}

export function uploadPhoto(input: { projectId: string; tag: string; caption?: string; dataUrl: string }) {
  return req<{ id: string }>("photos", { method: "POST", body: JSON.stringify(input) });
}

export function listMessages() {
  return req<{ messages: { id: string; body: string; channel: string; opened_composer_at: string | null }[] }>(
    "messages",
  );
}

export function draftSms(input: { kind: string; projectId?: string; tag?: string }) {
  return req<{ id: string; body: string; toPhone: string | null }>("sms", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function markSmsOpened(id: string) {
  return req<{ ok: boolean }>(`sms/${id}/opened`, { method: "POST" });
}
