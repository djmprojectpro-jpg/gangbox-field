import AsyncStorage from "@react-native-async-storage/async-storage";
import { uploadPhoto } from "./api";

const KEY = "gangbox.field.queue";

export type QueuedPhoto = {
  id: string;
  projectId: string;
  tag: string;
  caption: string;
  dataUrl: string;
  createdAt: string;
};

async function read(): Promise<QueuedPhoto[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as QueuedPhoto[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function write(items: QueuedPhoto[]) {
  await AsyncStorage.setItem(KEY, JSON.stringify(items));
}

export async function enqueue(item: QueuedPhoto) {
  const items = await read();
  items.push(item);
  await write(items);
}

export async function listQueue() {
  return read();
}

export async function flushQueue(): Promise<{ sent: number; failed: number }> {
  const items = await read();
  const keep: QueuedPhoto[] = [];
  let sent = 0;
  let failed = 0;
  for (const item of items) {
    try {
      await uploadPhoto({
        projectId: item.projectId,
        tag: item.tag,
        caption: item.caption,
        dataUrl: item.dataUrl,
      });
      sent++;
    } catch {
      keep.push(item);
      failed++;
    }
  }
  await write(keep);
  return { sent, failed };
}
