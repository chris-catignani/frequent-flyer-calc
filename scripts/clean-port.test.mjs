import { spawn, spawnSync } from "node:child_process";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cleanPortScript = path.resolve(__dirname, "clean-port.mjs");
const TEST_PORT = 3999;

function checkPortInUse(port) {
  return new Promise((resolve) => {
    const client = new net.Socket();
    client.once("connect", () => {
      client.destroy();
      resolve(true);
    });
    client.once("error", () => {
      resolve(false);
    });
    client.connect(port, "127.0.0.1");
  });
}

async function runTest() {
  console.log("Test 1: Running clean-port when port is free...");
  const run1 = spawnSync("node", [cleanPortScript, String(TEST_PORT)], { encoding: "utf8" });
  if (run1.status !== 0) {
    throw new Error(
      `Expected exit code 0 when port is free, got ${run1.status}. Stderr: ${run1.stderr}`
    );
  }
  console.log("✓ Test 1 passed.");

  console.log("Test 2: Running clean-port when a server is listening...");
  const serverProcess = spawn(
    "node",
    [
      "-e",
      `const net = require("net");
       const server = net.createServer();
       server.listen(${TEST_PORT}, "127.0.0.1", () => {
         console.log("READY");
       });
       setInterval(() => {}, 1000);`,
    ],
    { stdio: ["ignore", "pipe", "inherit"] }
  );

  await new Promise((resolve, reject) => {
    serverProcess.stdout.on("data", (data) => {
      if (data.toString().includes("READY")) resolve();
    });
    serverProcess.on("error", reject);
    serverProcess.on("exit", (code) => reject(new Error(`Server exited early with code ${code}`)));
  });

  const isListeningBefore = await checkPortInUse(TEST_PORT);
  if (!isListeningBefore) {
    throw new Error("Server process failed to bind port for testing.");
  }

  const run2 = spawnSync("node", [cleanPortScript, String(TEST_PORT)], { encoding: "utf8" });
  if (run2.status !== 0) {
    throw new Error(
      `Expected exit code 0 after cleaning port, got ${run2.status}. Stderr: ${run2.stderr}`
    );
  }

  const isListeningAfter = await checkPortInUse(TEST_PORT);
  if (isListeningAfter) {
    throw new Error("Port is still in use after clean-port execution.");
  }
  console.log("✓ Test 2 passed.");
}

runTest()
  .then(() => {
    console.log("All clean-port tests passed successfully.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
  });
