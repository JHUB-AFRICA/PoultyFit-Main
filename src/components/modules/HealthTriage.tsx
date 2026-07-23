import { useMemo, useState } from "react";
import { SYMPTOMS } from "@/lib/poultry-data";
import { triage } from "@/lib/poultry-calc";
import { Button } from "@/components/ui/button";
import { Camera, AlertTriangle, ShieldCheck, Stethoscope, Check, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Phase = "asking" | "review" | "loading" | "done";

export function HealthTriageModule() {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [photo, setPhoto] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("asking");
  const [cardKey, setCardKey] = useState(0);

  const result = useMemo(
    () => (phase === "done" ? triage(selected, !!photo) : null),
    [phase, selected, photo],
  );

  const current = SYMPTOMS[index];
  const total = SYMPTOMS.length;

  const advance = (yes: boolean) => {
    if (!current) return;
    if (yes) setSelected((prev) => (prev.includes(current.id) ? prev : [...prev, current.id]));
    const nextIdx = index + 1;
    if (nextIdx >= total) {
      setPhase("review");
    } else {
      setIndex(nextIdx);
      setCardKey((k) => k + 1);
    }
  };

  const removeChip = (id: string) => {
    setSelected((prev) => prev.filter((s) => s !== id));
  };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(String(reader.result));
    reader.readAsDataURL(f);
  };

  const runDiagnosis = () => {
    setPhase("loading");
    setTimeout(() => setPhase("done"), 1600);
  };

  const restart = () => {
    setSelected([]);
    setPhoto(null);
    setIndex(0);
    setCardKey((k) => k + 1);
    setPhase("asking");
  };

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_360px]">
      <div>
        <p className="text-sm text-muted-foreground">
          Answer one at a time. This gives you a <span className="font-medium text-foreground">category of concern</span> — not a diagnosis.
        </p>

        {/* Selected chips strip */}
        <div className="mt-4 min-h-[2.5rem] rounded-xl border border-dashed border-border bg-secondary/30 p-2">
          {selected.length === 0 ? (
            <p className="px-2 py-1 text-xs text-muted-foreground">Symptoms you mark "yes" show up here. Tap a chip to remove it.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {selected.map((id) => {
                const s = SYMPTOMS.find((x) => x.id === id);
                if (!s) return null;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => removeChip(id)}
                    className="group inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-1 text-xs text-primary transition hover:bg-primary/20"
                  >
                    {s.label}
                    <X className="h-3 w-3 opacity-60 group-hover:opacity-100" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Card area */}
        <div className="mt-4">
          {phase === "asking" && current && (
            <div key={cardKey} className="animate-fade-in rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Symptom {index + 1} of {total}</span>
                <span>{selected.length} marked so far</span>
              </div>
              <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${(index / total) * 100}%` }}
                />
              </div>
              <p className="mt-6 font-display text-2xl leading-snug">{current.label}</p>
              <p className="mt-1 text-sm text-muted-foreground">Are you seeing this in your flock right now?</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button
                  onClick={() => advance(true)}
                  className="group inline-flex items-center justify-center gap-2 rounded-xl border border-primary bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition hover:brightness-110"
                >
                  <Check className="h-4 w-4" /> Yes, seeing this
                </button>
                <button
                  onClick={() => advance(false)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium transition hover:border-primary/50"
                >
                  <X className="h-4 w-4" /> Not this one
                </button>
              </div>
            </div>
          )}

          {phase === "review" && (
            <div className="animate-fade-in rounded-2xl border border-border bg-card p-6">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">All symptoms reviewed</p>
              <p className="mt-1 font-display text-2xl">
                {selected.length} marked as present
              </p>
              {selected.length > 0 ? (
                <>
                  <ul className="mt-4 space-y-1.5 text-sm">
                    {selected.map((id) => {
                      const s = SYMPTOMS.find((x) => x.id === id);
                      return s ? (
                        <li key={id} className="flex items-center gap-2">
                          <Check className="h-3.5 w-3.5 text-primary" /> {s.label}
                        </li>
                      ) : null;
                    })}
                  </ul>
                  <div className="mt-6 flex flex-wrap gap-2">
                    <Button onClick={runDiagnosis}>Find diagnosis</Button>
                    <Button variant="ghost" onClick={restart}>Start over</Button>
                  </div>
                </>
              ) : (
                <>
                  <p className="mt-3 text-sm text-muted-foreground">
                    No symptoms were marked. If your birds seem healthy, that's good news — come back if anything changes.
                  </p>
                  <div className="mt-6">
                    <Button variant="outline" onClick={restart}>Go through again</Button>
                  </div>
                </>
              )}
            </div>
          )}

          {phase === "loading" && (
            <div className="animate-fade-in rounded-2xl border border-border bg-card p-10 text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
              <p className="mt-4 font-display text-lg">Checking your flock's symptoms…</p>
              <p className="mt-1 text-sm text-muted-foreground">Matching against known conditions</p>
            </div>
          )}

          {phase === "done" && (
            <div className="animate-fade-in flex flex-wrap gap-2">
              <Button variant="outline" onClick={restart}>Start a new check</Button>
            </div>
          )}
        </div>

        {/* Persistent photo upload */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm hover:border-primary/50">
            <Camera className="h-4 w-4" />
            {photo ? "Change photo" : "Add photo (optional)"}
            <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
          </label>
          {photo && (
            <>
              <img src={photo} alt="Uploaded" className="h-12 w-12 rounded-md object-cover border border-border" />
              <button
                type="button"
                onClick={() => setPhoto(null)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Remove
              </button>
            </>
          )}
        </div>
      </div>

      <div>
        {result ? (
          <div className={cn("animate-fade-in rounded-2xl border p-6",
            result.urgency === "high" ? "border-destructive/40 bg-destructive/5"
            : result.urgency === "medium" ? "border-clay/40 bg-clay/5"
            : "border-border bg-card")}>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
              {result.urgency === "high" ? <AlertTriangle className="h-4 w-4 text-destructive" />
                : result.urgency === "medium" ? <Stethoscope className="h-4 w-4 text-clay" />
                : <ShieldCheck className="h-4 w-4 text-primary" />}
              {result.urgency} urgency
            </div>
            <p className="mt-3 font-display text-xl">{result.conditionName}</p>
            <p className="mt-2 text-sm text-muted-foreground">{result.note}</p>

            <div className="mt-4 rounded-lg bg-background/70 p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Confidence</span>
                <span className="font-medium">{result.confidencePct}%</span>
              </div>
              <div className="mt-1.5 h-1.5 w-full rounded-full bg-border">
                <div className="h-full rounded-full bg-primary" style={{ width: `${result.confidencePct}%` }} />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                We deliberately cap confidence. Please confirm with a professional before treating.
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
            {phase === "done"
              ? "No result — no symptoms were selected."
              : "Work through each symptom, then tap Find diagnosis to see a suggested next step."}
          </div>
        )}
      </div>
    </div>
  );
}
