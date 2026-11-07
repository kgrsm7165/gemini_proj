"""단일 에이전트: 뉴스/질문 -> 밸류체인 맵 추적 -> 관심기업 영향도.
사용: python agent.py "TEL 식각장비 수주 증가 뉴스, 내 종목 영향은?"   (ANTHROPIC_API_KEY 필요)
"""
import csv, json, sys
from pathlib import Path

ROOT = Path(__file__).parent
MAP = json.loads((ROOT / "data/valuechain/semiconductor.json").read_text(encoding="utf-8"))
WATCH = list(csv.DictReader(open(ROOT / "data/watchlist.csv", encoding="utf-8")))
CO = {c["name"]: c for c in MAP["companies"]}

def list_watchlist(): return WATCH
def get_company(name): return CO.get(name) or {"error": "맵에 없는 기업", "candidates": [n for n in CO if name in n or n in name]}
def find_by_process(process_id): return [{"name": c["name"], "role": c["role"], "focus": c["focus"]} for c in CO.values() if process_id in c["processes"]]
def get_relationships(name): return [r for r in MAP["relationships"] if name in (r["a"], r["b"])]
def get_map_nodes(): return [{"id": n["id"], "name": n["name"], "type": n["type"]} for n in MAP["nodes"]]

TOOLS = {f.__name__: f for f in (list_watchlist, get_company, find_by_process, get_relationships, get_map_nodes)}
SCHEMAS = [
    {"name": "list_watchlist", "description": "내 관심기업 목록", "input_schema": {"type": "object", "properties": {}}},
    {"name": "get_map_nodes", "description": "밸류체인 노드(응용처/소자/공정) 목록과 id", "input_schema": {"type": "object", "properties": {}}},
    {"name": "get_company", "description": "맵의 기업 정보(담당 공정, 제품, 근거 링크)", "input_schema": {"type": "object", "properties": {"name": {"type": "string"}}, "required": ["name"]}},
    {"name": "find_by_process", "description": "특정 공정 id(예: etch, litho)에 속한 기업들", "input_schema": {"type": "object", "properties": {"process_id": {"type": "string"}}, "required": ["process_id"]}},
    {"name": "get_relationships", "description": "기업의 공시 기반 고객/공급 관계", "input_schema": {"type": "object", "properties": {"name": {"type": "string"}}, "required": ["name"]}},
]
SYSTEM = """너는 밸류체인 기반 영향도 분석가다. 입력(뉴스/질문)에 대해:
1) 영향받는 공정/소자/응용처 노드를 식별하고 2) 도구로 맵을 따라 관련 기업과 관계를 조회하고
3) 관심기업별 방향(+/-/중립), 크기(상/중/하), 시차, 근거(맵 필드·source 링크), 확신도를 표로 낸다.
규칙: 맵/도구에서 확인된 사실과 네 추정을 반드시 구분해 표기한다. 맵의 'caveat'(미확인) 항목은 단정하지 않는다. 투자 권유는 하지 않는다."""

def run(question, model="claude-sonnet-5-5"):
    import anthropic
    client, msgs = anthropic.Anthropic(), [{"role": "user", "content": question}]
    while True:
        r = client.messages.create(model=model, max_tokens=4000, system=SYSTEM, tools=SCHEMAS, messages=msgs)
        msgs.append({"role": "assistant", "content": r.content})
        calls = [b for b in r.content if b.type == "tool_use"]
        if not calls:
            return "".join(b.text for b in r.content if b.type == "text")
        msgs.append({"role": "user", "content": [
            {"type": "tool_result", "tool_use_id": c.id, "content": json.dumps(TOOLS[c.name](**c.input), ensure_ascii=False)} for c in calls]})

if __name__ == "__main__":
    print(run(" ".join(sys.argv[1:]) or "최근 뉴스가 내 관심기업에 미치는 영향을 알려줘"))
