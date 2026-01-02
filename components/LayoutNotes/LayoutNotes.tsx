import type { ReactNode } from "react";
import css from "./LayoutNotes.module.css";

type Props = {
  sidebar?: ReactNode;
  notes?: ReactNode;
  modal?: ReactNode;
};

export default function LayoutNotes({ sidebar, notes, modal }: Props) {
  return (
    <>
      <div className={css.wrapper}>
        <aside className={css.sidebar}>{sidebar ?? null}</aside>
        <section className={css.content}>{notes ?? null}</section>
      </div>
      {modal ?? null}
    </>
  );
}
