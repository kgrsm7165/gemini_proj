# Gemini Project — 밸류체인 기반 영향도 에이전트 (MVP)

에이전트 1개 + 도구(맵/관심기업/관계 조회). 뉴스·질문 → 밸류체인 경로 추적 → 관심기업별 영향도.

## 구조
- `atlas/` 원본 밸류체인 아틀라스 HTML (반도체 전공정)
- `scripts/dump_atlas.js` 아틀라스를 렌더링해 내장 데이터를 `data/semiconductor/*.json`으로 덤프 (playwright)
- `scripts/build_valuechain.js` 덤프 → `data/valuechain/semiconductor.json` (노드/엣지/기업/공시 관계)
- `data/watchlist.csv` 관심기업 (샘플 2개, 직접 수정)
- `agent.py` 에이전트 (`ANTHROPIC_API_KEY` 필요)

## 실행
```
node scripts/dump_atlas.js atlas/semiconductor-front-end-atlas.html data/semiconductor
node scripts/build_valuechain.js
pip install anthropic
python agent.py "TEL 식각장비 수주 증가 뉴스, 내 종목 영향은?"
```
## 다음 단계
IR/리포트 텍스트 검색 도구, 파이프라인 수치 조회 도구, 다른 섹터 맵 추가(섹터별 JSON).
