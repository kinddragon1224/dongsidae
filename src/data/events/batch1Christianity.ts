import { S, defineEvents } from "./schema.ts";

export const batch1Christianity = defineEvents("christianity", [
  {
    id: "paichai-1885",
    title: "배재학당 설립",
    startYear: 1885,
    kind: "event",
    significance: 3,
    categories: ["선교", "교육", "한국교회사"],
    summary: "아펜젤러가 서울에 배재학당을 열어 근대 교육과 선교가 맞물린 장을 만들었다.",
    description:
      "1885년 감리교 선교사 헨리 아펜젤러는 서울에서 배재학당을 시작했다. 고종이 ‘인재를 기른다’는 뜻의 교명을 내린 것으로 전한다. 언더우드의 사역과 나란히, 개신교 학교·병원이 조선 개화기의 제도 풍경이 된다.",
    meaning:
      "복음이 예배당만이 아니라 교실과 병원으로 스며들기 시작한 해의 한 장면.",
    people: ["헨리 아펜젤러", "고종"],
    tags: ["배재", "아펜젤러", "교육", "선교"],
    relatedEventIds: ["korea-mission-1885", "allen-1884", "gojong"],
    sources: [S.church("배재학당·초기 감리교 선교 개설")],
  },
  {
    id: "korea-church-1910",
    title: "병합과 한국 교회",
    startYear: 1910,
    kind: "event",
    significance: 4,
    categories: ["한국교회사"],
    summary: "한일병합 해, 한반도 교회는 식민 통치 아래 예배·교육·민족 문제를 동시에 끌어안기 시작한다.",
    description:
      "1910년 국권 피탈 이후 한국 개신교는 급성장의 기억(1907 평양 대부흥)과 제국의 감시 사이를 걸어야 했다. 선교사와 조선인 지도자의 입장이 갈라지기도 했고, 학교는 민족 교육과 총독부 규제 사이의 긴장 속에 놓였다. 9년 뒤 3·1 운동에서 기독교인이 크게 참여하는 배경이 여기서 자란다.",
    meaning:
      "교회가 ‘성장’만으로 말할 수 없는 자리에 들어선 해. 권력 앞에서 예배가 무엇을 증언하는지가 물음이 된다.",
    tags: ["병합", "한국교회사", "선교"],
    relatedEventIds: ["annexation-1910", "edinburgh-1910", "pyongyang-1907", "march-first", "korea-church-1919"],
    confidence: "medium",
    sources: [S.church("일제하 한국교회사 개설")],
  },
  {
    id: "korea-church-1919",
    title: "3·1과 한국 교회",
    startYear: 1919,
    kind: "event",
    significance: 5,
    categories: ["한국교회사", "독립"],
    summary: "3·1 운동의 민족대표와 만세 시위에 개신교·천주교 신자들이 깊이 참여했다.",
    description:
      "1919년 3월 1일 독립선언 민족대표 33인 가운데 개신교인이 다수를 차지했다. 교회와 학교를 거점으로 만세 시위가 번졌고, 이후 일제의 감시와 탄압이 교회에 가중된다. 같은 해 유럽 신학에서는 바르트의 『로마서 주석』이 나왔다.",
    meaning:
      "예배당 안의 신앙이 거리의 함성으로 이어진 해. ‘교회와 민족’이 같은 숨으로 호흡한 장면이자, 그 대가가 따랐던 자리.",
    people: ["손병희", "길선주", "이승훈"],
    tags: ["3.1", "한국교회사", "독립"],
    relatedEventIds: ["march-first", "barth-romans", "korea-church-1910", "pyongyang-1907"],
    sources: [S.church("3·1 운동과 기독교회 개설")],
  },
  {
    id: "asia-missions-1592",
    title: "동아시아 가톨릭과 임진왜란",
    startYear: 1592,
    kind: "event",
    significance: 3,
    categories: ["선교", "가톨릭"],
    summary: "일본 가톨릭이 박해 국면에 들어선 뒤, 도요토미의 조선 침공이 동아시아를 흔들던 해.",
    description:
      "1587년 도요토미 히데요시의 선교사 추방령 이후 일본 가톨릭은 불안한 공존을 이어갔다. 1592년 조선 침공(임진왜란)으로 동아시아 전역이 전쟁터가 되었고, 포로·표류·무역로를 따라 신앙과 소식이 떠돌았다. 조선에 천주교가 뿌리를 내리는 것은 이보다 훨씬 뒤(18세기 말)의 일이다.",
    meaning:
      "복음이 아직 한반도에 정착하기 전, 같은 바다권에서 전쟁과 선교가 동시에 움직이던 해.",
    people: ["도요토미 히데요시"],
    tags: ["가톨릭", "일본", "임진왜란", "선교"],
    relatedEventIds: ["imjin", "bunroku-1592", "luther-95"],
    confidence: "medium",
    sources: [S.church("일본 가톨릭사·임진왜란 시기 개설")],
  },
]);
