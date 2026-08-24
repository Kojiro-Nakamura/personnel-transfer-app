const fs = require('fs');
let code = fs.readFileSync('src/utils/exportExcel.js', 'utf8');

// ==== 2. addListSheet fixes ====
// We can find the EXACT lines by index or by regex.
code = code.replace(/const headersR4 = \['氏名', \\\\$\\{currentEraShort\\}年齢\, 'フリガナ', '基本情報', '', '', '', '', '', \今年度/g, "const headersR4 = ['氏名', \\年齢\, 'フリガナ', '基本情報', '', '', '', '', '', '', '', \今年度");
code = code.replace(/const headersR5 = \['', '', '', '職員番号', '性別', '生年月日', '最終学歴', '採用年月日', '特記事項', '配置先', '職名', '級', '年数', '詳細', '備考', 'カウント除外'/g, "const headersR5 = ['', '', '', '職員番号', '性別', '生年月日', '最終学歴', '採用年月日', '特記事項', '配属希望', '特殊事情', '配置先', '職名', '級', '年数', '詳細', '備考', 'カウント除外'");

// Replace the EXACT merge lines for addListSheet which are right after r5.values = headersR5;
code = code.replace(/ws\.mergeCells\('D4:I4'\);\n\s*ws\.mergeCells\('J4:P4'\);\n\s*ws\.mergeCells\('Q4:W4'\);\n\s*ws\.mergeCells\('X4:AG4'\);/g, "ws.mergeCells('D4:K4');\n  ws.mergeCells('L4:R4');\n  ws.mergeCells('S4:Y4');\n  ws.mergeCells('Z4:AI4');");

// Let's replace the AH4 to AJ4 in addListSheet
code = code.replace(/ws\.mergeCells\(\AH4:\\\$\\{endColCode\\}4\\);/g, "ws.mergeCells(\AJ4:\4\);");


fs.writeFileSync('src/utils/exportExcel.js', code);
