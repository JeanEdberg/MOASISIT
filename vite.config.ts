import { copyFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import type { Plugin } from "vite";
import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";
import { appEnvPlugin } from "./scripts/app-env-plugin.mjs";
import { isMigrationFile } from "./scripts/migration-plan.mjs";

function hasGlobbedMigrations(root: string): boolean {
  try {
    return readdirSync(join(root, "migrations")).some(isMigrationFile);
  } catch {
    return false;
  }
}

/**
 * PGLite ships its Postgres runtime as sibling assets (`pglite.data`,
 * `pglite.wasm`) loaded via `new URL("./pglite.data", import.meta.url)`. When
 * Nitro bundles the Vercel server function it emits the PGLite module into
 * `_libs/` but does NOT copy those assets, so the serverless function crashes on
 * boot ("ENOENT … pglite.data") whenever it runs on the embedded PGLite fallback
 * (no `DATABASE_URL`). Copy them next to the bundled module so the in-memory
 * fallback actually starts — that is what makes the deployed app "just work"
 * with nothing configured.
 */
function pgliteAssetsPlugin(): Plugin {
  return {
    name: "app-builder:pglite-assets",
    apply: "build",
    closeBundle() {
      const root = process.cwd();
      const dist = join(root, "node_modules/@electric-sql/pglite/dist");
      const assets = ["pglite.data", "pglite.wasm", "initdb.wasm"].map((f) => join(dist, f));
      if (!assets.every((a) => existsSync(a))) return;

      const functionsDir = join(root, ".vercel/output/functions");
      if (!existsSync(functionsDir)) return;
      for (const entry of readdirSync(functionsDir)) {
        if (!entry.endsWith(".func")) continue;
        const libs = join(functionsDir, entry, "_libs");
        if (!existsSync(libs) || !statSync(libs).isDirectory()) continue;
        if (!existsSync(join(libs, "electric-sql__pglite.mjs"))) continue;
        for (const a of assets) {
          copyFileSync(a, join(libs, a.split("/").pop() as string));
        }
        console.log(`[pglite-assets] copied pglite.data + pglite.wasm + initdb.wasm into ${entry}/_libs`);
      }
    },
  };
}

function pgliteBootstrapPlugin(): Plugin {
  return {
    name: "app-builder:pglite-bootstrap",
    apply: "serve",
    async configureServer(server) {
      if (!hasGlobbedMigrations(server.config.root)) return;
      try {
        const mod = (await server.ssrLoadModule("/src/lib/db.ts")) as {
          ensureDbReady?: () => Promise<void>;
        };
        if (typeof mod.ensureDbReady === "function") {
          await mod.ensureDbReady();
        }
      } catch (err) {
        console.error("[app-builder] DB bootstrap failed:", err);
        throw err;
      }
    },
  };
}

function authPopupPlugin(): Plugin {
  return {
    name: "app-builder:auth-popup",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        try {
          const rawUrl = req.url ?? "";
          const pathOnly = rawUrl.split("?", 1)[0] ?? "";
          if (pathOnly !== "/auth/popup") {
            next();
            return;
          }
          if ((req.method ?? "GET").toUpperCase() !== "GET") {
            res.statusCode = 405;
            res.setHeader("content-type", "text/plain; charset=utf-8");
            res.end("Method Not Allowed");
            return;
          }

          const host = String(
            req.headers["x-forwarded-host"] ?? req.headers.host ?? "localhost:8080",
          );
          const proto = String(
            req.headers["x-forwarded-proto"] ??
              ((req.socket as { encrypted?: boolean } | undefined)?.encrypted ? "https" : "http"),
          );
          const requestHeaders = new Headers();
          for (const [key, value] of Object.entries(req.headers)) {
            if (value === undefined) continue;
            if (Array.isArray(value)) {
              for (const v of value) requestHeaders.append(key, v);
            } else {
              requestHeaders.set(key, value);
            }
          }
          if (!requestHeaders.has("host")) requestHeaders.set("host", host);

          const request = new Request(`${proto}://${host}${rawUrl}`, {
            method: "GET",
            headers: requestHeaders,
          });

          const mod = (await server.ssrLoadModule("/src/lib/auth/popup.server.ts")) as {
            handleAuthPopupRequest: (req: Request) => Promise<Response>;
          };
          const response = await mod.handleAuthPopupRequest(request);

          res.statusCode = response.status;
          const setCookies =
            typeof response.headers.getSetCookie === "function"
              ? response.headers.getSetCookie()
              : [];
          response.headers.forEach((value, key) => {
            if (key.toLowerCase() === "set-cookie") return;
            res.setHeader(key, value);
          });
          for (const cookie of setCookies) {
            res.appendHeader("set-cookie", cookie);
          }
          const body = Buffer.from(await response.arrayBuffer());
          res.end(body);
        } catch (err) {
          console.error("[app-builder] /auth/popup handler failed:", err);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader("content-type", "text/plain; charset=utf-8");
            res.end("auth popup failed");
          }
        }
      });
    },
  };
}

export default defineConfig(({ command, isPreview }) => ({
  server: {
    host: "0.0.0.0",
    port: 8080,
    strictPort: true,
  },
  preview: {
    host: "127.0.0.1",
    port: 8081,
    strictPort: true,
  },
  resolve: { tsconfigPaths: true },
  plugins: [
    pgliteAssetsPlugin(),
    pgliteBootstrapPlugin(),
    authPopupPlugin(),
    appEnvPlugin(),
    // HEMOS ELIMINADO grokPwaPlugin() AQUÍ
    tailwindcss(),
    tanstackStart(),
    ...(command === "build" || isPreview
      ? [
          nitro({
            preset: "vercel",
            serverDir: "./server",
          }),
        ]
      : []),
    viteReact(),
  ],
}));
