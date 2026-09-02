import { spawnSync } from "node:child_process";

export function sleepSync(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

export function getListeningPids(port) {
  try {
    const res = spawnSync("lsof", ["-ti", `:${port}`, "-sTCP:LISTEN"], {
      encoding: "utf8",
    });
    if (res.status === 0 && res.stdout.trim()) {
      const pids = res.stdout
        .trim()
        .split(/\s+/)
        .map(Number)
        .filter((pid) => !Number.isNaN(pid) && pid !== process.pid);
      return Array.from(new Set(pids));
    }
  } catch {
    // If lsof is not available on the system
  }
  return [];
}

export function cleanPortSync(targetPort) {
  let pids = getListeningPids(targetPort);
  if (pids.length === 0) {
    return;
  }

  console.log(
    `[E2E] Detected stale process(es) on port ${targetPort}: PIDs ${pids.join(", ")}. Terminating...`
  );

  // Step 1: SIGTERM
  for (const pid of pids) {
    try {
      process.kill(pid, "SIGTERM");
    } catch (err) {
      if (err.code === "EPERM") {
        console.error(
          `[E2E] Cannot terminate process ${pid} on port ${targetPort} (EPERM). Please kill it manually: sudo kill -9 ${pid}`
        );
        process.exit(1);
      }
      // Silently ignore ESRCH if process already died
    }
  }

  // Step 2: Poll up to 1000ms for graceful shutdown
  const termStart = Date.now();
  while (Date.now() - termStart < 1000) {
    sleepSync(50);
    pids = getListeningPids(targetPort);
    if (pids.length === 0) {
      console.log(`[E2E] Port ${targetPort} successfully freed.`);
      return;
    }
  }

  // Step 3: SIGKILL remaining
  console.log(`[E2E] Process(es) still listening. Sending SIGKILL to PIDs ${pids.join(", ")}...`);
  for (const pid of pids) {
    try {
      process.kill(pid, "SIGKILL");
    } catch (err) {
      if (err.code === "EPERM") {
        console.error(
          `[E2E] Cannot terminate process ${pid} on port ${targetPort} (EPERM). Please kill it manually: sudo kill -9 ${pid}`
        );
        process.exit(1);
      }
    }
  }

  // Step 4: Final verification poll up to 500ms
  const killStart = Date.now();
  while (Date.now() - killStart < 500) {
    sleepSync(50);
    pids = getListeningPids(targetPort);
    if (pids.length === 0) {
      console.log(`[E2E] Port ${targetPort} successfully freed.`);
      return;
    }
  }

  console.error(`[E2E] Failed to free port ${targetPort}. Still held by PIDs: ${pids.join(", ")}`);
  process.exit(1);
}

const targetPort = Number(process.argv[2] || process.env.E2E_PORT || 3001);
if (process.argv[1]?.endsWith("clean-port.mjs")) {
  cleanPortSync(targetPort);
}
