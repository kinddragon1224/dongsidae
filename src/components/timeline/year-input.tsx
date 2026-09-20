import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { YEAR_MAX, YEAR_MIN } from "@/lib/history/catalog";
import { useTimeline } from "@/lib/history/store";
import { formatYear, parseYearInput } from "@/lib/history/years";

export function YearInputDialog() {
  const open = useTimeline((s) => s.yearInputOpen);
  const setOpen = useTimeline((s) => s.setYearInputOpen);
  const year = useTimeline((s) => s.year);
  const setYear = useTimeline((s) => s.setYear);
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setValue(String(year));
      setError(null);
      window.setTimeout(() => inputRef.current?.select(), 30);
    }
  }, [open, year]);

  function submit() {
    const parsed = parseYearInput(value);
    if (parsed == null) {
      setError("연도를 확인하세요. 예: 1517, 기원전 4");
      return;
    }
    setYear(parsed);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="top-1/2 left-1/2 w-[min(24rem,calc(100%-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-xl p-6">
        <DialogTitle>연도 이동</DialogTitle>
        <DialogDescription className="mt-1">
          {formatYear(YEAR_MIN)}부터 {formatYear(YEAR_MAX)}까지. 기원전은 ‘기원전 4’ 또는 음수.
        </DialogDescription>
        <form
          className="mt-5 flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <Input
            ref={inputRef}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError(null);
            }}
            inputMode="text"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "year-error" : undefined}
            placeholder="1517"
            className="font-serif text-lg tabular-nums"
          />
          {error ? (
            <p id="year-error" className="text-sm text-destructive">
              {error}
            </p>
          ) : (
            <p className="text-xs text-subtle">기원후는 숫자만, 기원전은 음수.</p>
          )}
          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              취소
            </Button>
            <Button type="submit">이동</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
