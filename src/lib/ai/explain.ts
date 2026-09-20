import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const EventContextSchema = z.object({
  id: z.string(),
  title: z.string(),
  startYear: z.number(),
  endYear: z.number().optional(),
  region: z.string(),
  regionLabel: z.string().optional(),
  summary: z.string(),
  yearNote: z.string().optional(),
  confidence: z.string(),
  kind: z.string(),
  layer: z.enum(["exact", "ongoing", "nearby"]),
  label: z.string(),
});

const DEFAULT_MODEL = "grok-4.5";

export const getAiStatus = createServerFn({ method: "POST" }).handler(
  async (): Promise<{ available: boolean }> => {
    return { available: Boolean(process.env.XAI_API_KEY) };
  },
);

export const explainYear = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z
      .object({
        year: z.number().int(),
        events: z.array(EventContextSchema).max(40),
      })
      .parse(input),
  )
  .handler(async ({ data }): Promise<{ ok: true; text: string } | { ok: false; error: string }> => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      return { ok: false, error: "이 환경에서는 설명을 사용할 수 없습니다." };
    }

    const model = process.env.XAI_MODEL?.trim() || DEFAULT_MODEL;
    const yearLabel =
      data.year < 0 ? `기원전 ${Math.abs(data.year)}년` : `${data.year}년`;

    function layerBlock(layer: "exact" | "ongoing" | "nearby", heading: string) {
      const rows = data.events.filter((event) => event.layer === layer);
      if (rows.length === 0) return `${heading}\n(없음)`;
      return `${heading}\n${rows
        .map((event) => {
          const span =
            event.endYear != null && event.endYear !== event.startYear
              ? `${event.startYear}–${event.endYear}`
              : `${event.startYear}`;
          const note = event.yearNote ? ` / 연대주기: ${event.yearNote}` : "";
          const region = event.regionLabel ?? event.region;
          return `- [${region}] ${event.title} (${span}, ${event.label}, ${event.kind}, 신뢰도 ${event.confidence})${note}: ${event.summary}`;
        })
        .join("\n")}`;
    }

    const catalog = [
      layerBlock("exact", "[이 해에 일어난 일]"),
      layerBlock("ongoing", "[이 해에 진행 중인 시대·재위]"),
      layerBlock("nearby", "[가까운 전후 사건 — 아직 아니거나 이미 지난 일]"),
    ].join("\n\n");

    const system = [
      "당신은 역사와 교회사 연구 보조자다.",
      "반드시 제공된 사건 목록에 적힌 사실만 사용해 한국어로 설명한다.",
      "제공된 데이터 외의 사실을 임의로 추가하지 말 것.",
      "[이 해에 일어난 일]과 [진행 중인 시대]와 [가까운 전후 사건]을 절대 같은 것으로 쓰지 말 것.",
      "전후 사건은 ‘아직 일어나지 않았거나 이미 지난 일’임을 분명히 할 것.",
      "연대가 불확실하거나 yearNote/confidence가 낮으면 그 불확실성을 문장에 드러낼 것.",
      "같은 시간에 서로 다른 지역에서 무슨 일이 있었는지를 연결해, 짧고 품격 있게 쓸 것.",
      "추측·수사·새로운 연도·새로운 인물·새로운 사건을 만들지 말 것.",
      "4~7문장. 제목이나 불릿 없이 산문으로.",
    ].join(" ");

    const user = `${yearLabel}을 설명해 달라.\n\n${catalog}`;

    try {
      const res = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          temperature: 0.2,
          max_tokens: 700,
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
        }),
      });

      if (!res.ok) {
        return { ok: false, error: "설명을 가져오지 못했습니다." };
      }

      const body = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const text = body.choices?.[0]?.message?.content?.trim() ?? "";
      if (!text) return { ok: false, error: "설명이 비어 있습니다." };
      return { ok: true, text };
    } catch {
      return { ok: false, error: "설명을 가져오지 못했습니다." };
    }
  });
