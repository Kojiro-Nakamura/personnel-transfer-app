import re

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

target = """    } else if (c >= 19 && c <= 25) {
      c4.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBFDBFE' } }; // Blue
      c5.fill = c4.fill;
    } else if (c >= 26 && c <= 35) {
      const promoColors = {
        31: getPromotedBgColorCode('係長(主査)'),
        32: getPromotedBgColorCode('補佐I(主任)'),
        33: getPromotedBgColorCode('補佐II(班長)'),
        34: getPromotedBgColorCode('補佐III(補佐兼班長)'),
        35: getPromotedBgColorCode('課長')
      };
      if (promoColors[c]) {
         c4.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + promoColors[c].replace('#', '').toUpperCase() } };
      } else {
         c4.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5D0FE' } }; // Fuchsia
      }
      c5.fill = c4.fill;
    } else if (c >= 36) {
      c4.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFA7F3D0' } }; // Emerald
      c5.fill = c4.fill;
    } else if (c !== 10) {"""

replacement = """    } else if (c >= 19 && c <= 21) {
      c4.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCBD5E1' } }; // Slate
      c5.fill = c4.fill;
    } else if (c >= 22 && c <= 29) {
      c4.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBFDBFE' } }; // Blue
      c5.fill = c4.fill;
    } else if (c >= 30 && c <= 39) {
      const promoColors = {
        31: getPromotedBgColorCode('係長(主査)'),
        32: getPromotedBgColorCode('補佐I(主任)'),
        33: getPromotedBgColorCode('補佐II(班長)'),
        34: getPromotedBgColorCode('補佐III(補佐兼班長)'),
        35: getPromotedBgColorCode('課長'),
        36: getPromotedBgColorCode('所属長'),
        37: getPromotedBgColorCode('次長'),
        38: getPromotedBgColorCode('部長')
      };
      if (promoColors[c]) {
         c4.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + promoColors[c].replace('#', '').toUpperCase() } };
      } else {
         c4.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5D0FE' } }; // Fuchsia
      }
      c5.fill = c4.fill;
    } else if (c >= 40) {
      c4.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFA7F3D0' } }; // Emerald
      c5.fill = c4.fill;
    } else if (c !== 10) {"""

if target in code:
    code = code.replace(target, replacement)
    print("Replaced colors successfully")
    with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
        f.write(code)
else:
    print("Target not found.")