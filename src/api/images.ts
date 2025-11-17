import { api } from "./http";
import type { ImageItem, ImageThread } from "../types/api";

// GET /images
export async function getImages(): Promise<ImageItem[]> {
  const { data } = await api.get<ImageItem[]>("/images");
  return data;
}

// POST /images
export async function createImage(): Promise<{ id: string; url: string }> {
  const { data } = await api.post<{ id: string; url: string }>("/images");
  return data;
}

// GET /images/:id/threads
export async function getThreadsForImage(
  imageId: string
): Promise<ImageThread[]> {
  const { data } = await api.get<ImageThread[]>(`/images/${imageId}/threads`);
  return data;
}

// DELETE /threads/:id
export async function deleteThread(threadId: string): Promise<void> {
  await api.delete(`/threads/${threadId}`);
}
