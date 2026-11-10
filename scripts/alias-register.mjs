/**
 * Registers `alias-loader.mjs` with Node's module hooks so `node --test` can
 * resolve the app's `@/…` imports. Used via
 * `node --import ./scripts/alias-register.mjs …`.
 */
import { register } from "node:module";

register("./alias-loader.mjs", import.meta.url);
