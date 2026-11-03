import os
import re

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

start = code.find("export const addCurrentBasePlanSheet")
if start != -1:
    func_code = code[start:]
    pre_code = code[:start]

    # FIX ws.columns
    old_cols_regex = r"ws\.columns\s*=\s*\[.*?\];"
    new_cols = """ws.columns = [
    { width: 14 }, // A 部署名
    { width: 14 }, // B 班・グループ
    { width: 10 }, // C ポスト
    { width: 12 }, // D [今年] 職名
    { width: 16 }, // E [今年] 氏名
    { width: 16 }, // F [今年] 級
    { width: 6 },  // G [今年] 年齢
    { width: 12 }, // H [今年] 在籍
    { width: 4 },  // I 矢印
    { width: 14 }, // J [来年] 部署名
    { width: 14 }, // K [来年] 班・グループ
    { width: 12 }, // L [来年] 職名
    { width: 16 }, // M [来年] 級
    { width: 6 },  // N [来年] 年齢
    { width: 12 }, // O [来年] 在籍
    { width: 12 }, // P [来年] 備考
  ];"""
    
    func_code = re.sub(old_cols_regex, new_cols, func_code, flags=re.DOTALL)

    # FIX r4Vals
    # The original was something like: const r4Vals = ['部署名', '班・グループ', 'ポスト', `今年度...`, '', '', '', '', '', '', `来年度...`];
    func_code = re.sub(r"const r4Vals = \['部署名', '班・グループ', 'ポスト', `今年度\(\$\{targetYear - 1\}\(R\$\{targetYear - 2019\}\)\)`, '', '', '', '', '', '', `来年度\(\$\{targetYear\}\(R\$\{targetYear - 2018\}\)\)`\];",
                       "const r4Vals = ['部署名', '班・グループ', 'ポスト', `今年度(${targetYear - 1}(R${targetYear - 2019}))`, '', '', '', '', '', `来年度(${targetYear}(R${targetYear - 2018}))`];",
                       func_code)

    code = pre_code + func_code

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)