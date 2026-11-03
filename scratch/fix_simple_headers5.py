import os

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

search = "const r4Vals = ['部署名', '〇配属希望', '●特殊事情',"
replace = "const r4Vals = ['部署名', '配属希望', '特殊事情',"

if search in code:
    code = code.replace(search, replace)
    print("Fixed headers for cols B and C in addSimplePlanSheet")
else:
    print("Could not find r4Vals search string in addSimplePlanSheet")

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)