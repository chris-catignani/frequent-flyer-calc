import { execFileSync } from "node:child_process";
import path from "node:path";
import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT) || 3001;

const isTestRun = !process.argv.some((arg) => arg.includes("show-report") || arg === "--list");

if (
  !process.env.CI &&
  !process.env.__E2E_PORT_CLEANED &&
  process.env.TEST_WORKER_INDEX === undefined &&
  isTestRun
) {
  try {
    execFileSync(
      process.execPath,
      [path.resolve(__dirname, "scripts/clean-port.mjs"), String(PORT)],
      { stdio: "inherit" }
    );
  } catch {
    // clean-port.mjs prints errors and exits with 1 on unrecoverable EPERM
  }
  process.env.__E2E_PORT_CLEANED = "1";
}

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 1,
  workers: process.env.CI ? 4 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: process.env.CI ? "on-first-retry" : "retain-on-failure",
    video: process.env.CI ? "on-first-retry" : "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // On local macOS the bundled chromium headless shell frequently fails to
        // install; use the installed Google Chrome instead. CI keeps the pinned
        // chromium build.
        ...(process.env.CI ? {} : { channel: "chrome" }),
      },
    },
  ],
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: `http://127.0.0.1:${PORT}/qantas`,
    reuseExistingServer: false,
    timeout: process.env.CI ? 60_000 : 15_000,
  },
});
