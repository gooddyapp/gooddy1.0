import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Section({
  title,
  eyebrow,
  children,
  className,
  action,
}: {
  title?: string;
  eyebrow?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}) {
  return (
    <section className={cn("rounded-md border border-border bg-card p-4", className)}>
      {(eyebrow || title || action) && (
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            {eyebrow ? (
              <p className="font-sans text-label uppercase text-muted-foreground">{eyebrow}</p>
            ) : null}
            {title ? <h2 className="font-display text-title2 text-foreground">{title}</h2> : null}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="font-sans text-caption text-muted-foreground">{children}</p>;
}

export function Disclaimer({ children }: { children: ReactNode }) {
  return (
    <p className="mt-2 font-sans text-caption text-muted-foreground">
      <span className="text-rose-gold" aria-hidden="true">
        ✦{" "}
      </span>
      {children}
    </p>
  );
}
