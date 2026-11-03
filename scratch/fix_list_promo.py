import os

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

search = """      else if (colNumber <= 35) {
         argb = 'FFFDF4FF';
         if (colNumber === 35 && nextPromoColor) {
             argb = 'FF' + nextPromoColor.replace('#', '').toUpperCase();
         }
      }
      else {
         argb = 'FFECFDF5';
         if (colNumber === 35 + historyYears.length && nextPromoColor) {
             argb = 'FF' + nextPromoColor.replace('#', '').toUpperCase();
         }
      }"""

replace = """      else if (colNumber <= 33) {
         argb = 'FFFDF4FF';
         if (colNumber === 33 && nextPromoColor) {
             argb = 'FF' + nextPromoColor.replace('#', '').toUpperCase();
         }
      }
      else {
         argb = 'FFECFDF5';
      }"""

if search in code:
    code = code.replace(search, replace)
    print("Replaced list sheet promo color")
else:
    print("Could not find list sheet promo block")

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)

print("Done")