const fs = require('fs');
let code = fs.readFileSync('src/utils/exportExcel.js', 'utf8');

code = code.replace("if (colNumber <= 9) cell.fill = fillSlate;", "if (colNumber <= 11) cell.fill = fillSlate;");
code = code.replace("else if (colNumber <= 16) cell.fill = fillAmber;", "else if (colNumber <= 18) cell.fill = fillAmber;");
code = code.replace("else if (colNumber <= 23) cell.fill = fillBlue;", "else if (colNumber <= 25) cell.fill = fillBlue;");
code = code.replace("else if (colNumber <= 33) {", "else if (colNumber <= 35) {");
code = code.replace("if (colNumber >= 34) { // —š—ğ—ñ", "if (colNumber >= 36) { // —š—ğ—ñ");
code = code.replace("25: getPromotedBgColorCode('ŒW’·‹‰(å¸)')", "27: getPromotedBgColorCode('ŒW’·‹‰(å¸)')");
code = code.replace("26: getPromotedBgColorCode('•â²‹‰I(å”C)')", "28: getPromotedBgColorCode('•â²‹‰I(å”C)')");
code = code.replace("27: getPromotedBgColorCode('•â²‹‰II(”Ç’·)')", "29: getPromotedBgColorCode('•â²‹‰II(”Ç’·)')");
code = code.replace("28: getPromotedBgColorCode('•â²‹‰III(•â²Œ“”Ç’·)')", "30: getPromotedBgColorCode('•â²‹‰III(•â²Œ“”Ç’·)')");
code = code.replace("29: getPromotedBgColorCode('‰Û’·‹‰')", "31: getPromotedBgColorCode('‰Û’·‹‰')");
code = code.replace("30: getPromotedBgColorCode('Š‘®’·‹‰')", "32: getPromotedBgColorCode('Š‘®’·‹‰')");
code = code.replace("31: getPromotedBgColorCode('Ÿ’·‹‰')", "33: getPromotedBgColorCode('Ÿ’·‹‰')");
code = code.replace("32: getPromotedBgColorCode('•”’·‹‰')", "34: getPromotedBgColorCode('•”’·‹‰')");

fs.writeFileSync('src/utils/exportExcel.js', code);
