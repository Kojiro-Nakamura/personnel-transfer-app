import os
import re

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

start = code.find("export const addCurrentBasePlanSheet")
if start != -1:
    func_code = code[start:]
    pre_code = code[:start]

    func_code = re.sub(r"const r4Vals = \['部署名', '班・グループ', 'ポスト', `今年度\(\$\{targetYear - 1\}\(R\$\{targetYear - 2019\}\)\)`, '', '', '', '', '', '', `来年度\(\$\{targetYear\}\(R\$\{targetYear - 2018\}\)\)`\];",
                       r"const r4Vals = ['部署名', '班・グループ', 'ポスト', `今年度(${targetYear - 1}(R${targetYear - 2019}))`, '', '', '', '', '', `来年度(${targetYear}(R${targetYear - 2018}))`];",
                       func_code)

    code = pre_code + func_code

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)