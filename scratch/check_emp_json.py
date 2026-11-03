import json
with open("test.json", "r", encoding="utf8") as f:
    data = json.load(f)
    print(json.dumps(data.get("employees", [])[0], indent=2, ensure_ascii=False))