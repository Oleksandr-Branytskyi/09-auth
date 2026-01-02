"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { fetchNoteById } from "@/lib/api";
import Modal from "@/components/Modal/Modal";
import css from "./NotePreview.module.css";

type Props = {
  id: string;
};

export default function NotePreview({ id }: Props) {
  const router = useRouter();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["note", id],
    queryFn: () => fetchNoteById(id),
  });

  return (
    <Modal isOpen={true} onClose={() => router.back()}>
      {isLoading && <p className={css.loading}>Loading...</p>}
      {isError && <p className={css.error}>Error</p>}

      {data && (
        <div className={css.wrapper}>
          <h2 className={css.title}>{data.title}</h2>
          <p className={css.content}>{data.content}</p>
          <span className={css.tag}>{data.tag}</span>
        </div>
      )}
    </Modal>
  );
}
