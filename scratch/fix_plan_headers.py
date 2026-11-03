import os

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

search = """  r4Vals.push('氏名', `${currentEraShort}年齢`, 'フリガナ', '基本情報', '', '', '', '', '', '', '', '昇級年度', '', '', '', '', '', '', '', '', '', '');"""

replace = """  r4Vals.push('氏名', `${currentEraShort}年齢`, 'フリガナ', '基本情報', '', '', '', '', '', '', '', '昇級年度', '', '', '', '', '', '', '', '', '');"""

if search in code:
    code = code.replace(search, replace)
    print("Fixed extra element in addPlanSheet r4Vals")
else:
    print("Could not find r4Vals push in addPlanSheet")

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)