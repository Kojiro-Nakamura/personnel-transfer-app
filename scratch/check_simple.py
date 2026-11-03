import re

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

simple_func = code.split("export const addSimplePlanSheet =")[1].split("export const")[0]
if "curPromoColors" in simple_func:
    print("curPromoColors is in addSimplePlanSheet")
    for line in simple_func.split("\n"):
        if "curPromoColors" in line:
            print(line.strip())