/**
 * Node ESM resolve hook mapping the app's `@/…` alias to `<root>/src/…`, so
 * `node --test` can import the TypeScript modules the app actually ships
 * (Vite resolves the alias itself; bare `node` does not).
 */
import { existsSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));

export function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const base = join(root, "src", specifier.slice(2));
    const target = [base, `${base}.ts`, `${base}.tsx`, join(base, "index.ts")].find((p) =>
      existsSync(p),
    );
    if (target) return { url: pathToFileURL(target).href, shortCircuit: true };
  }
  return nextResolve(specifier, context);
}
