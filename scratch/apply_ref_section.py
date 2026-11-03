import os

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

# 1. Update columns in addCurrentBasePlanSheet
old_cols = """  ws.columns = [
    { width: 14 }, // A 部署名
    { width: 14 }, // B 班・グループ
    { width: 12 }, // C ポスト
    { width: 12 }, // D [今年] 職名
    { width: 14 }, // E [今年] 氏名
    { width: 8 },  // F [今年] 級
    { width: 8 },  // G [今年] 年齢
    { width: 12 }, // H [今年] 在籍
    { width: 12 }, // I [今年] 備考
    { width: 4 },  // J 矢印
    { width: 14 }, // K [来年] 部署名
    { width: 14 }, // L [来年] 班・グループ
    { width: 12 }, // M [来年] 職名
    { width: 8 },  // N [来年] 級
    { width: 8 },  // O [来年] 年齢
    { width: 12 }, // P [来年] 在籍
    { width: 12 }, // Q [来年] 備考
  ];"""

new_cols = """  const extraCols = [
    { width: 7.40 },  // 空白列 (R)
    { width: 14 }, // 氏名 (S)
    { width: 8 },  // 年齢 (T)
    { width: 16 }, // フリガナ (U)
    { width: 12 }, // 職員番号 (V)
    { width: 6 },  // 性別 (W)
    { width: 14 }, // 生年月日 (X)
    { width: 12 }, // 最終学歴 (Y)
    { width: 14 }, // 採用年月日 (Z)
    { width: 20 }, // 備考 (AA)
    { width: 8 },  // 配属 (AB)
    { width: 8 },  // 特事 (AC)
    { width: 8 },  // 採用 (AD)
    { width: 8 },  // 係長I (AE)
    { width: 8 },  // 係長II (AF)
    { width: 8 },  // 係長III (AG)
    { width: 8 },  // 課長 (AH)
    { width: 8 },  // 所属長 (AI)
    { width: 8 },  // 次長 (AJ)
    { width: 8 },  // 部長 (AK)
    { width: 14 }, // 採用年 (AL)
  ];
  historyYears.forEach(() => extraCols.push({ width: 14 }));
  
  ws.columns = [
    { width: 14 }, // A 部署名
    { width: 14 }, // B 班・グループ
    { width: 12 }, // C ポスト
    { width: 12 }, // D [今年] 職名
    { width: 14 }, // E [今年] 氏名
    { width: 8 },  // F [今年] 級
    { width: 8 },  // G [今年] 年齢
    { width: 12 }, // H [今年] 在籍
    { width: 12 }, // I [今年] 備考
    { width: 4 },  // J 矢印
    { width: 14 }, // K [来年] 部署名
    { width: 14 }, // L [来年] 班・グループ
    { width: 12 }, // M [来年] 職名
    { width: 8 },  // N [来年] 級
    { width: 8 },  // O [来年] 年齢
    { width: 12 }, // P [来年] 在籍
    { width: 12 }, // Q [来年] 備考
    ...extraCols
  ];
  
  const totalCols = 17 + extraCols.length;
"""
code = code.replace(old_cols, new_cols)

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)