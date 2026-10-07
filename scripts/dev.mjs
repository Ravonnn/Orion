#!/usr/bin/env node
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");


function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      stdio: options.capture ? ["ignore", "pipe", "pipe"] : "inherit",
      env: { ...process.env, ...options.env },
      shell: process.platform === "win32",
    });

    let stdout = "";
    let stderr = "";
    if (options.capture) {
      child.stdout?.on("data", (chunk) => {
        stdout += chunk.toString();
      });
      child.stderr?.on("data", (chunk) => {
        stderr += chunk.toString();
      });
    }

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve({ stdout, stderr });
      else reject(new Error(`${command} ${args.join(" ")} failed (${code})\n${stderr}`));
    });
  });
}

function parseEnvOutput(text) {
  const env = {};
  for (const line of text.split("\n")) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match) continue;
    const key = match[1];
    let value = match[2] ?? "";
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

async function ensureSupabase() {
  const supabaseBin = existsSync(path.join(root, "node_modules", ".bin", "supabase"))
    ? path.join(root, "node_modules", ".bin", "supabase")
    : "npx";
  const baseArgs = supabaseBin.endsWith("supabase") ? [] : ["supabase"];

  try {
    await run(supabaseBin, [...baseArgs, "status"], { capture: true });
  } catch {
    console.log("Starting local Supabase...");
    await run(supabaseBin, [...baseArgs, "start"]);
  }

  const { stdout } = await run(supabaseBin, [...baseArgs, "status", "-o", "env"], {
    capture: true,
  });
  return parseEnvOutput(stdout);
}

async function main() {
  const supabaseEnv = await ensureSupabase();
  const publishable =
    supabaseEnv.PUBLISHABLE_KEY ||
    supabaseEnv.ANON_KEY ||
    supabaseEnv.SUPABASE_ANON_KEY ||
    "";


  const env = {
    ...process.env,
    NEXT_PUBLIC_SUPABASE_URL: supabaseEnv.API_URL || "http://127.0.0.1:54321",
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: publishable,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: publishable,
    SUPABASE_SERVICE_ROLE_KEY: supabaseEnv.SERVICE_ROLE_KEY || "",
    EXPO_PUBLIC_SUPABASE_URL: supabaseEnv.API_URL || "http://127.0.0.1:54321",
    EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: publishable,
  };

  console.log("Supabase ready at", env.NEXT_PUBLIC_SUPABASE_URL);
  console.log("Starting web + mobile...");

  const turbo = path.join(root, "node_modules", ".bin", "turbo");
  const child = spawn(turbo, ["run", "dev", "--filter=@orion/web", "--filter=@orion/mobile"], {
    cwd: root,
    stdio: "inherit",
    env,
    shell: process.platform === "win32",
  });

  child.on("exit", (code) => process.exit(code ?? 0));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
