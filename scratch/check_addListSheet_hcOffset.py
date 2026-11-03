import re
with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()
    match = re.search(r"if \(colNumber > 3\d\) \{\s*const hcOffset = colNumber - 3\d;", code)
    if match:
        print("Found:", match.group(0))