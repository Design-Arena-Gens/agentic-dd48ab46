"use client";

import Link from "next/link";

export function IndexerHeader(): JSX.Element {
  return (
    <header className="mb-8 flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900/50 p-6 shadow-lg shadow-cyan-500/20 backdrop-blur">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-50 md:text-3xl">
            Winget Device Indexer
          </h1>
          <p className="mt-1 max-w-3xl text-sm text-slate-300 md:text-base">
            Index every installed application on your Windows device, filter the results instantly, and
            generate reproducible <code className="rounded bg-slate-800 px-1 text-xs">winget</code>
            commands for deployment scripts or recovery plans.
          </p>
        </div>
        <div className="flex gap-3 text-sm">
          <Link
            href="https://learn.microsoft.com/windows/package-manager/winget/"
            target="_blank"
            className="rounded-full border border-cyan-400/40 bg-cyan-500/10 px-4 py-2 text-cyan-200 transition hover:border-cyan-300 hover:bg-cyan-500/20"
          >
            Winget Docs
          </Link>
          <Link
            href="https://github.com/microsoft/winget-cli"
            target="_blank"
            className="rounded-full border border-slate-700 bg-slate-800 px-4 py-2 text-slate-200 transition hover:border-slate-500 hover:bg-slate-700"
          >
            winget-cli Repo
          </Link>
        </div>
      </div>
      <div className="grid gap-3 text-xs text-slate-400 md:grid-cols-3">
        <div className="rounded-2xl bg-slate-950/40 p-4">
          <p className="font-semibold text-slate-200">Full Device Sweep</p>
          <p className="mt-1 leading-relaxed">
            Executes <code>winget list</code> and registry fallbacks to capture every application,
            including legacy x86 entries.
          </p>
        </div>
        <div className="rounded-2xl bg-slate-950/40 p-4">
          <p className="font-semibold text-slate-200">Powerful Filtering</p>
          <p className="mt-1 leading-relaxed">
            Slice by source, publisher, upgrade availability, or freeform search across all metadata.
          </p>
        </div>
        <div className="rounded-2xl bg-slate-950/40 p-4">
          <p className="font-semibold text-slate-200">Command Builder</p>
          <p className="mt-1 leading-relaxed">
            Export typed <code>winget</code> instructions or JSON manifests ready for automation pipelines.
          </p>
        </div>
      </div>
    </header>
  );
}
