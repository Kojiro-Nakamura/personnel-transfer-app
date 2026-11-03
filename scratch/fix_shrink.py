import os

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

# I want to specifically target the addCurrentBasePlanSheet function to avoid messing with other sheets.
start = code.find("export const addCurrentBasePlanSheet")
if start != -1:
    func_code = code[start:]
    pre_code = code[:start]

    func_code = func_code.replace(
        "cell.alignment = { vertical: 'middle', wrapText: true };",
        "cell.alignment = { vertical: 'middle', shrinkToFit: true, wrapText: false };"
    )

    func_code = func_code.replace(
        "cell.alignment = { vertical: 'middle', horizontal: 'center' };",
        "cell.alignment = { vertical: 'middle', horizontal: 'center', shrinkToFit: true, wrapText: false };"
    )

    code = pre_code + func_code

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)