import { useEffect, useState } from "react";
import { explainYear } from "@/lib/ai/explain";
import { Button } from "@/components/ui/button";
import { getYearSnapshot, snapshotToAiContext } from "@/lib/history/snapshot";
import { useTimeline } from "@/lib/history/store";
import { formatYear } from "@/lib/history/years";

export function ExplainPanel() {
  const open = useTimeline((s) => s.explainOpen);
  const setOpen = useTimeline((s) => s.setExplainOpen);
  const year = useTimeline((s) => s.year);
  const [text, setText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setText(null);
      setError(null);
      setLoading(false);
    }
  }, [open, year]);

  async function run() {
    setLoading(true);
    setError(null);
    const snap = getYearSnapshot(year, { nearbyRange: 10, nearbyLimit: 3 });
    const events = snapshotToAiContext(snap, 28);
    const result = await explainYear({ data: { year, events } });
    setLoading(false);
    if (result.ok) setText(result.text);
    else setError(result.error);
  }

  if (!open) return null;

  return (
    <aside className="fixed inset-x-3 bottom-28 z-30 rounded-xl border border-border bg-popover p-4 shadow-[var(--shadow-border)] md:inset-x-auto md:top-20 md:right-6 md:bottom-auto md:w-[26rem]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.6875rem] tracking-wide text-subtle">설명</p>
          <h2 className="font-serif text-lg">{formatYear(year)}</h2>
        </div>
        <button
          type="button"
          className="text-xs text-muted-foreground hover:text-foreground"
          onClick={() => setOpen(false)}
        >
          닫기
        </button>
      </div>
      <p className="mt-2 text-xs text-subtle">
        기록된 사건만 재료로 삼습니다. 이 해 / 진행 중 / 전후를 섞지 않습니다.
      </p>
      {!text && !loading && !error && (
        <Button className="mt-4 w-full" onClick={() => void run()}>
          이 시대를 설명해줘
        </Button>
      )}
      {loading && (
        <p className="mt-4 text-sm text-muted-foreground">연결하는 중…</p>
      )}
      {error && (
        <p className="mt-4 text-sm text-destructive">{error}</p>
      )}
      {text && (
        <p className="mt-4 text-sm leading-relaxed text-foreground">{text}</p>
      )}
    </aside>
  );
}
