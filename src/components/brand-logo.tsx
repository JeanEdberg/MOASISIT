import { cn } from "@/components/ui";

/** Ruta del logo de Moasist, servido desde /public. */
export const LOGO_SRC = "/moasist-logo.png";

/**
 * Logotipo de la aplicación: el emblema de Moasist y, opcionalmente, el
 * wordmark. Es agnóstico a la empresa — la empresa se muestra aparte, según la
 * sesión del colaborador.
 */
export function BrandLogo({
  size = 40,
  withWordmark = false,
  className,
}: {
  size?: number;
  withWordmark?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <img
        src={LOGO_SRC}
        alt="Moasist"
        width={size}
        height={size}
        style={{ width: size, height: size }}
        className="shrink-0 select-none"
        draggable={false}
      />
      {withWordmark ? (
        <span className="font-display text-2xl leading-none font-bold tracking-tight text-ink">
          Moasist
        </span>
      ) : null}
    </span>
  );
}
