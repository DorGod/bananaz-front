import { api } from "./http";
import type { ImageItem, ImageThread } from "../types/api";

export async function getImages(): Promise<ImageItem[]> {
  const { data } = await api.get<ImageItem[]>("/images");
  return data;
}

export async function createImage(): Promise<{ id: string; url: string }> {
  const { data } = await api.post<{ id: string; url: string }>("/images");
  return data;
}

export async function getThreadsForImage(
  imageId: string
): Promise<ImageThread[]> {
  const { data } = await api.get<ImageThread[]>(`/images/${imageId}/threads`);
  return data;
}

export async function deleteThread(threadId: string): Promise<void> {
  await api.delete(`/threads/${threadId}`);
}

// 👇 NEW

export type CreateThreadPayload = {
  x: number; // normalized 0–1
  y: number; // normalized 0–1
  comment: string;
};

export async function createThread(
  imageId: string,
  payload: CreateThreadPayload
): Promise<ImageThread> {
  const { data } = await api.post<ImageThread>(
    `/images/${imageId}/threads`,
    payload
  );
  return data;
}
