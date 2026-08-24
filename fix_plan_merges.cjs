const fs = require('fs');
let code = fs.readFileSync('src/utils/exportExcel.js', 'utf8');

// The replace I did was:
// code = code.replace("ws.mergeCells('D4:I4');", "ws.mergeCells('D4:K4');");
// code = code.replace("ws.mergeCells('J4:P4');", "ws.mergeCells('L4:R4');");
// code = code.replace("ws.mergeCells('Q4:W4');", "ws.mergeCells('S4:Y4');");
// code = code.replace("ws.mergeCells('X4:AG4');", "ws.mergeCells('Z4:AI4');");

// In addPlanSheet, the merges should be:
// D4:I4 (¡”N“x)
// J4:O4 (—ˆ”N“x)

code = code.replace("ws.mergeCells('D4:K4');\\n  ws.mergeCells('J4:O4');", "ws.mergeCells('D4:I4');\\n  ws.mergeCells('J4:O4');");

// Let's check colors in addPlanSheet:
code = code.replace("if (i >= 21 && i <= 26) argb = 'FFBFDBFE'; // Šî–{î•ñ (Blue)", "if (i >= 21 && i <= 28) argb = 'FFBFDBFE'; // Šî–{î•ñ (Blue)");
code = code.replace("if (i >= 27 && i <= 36)", "if (i >= 29 && i <= 38)");

code = code.replace("28: getPromotedBgColorCode('ŒW’·‹‰(Žå¸)')", "30: getPromotedBgColorCode('ŒW’·‹‰(Žå¸)')");
code = code.replace("29: getPromotedBgColorCode('•â²‹‰I(Žå”C)')", "31: getPromotedBgColorCode('•â²‹‰I(Žå”C)')");
code = code.replace("30: getPromotedBgColorCode('•â²‹‰II(”Ç’·)')", "32: getPromotedBgColorCode('•â²‹‰II(”Ç’·)')");
code = code.replace("31: getPromotedBgColorCode('•â²‹‰III(•â²Œ“”Ç’·)')", "33: getPromotedBgColorCode('•â²‹‰III(•â²Œ“”Ç’·)')");
code = code.replace("32: getPromotedBgColorCode('‰Û’·‹‰')", "34: getPromotedBgColorCode('‰Û’·‹‰')");
code = code.replace("33: getPromotedBgColorCode('Š‘®’·‹‰')", "35: getPromotedBgColorCode('Š‘®’·‹‰')");
code = code.replace("34: getPromotedBgColorCode('ŽŸ’·‹‰')", "36: getPromotedBgColorCode('ŽŸ’·‹‰')");
code = code.replace("35: getPromotedBgColorCode('•”’·‹‰')", "37: getPromotedBgColorCode('•”’·‹‰')");

fs.writeFileSync('src/utils/exportExcel.js', code);
