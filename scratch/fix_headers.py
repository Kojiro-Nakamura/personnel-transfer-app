import os

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

# Replace exactly "'配属希望'" with "'〇配属希望'"
code = code.replace("'配属希望'", "'〇配属希望'")
# Replace exactly "'特殊事情'" with "'●特殊事情'"
code = code.replace("'特殊事情'", "'●特殊事情'")

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)