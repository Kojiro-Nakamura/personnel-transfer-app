import re
with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    content = f.read()
    match = re.search(r"const headersR5 = \[(.*?)\];", content)
    if match:
        arr_str = match.group(1)
        items = [x.strip().strip("'").strip('"') for x in arr_str.split("', '")]
        for i, item in enumerate(items):
            print(f"{i+1}: {item}")