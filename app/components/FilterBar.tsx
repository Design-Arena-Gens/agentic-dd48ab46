"use client";

import { ChangeEvent } from "react";
import clsx from "clsx";

interface FilterBarProps {
  search: string;
  sourceFilter: string;
  onlyUpgradeable: boolean;
  onSearchChange: (value: string) => void;
  onSourceChange: (value: string) => void;
  onUpgradeableChange: (value: boolean) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  totalApps: number;
  filteredApps: number;
  selectedCount: number;
  onClearSelection: () => void;
}

export function FilterBar({
  search,
  sourceFilter,
  onlyUpgradeable,
  onSearchChange,
  onSourceChange,
  onUpgradeableChange,
  onRefresh,
  isRefreshing,
  totalApps,
  filteredApps,
  selectedCount,
  onClearSelection
}: FilterBarProps): JSX.Element {
  const handleSourceChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onSourceChange(event.target.value);
  };

  return (
    <section className="mb-6 rounded-3xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur">
      <div className="grid gap-4 md:grid-cols-[2fr_1fr_1fr_auto] md:items-end">
        <label className="flex flex-col gap-2 text-xs uppercase tracking-wide text-slate-400">
          Search
          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by name, id, publisher..."
            className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none ring-cyan-500/40 transition focus:border-cyan-400 focus:ring-2"
          />
        </label>

        <label className="flex flex-col gap-2 text-xs uppercase tracking-wide text-slate-400">
          Source
          <select
            value={sourceFilter}
            onChange={handleSourceChange}
            className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none ring-cyan-500/40 transition focus:border-cyan-400 focus:ring-2"
          >
            <option value="all">All Sources</option>
            <option value="winget">Winget</option>
            <option value="msstore">Microsoft Store</option>
            <option value="registry">Registry</option>
            <option value="unknown">Unknown</option>
          </select>
        </label>

        <label className="flex items-center gap-3 self-center text-sm">
          <input
            type="checkbox"
            checked={onlyUpgradeable}
            onChange={(event) => onUpgradeableChange(event.target.checked)}
            className="h-4 w-4 rounded border border-slate-600 bg-slate-900 text-cyan-400 focus:ring-cyan-500"
          />
          <span className="text-slate-200">Show upgrades only</span>
        </label>

        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className={clsx(
            "h-fit rounded-2xl border border-cyan-500/30 px-4 py-3 text-sm font-medium transition",
            isRefreshing
              ? "cursor-wait bg-cyan-500/10 text-cyan-200"
              : "bg-cyan-500/20 text-cyan-100 hover:border-cyan-400 hover:bg-cyan-500/30"
          )}
        >
          {isRefreshing ? "Indexing..." : "Re-run Index"}
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-400">
        <span className="rounded-full bg-slate-950/60 px-3 py-1">
          Total apps: <strong className="text-slate-100">{totalApps}</strong>
        </span>
        <span className="rounded-full bg-slate-950/60 px-3 py-1">
          Visible: <strong className="text-slate-100">{filteredApps}</strong>
        </span>
        <span
          className={clsx(
            "rounded-full px-3 py-1",
            selectedCount > 0 ? "bg-cyan-500/20 text-cyan-100" : "bg-slate-950/60"
          )}
        >
          Selected: <strong className="text-slate-100">{selectedCount}</strong>
        </span>
        {selectedCount > 0 && (
          <button
            type="button"
            onClick={onClearSelection}
            className="rounded-full border border-transparent px-3 py-1 text-cyan-200 underline transition hover:text-cyan-100"
          >
            Clear selection
          </button>
        )}
      </div>
    </section>
  );
}
