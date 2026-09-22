import { S, defineEvents } from "../schema.ts";

export const batch1World = defineEvents("world", [
  {
    id: "imjin-world-1592",
    title: "동아시아 대전, 세계와 나란히",
    startYear: 1592,
    kind: "event",
    significance: 3,
    categories: ["전쟁", "세계사"],
    summary: "임진왜란이 터진 해, 유럽은 종교전쟁·대항해의 한가운데에 있었다.",
    description:
      "1592년 조선·명·일본이 전쟁으로 얽힐 때, 유럽에서는 종교개혁의 여파와 해상 팽창이 이어지고 있었다. 같은 지구 위에서 서로 직접 만나지 못한 채, ‘전쟁으로 질서를 다시 쓰는’ 실험이 동시에 진행된 해로 읽을 수 있다.",
    meaning:
      "동시대란, 소식이 닿지 않아도 같은 해가 겹친다는 뜻이다.",
    tags: ["임진왜란", "동시대", "대항해"],
    relatedEventIds: ["imjin", "bunroku-1592", "age-of-discovery", "reformation-era"],
    confidence: "medium",
    sources: [S.britannica("Invasion of Korea")],
  },
  {
    id: "congo-free-state-1885",
    title: "콩고 자유국 승인",
    startYear: 1885,
    kind: "event",
    significance: 3,
    categories: ["제국주의"],
    summary: "베를린 회의 결과, 레오폴드 2세의 콩고 자유국이 국제적으로 인정받는 국면에 들어갔다.",
    description:
      "1885년 전후, 벨기에 국왕 레오폴드 2세의 사적 식민 지배가 ‘자유국’ 이름으로 자리를 잡았다. 이후 자원 수탈과 폭력이 드러나며 20세기 초 국제 비판을 부른다. 제국주의가 ‘인도’와 ‘수탈’을 동시에 말하던 상징적 사례다.",
    meaning:
      "지도 위의 ‘자유’가 현지에서는 사슬이 될 수 있음을 예고한 해.",
    people: ["레오폴드 2세"],
    tags: ["콩고", "제국주의", "벨기에"],
    relatedEventIds: ["berlin-conference", "korea-mission-1885"],
    sources: [S.britannica("Congo Free State")],
  },
  {
    id: "japan-empire-1910",
    title: "제국의 시대, 한국 병합",
    startYear: 1910,
    kind: "event",
    significance: 4,
    categories: ["제국주의"],
    summary: "열강의 식민 분할이 이어지던 해, 일본이 대한제국을 병합했다.",
    description:
      "20세기 초 세계는 아프리카·아시아 식민 제국의 전성기에 가까웠다. 1910년 일본의 한국 병합은 동아시아에서 ‘후발 제국’이 대륙 발판을 굳힌 사건으로, 유럽 중심 제국주의 지도에 새로운 축을 더했다. 같은 해 에든버러에서는 세계선교대회가 열렸다.",
    meaning:
      "선교 대회와 병합이 같은 해에 있었던 사실 자체가, 근대의 이중 얼굴을 보여 준다.",
    tags: ["제국주의", "일본", "병합"],
    relatedEventIds: ["annexation-1910", "edinburgh-1910", "korea-annexation-ea-1910", "berlin-conference"],
    sources: [S.britannica("imperialism")],
  },
  {
    id: "versailles-1919",
    title: "베르사유 조약",
    startYear: 1919,
    kind: "event",
    significance: 5,
    categories: ["국제질서"],
    summary: "1차 대전을 마무리한 파리 강화회의와 베르사유 조약. ‘민족 자결’과 전승국 이해가 충돌했다.",
    description:
      "1919년 파리에서 전후 질서가 논의되고, 6월 베르사유 조약이 독일과 체결되었다. 윌슨의 민족 자결은 유럽·중동에 선택적으로 적용되었고, 조선·중국의 기대는 배신감으로 돌아왔다. 3·1과 5·4가 같은 해에 터진 국제적 배경이다.",
    meaning:
      "승자가 쓴 ‘평화’가 패자와 식민지에게는 다른 이름으로 읽힌 해.",
    people: ["우드로 윌슨", "조르주 클레망소", "데이비드 로이드 조지"],
    tags: ["베르사유", "파리강화", "민족자결"],
    relatedEventIds: ["ww1", "march-first", "may-fourth-1919", "russian-revolution"],
    sources: [
      S.britannica(
        "Treaty of Versailles",
        "https://www.britannica.com/event/Treaty-of-Versailles-1919",
      ),
    ],
  },
]);
