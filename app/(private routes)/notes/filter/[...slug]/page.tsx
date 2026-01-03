import type { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import type { NoteTag } from "@/types/note";
import getQueryClient from "@/lib/getQueryClient";
import { fetchNotes } from "@/lib/api/serverApi";
import NotesClient from "./Notes.client";

type Props = {
  params: Promise<{ slug: string[] }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const rawTag = slug?.[0] ?? "all";
  const filterName = rawTag === "all" ? "All" : rawTag;

  const title = `Notes — ${filterName} | NoteHub`;
  const description = `Browse NoteHub notes filtered by: ${filterName}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://08-zustand-xi-lovat.vercel.app/notes/filter/${
        slug?.join("/") ?? "all"
      }`,
      images: ["https://ac.goit.global/fullstack/react/notehub-og-meta.jpg"],
    },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;

  const rawTag = slug?.[0] ?? "all";
  const tag: NoteTag | undefined =
    rawTag !== "all" ? (rawTag as NoteTag) : undefined;

  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["notes", { tag, page: 1, search: "" }],
    queryFn: () => fetchNotes({ page: 1, perPage: 20, search: "", tag }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NotesClient slug={slug} />
    </HydrationBoundary>
  );
}
