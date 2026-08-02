"use client";

import React, { useState, useEffect } from "react";

let toastListeners: Array<(t: ToastMessage) => void> = [];

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  title: string;
  description?: string;
}

export const toast = {
  success: (title: string, description?: string) => {
    emitToast("success", title, description);
  },
  error: (title: string, description?: string) => {
    emitToast("error", title, description);
  },
  info: (title: string, description?: string) => {
    emitToast("info", title, description);
  },
};

function emitToast(type: "success" | "error" | "info", title: string, description?: string) {
  const id = Math.random().toString(36).substring(2, 9);
  toastListeners.forEach((l) => l({ id, type, title, description }));
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const listener = (newToast: ToastMessage) => {
      setToasts((prev) => [...prev, newToast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 5000);
    };

    toastListeners.push(listener);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== listener);
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-80">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`p-4 rounded-xl border shadow-xl flex flex-col gap-1 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 ${
            t.type === "success"
              ? "bg-emerald-950/90 border-emerald-850 text-emerald-200"
              : t.type === "error"
              ? "bg-rose-950/90 border-rose-850 text-rose-200"
              : "bg-slate-950/90 border-slate-800 text-slate-200"
          }`}
        >
          <div className="text-xs font-bold leading-none">{t.title}</div>
          {t.description && <div className="text-[10px] opacity-80 leading-normal mt-1">{t.description}</div>}
        </div>
      ))}
    </div>
  );
}
