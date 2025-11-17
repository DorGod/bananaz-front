import { api } from "./http";

export async function createUser(name: string): Promise<void> {
  await api.post("/users", { name });
}

export async function loginUser(name: string): Promise<void> {
  await api.post("/login", { name });
}
