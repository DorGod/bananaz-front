import { api } from "./http";
import type { ImageItem, ImageThread } from "../types/api";

export async function getImages(): Promise<ImageItem[]> {
  const { data } = await api.get("/images");

  if (Array.isArray(data)) {
    return data as ImageItem[];
  }

  console.warn("Unexpected /images response:", data);
  return [];
}

export async function createImage(): Promise<{ id: string; url: string }> {
  const { data } = await api.post<{ id: string; url: string }>("/images");
  return data;
}

export async function getThreadsForImage(
  imageId: string
): Promise<ImageThread[]> {
  const { data } = await api.get(`/images/${imageId}/threads`);

  if (Array.isArray(data)) {
    return data as ImageThread[];
  }

  console.warn("Unexpected /images/:id/threads response:", data);
  return [];
}

export async function deleteThread(threadId: string): Promise<void> {
  await api.delete(`/threads/${threadId}`);
}

export type CreateThreadPayload = {
  x: number;
  y: number;
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
