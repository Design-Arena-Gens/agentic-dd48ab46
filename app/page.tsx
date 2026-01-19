"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { IndexerHeader } from "@/app/components/IndexerHeader";
import { FilterBar } from "@/app/components/FilterBar";
import { AppTable, type SortDirection, type SortKey } from "@/app/components/AppTable";
import { CommandPanel } from "@/app/components/CommandPanel";
import { UploadPanel } from "@/app/components/UploadPanel";
import { StatusBanner } from "@/app/components/StatusBanner";
import type { IndexResult, WingetApp } from "@/lib/types";

const sortByKey = (apps: WingetApp[], key: SortKey, direction: SortDirection) => {
  const sorted = [...apps];
  const modifier = direction === "asc" ? 1 : -1;

  sorted.sort((a, b) => {
    const getValue = (app: WingetApp) => {
      switch (key) {
        case "publisher":
          return app.publisher ?? "";
        case "version":
          return app.version ?? "";
        case "available":
          return app.availableVersion ?? "";
        case "name":
        default:
          return app.name ?? "";
      }
    };

    const aValue = getValue(a)?.toLowerCase();
    const bValue = getValue(b)?.toLowerCase();
    if (aValue < bValue) return -1 * modifier;
    if (aValue > bValue) return 1 * modifier;
    return 0;
  });

  return sorted;
};

export default function Home(): JSX.Element {
  const [apps, setApps] = useState<WingetApp[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [indexResult, setIndexResult] = useState<IndexResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [onlyUpgradeable, setOnlyUpgradeable] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const runIndex = useCallback(async () => {
    setStatus("loading");
    setErrorMessage(null);
    try {
      const response = await fetch("/api/index", { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`Indexer returned ${response.status}`);
      }

      const result = (await response.json()) as IndexResult;
      const normalized = result.apps.map((app) => ({
        ...app,
        source: app.source ?? "winget",
        isUpgradeAvailable:
          typeof app.isUpgradeAvailable === "boolean"
            ? app.isUpgradeAvailable
            : Boolean(app.availableVersion && app.availableVersion !== app.version)
      }));

      setApps(sortByKey(normalized, sortKey, sortDirection));
      setIndexResult(result);
      setSelected(new Set());
      setStatus("ready");
    } catch (error) {
      console.error(error);
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Unknown error");
    }
  }, [sortDirection, sortKey]);

  useEffect(() => {
    void runIndex();
  }, [runIndex]);

  const normalizedSearch = search.trim().toLowerCase();

  const filteredApps = useMemo(() => {
    const dataset = sortByKey(apps, sortKey, sortDirection);
    return dataset.filter((app) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        [app.name, app.id, app.publisher]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(normalizedSearch));

      const matchesSource =
        sourceFilter === "all"
          ? true
          : sourceFilter === "unknown"
          ? !app.source
          : (app.source ?? "").toLowerCase() === sourceFilter.toLowerCase();

      const matchesUpgrade = onlyUpgradeable ? Boolean(app.isUpgradeAvailable) : true;

      return matchesSearch && matchesSource && matchesUpgrade;
    });
  }, [apps, normalizedSearch, onlyUpgradeable, sortDirection, sortKey, sourceFilter]);

  const selectedApps = useMemo(
    () => apps.filter((app) => selected.has(app.id)),
    [apps, selected]
  );

  const toggleSelection = (id: string) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAll = (ids: string[], allSelected: boolean) => {
    setSelected((current) => {
      const next = new Set(current);
      ids.forEach((id) => {
        if (allSelected) {
          next.delete(id);
        } else {
          next.add(id);
        }
      });
      return next;
    });
  };

  const clearSelection = () => setSelected(new Set());

  const onImport = (importedApps: WingetApp[]) => {
    const normalized = importedApps.map((app, index) => ({
      ...app,
      id: app.id ?? app.name ?? `app-${index}`,
      name: app.name ?? app.id ?? `App ${index + 1}`,
      source: app.source ?? "winget",
      isUpgradeAvailable:
        typeof app.isUpgradeAvailable === "boolean"
          ? app.isUpgradeAvailable
          : Boolean(app.availableVersion && app.availableVersion !== app.version)
    }));

    const sorted = sortByKey(normalized, sortKey, sortDirection);
    setApps(sorted);
    setIndexResult({
      source: "upload",
      generatedAt: new Date().toISOString(),
      durationMs: 0,
      apps: sorted
    });
    setStatus("ready");
    clearSelection();
  };

  const handleSortChange = (key: SortKey) => {
    if (key === sortKey) {
      setSortDirection((dir) => (dir === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <IndexerHeader />

      <StatusBanner status={status} result={indexResult} errorMessage={errorMessage} />

      <FilterBar
        search={search}
        sourceFilter={sourceFilter}
        onlyUpgradeable={onlyUpgradeable}
        onSearchChange={setSearch}
        onSourceChange={setSourceFilter}
        onUpgradeableChange={setOnlyUpgradeable}
        onRefresh={() => void runIndex()}
        isRefreshing={status === "loading"}
        totalApps={apps.length}
        filteredApps={filteredApps.length}
        selectedCount={selected.size}
        onClearSelection={clearSelection}
      />

      <AppTable
        apps={filteredApps}
        selectedIds={selected}
        onToggle={toggleSelection}
        onToggleAll={toggleAll}
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSortChange={handleSortChange}
      />

      <CommandPanel selectedApps={selectedApps} />

      <UploadPanel onImport={onImport} />
    </main>
  );
}
