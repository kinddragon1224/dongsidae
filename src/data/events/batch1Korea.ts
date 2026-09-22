import { S, defineEvents } from "./schema.ts";

export const batch1Korea = defineEvents("korea", [
  {
    id: "imjin-outbreak-1592",
    title: "부산 상륙과 파천",
    startYear: 1592,
    kind: "event",
    significance: 4,
    categories: ["전쟁", "조선"],
    summary: "1592년 4월 왜군의 부산 상륙 뒤 한양이 함락되고, 선조가 의주 방면으로 피란했다.",
    description:
      "개전 한 달 안에 동래·상주·충주가 무너지고 한양이 함락되었다. 선조는 평양을 거쳐 의주로 향했고, 조정이 무너진 자리에서 의병과 수군이 따로 일어났다. 전쟁의 ‘첫해’는 왕조의 붕괴 위기와 민간 항전이 동시에 드러난 해이다.",
    people: ["선조", "도요토미 히데요시"],
    tags: ["임진왜란", "파천", "부산"],
    relatedEventIds: ["imjin", "uibyeong-1592", "seonjo"],
    sources: [S.nks("선조실록 임진년")],
  },
  {
    id: "uibyeong-1592",
    title: "임진년 의병",
    startYear: 1592,
    kind: "event",
    significance: 4,
    categories: ["전쟁", "민중"],
    summary: "관군이 무너진 해, 각지에서 의병이 일어나 왜군 보급과 후방을 흔들었다.",
    description:
      "곽재우·고경명·조헌 등 유생·향촌 세력이 의병을 일으켰다. 정규군이 패퇴한 공백을 메우며 전세를 부분적으로 되돌리는 데 기여했다. 수군(이순신)과 의병은 임진년 항전의 두 축으로 기억된다.",
    people: ["곽재우", "고경명", "조헌", "이순신"],
    tags: ["의병", "임진왜란"],
    relatedEventIds: ["imjin", "imjin-outbreak-1592"],
    sources: [S.nks("임진왜란 의병")],
  },
  {
    id: "tianjin-korea-1885",
    title: "톈진조약과 조선",
    startYear: 1885,
    kind: "event",
    significance: 4,
    categories: ["개항", "조선"],
    summary: "갑신정변 뒤 청·일이 톈진조약으로 조선 출병 규칙을 정했다. 한반도는 열강 각축의 한가운데에 있었다.",
    description:
      "1884년 갑신정변 이후 1885년 이토 히로부미와 이홍장이 톈진조약을 맺었다. 청·일 양국이 조선에 출병할 때 서로 통보하기로 했다. 같은 해 언더우드·아펜젤러가 제물포에 도착한다. 외교의 종속과 선교의 시작이 한 해에 겹친다.",
    meaning:
      "문이 열린 자리에서, 누가 그 문을 지키는지를 먼저 정하던 해.",
    people: ["고종", "이토 히로부미", "이홍장"],
    tags: ["톈진조약", "개항", "갑신"],
    relatedEventIds: ["korea-mission-1885", "gojong", "tianjin-convention-1885", "ganghwa-1876"],
    sources: [S.nks("톈진조약(1885)")],
  },
  {
    id: "korea-opening-1885",
    title: "개화기 조선, 1885년",
    startYear: 1885,
    kind: "event",
    significance: 3,
    categories: ["개항", "조선"],
    summary: "고종 친정 아래 개화 정책과 외국인 거류, 근대 시설이 동시에 늘어나던 해.",
    description:
      "강화도 조약 이후 항구와 조계가 열리고, 1885년에는 선교사·외교관·상인이 제물포와 서울을 오갔다. 전신·병원·학교 같은 근대 제도가 들어오기 시작했지만, 청·일·러의 압력도 함께 커졌다.",
    meaning:
      "‘개화’가 희망이자 위기로 동시에 읽히던 자리.",
    people: ["고종"],
    tags: ["개화", "제물포", "고종"],
    relatedEventIds: ["korea-mission-1885", "tianjin-korea-1885", "gojong", "allen-1884"],
    confidence: "medium",
    sources: [S.nks("개화기·고종 연간 개설")],
  },
  {
    id: "provisional-gov-1919",
    title: "대한민국 임시정부 수립",
    startYear: 1919,
    kind: "event",
    significance: 5,
    categories: ["독립"],
    summary: "1919년 4월 상하이에 대한민국 임시정부가 수립되었다.",
    description:
      "3·1 운동의 열기 속에서 국내외 독립 운동 세력이 상하이에서 임시정부를 출범시켰다. 헌법·연호·외교를 갖춘 ‘망명 정부’로서 이후 광복까지 독립운동의 중심 축 중 하나가 된다.",
    meaning:
      "거리의 만세가 제도의 이름(대한민국)으로 이어진 해.",
    people: ["이승만", "안창호", "김구"],
    tags: ["임시정부", "상하이", "독립"],
    relatedEventIds: ["march-first", "liberation-1945", "rok-1948"],
    sources: [S.nks("대한민국 임시정부")],
  },
]);
