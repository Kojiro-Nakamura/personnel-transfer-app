import re

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

t = """  const extraCols = [
    { width: 7.40 },  // 空白列 (R)
    { width: 14 }, // 氏名 (S)
    { width: 8 },  // 年齢 (T)
    { width: 16 }, // フリガナ (U)
    { width: 12 }, // 職員番号 (V)
    { width: 6 },  // 性別 (W)
    { width: 14 }, // 生年月日 (X)
    { width: 12 }, // 最終学歴 (Y)
    { width: 14 }, // 採用年月日 (Z)
    { width: 20 }, // 特記事項 (AA)
    { width: 8 },  // 配属希望 (AB)
    { width: 8 },  // 特殊事情 (AC)
    { width: 8 },  // 採用 (AD)
    { width: 8 },  // 係長級(主査) (AE)
    { width: 8 },  // 補佐級I(主任) (AF)
    { width: 8 },  // 補佐級II(班長) (AG)
    { width: 8 },  // 補佐級III(補佐兼班長) (AH)
    { width: 8 },  // 課長級 (AI)
    { width: 8 },  // 所属長級 (AJ)
    { width: 8 },  // 次長級 (AK)
    { width: 8 },  // 部長級 (AL)
    { width: 14 }, // 来年度 (AM)
  ];"""

r = """  const extraCols = [
    { width: 7.40 },  // 空白列 (R)
    { width: 14 }, // 氏名 (S)
    { width: 8 },  // 年齢 (T)
    { width: 16 }, // フリガナ (U)
    { width: 12 }, // 職員番号 (V)
    { width: 6 },  // 性別 (W)
    { width: 14 }, // 生年月日 (X)
    { width: 12 }, // 最終学歴 (Y)
    { width: 14 }, // 採用年月日 (Z)
    { width: 20 }, // 特記事項 (AA)
    { width: 8 },  // 配属希望 (AB)
    { width: 8 },  // 特殊事情 (AC)
    { width: 15 }, // 採用 (AD)
    { width: 15 }, // 係長級(主査) (AE)
    { width: 15 }, // 補佐級I(主任) (AF)
    { width: 15 }, // 補佐級II(班長) (AG)
    { width: 15 }, // 補佐級III(補佐兼班長) (AH)
    { width: 15 }, // 課長級 (AI)
    { width: 15 }, // 所属長級 (AJ)
    { width: 15 }, // 次長級 (AK)
    { width: 15 }, // 部長級 (AL)
    { width: 14 }, // 来年度 (AM)
  ];"""

# Just doing Regex to be safe because comments might not match exactly
import sys

def modify_widths(text):
    # Find the extraCols array
    match = re.search(r'const extraCols = \[\s*(.*?)\s*\];', text, re.DOTALL)
    if not match:
        return text
    
    inner = match.group(1)
    lines = inner.split('\n')
    new_lines = []
    for line in lines:
        if '(AD)' in line or '(AE)' in line or '(AF)' in line or '(AG)' in line or '(AH)' in line or '(AI)' in line or '(AJ)' in line or '(AK)' in line or '(AL)' in line:
            new_lines.append(re.sub(r'width:\s*\d+', 'width: 15', line))
        else:
            new_lines.append(line)
    
    new_inner = '\n'.join(new_lines)
    return text.replace(match.group(1), new_inner)

new_code = modify_widths(code)
if new_code != code:
    print("Modified widths successfully")
    with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
        f.write(new_code)
else:
    print("Failed to modify widths")