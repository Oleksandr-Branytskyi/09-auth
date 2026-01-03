"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import type { NoteTag } from "@/types/note";
import { fetchNotes } from "@/lib/api/clientApi";

import NoteList from "@/components/NoteList/NoteList";
import SearchBox from "@/components/SearchBox/SearchBox";
import Pagination from "@/components/Pagination/Pagination";

import css from "@/styles/NotesPage.module.css";

type Props = {
  slug?: string[];
};

function useDebouncedValue<T>(value: T, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(id);
  }, [value, delay]);

  return debounced;
}

export default function NotesClient({ slug }: Props) {
  const rawTag = slug?.[0] ?? "all";
  const tag: NoteTag | undefined =
    rawTag !== "all" ? (rawTag as NoteTag) : undefined;

  const [pageByTag, setPageByTag] = useState<Record<string, number>>({});
  const page = pageByTag[rawTag] ?? 1;

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);

  const queryKey = useMemo(
    () => ["notes", { tag, page, search: debouncedSearch }],
    [tag, page, debouncedSearch]
  );

  const { data, isLoading, isError } = useQuery({
    queryKey,
    queryFn: () =>
      fetchNotes({
        page,
        perPage: 12,
        search: debouncedSearch,
        tag,
      }),
  });

  const notes = data?.notes ?? [];
  const totalPages = data?.totalPages ?? 1;

  const handlePageChange = (nextPage: number) => {
    setPageByTag((prev) => ({ ...prev, [rawTag]: nextPage }));
  };

  return (
    <div className={css.app}>
      <div className={css.toolbar}>
        <SearchBox
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPageByTag((prev) => ({ ...prev, [rawTag]: 1 }));
          }}
        />
        <Link href="/notes/action/create" className={css.button}>
          Create note
        </Link>
      </div>

      {isLoading && <p>Loading...</p>}
      {isError && <p>Error</p>}

      {!isLoading && !isError && notes.length === 0 && <p>No notes found</p>}

      {notes.length > 0 && <NoteList notes={notes} />}

      {totalPages > 1 && (
        <Pagination
          page={page}
          pageCount={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
