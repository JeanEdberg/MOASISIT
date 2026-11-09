import { createRouter } from "@tanstack/react-router";
import { AppErrorComponent } from "@/lib/error-component";
import { previewPathRewrite } from "@/lib/preview-path-prefix";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  return createRouter({
    routeTree,
    rewrite: previewPathRewrite(),
    defaultErrorComponent: AppErrorComponent,
    defaultNotFoundComponent: () => (
      <div style={{ padding: "40px", textAlign: "center", color: "#333" }}>
        <h2>Página no encontrada en Moasist</h2>
        <p>La ruta solicitada no existe o fue movida.</p>
      </div>
    ),
  });
}