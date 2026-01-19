"use client";

import clsx from "clsx";
import type { IndexResult } from "@/lib/types";

interface StatusBannerProps {
  status: "idle" | "loading" | "ready" | "error";
  result: IndexResult | null;
  errorMessage?: string | null;
}

export function StatusBanner({ status, result, errorMessage }: StatusBannerProps): JSX.Element | null {
  if (status === "idle") {
    return null;
  }

  const isFallback = result?.source === "fallback";
  const message =
    status === "loading"
      ? "Indexing applications…"
      : status === "error"
      ? errorMessage ?? "Indexing failed."
      : isFallback
      ? "winget is unavailable in this environment. Showing sample data."
      : "Indexed directly from winget.";

  return (
    <div
      className={clsx(
        "mb-5 flex items-center justify-between rounded-3xl border px-5 py-4 text-sm shadow",
        status === "error"
          ? "border-rose-500/40 bg-rose-500/10 text-rose-100"
          : isFallback
          ? "border-amber-500/40 bg-amber-500/10 text-amber-100"
          : "border-cyan-500/40 bg-cyan-500/10 text-cyan-100"
      )}
    >
      <span>{message}</span>
      {result && (
        <span className="text-xs text-slate-200/70">
          {result.apps.length} apps · {Math.max(result.durationMs, 1)} ms · {result.generatedAt}
        </span>
      )}
    </div>
  );
}
