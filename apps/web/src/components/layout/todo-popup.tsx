"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getTodoItems, type TodoItem } from "@/lib/actions/todo-items";

const SESSION_KEY = "amicale_todo_seen";

export function TodoPopup() {
  const [items, setItems] = useState<TodoItem[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return;

    getTodoItems()
      .then((data) => {
        if (data.length > 0) {
          setItems(data);
          setOpen(true);
          sessionStorage.setItem(SESSION_KEY, "1");
        }
      })
      .catch(() => {});
  }, []);

  if (!open || items.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[9500] flex items-end justify-center sm:items-center">
      <div
        className="fixed inset-0 bg-black/50 animate-in fade-in"
        onClick={() => setOpen(false)}
      />
      <div className="relative z-10 mx-4 mb-4 w-full max-w-md rounded-[20px] bg-surface-elevated shadow-lg animate-in slide-in-from-bottom-4 fade-in sm:mb-0">
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/20">
              <span className="text-lg">📋</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-content-primary">
                À faire
              </h2>
              <p className="text-xs text-content-secondary">
                {items.length} élément{items.length > 1 ? "s" : ""} en attente
              </p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-secondary text-content-secondary transition-colors hover:text-content-primary"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-4 space-y-2">
          {items.map((item) => (
            <Link
              key={item.type}
              href={item.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-[14px] bg-surface-secondary p-3 transition-colors active:bg-surface-elevated"
            >
              <span className="text-xl">{item.icon}</span>
              <span className="flex-1 text-[14px] font-medium text-content-primary">
                {item.label}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0 text-content-muted"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          ))}
        </div>

        <div className="px-6 pb-6 pt-2">
          <button
            onClick={() => setOpen(false)}
            className="w-full rounded-[14px] bg-brand-500 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-brand-600 active:bg-brand-700"
          >
            Compris
          </button>
        </div>
      </div>
    </div>
  );
}
