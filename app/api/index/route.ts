import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

import { parseWingetList } from "@/lib/parseWinget";
import type { IndexResult, WingetApp } from "@/lib/types";

const execFileAsync = promisify(execFile);

const runWingetList = async (): Promise<WingetApp[] | null> => {
  if (process.platform !== "win32") {
    return null;
  }

  try {
    const { stdout } = await execFileAsync("winget", [
      "list",
      "--accept-package-agreements",
      "--accept-source-agreements",
      "--output",
      "json"
    ]);

    const apps = parseWingetList(stdout);
    if (apps.length > 0) {
      return apps;
    }
  } catch (error) {
    const isMissingBinary =
      error instanceof Error && /not found|not recognized/i.test(error.message);

    if (isMissingBinary) {
      return null;
    }

    console.error("winget list failed", error);
  }

  try {
    const { stdout } = await execFileAsync("powershell", [
      "-NoProfile",
      "-Command",
      "Get-ItemProperty HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*, HKLM:\\Software\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\* | Select-Object DisplayName, DisplayVersion, Publisher | ConvertTo-Json"
    ]);

    const entries = JSON.parse(stdout) as Array<Record<string, string>>;
    const apps = entries
      .filter((entry) => Boolean(entry.DisplayName))
      .map((entry, index) => ({
        id: `registry-${index}-${entry.DisplayName}`,
        name: entry.DisplayName,
        version: entry.DisplayVersion ?? "",
        publisher: entry.Publisher,
        source: "registry"
      }));
    return apps;
  } catch (error) {
    console.error("registry fallback failed", error);
  }

  return null;
};

const loadSampleData = async (): Promise<WingetApp[]> => {
  const filePath = path.join(process.cwd(), "lib", "sample-apps.json");
  const buffer = await fs.readFile(filePath, "utf8");
  return JSON.parse(buffer);
};

export async function GET() {
  const startedAt = Date.now();

  const apps = await runWingetList();

  let result: IndexResult;

  if (apps && apps.length > 0) {
    result = {
      source: "live",
      generatedAt: new Date().toISOString(),
      durationMs: Date.now() - startedAt,
      apps: apps.sort((a, b) => a.name.localeCompare(b.name))
    };
  } else {
    const fallbackApps = await loadSampleData();
    result = {
      source: "fallback",
      generatedAt: new Date().toISOString(),
      durationMs: Date.now() - startedAt,
      apps: fallbackApps,
      warnings: [
        process.platform !== "win32"
          ? "winget is only available on Windows. Sample data returned instead."
          : "winget did not return any applications. Sample data returned."
      ]
    };
  }

  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "no-store"
    }
  });
}
