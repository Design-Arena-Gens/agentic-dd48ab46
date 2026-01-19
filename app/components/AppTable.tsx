"use client";

import clsx from "clsx";
import type { WingetApp } from "@/lib/types";

export type SortKey = "name" | "publisher" | "version" | "available";
export type SortDirection = "asc" | "desc";

interface AppTableProps {
  apps: WingetApp[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onToggleAll: (ids: string[], allSelected: boolean) => void;
  sortKey: SortKey;
  sortDirection: SortDirection;
  onSortChange: (key: SortKey) => void;
}

const headers: Array<{ key: SortKey; label: string; width?: string }> = [
  { key: "name", label: "Application", width: "34%" },
  { key: "publisher", label: "Publisher", width: "26%" },
  { key: "version", label: "Installed", width: "14%" },
  { key: "available", label: "Available", width: "14%" }
];

export function AppTable({
  apps,
  selectedIds,
  onToggle,
  onToggleAll,
  sortKey,
  sortDirection,
  onSortChange
}: AppTableProps): JSX.Element {
  const visibleIds = apps.map((app) => app.id);
  const selectedVisible = visibleIds.filter((id) => selectedIds.has(id)).length;
  const allVisibleSelected = apps.length > 0 && selectedVisible === apps.length;

  const toggleAll = () => onToggleAll(visibleIds, allVisibleSelected);

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/40">
      <div className="grid grid-cols-[auto_1fr] items-center gap-3 border-b border-slate-800 bg-slate-950/50 px-6 py-3 text-xs uppercase tracking-wide text-slate-400">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={allVisibleSelected}
            onChange={toggleAll}
            className="h-4 w-4 rounded border border-slate-600 bg-slate-900 text-cyan-400 focus:ring-cyan-500"
          />
        </div>
        <div className="grid grid-cols-[repeat(4,minmax(0,1fr))] gap-4">
          {headers.map((header) => {
            const active = sortKey === header.key;
            return (
              <button
                type="button"
                key={header.key}
                onClick={() => onSortChange(header.key)}
                className={clsx(
                  "flex items-center gap-2 text-left transition",
                  active ? "text-cyan-200" : "text-slate-400 hover:text-slate-200"
                )}
                style={header.width ? { width: header.width } : undefined}
              >
                {header.label}
                {active && (
                  <span className="text-[0.6rem] font-semibold text-cyan-200">
                    {sortDirection === "asc" ? "▲" : "▼"}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-h-[520px] overflow-y-auto">
        {apps.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-slate-400">
            No applications found. Adjust filters or re-run the indexer.
          </div>
        ) : (
          <ul className="divide-y divide-slate-900/60">
            {apps.map((app) => {
              const selected = selectedIds.has(app.id);
              const upgrade = Boolean(app.isUpgradeAvailable);

              return (
                <li
                  key={app.id}
                  className={clsx(
                    "grid grid-cols-[auto_1fr] items-center gap-3 px-6 py-4 transition",
                    selected ? "bg-cyan-500/10" : "hover:bg-slate-900/40"
                  )}
                >
                  <div className="flex items-center">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => onToggle(app.id)}
                        className="h-4 w-4 rounded border border-slate-600 bg-slate-900 text-cyan-400 focus:ring-cyan-500"
                      />
                    </label>
                  </div>
                  <div className="grid grid-cols-[repeat(4,minmax(0,1fr))] gap-4 text-sm">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-100">{app.name}</span>
                      <span className="text-xs text-slate-400">{app.id}</span>
                    </div>
                    <div className="text-slate-300">{app.publisher ?? "—"}</div>
                    <div className="text-slate-200">{app.version || "—"}</div>
                    <div className="flex items-center gap-2 text-slate-200">
                      {app.availableVersion ?? "—"}
                      {upgrade && (
                        <span className="rounded-full bg-amber-400/10 px-2 py-0.5 text-xs font-semibold text-amber-200">
                          Update
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
