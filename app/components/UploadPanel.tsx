"use client";

import { ChangeEvent, useRef, useState } from "react";
import { parseWingetList } from "@/lib/parseWinget";
import type { WingetApp } from "@/lib/types";

interface UploadPanelProps {
  onImport: (apps: WingetApp[]) => void;
}

export function UploadPanel({ onImport }: UploadPanelProps): JSX.Element {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = async (file: File) => {
    try {
      const text = await file.text();
      const apps = parseWingetList(text);
      if (apps.length === 0) {
        throw new Error("No recognizable applications found in file.");
      }
      onImport(apps);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to read file.");
    }
  };

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      void handleFiles(file);
    }
  };

  return (
    <section className="mt-6 rounded-3xl border border-slate-800 bg-slate-950/60 p-6 text-sm text-slate-300">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">Bring your own index</h2>
          <p className="text-sm text-slate-400">
            Upload the raw output from <code>winget list --output json</code> or any registry export in JSON
            produced by the bundled PowerShell script.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-full border border-cyan-400 bg-cyan-500/20 px-4 py-2 text-sm text-cyan-100 transition hover:bg-cyan-500/30"
          >
            Import JSON
          </button>
          <a
            href="/scripts/export-winget.ps1"
            download
            className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
          >
            Download script
          </a>
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.txt"
        onChange={onChange}
        className="hidden"
      />
      {error && <p className="mt-3 text-sm text-amber-300">{error}</p>}
    </section>
  );
}
