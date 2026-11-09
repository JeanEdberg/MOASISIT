import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "./router";
import "./index.css";

// Instanciamos el router importado desde router.tsx con previewPathRewrite y error component
const router = getRouter();

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// Montaje de la aplicación React en el DOM
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
}

// ----------------------------------------------------------------------
// REGISTRO AUTOMÁTICO DEL SERVICE WORKER (PWA MOASIST)
// ----------------------------------------------------------------------
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        console.log("📡 Moasist PWA Service Worker registrado con éxito en:", reg.scope);
      })
      .catch((err) => {
        console.error("❌ Error al registrar el Service Worker de Moasist:", err);
      });
  });
}