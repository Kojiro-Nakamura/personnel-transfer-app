import re

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

# 1. Fix r5Vals push
r5_target = "r5Vals.push('', '氏名', '年齢', 'フリガナ', '職員番号', '性別', '生年月日', '最終学歴', '採用年月日', '特記事項', '〇配属希望', '●特殊事情', '採用', '係長級(主査)', '補佐級I(主任)', '補佐級II(班長)', '補佐級III(補佐兼班長)', '課長級', '所属長級', '次長級', '部長級', '来年度');"
r5_replacement = "r5Vals.push('', '氏名', '年齢', 'フリガナ', '職員番号', '性別', '生年月日', '最終学歴', '採用年月日', '特記事項', '配属希望', '特殊事情', '採用', '係長級(主査)', '補佐級I(主任)', '補佐級II(班長)', '補佐級III(補佐兼班長)', '課長級', '所属長級', '次長級', '部長級', '来年度');"

if r5_target in code:
    code = code.replace(r5_target, r5_replacement)
    print("Row 5 titles replaced!")
else:
    print("Row 5 titles target not found!")

# 2. Remove unwanted Row 5 merges
merges_target = """  ws.mergeCells('W5:X5');
  ws.mergeCells('AB5:AC5');
  ws.mergeCells('AD5:AM5');"""
merges_replacement = ""

if merges_target in code:
    code = code.replace(merges_target, merges_replacement)
    print("Row 5 merges removed!")
else:
    print("Row 5 merges target not found!")


with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)