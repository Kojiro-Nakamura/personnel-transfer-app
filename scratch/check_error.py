import os

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

# find addCurrentBasePlanSheet
start = code.find("export const addCurrentBasePlanSheet")
if start != -1:
    print(code[start:start+1500])