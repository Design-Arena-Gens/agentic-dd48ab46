"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { buildWingetCommands, type CommandAction, type CommandOptions } from "@/lib/commands";
import type { WingetApp } from "@/lib/types";

interface CommandPanelProps {
  selectedApps: WingetApp[];
}

const actions: Array<{ id: CommandAction; label: string; help: string }> = [
  { id: "install", label: "Install", help: "Deploys the currently installed versions." },
  {
    id: "upgrade",
    label: "Upgrade",
    help: "Attempts to upgrade the selected applications to the latest available version."
  },
  {
    id: "uninstall",
    label: "Uninstall",
    help: "Removes the selected applications."
  },
  {
    id: "import",
    label: "Export manifest",
    help: "Generates a JSON manifest compatible with winget import."
  }
];

export function CommandPanel({ selectedApps }: CommandPanelProps): JSX.Element {
  const [action, setAction] = useState<CommandAction>("install");
  const [options, setOptions] = useState<CommandOptions>({
    includeSilent: false,
    useForce: false,
    outputFormat: "multiline"
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (selectedApps.length === 0) {
      setCopied(false);
    }
  }, [selectedApps.length]);

  const command = useMemo(() => buildWingetCommands(action, selectedApps, options), [
    action,
    options,
    selectedApps
  ]);

  const copyToClipboard = async () => {
    if (!command) {
      return;
    }
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const changeOption = <K extends keyof CommandOptions>(key: K, value: CommandOptions[K]) => {
    setOptions((current) => ({ ...current, [key]: value }));
  };

  const disableCommand = selectedApps.length === 0;

  return (
    <section className="mt-6 grid gap-4 rounded-3xl border border-slate-800 bg-slate-950/50 p-6 lg:grid-cols-[2fr_1fr]">
      <div>
        <h2 className="text-lg font-semibold text-slate-100">Command Builder</h2>
        <p className="mt-1 text-sm text-slate-400">
          Pick the action and adjust options. Commands update instantly as you change the selection.
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          {actions.map((entry) => {
            const active = action === entry.id;
            return (
              <button
                key={entry.id}
                type="button"
                onClick={() => setAction(entry.id)}
                className={clsx(
                  "rounded-full border px-4 py-2 text-sm transition",
                  active
                    ? "border-cyan-400 bg-cyan-500/20 text-cyan-100"
                    : "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500"
                )}
              >
                {entry.label}
              </button>
            );
          })}
        </div>

        <textarea
          readOnly
          value={command}
          spellCheck={false}
          className="mt-4 h-48 w-full rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 font-mono text-sm text-cyan-100 shadow-inner focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
          placeholder={disableCommand ? "Select one or more applications to generate commands..." : ""}
        />

        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
          <button
            type="button"
            onClick={copyToClipboard}
            disabled={disableCommand}
            className={clsx(
              "rounded-full border px-4 py-2 transition",
              disableCommand
                ? "cursor-not-allowed border-slate-700 bg-slate-900 text-slate-600"
                : "border-cyan-400 bg-cyan-500/20 text-cyan-100 hover:bg-cyan-500/30"
            )}
          >
            {copied ? "Copied!" : "Copy"}
          </button>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={options.includeSilent ?? false}
              onChange={(event) => changeOption("includeSilent", event.target.checked)}
              className="h-4 w-4 rounded border border-slate-600 bg-slate-900 text-cyan-400 focus:ring-cyan-500"
            />
            <span className="text-slate-200 text-sm">Silent mode</span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={options.useForce ?? false}
              onChange={(event) => changeOption("useForce", event.target.checked)}
              className="h-4 w-4 rounded border border-slate-600 bg-slate-900 text-cyan-400 focus:ring-cyan-500"
            />
            <span className="text-slate-200 text-sm">Force</span>
          </label>
          {action !== "import" && (
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={options.outputFormat === "powershell"}
                onChange={(event) => changeOption("outputFormat", event.target.checked ? "powershell" : "multiline")}
                className="h-4 w-4 rounded border border-slate-600 bg-slate-900 text-cyan-400 focus:ring-cyan-500"
              />
              <span className="text-slate-200 text-sm">PowerShell pipeline</span>
            </label>
          )}
        </div>
      </div>
      <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-300">
        <h3 className="text-base font-semibold text-slate-100">How it works</h3>
        <ul className="mt-3 space-y-2 marker:text-cyan-400">
          <li className="leading-relaxed">
            <strong className="text-slate-100">Install</strong> rehydrates a device by installing the same
            versions captured during indexing.
          </li>
          <li className="leading-relaxed">
            <strong className="text-slate-100">Upgrade</strong> omits the <code>--version</code> flag and is
            ideal for maintenance windows.
          </li>
          <li className="leading-relaxed">
            <strong className="text-slate-100">Uninstall</strong> removes software, using silent/force flags
            if toggled.
          </li>
          <li className="leading-relaxed">
            <strong className="text-slate-100">Export manifest</strong> produces JSON compatible with{" "}
            <code>winget import</code>.
          </li>
        </ul>
      </div>
    </section>
  );
}
