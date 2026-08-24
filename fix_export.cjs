const fs = require('fs');
let code = fs.readFileSync('src/utils/exportExcel.js', 'utf8');

code = code.replace(
    "const headersR4 = ['氏名', \\年齢\, 'フリガナ', '基本情報', '', '', '', '', '', \今年度（現行）\\, '', '', '', '', '', '', \来年度（新組織）\\, '', '', '', '', '', '', '昇級年度', '', '', '', '', '', '', '', '', ''];",
    "const headersR4 = ['氏名', \\年齢\, 'フリガナ', '基本情報', '', '', '', '', '', '', '', \今年度（現行）\\, '', '', '', '', '', '', \来年度（新組織）\\, '', '', '', '', '', '', '昇級年度', '', '', '', '', '', '', '', '', ''];"
);

code = code.replace(
    "const headersR5 = ['', '', '', '職員番号', '性別', '生年月日', '最終学歴', '採用年月日', '特記事項', '配置先', '職名', '級', '年数', '詳細', '備考', 'カウント除外', '配置先', '職名', '級', '年数', '詳細', '備考', 'カウント除外', '採用', '係長級(主査)', '補佐級I(主任)', '補佐級II(班長)', '補佐級III(補佐兼班長)', '課長級', '所属長級', '次長級', '部長級', '来年度'];",
    "const headersR5 = ['', '', '', '職員番号', '性別', '生年月日', '最終学歴', '採用年月日', '特記事項', '配属希望', '特殊事情', '配置先', '職名', '級', '年数', '詳細', '備考', 'カウント除外', '配置先', '職名', '級', '年数', '詳細', '備考', 'カウント除外', '採用', '係長級(主査)', '補佐級I(主任)', '補佐級II(班長)', '補佐級III(補佐兼班長)', '課長級', '所属長級', '次長級', '部長級', '来年度'];"
);

code = code.replace("ws.mergeCells('D4:I4');", "ws.mergeCells('D4:K4');");
code = code.replace("ws.mergeCells('J4:P4');", "ws.mergeCells('L4:R4');");
code = code.replace("ws.mergeCells('Q4:W4');", "ws.mergeCells('S4:Y4');");
code = code.replace("ws.mergeCells('X4:AG4');", "ws.mergeCells('Z4:AI4');");

code = code.replace("if (colNumber <= 9) cell.fill = fillSlate;", "if (colNumber <= 11) cell.fill = fillSlate;");
code = code.replace("else if (colNumber <= 16) cell.fill = fillAmber;", "else if (colNumber <= 18) cell.fill = fillAmber;");
code = code.replace("else if (colNumber <= 23) cell.fill = fillBlue;", "else if (colNumber <= 25) cell.fill = fillBlue;");
code = code.replace("else if (colNumber <= 33) {", "else if (colNumber <= 35) {");
code = code.replace("const endColCode = ws.getColumn(33 + historyYears.length).letter;", "const endColCode = ws.getColumn(35 + historyYears.length).letter;");
code = code.replace("ws.mergeCells(\AH4:\4\);", "ws.mergeCells(\AJ4:\4\);");
code = code.replace("if (colNumber >= 34) { // 履歴列", "if (colNumber >= 36) { // 履歴列");

fs.writeFileSync('src/utils/exportExcel.js', code);
