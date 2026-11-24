import { Button } from "@/components/ui/button";
import { LEGAL, type LegalKind } from "@/content/legal";
import { useT } from "@/i18n";

export function LegalSheet({ kind, onClose }: { kind: LegalKind; onClose: () => void }) {
  const t = useT();
  const doc = LEGAL[kind];
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-velvet/50 p-4">
      <div className="max-h-[85vh] w-full max-w-[390px] overflow-y-auto rounded-pan bg-card p-4">
        <p className="font-sans text-label uppercase text-muted-foreground">{doc.updated}</p>
        <h2 className="mt-1 font-display text-title2">{doc.title}</h2>
        {doc.sections.map((section) => (
          <section key={section.heading} className="mt-4">
            <h3 className="font-sans text-body-strong">{section.heading}</h3>
            <p className="mt-1 font-sans text-caption text-muted-foreground">{section.body}</p>
          </section>
        ))}
        <Button className="mt-5 w-full" onClick={onClose}>
          {t("common.done")}
        </Button>
      </div>
    </div>
  );
}
