import os

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

start = code.find("export const addCurrentBasePlanSheet")
if start != -1:
    func_code = code[start:]
    pre_code = code[:start]

    # ws.columns
    old_cols = """  ws.columns = [
    { width: 14 }, // A 部署名
    { width: 14 }, // B 班・グループ
    { width: 10 }, // C ポスト
    { width: 12 }, // D [今年] 職名
    { width: 16 }, // E [今年] 氏名
    { width: 16 }, // F [今年] 級
    { width: 6 },  // G [今年] 年齢
    { width: 12 }, // H [今年] 在籍
    { width: 12 }, // I [今年] 備考
    { width: 4 },  // J 矢印
    { width: 14 }, // K [来年] 部署名
    { width: 14 }, // L [来年] 班・グループ
    { width: 12 }, // M [来年] 職名
    { width: 16 }, // N [来年] 級
    { width: 6 },  // O [来年] 年齢
    { width: 12 }, // P [来年] 在籍
    { width: 12 }, // Q [来年] 備考
  ];"""
    
    new_cols = """  ws.columns = [
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
    
    func_code = func_code.replace(old_cols, new_cols)
    
    func_code = func_code.replace("ws.mergeCells('A2:Q2');", "ws.mergeCells('A2:P2');")
    func_code = func_code.replace("ws.mergeCells('A3:Q3');", "ws.mergeCells('A3:P3');")
    
    func_code = func_code.replace("const r4Vals = ['部署名', '班・グループ', 'ポスト', `今年度(${targetYear - 1}(R${targetYear - 2019}))`, '', '', '', '', '', '', `来年度(${targetYear}(R${targetYear - 2018}))`];",
                                  "const r4Vals = ['部署名', '班・グループ', 'ポスト', `今年度(${targetYear - 1}(R${targetYear - 2019}))`, '', '', '', '', '', `来年度(${targetYear}(R${targetYear - 2018}))`];")
                                  
    func_code = func_code.replace("const r5Vals = ['', '', '', '職名', '氏名', '級', '年齢', '在籍', '備考', '', '部署名', '班・グループ', '職名', '級', '年齢', '在籍', '備考'];",
                                  "const r5Vals = ['', '', '', '職名', '氏名', '級', '年齢', '在籍', '', '部署名', '班・グループ', '職名', '級', '年齢', '在籍', '備考'];")
                                  
    func_code = func_code.replace("ws.mergeCells('D4:I4');", "ws.mergeCells('D4:H4');")
    func_code = func_code.replace("ws.mergeCells('J4:J5');", "ws.mergeCells('I4:I5');")
    func_code = func_code.replace("ws.mergeCells('K4:Q4');", "ws.mergeCells('J4:P4');")
    
    func_code = func_code.replace("const vals = new Array(17).fill('');", "const vals = new Array(16).fill('');")
    func_code = func_code.replace("for (let c = 1; c <= 17; c++) {", "for (let c = 1; c <= 16; c++) {")
    func_code = func_code.replace("for (let i = 1; i <= 17; i++) {", "for (let i = 1; i <= 16; i++) {")

    # In processEmps:
    #             c >= 11 && c <= 17 becomes c >= 10 && c <= 16
    func_code = func_code.replace("if (c >= 11 && c <= 17 && !isRetired && !isUnassigned)", "if (c >= 10 && c <= 16 && !isRetired && !isUnassigned)")
    
    # In format section (header loop)
    func_code = func_code.replace("if (c === 7 || c === 8 || c === 15 || c === 16)", "if (c === 7 || c === 8 || c === 14 || c === 15)")
    func_code = func_code.replace("if (c === 10)", "if (c === 9)")
    func_code = func_code.replace("if (c === 7 || c === 8 || c === 10 || c === 15 || c === 16)", "if (c === 7 || c === 8 || c === 9 || c === 14 || c === 15)")

    code = pre_code + func_code

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)