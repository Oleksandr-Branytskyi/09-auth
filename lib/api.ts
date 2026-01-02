import axios, { type AxiosResponse } from "axios";
import type { Note, NoteTag } from "@/types/note";

const BASE_URL = "https://notehub-public.goit.study/api";

function getApi() {
  const token = process.env.NEXT_PUBLIC_NOTEHUB_TOKEN;

  if (!token) {
    throw new Error(
      "NEXT_PUBLIC_NOTEHUB_TOKEN is missing. Add it to environment variables."
    );
  }

  return axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/* ---------- TYPES ---------- */

export interface FetchNotesParams {
  page: number;
  perPage: number;
  search?: string;
  tag?: NoteTag;
}

export interface FetchNotesResponse {
  notes: Note[];
  totalPages: number;
}

export interface CreateNotePayload {
  title: string;
  content: string;
  tag: NoteTag;
}

/* ---------- API FUNCTIONS ---------- */

export async function fetchNotes(
  params: FetchNotesParams
): Promise<FetchNotesResponse> {
  const api = getApi();

  const response: AxiosResponse<FetchNotesResponse> = await api.get("notes", {
    params: {
      page: params.page,
      perPage: params.perPage,
      search: params.search?.trim() || undefined,
      tag: params.tag,
    },
    headers: {
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    },
  });

  return response.data;
}

export async function fetchNoteById(id: string): Promise<Note> {
  const api = getApi();

  const response: AxiosResponse<Note> = await api.get(`notes/${id}`, {
    headers: {
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    },
  });

  return response.data;
}

export async function createNote(payload: CreateNotePayload): Promise<Note> {
  const api = getApi();

  const response: AxiosResponse<Note> = await api.post("notes", payload);
  return response.data;
}

export async function deleteNote(id: string): Promise<Note> {
  const api = getApi();

  const response: AxiosResponse<Note> = await api.delete(`notes/${id}`, {
    headers: {
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    },
  });

  return response.data;
}
