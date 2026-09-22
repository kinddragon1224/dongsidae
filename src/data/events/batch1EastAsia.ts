import { S, defineEvents } from "./schema.ts";

export const batch1EastAsia = defineEvents("east_asia", [
  {
    id: "bunroku-1592",
    title: "분로쿠의 역 (임진왜란)",
    startYear: 1592,
    endYear: 1598,
    kind: "war",
    significance: 5,
    categories: ["일본", "전쟁"],
    summary: "도요토미 히데요시가 조선을 침공한 전쟁. 일본에서는 분로쿠·게이초의 역으로 부른다.",
    description:
      "통일 직후 히데요시는 명을 치겠다는 명분으로 조선에 대군을 보냈다. 초전 승세 뒤 보급·수군·명군 개입으로 장기전으로 바뀌었고, 1598년 히데요시 사망 후 철수한다. 조선·명·일본이 한꺼번에 휘말린 동아시아 전쟁이다.",
    meaning:
      "‘통일의 다음 단계’가 이웃 침공이 된 해. 일본사와 한국사가 같은 전장에서 만난다.",
    people: ["도요토미 히데요시", "고니시 유키나가", "가토 기요마사"],
    tags: ["분로쿠", "임진왜란", "도요토미"],
    relatedEventIds: ["imjin", "toyotomi-1590", "ming-aid-1592", "asia-missions-1592"],
    sources: [
      S.britannica("Hideyoshi", "https://www.britannica.com/biography/Toyotomi-Hideyoshi"),
    ],
  },
  {
    id: "ming-aid-1592",
    title: "명, 조선 원병",
    startYear: 1592,
    kind: "event",
    significance: 4,
    categories: ["명", "전쟁"],
    summary: "임진왜란 발발 해, 명이 조선에 원병을 보내 동아시아 삼국 전쟁이 되었다.",
    description:
      "평양 함락 위기에 명이 이여송 등을 파병했다. 조·명 연합과 왜군의 대치가 이어지며 전쟁은 국제전 양상을 띤다. 명 조정에는 전비 부담이 커졌고, 전후 동아시아 질서에도 그림자를 남긴다.",
    people: ["이여송", "선조"],
    tags: ["명", "원병", "임진왜란"],
    relatedEventIds: ["imjin", "bunroku-1592", "ming"],
    sources: [S.britannica("Invasion of Korea")],
  },
  {
    id: "tianjin-convention-1885",
    title: "톈진조약 (이토·이홍장)",
    startYear: 1885,
    kind: "event",
    significance: 4,
    categories: ["청", "일본"],
    summary: "갑신정변 뒤 청·일이 조선 출병 시 상호 통보를 약정했다.",
    description:
      "1885년 4월, 이토 히로부미와 이홍장이 톈진에서 조약을 맺었다. 양국은 조선에 파병할 때 미리 알리기로 했고, 주둔군을 철수했다. 겉으로는 균형을 말한 합의였으나, 조선을 무대로 한 청·일 경쟁을 제도화한 측면이 크다. 같은 해 한반도에는 개신교 선교사들이 상륙했다.",
    meaning:
      "동아시아의 ‘질서’가 조선의 머리를 넘어 합의되던 해.",
    people: ["이토 히로부미", "이홍장"],
    tags: ["톈진조약", "청", "일본", "조선"],
    relatedEventIds: ["tianjin-korea-1885", "meiji", "korea-mission-1885", "sino-japanese-1894"],
    sources: [
      S.britannica(
        "Li Hongzhang",
        "https://www.britannica.com/biography/Li-Hongzhang",
      ),
    ],
  },
  {
    id: "korea-annexation-ea-1910",
    title: "일본, 한국 병합",
    startYear: 1910,
    kind: "event",
    significance: 5,
    categories: ["일본", "제국"],
    summary: "일본 제국이 대한제국을 병합하고 조선총독부 통치를 시작했다.",
    description:
      "러일전쟁과 을사조약 이후 일본은 한반도 지배를 완성했다. 1910년 병합은 동아시아에서 일본이 ‘대륙 제국’으로 한 걸음 더 나간 사건이다. 같은 해 중국은 신해혁명 직전, 청의 말기 위기에 있었다.",
    meaning:
      "한 나라의 멸망이 이웃 제국의 ‘성공’으로 기록되던 해. 동아시아 근대의 폭력을 응축한다.",
    people: ["데라우치 마사타케"],
    tags: ["병합", "일본제국", "조선"],
    relatedEventIds: ["annexation-1910", "russo-japan-1905", "xinhai", "occupation"],
    sources: [S.britannica("Japan", "https://www.britannica.com/place/Japan")],
  },
  {
    id: "may-fourth-1919",
    title: "5·4 운동",
    startYear: 1919,
    kind: "event",
    significance: 5,
    categories: ["중국"],
    summary: "파리 강화회의의 산둥 처리에 항의해 베이징에서 시작된 학생·시민 운동.",
    description:
      "1919년 5월 4일, 베이징 학생들이 베르사유 체제의 산둥 이권 양도에 반대하며 시위했다. 상하이 등지로 번지며 신문화 운동·반제국주의 물결과 만났다. 같은 해 조선의 3·1 운동과 나란히, 동아시아 ‘각성’의 해로 읽힌다.",
    meaning:
      "전승국의 ‘평화’가 약소국에게는 굴욕으로 다가온 해. 거리의 학생이 역사를 밀었다.",
    people: ["채원배", "천두슈"],
    tags: ["5.4", "신문화", "산둥"],
    relatedEventIds: ["versailles-1919", "march-first", "xinhai"],
    sources: [
      S.britannica(
        "May Fourth Movement",
        "https://www.britannica.com/event/May-Fourth-Movement",
      ),
    ],
  },
]);
