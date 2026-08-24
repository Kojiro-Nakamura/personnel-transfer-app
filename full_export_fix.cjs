const fs = require('fs');
let code = fs.readFileSync('src/utils/exportExcel.js', 'utf8');

// ==== 1. addPlanSheet fixes ====
code = code.replace(
    "r4Vals.push('氏名', \\年齢\, 'フリガナ', '基本情報', '', '', '', '', '', '昇級年度', '', '', '', '', '', '', '', '', '', '');",
    "r4Vals.push('氏名', \\年齢\, 'フリガナ', '基本情報', '', '', '', '', '', '', '', '昇級年度', '', '', '', '', '', '', '', '', '', '');"
);

code = code.replace(
    "r5Vals.push('氏名', '年齢', 'フリガナ', '職員番号', '性別', '生年月日', '最終学歴', '採用年月日', '特記事項', '採用', '係長級(主査)', '補佐級I(主任)', '補佐級II(班長)', '補佐級III(補佐兼班長)', '課長級', '所属長級', '次長級', '部長級', '来年度');",
    "r5Vals.push('氏名', '年齢', 'フリガナ', '職員番号', '性別', '生年月日', '最終学歴', '採用年月日', '特記事項', '配属希望', '特殊事情', '採用', '係長級(主査)', '補佐級I(主任)', '補佐級II(班長)', '補佐級III(補佐兼班長)', '課長級', '所属長級', '次長級', '部長級', '来年度');"
);

code = code.replace("if (i >= 21 && i <= 26) argb = 'FFBFDBFE'; // 基本情報 (Blue)", "if (i >= 21 && i <= 28) argb = 'FFBFDBFE'; // 基本情報 (Blue)");
code = code.replace("if (i >= 27 && i <= 36) {", "if (i >= 29 && i <= 38) {");

code = code.replace("28: getPromotedBgColorCode('係長級(主査)')", "30: getPromotedBgColorCode('係長級(主査)')");
code = code.replace("29: getPromotedBgColorCode('補佐級I(主任)')", "31: getPromotedBgColorCode('補佐級I(主任)')");
code = code.replace("30: getPromotedBgColorCode('補佐級II(班長)')", "32: getPromotedBgColorCode('補佐級II(班長)')");
code = code.replace("31: getPromotedBgColorCode('補佐級III(補佐兼班長)')", "33: getPromotedBgColorCode('補佐級III(補佐兼班長)')");
code = code.replace("32: getPromotedBgColorCode('課長級')", "34: getPromotedBgColorCode('課長級')");
code = code.replace("33: getPromotedBgColorCode('所属長級')", "35: getPromotedBgColorCode('所属長級')");
code = code.replace("34: getPromotedBgColorCode('次長級')", "36: getPromotedBgColorCode('次長級')");
code = code.replace("35: getPromotedBgColorCode('部長級')", "37: getPromotedBgColorCode('部長級')");

code = code.replace("curPromoColors[36] = c;", "curPromoColors[38] = c;");
code = code.replace("curFontStyles[39 + i] = 'change';", "curFontStyles[41 + i] = 'change';");


// ==== 2. addListSheet fixes ====
code = code.replace(
    "const headersR4 = ['氏名', \\年齢\, 'フリガナ', '基本情報', '', '', '', '', '', \今年度（現行）\\, '', '', '', '', '', '', \来年度（新組織）\\, '', '', '', '', '', '', '昇級年度', '', '', '', '', '', '', '', '', ''];",
    "const headersR4 = ['氏名', \\年齢\, 'フリガナ', '基本情報', '', '', '', '', '', '', '', \今年度（現行）\\, '', '', '', '', '', '', \来年度（新組織）\\, '', '', '', '', '', '', '昇級年度', '', '', '', '', '', '', '', '', ''];"
);

code = code.replace(
    "const headersR5 = ['', '', '', '職員番号', '性別', '生年月日', '最終学歴', '採用年月日', '特記事項', '配置先', '職名', '級', '年数', '詳細', '備考', 'カウント除外', '配置先', '職名', '級', '年数', '詳細', '備考', 'カウント除外', '採用', '係長級(主査)', '補佐級I(主任)', '補佐級II(班長)', '補佐級III(補佐兼班長)', '課長級', '所属長級', '次長級', '部長級', '来年度'];",
    "const headersR5 = ['', '', '', '職員番号', '性別', '生年月日', '最終学歴', '採用年月日', '特記事項', '配属希望', '特殊事情', '配置先', '職名', '級', '年数', '詳細', '備考', 'カウント除外', '配置先', '職名', '級', '年数', '詳細', '備考', 'カウント除外', '採用', '係長級(主査)', '補佐級I(主任)', '補佐級II(班長)', '補佐級III(補佐兼班長)', '課長級', '所属長級', '次長級', '部長級', '来年度'];"
);

// We need to only replace the ones in addListSheet.
// The D4:I4 in addListSheet is exactly "ws.mergeCells('D4:I4');" which might match addPlanSheet if we aren't careful.
// Wait, addPlanSheet has "ws.mergeCells('D4:I4');". 
// addListSheet ALSO has "ws.mergeCells('D4:I4');" originally.
// Let's replace the block for addListSheet:
code = code.replace(
    "  ws.mergeCells('D4:I4');\\n  ws.mergeCells('J4:P4');\\n  ws.mergeCells('Q4:W4');\\n  ws.mergeCells('X4:AG4');",
    "  ws.mergeCells('D4:K4');\\n  ws.mergeCells('L4:R4');\\n  ws.mergeCells('S4:Y4');\\n  ws.mergeCells('Z4:AI4');"
);

code = code.replace("if (colNumber <= 9) cell.fill = fillSlate;", "if (colNumber <= 11) cell.fill = fillSlate;");
code = code.replace("else if (colNumber <= 16) cell.fill = fillAmber;", "else if (colNumber <= 18) cell.fill = fillAmber;");
code = code.replace("else if (colNumber <= 23) cell.fill = fillBlue;", "else if (colNumber <= 25) cell.fill = fillBlue;");
code = code.replace("else if (colNumber <= 33) {", "else if (colNumber <= 35) {");
code = code.replace("const endColCode = ws.getColumn(33 + historyYears.length).letter;", "const endColCode = ws.getColumn(35 + historyYears.length).letter;");
code = code.replace("ws.mergeCells(\AH4:\4\);", "ws.mergeCells(\AJ4:\4\);");
code = code.replace("if (colNumber >= 34) { // 履歴列", "if (colNumber >= 36) { // 履歴列");
code = code.replace("25: getPromotedBgColorCode('係長級(主査)')", "27: getPromotedBgColorCode('係長級(主査)')");
code = code.replace("26: getPromotedBgColorCode('補佐級I(主任)')", "28: getPromotedBgColorCode('補佐級I(主任)')");
code = code.replace("27: getPromotedBgColorCode('補佐級II(班長)')", "29: getPromotedBgColorCode('補佐級II(班長)')");
code = code.replace("28: getPromotedBgColorCode('補佐級III(補佐兼班長)')", "30: getPromotedBgColorCode('補佐級III(補佐兼班長)')");
code = code.replace("29: getPromotedBgColorCode('課長級')", "31: getPromotedBgColorCode('課長級')");
code = code.replace("30: getPromotedBgColorCode('所属長級')", "32: getPromotedBgColorCode('所属長級')");
code = code.replace("31: getPromotedBgColorCode('次長級')", "33: getPromotedBgColorCode('次長級')");
code = code.replace("32: getPromotedBgColorCode('部長級')", "34: getPromotedBgColorCode('部長級')");

fs.writeFileSync('src/utils/exportExcel.js', code);
