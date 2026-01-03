import type { AxiosResponse } from "axios";
import { api } from "./api";
import type { Note } from "../../types/note";
import type { User } from "../../types/user";

export interface FetchNotesParams {
  search?: string;
  page?: number;
  perPage?: number;
  tag?: string;
}

const withCookie = (cookie?: string) => ({
  headers: cookie ? { Cookie: cookie } : undefined,
});

export const fetchNotes = async (
  params: FetchNotesParams,
  cookie?: string
): Promise<Note[]> => {
  const { data } = await api.get<Note[]>("/notes", {
    ...withCookie(cookie),
    params,
  });
  return data;
};

export const fetchNoteById = async (
  id: string,
  cookie?: string
): Promise<Note> => {
  const { data } = await api.get<Note>(`/notes/${id}`, withCookie(cookie));
  return data;
};

export const getMe = async (cookie?: string): Promise<User> => {
  const { data } = await api.get<User>("/users/me", withCookie(cookie));
  return data;
};

export const checkSession = async (
  cookie?: string
): Promise<AxiosResponse<User | null>> => {
  const response = await api.get<User | null>(
    "/auth/session",
    withCookie(cookie)
  );
  return response;
};
