import * as SecureStore from "expo-secure-store";

export const colors = {
  ink: "#12110E",
  ink2: "#1C1B18",
  paper: "#F7F4EE",
  paper2: "#EFEAE0",
  cream: "#F4EFE6",
  brass: "#C4A574",
  muted: "#6F6A60",
  line: "#E4DDD0",
  warn: "#8A5A22",
  warnBg: "#F3EAD8",
  ok: "#3D6B4F",
};

const API_KEY = "gangbox.api";
let cachedApi = "";

function cleanUrl(value: string | null | undefined): string {
  return (value ?? "").trim().replace(/\/+$/, "");
}

export function apiBase(): string {
  const fromEnv = cleanUrl(process.env.EXPO_PUBLIC_API_URL);
  return fromEnv || cachedApi;
}

export async function loadApiBase(): Promise<string> {
  const fromEnv = cleanUrl(process.env.EXPO_PUBLIC_API_URL);
  if (fromEnv) {
    cachedApi = fromEnv;
    return fromEnv;
  }
  try {
    cachedApi = cleanUrl(await SecureStore.getItemAsync(API_KEY));
  } catch {
    cachedApi = "";
  }
  return cachedApi;
}

export async function saveApiBase(url: string): Promise<void> {
  cachedApi = cleanUrl(url);
  if (cachedApi) await SecureStore.setItemAsync(API_KEY, cachedApi);
  else await SecureStore.deleteItemAsync(API_KEY);
}
