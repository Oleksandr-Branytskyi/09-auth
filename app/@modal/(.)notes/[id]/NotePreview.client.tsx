"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { fetchNoteById } from "@/lib/api";
import Modal from "@/components/Modal/Modal";

type Props = {
  id: string;
};

export default function NotePreviewClient({ id }: Props) {
  const router = useRouter();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["note", id],
    queryFn: () => fetchNoteById(id),
    refetchOnMount: false,
  });

  return (
    <Modal isOpen={true} onClose={() => router.back()}>
      {isLoading && <p>Loading...</p>}
      {isError && <p>Error</p>}

      {data && (
        <>
          <h2>{data.title}</h2>
          <p>{data.content}</p>
          <span>{data.tag}</span>
          <p>{new Date(data.createdAt).toLocaleString()}</p>
        </>
      )}
    </Modal>
  );
}
