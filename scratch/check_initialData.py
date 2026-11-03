import re
with open("src/constants/initialData.js", "r", encoding="utf8") as f:
    code = f.read()
    match = re.search(r"export const INITIAL_EMPLOYEES = \[\s*\{([^}]+)\}", code)
    if match:
        print(match.group(1))